import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertProjectSchema, insertPageSchema, insertElementSchema, insertProductSchema, insertProductCategorySchema, insertProductVariantSchema, insertCartSchema, insertCartItemSchema, insertReviewSchema, insertWishlistSchema, insertWishlistItemSchema, insertDiscountSchema, insertProductTagSchema, insertProductTagRelationSchema, insertShippingMethodSchema, insertInventorySchema, insertInventoryHistorySchema, projectDatabases, projectApis, projectDatabasesInsertSchema, projectApisInsertSchema } from "@shared/schema";
import { isAuthenticated } from "./auth";
import { eq, and, desc, like, or, sql } from "drizzle-orm";
import { db } from "@db";
import * as schema from "@shared/schema";
import { randomUUID } from "crypto";
import Stripe from "stripe";
import { createPaypalOrder, capturePaypalOrder, loadPaypalDefault } from "./paypal";
import pkg from 'pg';
const { Pool } = pkg;

// Pool para queries SQL diretas (necessário para criar tabelas dinâmicas)
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Initialize Stripe
const stripeInstance = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16" as any,
}) : null;

// Auxiliar para mapear tipos de coluna do formulário para SQL
function mapTypeToSQL(type: string): string {
  switch (type.toLowerCase()) {
    case 'string':
    case 'text':
      return 'TEXT';
    case 'integer':
    case 'int':
      return 'INTEGER';
    case 'number':
    case 'float':
    case 'decimal':
      return 'NUMERIC';
    case 'boolean':
    case 'bool':
      return 'BOOLEAN';
    case 'date':
      return 'DATE';
    case 'timestamp':
    case 'datetime':
      return 'TIMESTAMP';
    case 'json':
    case 'object':
      return 'JSONB';
    case 'uuid':
      return 'UUID';
    case 'serial':
    case 'autoincrement':
      return 'SERIAL';
    default:
      return 'TEXT';
  }
}

// Auxiliar para formatar valores SQL baseado no tipo
function formatSQLValue(value: any, type: string): string {
  if (value === null || value === undefined) {
    return 'NULL';
  }
  
  switch (type.toLowerCase()) {
    case 'string':
    case 'text':
    case 'uuid':
    case 'date':
    case 'timestamp':
    case 'datetime':
      return `'${value.replace(/'/g, "''")}'`;
    case 'boolean':
    case 'bool':
      return value ? 'TRUE' : 'FALSE';
    case 'json':
    case 'object':
      return `'${JSON.stringify(value).replace(/'/g, "''")}'::JSONB`;
    default: // números
      return String(value);
  }
}

// Rota para criação de tabelas de banco de dados
async function handleCreateDatabaseTable(req: Request, res: Response) {
  try {
    const { name, description, generateApi, columns, projectId } = req.body;
    
    if (!name || !columns || !Array.isArray(columns) || columns.length === 0) {
      return res.status(400).json({
        message: 'Nome da tabela e colunas são obrigatórios'
      });
    }
    
    // Verificar se o ID do projeto foi fornecido
    if (!projectId) {
      return res.status(400).json({
        message: 'ID do projeto é obrigatório para criar uma tabela'
      });
    }
    
    // Verificar se o projeto existe
    const project = await storage.getProjectById(parseInt(projectId));
    if (!project) {
      return res.status(404).json({
        message: 'Projeto não encontrado'
      });
    }
    
    // Validar nome da tabela
    if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(name)) {
      return res.status(400).json({
        message: 'Nome da tabela inválido. Use apenas letras, números e underscore, começando com uma letra.'
      });
    }
    
    // Validar colunas
    let hasPrimaryKey = false;
    for (const column of columns) {
      if (!column.name || !column.type) {
        return res.status(400).json({
          message: 'Todas as colunas devem ter nome e tipo'
        });
      }
      
      if (column.primary) {
        hasPrimaryKey = true;
      }
    }
    
    if (!hasPrimaryKey) {
      return res.status(400).json({
        message: 'A tabela deve ter pelo menos uma coluna como chave primária'
      });
    }
    
    // Gerar SQL para criar a tabela
    let createTableSQL = `CREATE TABLE ${name} (\n`;
    
    const columnDefs = columns.map(column => {
      let columnDef = `  ${column.name} ${mapTypeToSQL(column.type)}`;
      
      if (column.notNull) {
        columnDef += ' NOT NULL';
      }
      
      if (column.primary) {
        columnDef += ' PRIMARY KEY';
      }
      
      if (column.defaultValue) {
        columnDef += ` DEFAULT ${formatSQLValue(column.defaultValue, column.type)}`;
      }
      
      return columnDef;
    });
    
    createTableSQL += columnDefs.join(',\n');
    createTableSQL += '\n);';
    
    // Criar nome de tabela prefixado com o ID do projeto para garantir isolamento
    const projectTableName = `p${projectId}_${name}`;
    
    // Atualizar o SQL com o nome da tabela prefixado
    createTableSQL = createTableSQL.replace(`CREATE TABLE ${name}`, `CREATE TABLE ${projectTableName}`);
    
    // Execute SQL para criar a tabela
    await pool.query(createTableSQL);
    
    // Registrar no sistema de metadados do projeto
    const tableMetadata = {
      projectId: parseInt(projectId),
      tableName: projectTableName,
      displayName: name,
      description: description || "",
      apiEnabled: !!generateApi,
      isBuiltIn: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Inserir na tabela de metadados
    const [savedTable] = await db.insert(schema.projectDatabases).values(tableMetadata).returning();
    
    // Gerar API dinamicamente se solicitado
    if (generateApi) {
      try {
        // Registrar endpoints na tabela de metadados de API
        const apiMethods = ["GET", "POST", "PUT", "DELETE"];
        
        // Criar uma entrada para cada método
        for (const method of apiMethods) {
          const apiMetadata = {
            projectId: parseInt(projectId),
            tableId: savedTable.id,
            apiPath: `/api/projects/${projectId}/${name.toLowerCase()}`,
            method: method,
            description: `API ${method} para tabela ${name}`,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          
          await db.insert(schema.projectApis).values(apiMetadata).returning();
        }
        
        console.log(`API para tabela ${projectTableName} registrada com sucesso`);
      } catch (apiError) {
        console.error(`Erro ao registrar API para tabela ${projectTableName}:`, apiError);
        // Não interromper com erro, apenas registrar o problema
      }
    }
    
    return res.status(201).json({
      message: `Tabela ${name} criada com sucesso`,
      id: savedTable.id,
      name: savedTable.displayName,
      tableName: savedTable.tableName,
      projectId: savedTable.projectId,
      apiEnabled: savedTable.apiEnabled
    });
    
  } catch (error) {
    console.error('Erro ao criar tabela:', error);
    return res.status(500).json({
      message: 'Erro ao criar tabela no banco de dados',
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

// Rota para listar tabelas do banco de dados
async function handleGetDatabaseTables(req: Request, res: Response) {
  try {
    const projectId = req.query.projectId ? parseInt(req.query.projectId as string) : null;
    
    if (!projectId) {
      return res.status(400).json({ message: "O ID do projeto é obrigatório" });
    }
    
    // Verificar se o projeto existe
    const project = await storage.getProjectById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Projeto não encontrado" });
    }
    
    // Buscar tabelas vinculadas a este projeto diretamente da tabela de metadados
    const projectTables = await db.query.projectDatabases.findMany({
      where: eq(schema.projectDatabases.projectId, projectId)
    });
    
    // Para cada tabela, obter o número de registros
    const tablesWithCounts = await Promise.all(projectTables.map(async (table) => {
      try {
        const countQuery = sql`SELECT COUNT(*) as count FROM ${sql.identifier(table.tableName)}`;
        const countResult = await db.execute(countQuery);
        const rowCount = parseInt(countResult.rows[0]?.count || '0', 10);
        
        return {
          id: table.id,
          name: table.displayName,
          tableName: table.tableName, 
          description: table.description || '',
          rowCount,
          apiEnabled: table.apiEnabled,
          createdAt: table.createdAt,
          updatedAt: table.updatedAt
        };
      } catch (err) {
        // Se houver erro ao contar, manter o valor zero
        return {
          id: table.id,
          name: table.displayName,
          tableName: table.tableName,
          description: table.description || '',
          rowCount: 0,
          apiEnabled: table.apiEnabled,
          createdAt: table.createdAt,
          updatedAt: table.updatedAt
        };
      }
    }));
    
    return res.json({
      tables: tablesWithCounts
    });
  } catch (error) {
    console.error('Erro ao listar tabelas:', error);
    return res.status(500).json({
      message: 'Erro ao listar tabelas do banco de dados',
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // PayPal routes
  app.get("/paypal/setup", async (req, res) => {
    await loadPaypalDefault(req, res);
  });

  app.post("/paypal/order", async (req, res) => {
    // Request body should contain: { intent, amount, currency }
    await createPaypalOrder(req, res);
  });

  app.post("/paypal/order/:orderID/capture", async (req, res) => {
    await capturePaypalOrder(req, res);
  });

  // API routes prefix
  const apiPrefix = '/api';
  
  // Helper para tratamento de erros
  const handleError = (res: any, error: any, message = 'Erro interno do servidor') => {
    console.error(`API Error: ${message}`, error);
    return res.status(500).json({
      error: message,
      message: error.message || 'Um erro inesperado ocorreu.'
    });
  };

  // User routes
  app.post(`${apiPrefix}/auth/register`, async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const newUser = await storage.createUser(userData);
      res.status(201).json({
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        fullName: newUser.fullName,
        avatarUrl: newUser.avatarUrl,
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        return res.status(409).json({ message: 'Username or email already exists' });
      }
      console.error('Error creating user:', error);
      res.status(500).json({ message: 'Failed to create user' });
    }
  });

  app.post(`${apiPrefix}/auth/login`, async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await storage.getUserByUsername(username);
      
      if (!user) {
        return res.status(401).json({ message: 'Invalid username or password' });
      }
      
      const isValidPassword = await storage.validatePassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid username or password' });
      }
      
      req.session.userId = user.id;
      res.status(200).json({
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
      });
    } catch (error) {
      console.error('Error during login:', error);
      res.status(500).json({ message: 'An error occurred during login' });
    }
  });

  app.post(`${apiPrefix}/auth/logout`, (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error('Error during logout:', err);
        return res.status(500).json({ message: 'Failed to logout' });
      }
      res.status(200).json({ message: 'Logged out successfully' });
    });
  });

  // Project routes
  // Endpoint para buscar um projeto pelo nome
app.get(`${apiPrefix}/projects/by-name/:name`, async (req, res) => {
  try {
    const projectName = req.params.name;
    
    if (projectName === 'default') {
      // Caso especial para o projeto "default" - retorna o projeto mais recente do usuário
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Usuário não autenticado" });
      }
      
      const userProjects = await storage.getProjectsByUserId(req.session.userId);
      
      if (userProjects && userProjects.length > 0) {
        // Retorna o projeto mais recente
        console.log(`Projeto encontrado para o nome '${projectName}'`, userProjects[0]);
        return res.status(200).json(userProjects[0]);
      } else {
        return res.status(404).json({ message: "Nenhum projeto encontrado para o usuário" });
      }
    }
    
    // Busca projeto pelo nome
    const projects = await db.query.projects.findMany({
      where: eq(schema.projects.name, projectName),
      limit: 1
    });
    
    if (projects.length === 0) {
      return res.status(404).json({ message: `Projeto com nome '${projectName}' não encontrado` });
    }
    
    console.log(`Projeto encontrado para o nome '${projectName}'`, projects[0]);
    res.status(200).json(projects[0]);
  } catch (error) {
    console.error("Erro ao buscar projeto por nome:", error);
    res.status(500).json({ message: "Erro ao buscar projeto por nome" });
  }
});

app.get(`${apiPrefix}/projects`, async (req, res) => {
    try {
      // Verificar autenticação via session ou pelo middleware auth
      const userId = req.session?.userId || (req.user ? req.user.id : null);
      
      if (!userId) {
        return res.status(401).json({ message: 'Não autenticado. Faça login para continuar.' });
      }
      
      console.log(`Buscando projetos para o usuário ID: ${userId}`);
      const projects = await storage.getProjectsByUserId(userId);
      
      console.log(`Projetos encontrados: ${projects.length}`);
      return res.status(200).json(projects);
    } catch (error) {
      console.error('Erro ao buscar projetos:', error);
      return res.status(500).json({ message: 'Falha ao buscar projetos: ' + (error instanceof Error ? error.message : 'Erro desconhecido') });
    }
  });

  app.post(`${apiPrefix}/projects`, async (req, res) => {
    try {
      // Verificar autenticação via session ou pelo middleware auth
      const userId = req.session?.userId || (req.user ? req.user.id : null);
      
      if (!userId) {
        return res.status(401).json({ message: 'Não autenticado. Faça login para continuar.' });
      }
      
      console.log(`Criando novo projeto para o usuário ID: ${userId}. Dados recebidos:`, req.body);
      
      // Configuração padrão para novo projeto
      const projectData = insertProjectSchema.parse({
        name: req.body.name || 'Novo Projeto',
        description: req.body.description || 'Projeto criado no NextGen Site Builder',
        isPublic: req.body.isPublic !== undefined ? req.body.isPublic : false,
        thumbnail: req.body.thumbnail || null,
        userId: userId,
      });
      
      const newProject = await storage.createProject(projectData);
      console.log(`Projeto criado com sucesso: ${newProject.id}`);
      
      // Se for um projeto vazio (sem template), criar pelo menos uma página home
      if (!req.body.fromTemplate) {
        const homePage = await storage.createPage({
          projectId: newProject.id,
          name: 'Home',
          slug: 'home',
          isHomepage: true,
        });
        console.log(`Página home criada: ${homePage.id}`);
      }
      
      return res.status(201).json(newProject);
    } catch (error) {
      console.error('Erro ao criar projeto:', error);
      return res.status(500).json({ 
        message: 'Falha ao criar projeto: ' + (error instanceof Error ? error.message : 'Erro desconhecido')
      });
    }
  });

  app.get(`${apiPrefix}/projects/:id`, async (req, res) => {
    try {
      const userId = req.session.userId;
      const projectId = parseInt(req.params.id);
      
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const project = await storage.getProjectById(projectId);
      
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      
      if (project.userId !== userId && !project.isPublic) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      
      res.status(200).json(project);
    } catch (error) {
      console.error('Error fetching project:', error);
      res.status(500).json({ message: 'Failed to fetch project' });
    }
  });

  app.put(`${apiPrefix}/projects/:id`, async (req, res) => {
    try {
      const userId = req.session.userId;
      const projectId = parseInt(req.params.id);
      
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const project = await storage.getProjectById(projectId);
      
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      
      if (project.userId !== userId) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      
      const updatedProject = await storage.updateProject(projectId, req.body);
      res.status(200).json(updatedProject);
    } catch (error) {
      console.error('Error updating project:', error);
      res.status(500).json({ message: 'Failed to update project' });
    }
  });

  app.delete(`${apiPrefix}/projects/:id`, async (req, res) => {
    try {
      const userId = req.session.userId;
      const projectId = parseInt(req.params.id);
      
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const project = await storage.getProjectById(projectId);
      
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      
      if (project.userId !== userId) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      
      await storage.deleteProject(projectId);
      res.status(204).end();
    } catch (error) {
      console.error('Error deleting project:', error);
      res.status(500).json({ message: 'Failed to delete project' });
    }
  });

  // Page routes
  app.get(`${apiPrefix}/projects/:projectId/pages`, async (req, res) => {
    try {
      const userId = req.session.userId;
      const projectId = parseInt(req.params.projectId);
      
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const project = await storage.getProjectById(projectId);
      
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      
      if (project.userId !== userId && !project.isPublic) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      
      const pages = await storage.getPagesByProjectId(projectId);
      res.status(200).json(pages);
    } catch (error) {
      console.error('Error fetching pages:', error);
      res.status(500).json({ message: 'Failed to fetch pages' });
    }
  });

  app.post(`${apiPrefix}/projects/:projectId/pages`, async (req, res) => {
    try {
      const userId = req.session.userId;
      const projectId = parseInt(req.params.projectId);
      
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const project = await storage.getProjectById(projectId);
      
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      
      if (project.userId !== userId) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      
      const pageData = insertPageSchema.parse({
        ...req.body,
        projectId,
      });
      
      const newPage = await storage.createPage(pageData);
      res.status(201).json(newPage);
    } catch (error) {
      console.error('Error creating page:', error);
      res.status(500).json({ message: 'Failed to create page' });
    }
  });

  app.get(`${apiPrefix}/pages/:id`, async (req, res) => {
    try {
      const userId = req.session.userId;
      const pageId = parseInt(req.params.id);
      
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const page = await storage.getPageById(pageId);
      
      if (!page) {
        return res.status(404).json({ message: 'Page not found' });
      }
      
      const project = await storage.getProjectById(page.projectId);
      
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      
      if (project.userId !== userId && !project.isPublic) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      
      res.status(200).json(page);
    } catch (error) {
      console.error('Error fetching page:', error);
      res.status(500).json({ message: 'Failed to fetch page' });
    }
  });

  app.put(`${apiPrefix}/pages/:id`, async (req, res) => {
    try {
      const userId = req.session.userId;
      const pageId = parseInt(req.params.id);
      
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const page = await storage.getPageById(pageId);
      
      if (!page) {
        return res.status(404).json({ message: 'Page not found' });
      }
      
      const project = await storage.getProjectById(page.projectId);
      
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      
      if (project.userId !== userId) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      
      const updatedPage = await storage.updatePage(pageId, req.body);
      res.status(200).json(updatedPage);
    } catch (error) {
      console.error('Error updating page:', error);
      res.status(500).json({ message: 'Failed to update page' });
    }
  });

  app.delete(`${apiPrefix}/pages/:id`, async (req, res) => {
    try {
      const userId = req.session.userId;
      const pageId = parseInt(req.params.id);
      
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const page = await storage.getPageById(pageId);
      
      if (!page) {
        return res.status(404).json({ message: 'Page not found' });
      }
      
      const project = await storage.getProjectById(page.projectId);
      
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      
      if (project.userId !== userId) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      
      await storage.deletePage(pageId);
      res.status(204).end();
    } catch (error) {
      console.error('Error deleting page:', error);
      res.status(500).json({ message: 'Failed to delete page' });
    }
  });

  // Element routes
  app.get(`${apiPrefix}/pages/:pageId/elements`, async (req, res) => {
    try {
      const userId = req.session.userId;
      const pageId = parseInt(req.params.pageId);
      
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const page = await storage.getPageById(pageId);
      
      if (!page) {
        return res.status(404).json({ message: 'Page not found' });
      }
      
      const project = await storage.getProjectById(page.projectId);
      
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      
      if (project.userId !== userId && !project.isPublic) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      
      const elements = await storage.getElementsByPageId(pageId);
      res.status(200).json(elements);
    } catch (error) {
      console.error('Error fetching elements:', error);
      res.status(500).json({ message: 'Failed to fetch elements' });
    }
  });

  app.post(`${apiPrefix}/pages/:pageId/elements`, async (req, res) => {
    try {
      const userId = req.session.userId;
      const pageId = parseInt(req.params.pageId);
      
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const page = await storage.getPageById(pageId);
      
      if (!page) {
        return res.status(404).json({ message: 'Page not found' });
      }
      
      const project = await storage.getProjectById(page.projectId);
      
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      
      if (project.userId !== userId) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      
      const elementData = insertElementSchema.parse({
        ...req.body,
        pageId,
      });
      
      const newElement = await storage.createElement(elementData);
      res.status(201).json(newElement);
    } catch (error) {
      console.error('Error creating element:', error);
      res.status(500).json({ message: 'Failed to create element' });
    }
  });

  app.put(`${apiPrefix}/pages/:pageId/elements/:id`, async (req, res) => {
    try {
      const userId = req.session.userId;
      const pageId = parseInt(req.params.pageId);
      const elementId = parseInt(req.params.id);
      
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const page = await storage.getPageById(pageId);
      
      if (!page) {
        return res.status(404).json({ message: 'Page not found' });
      }
      
      const project = await storage.getProjectById(page.projectId);
      
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      
      if (project.userId !== userId) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      
      const updatedElement = await storage.updateElement(elementId, req.body);
      res.status(200).json(updatedElement);
    } catch (error) {
      console.error('Error updating element:', error);
      res.status(500).json({ message: 'Failed to update element' });
    }
  });

  app.delete(`${apiPrefix}/pages/:pageId/elements/:id`, async (req, res) => {
    try {
      const userId = req.session.userId;
      const pageId = parseInt(req.params.pageId);
      const elementId = parseInt(req.params.id);
      
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const page = await storage.getPageById(pageId);
      
      if (!page) {
        return res.status(404).json({ message: 'Page not found' });
      }
      
      const project = await storage.getProjectById(page.projectId);
      
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      
      if (project.userId !== userId) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      
      await storage.deleteElement(elementId);
      res.status(204).end();
    } catch (error) {
      console.error('Error deleting element:', error);
      res.status(500).json({ message: 'Failed to delete element' });
    }
  });

  // Templates routes
  app.get(`${apiPrefix}/templates`, async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      const templates = await storage.getTemplates(category);
      res.status(200).json(templates);
    } catch (error) {
      console.error('Error fetching templates:', error);
      res.status(500).json({ message: 'Failed to fetch templates' });
    }
  });

  app.get(`${apiPrefix}/templates/:id`, async (req, res) => {
    try {
      const templateId = parseInt(req.params.id);
      const template = await storage.getTemplateById(templateId);
      
      if (!template) {
        return res.status(404).json({ message: 'Template not found' });
      }
      
      const elements = await storage.getTemplateElementsByTemplateId(templateId);
      
      res.status(200).json({
        ...template,
        elements,
      });
    } catch (error) {
      console.error('Error fetching template:', error);
      res.status(500).json({ message: 'Failed to fetch template' });
    }
  });

  app.post(`${apiPrefix}/apply-template`, async (req, res) => {
    try {
      const userId = req.session.userId;
      const { templateId, pageId } = req.body;
      
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const page = await storage.getPageById(pageId);
      
      if (!page) {
        return res.status(404).json({ message: 'Page not found' });
      }
      
      const project = await storage.getProjectById(page.projectId);
      
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      
      if (project.userId !== userId) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      
      const template = await storage.getTemplateById(templateId);
      
      if (!template) {
        return res.status(404).json({ message: 'Template not found' });
      }
      
      const templateElements = await storage.getTemplateElementsByTemplateId(templateId);
      
      // Clear existing elements
      await storage.deleteElementsByPageId(pageId);
      
      // Create new elements from template
      const newElements = await storage.createElementsFromTemplate(pageId, templateElements);
      
      res.status(200).json({
        message: 'Template applied successfully',
        elements: newElements,
      });
    } catch (error) {
      console.error('Error applying template:', error);
      res.status(500).json({ message: 'Failed to apply template' });
    }
  });

  // Publish project
  app.post(`${apiPrefix}/projects/:id/publish`, async (req, res) => {
    try {
      const userId = req.session.userId;
      const projectId = parseInt(req.params.id);
      
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const project = await storage.getProjectById(projectId);
      
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      
      if (project.userId !== userId) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      
      // Generate a unique URL for the published project
      const publishedUrl = `site-${projectId}-${Date.now()}`;
      
      // Update project with published URL and make it public
      const updatedProject = await storage.updateProject(projectId, {
        isPublic: true,
        publishedUrl,
      });
      
      res.status(200).json({
        message: 'Project published successfully',
        publishedUrl,
      });
    } catch (error) {
      console.error('Error publishing project:', error);
      res.status(500).json({ message: 'Failed to publish project' });
    }
  });

  // ============= E-COMMERCE API ROUTES =============

  // Product Category routes
  app.get(`${apiPrefix}/projects/:projectId/product-categories`, async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const project = await db.query.projects.findFirst({
        where: eq(schema.projects.id, projectId),
      });

      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }

      const categories = await db.query.productCategories.findMany({
        where: eq(schema.productCategories.projectId, projectId),
        orderBy: [{ column: schema.productCategories.order, order: 'asc' }],
      });

      res.status(200).json(categories);
    } catch (error) {
      console.error('Error fetching product categories:', error);
      res.status(500).json({ message: 'Failed to fetch product categories' });
    }
  });

  app.get(`${apiPrefix}/product-categories/:id`, async (req, res) => {
    try {
      const categoryId = parseInt(req.params.id);
      const category = await db.query.productCategories.findFirst({
        where: eq(schema.productCategories.id, categoryId),
        with: {
          products: {
            with: {
              product: true
            }
          }
        }
      });

      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }

      res.status(200).json(category);
    } catch (error) {
      console.error('Error fetching product category:', error);
      res.status(500).json({ message: 'Failed to fetch product category' });
    }
  });

  // Product routes
  app.get(`${apiPrefix}/projects/:projectId/products`, async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const { featured, categoryId, search, limit } = req.query;
      const limitNumber = limit ? parseInt(limit as string) : undefined;

      let query = db.select()
        .from(schema.products)
        .where(eq(schema.products.projectId, projectId));

      // Apply filters
      if (featured === 'true') {
        query = query.where(eq(schema.products.featured, true));
      }

      if (search) {
        query = query.where(
          or(
            like(schema.products.name, `%${search}%`),
            like(schema.products.description, `%${search}%`)
          )
        );
      }

      // Get the results
      let products = await query.limit(limitNumber || 100);

      // Filter by category if needed
      if (categoryId) {
        const categoryIdNum = parseInt(categoryId as string);
        const productCategoryRelations = await db.query.productCategoryRelations.findMany({
          where: eq(schema.productCategoryRelations.categoryId, categoryIdNum),
        });

        const productIds = productCategoryRelations.map(relation => relation.productId);
        products = products.filter(product => productIds.includes(product.id));
      }

      // Get variants for each product
      const productIds = products.map(product => product.id);
      const variants = await db.query.productVariants.findMany({
        where: sql`${schema.productVariants.productId} IN ${productIds}`,
      });

      // Map variants to products
      const productsWithVariants = products.map(product => ({
        ...product,
        variants: variants.filter(variant => variant.productId === product.id)
      }));

      res.status(200).json(productsWithVariants);
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({ message: 'Failed to fetch products' });
    }
  });

  // Rota para buscar produtos por slug
  app.get(`${apiPrefix}/projects/:projectId/products/by-slug/:slug`, async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const slug = req.params.slug;
      
      if (!slug) {
        return res.status(400).json({ message: 'Slug de produto é obrigatório' });
      }
      
      // Buscar o produto por slug
      const product = await db.query.products.findFirst({
        where: and(
          eq(schema.products.projectId, projectId),
          eq(schema.products.slug, slug),
          eq(schema.products.status, 'published')
        )
      });
      
      if (!product) {
        return res.status(404).json({ message: 'Produto não encontrado' });
      }
      
      // Buscar as variantes do produto
      const variants = await db.query.productVariants.findMany({
        where: eq(schema.productVariants.productId, product.id)
      });
      
      // Buscar as categorias relacionadas ao produto
      const categoryRelations = await db.query.productCategoryRelations.findMany({
        where: eq(schema.productCategoryRelations.productId, product.id),
        with: {
          category: true
        }
      });
      
      const categories = categoryRelations.map(relation => relation.category);
      
      // Retornar produto com informações relacionadas
      res.status(200).json({
        ...product,
        variants,
        categories
      });
    } catch (error) {
      return handleError(res, error, 'Erro ao buscar produto por slug');
    }
  });
  
  // Rota para obter avaliações de um produto
  app.get(`${apiPrefix}/projects/:projectId/products/:productId/reviews`, async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const productId = parseInt(req.params.productId);
      
      // Verificar se o produto existe
      const product = await db.query.products.findFirst({
        where: and(
          eq(schema.products.id, productId),
          eq(schema.products.projectId, projectId)
        )
      });
      
      if (!product) {
        return res.status(404).json({ message: 'Produto não encontrado' });
      }
      
      // Buscar avaliações do produto no banco de dados
      const reviews = await db.query.reviews.findMany({
        where: and(
          eq(schema.reviews.productId, productId),
          eq(schema.reviews.projectId, projectId),
          eq(schema.reviews.status, 'published')
        ),
        orderBy: [desc(schema.reviews.createdAt)],
        with: {
          customer: {
            columns: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      });

      // Adicionar informações formatadas e calcular métricas
      const formattedReviews = reviews.map(review => ({
        ...review,
        customerName: review.customer ? `${review.customer.firstName} ${review.customer.lastName}`.trim() : 'Cliente',
        formattedDate: new Date(review.createdAt).toLocaleDateString('pt-BR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      }));

      // Calcular métricas de avaliação
      const totalReviews = formattedReviews.length;
      const averageRating = totalReviews > 0 
        ? formattedReviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
        : 0;
      
      // Agrupar avaliações por estrelas (1-5)
      const ratingCounts = {
        5: formattedReviews.filter(r => r.rating === 5).length,
        4: formattedReviews.filter(r => r.rating === 4).length,
        3: formattedReviews.filter(r => r.rating === 3).length,
        2: formattedReviews.filter(r => r.rating === 2).length,
        1: formattedReviews.filter(r => r.rating === 1).length
      };

      // Calcular porcentagens para cada nível de classificação
      const ratingPercentages = totalReviews > 0 
        ? {
            5: Math.round((ratingCounts[5] / totalReviews) * 100),
            4: Math.round((ratingCounts[4] / totalReviews) * 100),
            3: Math.round((ratingCounts[3] / totalReviews) * 100),
            2: Math.round((ratingCounts[2] / totalReviews) * 100),
            1: Math.round((ratingCounts[1] / totalReviews) * 100)
          }
        : { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

      // Retornar resultado com todos os dados e métricas
      res.status(200).json({
        reviews: formattedReviews,
        metrics: {
          totalReviews,
          averageRating: parseFloat(averageRating.toFixed(1)),
          ratingCounts,
          ratingPercentages
        }
      });
    } catch (error) {
      return handleError(res, error, 'Erro ao buscar avaliações do produto');
    }
  });

  // Rota para adicionar uma nova avaliação de produto
  app.post(`${apiPrefix}/projects/:projectId/products/:productId/reviews`, isAuthenticated, async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const productId = parseInt(req.params.productId);
      const userId = req.session?.userId || (req.user ? req.user.id : null);
      
      if (!userId) {
        return res.status(401).json({ message: 'Usuário não autenticado' });
      }
      
      // Verificar se o produto existe
      const product = await db.query.products.findFirst({
        where: and(
          eq(schema.products.id, productId),
          eq(schema.products.projectId, projectId)
        )
      });
      
      if (!product) {
        return res.status(404).json({ message: 'Produto não encontrado' });
      }
      
      // Verificar se o cliente existe ou criar um cliente para o usuário se necessário
      let customerId;
      const existingCustomer = await db.query.customers.findFirst({
        where: and(
          eq(schema.customers.userId, userId),
          eq(schema.customers.projectId, projectId)
        )
      });
      
      if (existingCustomer) {
        customerId = existingCustomer.id;
      } else {
        // Buscar dados do usuário
        const user = await storage.getUserById(userId);
        if (!user) {
          return res.status(404).json({ message: 'Usuário não encontrado' });
        }
        
        // Criar um cliente para este usuário
        const newCustomer = await db.insert(schema.customers).values({
          projectId,
          userId,
          email: user.email,
          firstName: user.fullName ? user.fullName.split(' ')[0] : '',
          lastName: user.fullName && user.fullName.split(' ').length > 1 ? user.fullName.split(' ').slice(1).join(' ') : '',
          createdAt: new Date(),
          updatedAt: new Date()
        }).returning();
        
        customerId = newCustomer[0].id;
      }
      
      // Validar dados da avaliação
      const reviewData = insertReviewSchema.parse({
        ...req.body,
        projectId,
        productId,
        customerId,
        status: 'pending', // Por padrão, avaliações precisam ser aprovadas
        isVerifiedPurchase: false, // Será atualizado com base no histórico de pedidos
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      // Verificar se o usuário já comprou o produto (para marcar como compra verificada)
      const userOrders = await db.query.orders.findMany({
        where: and(
          eq(schema.orders.customerId, customerId),
          eq(schema.orders.projectId, projectId),
          eq(schema.orders.status, 'completed')
        ),
        with: {
          items: true
        }
      });
      
      // Verificar se algum pedido contém o produto
      const hasPurchasedProduct = userOrders.some(order => 
        order.items.some(item => item.productId === productId)
      );
      
      // Atualizar o campo isVerifiedPurchase
      if (hasPurchasedProduct) {
        reviewData.isVerifiedPurchase = true;
        // Para clientes que compraram o produto, podemos auto-aprovar a avaliação
        reviewData.status = 'published';
      }
      
      // Salvar a avaliação
      const newReview = await db.insert(schema.reviews).values(reviewData).returning();
      
      // Retornar a nova avaliação
      res.status(201).json({
        ...newReview[0],
        message: hasPurchasedProduct 
          ? 'Sua avaliação foi publicada. Obrigado pelo feedback!' 
          : 'Sua avaliação foi recebida e será publicada após revisão. Obrigado pelo feedback!'
      });
    } catch (error) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ 
          message: 'Dados inválidos para avaliação', 
          errors: error.errors 
        });
      }
      return handleError(res, error, 'Erro ao adicionar avaliação');
    }
  });

  // Rota para atualizar status de uma avaliação (para administradores)
  app.patch(`${apiPrefix}/projects/:projectId/reviews/:reviewId/status`, isAuthenticated, async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const reviewId = parseInt(req.params.reviewId);
      const { status } = req.body;
      
      // Verificar se o status é válido
      if (!['pending', 'published', 'rejected'].includes(status)) {
        return res.status(400).json({ message: 'Status inválido. Valores permitidos: pending, published, rejected' });
      }
      
      // Verificar se a avaliação existe
      const review = await db.query.reviews.findFirst({
        where: and(
          eq(schema.reviews.id, reviewId),
          eq(schema.reviews.projectId, projectId)
        )
      });
      
      if (!review) {
        return res.status(404).json({ message: 'Avaliação não encontrada' });
      }
      
      // Atualizar o status
      const updatedReview = await db.update(schema.reviews)
        .set({ 
          status, 
          updatedAt: new Date() 
        })
        .where(and(
          eq(schema.reviews.id, reviewId),
          eq(schema.reviews.projectId, projectId)
        ))
        .returning();
      
      res.status(200).json(updatedReview[0]);
    } catch (error) {
      return handleError(res, error, 'Erro ao atualizar status da avaliação');
    }
  });

  // Rota para excluir uma avaliação
  app.delete(`${apiPrefix}/projects/:projectId/reviews/:reviewId`, isAuthenticated, async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const reviewId = parseInt(req.params.reviewId);
      const userId = req.session?.userId || (req.user ? req.user.id : null);
      
      if (!userId) {
        return res.status(401).json({ message: 'Usuário não autenticado' });
      }
      
      // Verificar se a avaliação existe
      const review = await db.query.reviews.findFirst({
        where: and(
          eq(schema.reviews.id, reviewId),
          eq(schema.reviews.projectId, projectId)
        ),
        with: {
          customer: true
        }
      });
      
      if (!review) {
        return res.status(404).json({ message: 'Avaliação não encontrada' });
      }
      
      // Verificar permissão: apenas o próprio usuário que criou ou um administrador pode excluir
      if (review.customer.userId !== userId) {
        // Aqui verificaríamos se o usuário é administrador do projeto
        // Para simplificar, vamos apenas retornar erro de permissão
        return res.status(403).json({ message: 'Você não tem permissão para excluir esta avaliação' });
      }
      
      // Excluir a avaliação
      await db.delete(schema.reviews)
        .where(and(
          eq(schema.reviews.id, reviewId),
          eq(schema.reviews.projectId, projectId)
        ));
      
      res.status(200).json({ message: 'Avaliação excluída com sucesso' });
    } catch (error) {
      return handleError(res, error, 'Erro ao excluir avaliação');
    }
  });

  // Endpoints para Wishlist (Lista de Desejos)
  
  // Obter todas as listas de desejos de um cliente
  app.get(`${apiPrefix}/projects/:projectId/wishlists`, isAuthenticated, async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const userId = req.session?.userId || (req.user ? req.user.id : null);
      
      if (!userId) {
        return res.status(401).json({ message: 'Usuário não autenticado' });
      }
      
      // Buscar o cliente associado ao usuário
      const customer = await db.query.customers.findFirst({
        where: and(
          eq(schema.customers.userId, userId),
          eq(schema.customers.projectId, projectId)
        )
      });
      
      if (!customer) {
        return res.status(404).json({ message: 'Cliente não encontrado para este usuário' });
      }
      
      // Buscar as listas de desejos do cliente
      const wishlists = await db.query.wishlists.findMany({
        where: and(
          eq(schema.wishlists.customerId, customer.id),
          eq(schema.wishlists.projectId, projectId)
        ),
        orderBy: [desc(schema.wishlists.createdAt)]
      });
      
      // Para cada lista, buscar os itens
      const wishlistsWithItems = await Promise.all(wishlists.map(async (wishlist) => {
        const items = await db.query.wishlistItems.findMany({
          where: eq(schema.wishlistItems.wishlistId, wishlist.id),
          with: {
            product: {
              columns: {
                id: true,
                name: true,
                slug: true,
                price: true,
                salePrice: true,
                images: true,
                status: true
              }
            },
            variant: {
              columns: {
                id: true,
                name: true,
                price: true,
                salePrice: true,
                images: true
              }
            }
          }
        });
        
        const activeItems = items.filter(item => 
          item.product && item.product.status === 'published'
        );
        
        return {
          ...wishlist,
          itemCount: activeItems.length,
          items: activeItems
        };
      }));
      
      return res.status(200).json(wishlistsWithItems);
    } catch (error) {
      return handleError(res, error, 'Erro ao buscar listas de desejos');
    }
  });
  
  // Obter uma lista de desejos específica
  app.get(`${apiPrefix}/projects/:projectId/wishlists/:wishlistId`, async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const wishlistId = parseInt(req.params.wishlistId);
      
      // Verificar se a lista existe
      const wishlist = await db.query.wishlists.findFirst({
        where: and(
          eq(schema.wishlists.id, wishlistId),
          eq(schema.wishlists.projectId, projectId)
        )
      });
      
      if (!wishlist) {
        return res.status(404).json({ message: 'Lista de desejos não encontrada' });
      }
      
      // Se a lista não for pública, verificar autenticação
      if (!wishlist.isPublic) {
        const userId = req.session?.userId || (req.user ? req.user.id : null);
        
        if (!userId) {
          return res.status(401).json({ message: 'Esta lista de desejos é privada' });
        }
        
        // Verificar se o usuário é o proprietário da lista
        const customer = await db.query.customers.findFirst({
          where: and(
            eq(schema.customers.userId, userId),
            eq(schema.customers.projectId, projectId)
          )
        });
        
        if (!customer || customer.id !== wishlist.customerId) {
          return res.status(403).json({ message: 'Você não tem permissão para acessar esta lista de desejos' });
        }
      }
      
      // Buscar os itens da lista de desejos
      const items = await db.query.wishlistItems.findMany({
        where: eq(schema.wishlistItems.wishlistId, wishlistId),
        with: {
          product: true,
          variant: true
        }
      });
      
      // Filtrar apenas produtos ativos
      const activeItems = items.filter(item => 
        item.product && item.product.status === 'published'
      );
      
      // Buscar informações do cliente para exibir o nome
      const customer = await db.query.customers.findFirst({
        where: eq(schema.customers.id, wishlist.customerId),
        columns: {
          id: true,
          firstName: true,
          lastName: true
        }
      });
      
      // Adicionar informações formatadas
      const result = {
        ...wishlist,
        customerName: customer ? `${customer.firstName} ${customer.lastName}`.trim() : 'Cliente',
        formattedDate: new Date(wishlist.createdAt).toLocaleDateString('pt-BR'),
        itemCount: activeItems.length,
        items: activeItems
      };
      
      return res.status(200).json(result);
    } catch (error) {
      return handleError(res, error, 'Erro ao buscar lista de desejos');
    }
  });
  
  // Criar uma nova lista de desejos
  app.post(`${apiPrefix}/projects/:projectId/wishlists`, isAuthenticated, async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const userId = req.session?.userId || (req.user ? req.user.id : null);
      
      if (!userId) {
        return res.status(401).json({ message: 'Usuário não autenticado' });
      }
      
      // Buscar o cliente associado ao usuário
      let customer = await db.query.customers.findFirst({
        where: and(
          eq(schema.customers.userId, userId),
          eq(schema.customers.projectId, projectId)
        )
      });
      
      // Se não existir cliente para este usuário, criar um
      if (!customer) {
        const user = await storage.getUserById(userId);
        if (!user) {
          return res.status(404).json({ message: 'Usuário não encontrado' });
        }
        
        const newCustomer = await db.insert(schema.customers).values({
          projectId,
          userId,
          email: user.email,
          firstName: user.fullName ? user.fullName.split(' ')[0] : '',
          lastName: user.fullName && user.fullName.split(' ').length > 1 ? user.fullName.split(' ').slice(1).join(' ') : '',
          createdAt: new Date(),
          updatedAt: new Date()
        }).returning();
        
        customer = newCustomer[0];
      }
      
      // Validar dados da lista de desejos
      const wishlistData = insertWishlistSchema.parse({
        ...req.body,
        projectId,
        customerId: customer.id,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      // Criar a lista de desejos
      const newWishlist = await db.insert(schema.wishlists).values(wishlistData).returning();
      
      res.status(201).json(newWishlist[0]);
    } catch (error) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ 
          message: 'Dados inválidos para lista de desejos', 
          errors: error.errors 
        });
      }
      return handleError(res, error, 'Erro ao criar lista de desejos');
    }
  });
  
  // Adicionar um produto a uma lista de desejos
  app.post(`${apiPrefix}/projects/:projectId/wishlists/:wishlistId/items`, isAuthenticated, async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const wishlistId = parseInt(req.params.wishlistId);
      const { productId, variantId } = req.body;
      const userId = req.session?.userId || (req.user ? req.user.id : null);
      
      if (!userId) {
        return res.status(401).json({ message: 'Usuário não autenticado' });
      }
      
      if (!productId) {
        return res.status(400).json({ message: 'ID do produto é obrigatório' });
      }
      
      // Verificar se a lista de desejos existe
      const wishlist = await db.query.wishlists.findFirst({
        where: and(
          eq(schema.wishlists.id, wishlistId),
          eq(schema.wishlists.projectId, projectId)
        ),
        with: {
          customer: true
        }
      });
      
      if (!wishlist) {
        return res.status(404).json({ message: 'Lista de desejos não encontrada' });
      }
      
      // Verificar se o usuário é o proprietário da lista
      if (wishlist.customer.userId !== userId) {
        return res.status(403).json({ message: 'Você não tem permissão para modificar esta lista de desejos' });
      }
      
      // Verificar se o produto existe
      const product = await db.query.products.findFirst({
        where: and(
          eq(schema.products.id, productId),
          eq(schema.products.projectId, projectId)
        )
      });
      
      if (!product) {
        return res.status(404).json({ message: 'Produto não encontrado' });
      }
      
      // Verificar se a variante existe, se fornecida
      if (variantId) {
        const variant = await db.query.productVariants.findFirst({
          where: and(
            eq(schema.productVariants.id, variantId),
            eq(schema.productVariants.productId, productId)
          )
        });
        
        if (!variant) {
          return res.status(404).json({ message: 'Variante do produto não encontrada' });
        }
      }
      
      // Verificar se o produto já está na lista
      const existingItem = await db.query.wishlistItems.findFirst({
        where: and(
          eq(schema.wishlistItems.wishlistId, wishlistId),
          eq(schema.wishlistItems.productId, productId),
          variantId ? eq(schema.wishlistItems.variantId, variantId) : sql`TRUE`
        )
      });
      
      if (existingItem) {
        return res.status(400).json({ 
          message: 'Este produto já está na sua lista de desejos',
          item: existingItem
        });
      }
      
      // Adicionar o produto à lista de desejos
      const wishlistItemData = insertWishlistItemSchema.parse({
        wishlistId,
        productId,
        variantId: variantId || null,
        createdAt: new Date()
      });
      
      const newItem = await db.insert(schema.wishlistItems).values(wishlistItemData).returning();
      
      // Buscar dados completos do item adicionado
      const item = await db.query.wishlistItems.findFirst({
        where: eq(schema.wishlistItems.id, newItem[0].id),
        with: {
          product: true,
          variant: true
        }
      });
      
      res.status(201).json({
        ...item,
        message: 'Produto adicionado à lista de desejos com sucesso'
      });
    } catch (error) {
      return handleError(res, error, 'Erro ao adicionar produto à lista de desejos');
    }
  });
  
  // Remover um produto de uma lista de desejos
  app.delete(`${apiPrefix}/projects/:projectId/wishlists/:wishlistId/items/:itemId`, isAuthenticated, async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const wishlistId = parseInt(req.params.wishlistId);
      const itemId = parseInt(req.params.itemId);
      const userId = req.session?.userId || (req.user ? req.user.id : null);
      
      if (!userId) {
        return res.status(401).json({ message: 'Usuário não autenticado' });
      }
      
      // Verificar se a lista de desejos existe
      const wishlist = await db.query.wishlists.findFirst({
        where: and(
          eq(schema.wishlists.id, wishlistId),
          eq(schema.wishlists.projectId, projectId)
        ),
        with: {
          customer: true
        }
      });
      
      if (!wishlist) {
        return res.status(404).json({ message: 'Lista de desejos não encontrada' });
      }
      
      // Verificar se o usuário é o proprietário da lista
      if (wishlist.customer.userId !== userId) {
        return res.status(403).json({ message: 'Você não tem permissão para modificar esta lista de desejos' });
      }
      
      // Verificar se o item existe na lista
      const item = await db.query.wishlistItems.findFirst({
        where: and(
          eq(schema.wishlistItems.id, itemId),
          eq(schema.wishlistItems.wishlistId, wishlistId)
        )
      });
      
      if (!item) {
        return res.status(404).json({ message: 'Item não encontrado na lista de desejos' });
      }
      
      // Remover o item da lista de desejos
      await db.delete(schema.wishlistItems)
        .where(eq(schema.wishlistItems.id, itemId));
      
      res.status(200).json({ message: 'Item removido da lista de desejos com sucesso' });
    } catch (error) {
      return handleError(res, error, 'Erro ao remover produto da lista de desejos');
    }
  });
  
  // Atualizar uma lista de desejos (nome, visibilidade)
  app.patch(`${apiPrefix}/projects/:projectId/wishlists/:wishlistId`, isAuthenticated, async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const wishlistId = parseInt(req.params.wishlistId);
      const { name, isPublic } = req.body;
      const userId = req.session?.userId || (req.user ? req.user.id : null);
      
      if (!userId) {
        return res.status(401).json({ message: 'Usuário não autenticado' });
      }
      
      // Verificar se a lista de desejos existe
      const wishlist = await db.query.wishlists.findFirst({
        where: and(
          eq(schema.wishlists.id, wishlistId),
          eq(schema.wishlists.projectId, projectId)
        ),
        with: {
          customer: true
        }
      });
      
      if (!wishlist) {
        return res.status(404).json({ message: 'Lista de desejos não encontrada' });
      }
      
      // Verificar se o usuário é o proprietário da lista
      if (wishlist.customer.userId !== userId) {
        return res.status(403).json({ message: 'Você não tem permissão para modificar esta lista de desejos' });
      }
      
      // Construir objeto com dados a serem atualizados
      const updateData = {};
      if (name !== undefined) updateData.name = name;
      if (isPublic !== undefined) updateData.isPublic = isPublic;
      updateData.updatedAt = new Date();
      
      // Atualizar a lista de desejos
      const updatedWishlist = await db.update(schema.wishlists)
        .set(updateData)
        .where(and(
          eq(schema.wishlists.id, wishlistId),
          eq(schema.wishlists.projectId, projectId)
        ))
        .returning();
      
      res.status(200).json(updatedWishlist[0]);
    } catch (error) {
      return handleError(res, error, 'Erro ao atualizar lista de desejos');
    }
  });

  // Endpoints para Descontos e Cupons

  // Listar todos os descontos/cupons disponíveis
  app.get(`${apiPrefix}/projects/:projectId/discounts`, async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const { active } = req.query;
      
      // Construir query base
      let query = and(
        eq(schema.discounts.projectId, projectId)
      );
      
      // Filtrar por status (ativo/inativo)
      if (active === 'true') {
        const now = new Date();
        query = and(
          query,
          or(
            eq(schema.discounts.expiresAt, null),
            sql`${schema.discounts.expiresAt} > ${now}`
          ),
          or(
            eq(schema.discounts.startsAt, null),
            sql`${schema.discounts.startsAt} <= ${now}`
          ),
          eq(schema.discounts.isActive, true)
        );
      } else if (active === 'false') {
        const now = new Date();
        query = and(
          query,
          or(
            and(
              sql`${schema.discounts.expiresAt} IS NOT NULL`,
              sql`${schema.discounts.expiresAt} <= ${now}`
            ),
            eq(schema.discounts.isActive, false)
          )
        );
      }
      
      // Buscar descontos com filtros aplicados
      const discounts = await db.query.discounts.findMany({
        where: query,
        orderBy: [
          // Ordenar por expiração: primeiro os que vão expirar em breve
          asc(schema.discounts.expiresAt),
          // Depois por data de criação (mais novos primeiro)
          desc(schema.discounts.createdAt)
        ]
      });
      
      // Adicionar informações de status e tempo restante
      const now = new Date();
      const formattedDiscounts = discounts.map(discount => {
        const isExpired = discount.expiresAt && new Date(discount.expiresAt) < now;
        const isNotStarted = discount.startsAt && new Date(discount.startsAt) > now;
        
        let status = 'active';
        if (isExpired) status = 'expired';
        else if (isNotStarted) status = 'scheduled';
        else if (!discount.isActive) status = 'inactive';
        
        // Calcular tempo restante em dias
        let daysRemaining = null;
        if (discount.expiresAt && !isExpired) {
          const diff = new Date(discount.expiresAt).getTime() - now.getTime();
          daysRemaining = Math.ceil(diff / (1000 * 3600 * 24));
        }
        
        // Formatar datas para exibição
        const formatDate = (date) => {
          if (!date) return null;
          return new Date(date).toLocaleDateString('pt-BR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
        };
        
        return {
          ...discount,
          status,
          daysRemaining,
          formattedStartDate: formatDate(discount.startsAt),
          formattedEndDate: formatDate(discount.expiresAt),
          formattedCreatedAt: formatDate(discount.createdAt)
        };
      });
      
      return res.status(200).json(formattedDiscounts);
    } catch (error) {
      return handleError(res, error, 'Erro ao listar descontos');
    }
  });
  
  // Obter detalhes de um desconto específico
  app.get(`${apiPrefix}/projects/:projectId/discounts/:discountId`, async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const discountId = parseInt(req.params.discountId);
      
      const discount = await db.query.discounts.findFirst({
        where: and(
          eq(schema.discounts.id, discountId),
          eq(schema.discounts.projectId, projectId)
        )
      });
      
      if (!discount) {
        return res.status(404).json({ message: 'Desconto não encontrado' });
      }
      
      // Verificar status atual do desconto
      const now = new Date();
      const isExpired = discount.expiresAt && new Date(discount.expiresAt) < now;
      const isNotStarted = discount.startsAt && new Date(discount.startsAt) > now;
      
      let status = 'active';
      if (isExpired) status = 'expired';
      else if (isNotStarted) status = 'scheduled';
      else if (!discount.isActive) status = 'inactive';
      
      // Calcular tempo restante em dias
      let daysRemaining = null;
      if (discount.expiresAt && !isExpired) {
        const diff = new Date(discount.expiresAt).getTime() - now.getTime();
        daysRemaining = Math.ceil(diff / (1000 * 3600 * 24));
      }
      
      // Formatar datas para exibição
      const formatDate = (date) => {
        if (!date) return null;
        return new Date(date).toLocaleDateString('pt-BR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      };
      
      // Adicionar informações de uso, se o desconto for um cupom
      let usage = null;
      if (discount.type === 'coupon' && discount.code) {
        // Aqui buscaríamos no banco de dados quantas vezes o cupom foi usado
        // Implementação simplificada para demonstração
        usage = {
          totalUses: 0,
          remainingUses: discount.usageLimit ? discount.usageLimit : 'ilimitado'
        };
      }
      
      const result = {
        ...discount,
        status,
        daysRemaining,
        formattedStartDate: formatDate(discount.startsAt),
        formattedEndDate: formatDate(discount.expiresAt),
        formattedCreatedAt: formatDate(discount.createdAt),
        formattedUpdatedAt: formatDate(discount.updatedAt),
        usage
      };
      
      return res.status(200).json(result);
    } catch (error) {
      return handleError(res, error, 'Erro ao buscar detalhes do desconto');
    }
  });
  
  // Criar um novo desconto/cupom
  app.post(`${apiPrefix}/projects/:projectId/discounts`, isAuthenticated, async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const userId = req.session?.userId || (req.user ? req.user.id : null);
      
      if (!userId) {
        return res.status(401).json({ message: 'Usuário não autenticado' });
      }
      
      // Validar dados do desconto
      const discountData = insertDiscountSchema.parse({
        ...req.body,
        projectId,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      // Se for um cupom, gerar código se não fornecido
      if (discountData.type === 'coupon' && !discountData.code) {
        // Gerar código aleatório
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 8; i++) {
          code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        discountData.code = code;
      }
      
      // Criar o desconto no banco de dados
      const newDiscount = await db.insert(schema.discounts).values(discountData).returning();
      
      // Se for uma promoção para categorias ou produtos específicos, salvar as relações
      if (req.body.categories && Array.isArray(req.body.categories) && req.body.categories.length > 0) {
        const categoryRelations = req.body.categories.map(categoryId => ({
          discountId: newDiscount[0].id,
          categoryId: parseInt(categoryId),
          projectId
        }));
        
        await db.insert(schema.discountCategoryRelations).values(categoryRelations);
      }
      
      if (req.body.products && Array.isArray(req.body.products) && req.body.products.length > 0) {
        const productRelations = req.body.products.map(productId => ({
          discountId: newDiscount[0].id,
          productId: parseInt(productId),
          projectId
        }));
        
        await db.insert(schema.discountProductRelations).values(productRelations);
      }
      
      res.status(201).json({
        ...newDiscount[0],
        message: discountData.type === 'coupon' 
          ? `Cupom ${discountData.code} criado com sucesso` 
          : 'Promoção criada com sucesso'
      });
    } catch (error) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ 
          message: 'Dados inválidos para o desconto', 
          errors: error.errors 
        });
      }
      return handleError(res, error, 'Erro ao criar desconto');
    }
  });
  
  // Atualizar um desconto existente
  app.patch(`${apiPrefix}/projects/:projectId/discounts/:discountId`, isAuthenticated, async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const discountId = parseInt(req.params.discountId);
      const userId = req.session?.userId || (req.user ? req.user.id : null);
      
      if (!userId) {
        return res.status(401).json({ message: 'Usuário não autenticado' });
      }
      
      // Verificar se o desconto existe
      const discount = await db.query.discounts.findFirst({
        where: and(
          eq(schema.discounts.id, discountId),
          eq(schema.discounts.projectId, projectId)
        )
      });
      
      if (!discount) {
        return res.status(404).json({ message: 'Desconto não encontrado' });
      }
      
      // Construir objeto com dados a serem atualizados
      const updateData = {
        ...req.body,
        updatedAt: new Date()
      };
      
      // Remover campos que não devem ser atualizados
      delete updateData.id;
      delete updateData.projectId;
      delete updateData.createdAt;
      delete updateData.categories;
      delete updateData.products;
      
      // Atualizar o desconto
      const updatedDiscount = await db.update(schema.discounts)
        .set(updateData)
        .where(and(
          eq(schema.discounts.id, discountId),
          eq(schema.discounts.projectId, projectId)
        ))
        .returning();
      
      // Atualizar relações com categorias, se fornecidas
      if (req.body.categories && Array.isArray(req.body.categories)) {
        // Excluir relações anteriores
        await db.delete(schema.discountCategoryRelations)
          .where(eq(schema.discountCategoryRelations.discountId, discountId));
        
        // Criar novas relações
        if (req.body.categories.length > 0) {
          const categoryRelations = req.body.categories.map(categoryId => ({
            discountId,
            categoryId: parseInt(categoryId),
            projectId
          }));
          
          await db.insert(schema.discountCategoryRelations).values(categoryRelations);
        }
      }
      
      // Atualizar relações com produtos, se fornecidas
      if (req.body.products && Array.isArray(req.body.products)) {
        // Excluir relações anteriores
        await db.delete(schema.discountProductRelations)
          .where(eq(schema.discountProductRelations.discountId, discountId));
        
        // Criar novas relações
        if (req.body.products.length > 0) {
          const productRelations = req.body.products.map(productId => ({
            discountId,
            productId: parseInt(productId),
            projectId
          }));
          
          await db.insert(schema.discountProductRelations).values(productRelations);
        }
      }
      
      res.status(200).json({
        ...updatedDiscount[0],
        message: 'Desconto atualizado com sucesso'
      });
    } catch (error) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ 
          message: 'Dados inválidos para atualização do desconto', 
          errors: error.errors 
        });
      }
      return handleError(res, error, 'Erro ao atualizar desconto');
    }
  });
  
  // Excluir um desconto
  app.delete(`${apiPrefix}/projects/:projectId/discounts/:discountId`, isAuthenticated, async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const discountId = parseInt(req.params.discountId);
      const userId = req.session?.userId || (req.user ? req.user.id : null);
      
      if (!userId) {
        return res.status(401).json({ message: 'Usuário não autenticado' });
      }
      
      // Verificar se o desconto existe
      const discount = await db.query.discounts.findFirst({
        where: and(
          eq(schema.discounts.id, discountId),
          eq(schema.discounts.projectId, projectId)
        )
      });
      
      if (!discount) {
        return res.status(404).json({ message: 'Desconto não encontrado' });
      }
      
      // Excluir relações de categorias e produtos primeiro
      await db.delete(schema.discountCategoryRelations)
        .where(eq(schema.discountCategoryRelations.discountId, discountId));
      
      await db.delete(schema.discountProductRelations)
        .where(eq(schema.discountProductRelations.discountId, discountId));
      
      // Excluir o desconto
      await db.delete(schema.discounts)
        .where(and(
          eq(schema.discounts.id, discountId),
          eq(schema.discounts.projectId, projectId)
        ));
      
      res.status(200).json({ 
        message: discount.type === 'coupon' 
          ? `Cupom ${discount.code} excluído com sucesso` 
          : 'Promoção excluída com sucesso'
      });
    } catch (error) {
      return handleError(res, error, 'Erro ao excluir desconto');
    }
  });
  
  // Verificar validade de um cupom
  app.post(`${apiPrefix}/projects/:projectId/discounts/validate-coupon`, async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const { code, cartTotal, cartItems } = req.body;
      
      if (!code) {
        return res.status(400).json({ message: 'Código do cupom é obrigatório' });
      }
      
      // Buscar o cupom pelo código
      const discount = await db.query.discounts.findFirst({
        where: and(
          eq(schema.discounts.code, code.toUpperCase()),
          eq(schema.discounts.projectId, projectId),
          eq(schema.discounts.type, 'coupon')
        )
      });
      
      if (!discount) {
        return res.status(404).json({ 
          valid: false,
          message: 'Cupom não encontrado' 
        });
      }
      
      // Verificar se o cupom está ativo
      if (!discount.isActive) {
        return res.status(400).json({ 
          valid: false,
          message: 'Este cupom não está ativo' 
        });
      }
      
      // Verificar data de validade
      const now = new Date();
      if (discount.expiresAt && new Date(discount.expiresAt) < now) {
        return res.status(400).json({ 
          valid: false,
          message: 'Este cupom expirou' 
        });
      }
      
      // Verificar data de início
      if (discount.startsAt && new Date(discount.startsAt) > now) {
        return res.status(400).json({ 
          valid: false,
          message: `Este cupom só será válido a partir de ${new Date(discount.startsAt).toLocaleDateString('pt-BR')}` 
        });
      }
      
      // Verificar limite de uso (simplificado, em sistema real verificaria uso por usuário)
      if (discount.usageLimit !== null && discount.usageCount >= discount.usageLimit) {
        return res.status(400).json({ 
          valid: false,
          message: 'Este cupom já atingiu o limite máximo de uso' 
        });
      }
      
      // Verificar valor mínimo do pedido
      if (discount.minimumOrderValue && cartTotal < discount.minimumOrderValue) {
        return res.status(400).json({ 
          valid: false,
          message: `Este cupom só é válido para pedidos acima de R$ ${discount.minimumOrderValue.toFixed(2)}` 
        });
      }
      
      // Cálculo do valor do desconto
      let discountValue = 0;
      if (discount.valueType === 'percentage') {
        discountValue = (cartTotal * discount.value) / 100;
      } else { // fixed
        discountValue = discount.value;
      }
      
      // Aplicar limite máximo de desconto, se existir
      if (discount.maxDiscountValue && discountValue > discount.maxDiscountValue) {
        discountValue = discount.maxDiscountValue;
      }
      
      // Formatar mensagem de sucesso
      let successMessage = '';
      if (discount.valueType === 'percentage') {
        successMessage = `Cupom aplicado: ${discount.value}% de desconto`;
      } else {
        successMessage = `Cupom aplicado: R$ ${discount.value.toFixed(2)} de desconto`;
      }
      
      return res.status(200).json({
        valid: true,
        discount: {
          ...discount,
          appliedValue: discountValue
        },
        message: successMessage
      });
    } catch (error) {
      return handleError(res, error, 'Erro ao validar cupom');
    }
  });

  // Endpoints para gerenciamento de estoque (Inventory)

  // Obter o estoque de um produto
  app.get(`${apiPrefix}/projects/:projectId/products/:productId/inventory`, async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const productId = parseInt(req.params.productId);
      
      // Verificar se o produto existe
      const product = await db.query.products.findFirst({
        where: and(
          eq(schema.products.id, productId),
          eq(schema.products.projectId, projectId)
        )
      });
      
      if (!product) {
        return res.status(404).json({ message: 'Produto não encontrado' });
      }
      
      // Buscar informações de estoque do produto e suas variantes
      const inventoryItems = await db.query.inventory.findMany({
        where: and(
          eq(schema.inventory.productId, productId),
          eq(schema.inventory.projectId, projectId)
        ),
        with: {
          variant: {
            columns: {
              id: true,
              name: true,
              sku: true
            }
          }
        }
      });
      
      // Se não houver registros de estoque, criar um estoque padrão para o produto
      if (inventoryItems.length === 0) {
        // Verificar se o produto tem variantes
        const variants = await db.query.productVariants.findMany({
          where: eq(schema.productVariants.productId, productId)
        });
        
        // Se o produto tiver variantes, criar registros de estoque para cada uma
        if (variants.length > 0) {
          const inventoryData = variants.map(variant => ({
            projectId,
            productId,
            variantId: variant.id,
            sku: variant.sku || `PROD-${productId}-VAR-${variant.id}`,
            quantity: 0,
            lowStockThreshold: 5,
            status: 'out_of_stock',
            createdAt: new Date(),
            updatedAt: new Date()
          }));
          
          await db.insert(schema.inventory).values(inventoryData).returning();
          
          // Buscar os novos registros de estoque criados
          return res.status(200).json(await db.query.inventory.findMany({
            where: and(
              eq(schema.inventory.productId, productId),
              eq(schema.inventory.projectId, projectId)
            ),
            with: {
              variant: {
                columns: {
                  id: true,
                  name: true,
                  sku: true
                }
              }
            }
          }));
        } else {
          // Se o produto não tiver variantes, criar um registro de estoque para o produto principal
          const inventoryData = {
            projectId,
            productId,
            variantId: null,
            sku: product.sku || `PROD-${productId}`,
            quantity: 0,
            lowStockThreshold: 5,
            status: 'out_of_stock',
            createdAt: new Date(),
            updatedAt: new Date()
          };
          
          const newInventory = await db.insert(schema.inventory).values(inventoryData).returning();
          
          return res.status(200).json(newInventory);
        }
      }
      
      // Formatar os resultados de estoque
      const inventoryWithStatus = inventoryItems.map(item => {
        // Determinar o status de estoque baseado na quantidade
        let status = 'in_stock';
        if (item.quantity <= 0) {
          status = 'out_of_stock';
        } else if (item.quantity <= item.lowStockThreshold) {
          status = 'low_stock';
        }
        
        return {
          ...item,
          status,
          variantName: item.variant ? item.variant.name : 'Produto Principal',
          formattedSku: item.sku || (item.variant ? item.variant.sku : `PROD-${productId}`)
        };
      });
      
      return res.status(200).json(inventoryWithStatus);
    } catch (error) {
      return handleError(res, error, 'Erro ao buscar estoque do produto');
    }
  });
  
  // Atualizar o estoque de um produto
  app.patch(`${apiPrefix}/projects/:projectId/inventory/:inventoryId`, isAuthenticated, async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const inventoryId = parseInt(req.params.inventoryId);
      const { quantity, lowStockThreshold, sku, reason } = req.body;
      const userId = req.session?.userId || (req.user ? req.user.id : null);
      
      if (!userId) {
        return res.status(401).json({ message: 'Usuário não autenticado' });
      }
      
      // Verificar se o registro de estoque existe
      const inventoryItem = await db.query.inventory.findFirst({
        where: and(
          eq(schema.inventory.id, inventoryId),
          eq(schema.inventory.projectId, projectId)
        ),
        with: {
          product: true,
          variant: true
        }
      });
      
      if (!inventoryItem) {
        return res.status(404).json({ message: 'Registro de estoque não encontrado' });
      }
      
      // Preparar dados para atualização
      const updateData: any = {
        updatedAt: new Date()
      };
      
      // Registrar alterações no histórico se a quantidade for alterada
      let oldQuantity = inventoryItem.quantity;
      let newQuantity = oldQuantity;
      
      if (quantity !== undefined) {
        updateData.quantity = quantity;
        newQuantity = quantity;
      }
      
      if (lowStockThreshold !== undefined) {
        updateData.lowStockThreshold = lowStockThreshold;
      }
      
      if (sku !== undefined) {
        updateData.sku = sku;
      }
      
      // Atualizar o estoque
      const updatedInventory = await db.update(schema.inventory)
        .set(updateData)
        .where(and(
          eq(schema.inventory.id, inventoryId),
          eq(schema.inventory.projectId, projectId)
        ))
        .returning();
      
      // Registrar alteração no histórico se houver mudança na quantidade
      if (newQuantity !== oldQuantity) {
        // Determinar o tipo de movimento
        const movementType = newQuantity > oldQuantity ? 'increment' : 'decrement';
        const change = Math.abs(newQuantity - oldQuantity);
        
        // Registrar no histórico
        await db.insert(schema.inventoryHistory).values({
          projectId,
          inventoryId,
          productId: inventoryItem.productId,
          variantId: inventoryItem.variantId,
          userId,
          type: movementType,
          quantity: change,
          previousQuantity: oldQuantity,
          newQuantity,
          reason: reason || (movementType === 'increment' ? 'Entrada de estoque' : 'Saída de estoque'),
          createdAt: new Date()
        });
      }
      
      // Determinar o status de estoque baseado na quantidade
      let status = 'in_stock';
      if (newQuantity <= 0) {
        status = 'out_of_stock';
      } else if (newQuantity <= (lowStockThreshold || inventoryItem.lowStockThreshold)) {
        status = 'low_stock';
      }
      
      // Buscar o produto e variante (se existir) para incluir nas informações de resposta
      const productName = inventoryItem.product?.name || 'Produto';
      const variantName = inventoryItem.variant?.name || 'Principal';
      
      return res.status(200).json({
        ...updatedInventory[0],
        status,
        productName,
        variantName,
        message: 'Estoque atualizado com sucesso'
      });
    } catch (error) {
      return handleError(res, error, 'Erro ao atualizar estoque');
    }
  });
  
  // Obter histórico de movimentações de estoque
  app.get(`${apiPrefix}/projects/:projectId/inventory/:inventoryId/history`, async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const inventoryId = parseInt(req.params.inventoryId);
      
      // Verificar se o registro de estoque existe
      const inventoryItem = await db.query.inventory.findFirst({
        where: and(
          eq(schema.inventory.id, inventoryId),
          eq(schema.inventory.projectId, projectId)
        )
      });
      
      if (!inventoryItem) {
        return res.status(404).json({ message: 'Registro de estoque não encontrado' });
      }
      
      // Buscar histórico de movimentações
      const history = await db.query.inventoryHistory.findMany({
        where: and(
          eq(schema.inventoryHistory.inventoryId, inventoryId),
          eq(schema.inventoryHistory.projectId, projectId)
        ),
        orderBy: [desc(schema.inventoryHistory.createdAt)],
        with: {
          user: {
            columns: {
              id: true,
              username: true,
              fullName: true
            }
          }
        }
      });
      
      // Formatar resultados
      const formattedHistory = history.map(entry => {
        // Formatar data para exibição
        const formattedDate = new Date(entry.createdAt).toLocaleDateString('pt-BR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        
        // Formatar nome de usuário
        const userName = entry.user 
          ? (entry.user.fullName || entry.user.username) 
          : 'Sistema';
        
        // Formatar tipo de movimentação
        const typeDisplay = entry.type === 'increment' 
          ? 'Entrada' 
          : entry.type === 'decrement' 
            ? 'Saída' 
            : entry.type === 'adjustment' 
              ? 'Ajuste' 
              : 'Outro';
        
        // Formatar descrição da movimentação
        let description = entry.reason || '';
        if (!description) {
          if (entry.type === 'increment') {
            description = `Entrada de ${entry.quantity} unidades`;
          } else if (entry.type === 'decrement') {
            description = `Saída de ${entry.quantity} unidades`;
          } else {
            description = `Ajuste de ${entry.previousQuantity} para ${entry.newQuantity} unidades`;
          }
        }
        
        return {
          ...entry,
          formattedDate,
          userName,
          typeDisplay,
          description
        };
      });
      
      return res.status(200).json(formattedHistory);
    } catch (error) {
      return handleError(res, error, 'Erro ao buscar histórico de estoque');
    }
  });
  
  // Registrar movimento manual de estoque
  app.post(`${apiPrefix}/projects/:projectId/inventory/:inventoryId/movement`, isAuthenticated, async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const inventoryId = parseInt(req.params.inventoryId);
      const { type, quantity, reason } = req.body;
      const userId = req.session?.userId || (req.user ? req.user.id : null);
      
      if (!userId) {
        return res.status(401).json({ message: 'Usuário não autenticado' });
      }
      
      // Validar tipo de movimento
      if (!['increment', 'decrement', 'adjustment'].includes(type)) {
        return res.status(400).json({ 
          message: 'Tipo de movimento inválido. Valores permitidos: increment, decrement, adjustment' 
        });
      }
      
      // Validar quantidade
      if (type !== 'adjustment' && (!quantity || quantity <= 0)) {
        return res.status(400).json({ 
          message: 'A quantidade deve ser um valor positivo' 
        });
      }
      
      // Verificar se o registro de estoque existe
      const inventoryItem = await db.query.inventory.findFirst({
        where: and(
          eq(schema.inventory.id, inventoryId),
          eq(schema.inventory.projectId, projectId)
        ),
        with: {
          product: {
            columns: {
              id: true,
              name: true
            }
          },
          variant: {
            columns: {
              id: true,
              name: true
            }
          }
        }
      });
      
      if (!inventoryItem) {
        return res.status(404).json({ message: 'Registro de estoque não encontrado' });
      }
      
      // Calcular nova quantidade
      let newQuantity = inventoryItem.quantity;
      if (type === 'increment') {
        newQuantity += quantity;
      } else if (type === 'decrement') {
        newQuantity = Math.max(0, newQuantity - quantity); // Evitar quantidade negativa
      } else if (type === 'adjustment') {
        newQuantity = quantity;
      }
      
      // Registrar movimento no histórico
      const historyEntry = await db.insert(schema.inventoryHistory).values({
        projectId,
        inventoryId,
        productId: inventoryItem.productId,
        variantId: inventoryItem.variantId,
        userId,
        type,
        quantity: type === 'adjustment' ? Math.abs(newQuantity - inventoryItem.quantity) : quantity,
        previousQuantity: inventoryItem.quantity,
        newQuantity,
        reason: reason || (
          type === 'increment' 
            ? 'Entrada manual de estoque' 
            : type === 'decrement' 
              ? 'Saída manual de estoque' 
              : 'Ajuste manual de estoque'
        ),
        createdAt: new Date()
      }).returning();
      
      // Atualizar quantidade no estoque
      const updatedInventory = await db.update(schema.inventory)
        .set({
          quantity: newQuantity,
          updatedAt: new Date()
        })
        .where(and(
          eq(schema.inventory.id, inventoryId),
          eq(schema.inventory.projectId, projectId)
        ))
        .returning();
      
      // Determinar mensagem de sucesso e status de estoque
      let message = '';
      if (type === 'increment') {
        message = `Adicionadas ${quantity} unidades ao estoque`;
      } else if (type === 'decrement') {
        message = `Removidas ${quantity} unidades do estoque`;
      } else {
        message = `Estoque ajustado para ${newQuantity} unidades`;
      }
      
      // Determinar o status de estoque baseado na quantidade
      let status = 'in_stock';
      if (newQuantity <= 0) {
        status = 'out_of_stock';
      } else if (newQuantity <= inventoryItem.lowStockThreshold) {
        status = 'low_stock';
      }
      
      // Formatar informações para resposta
      const productName = inventoryItem.product?.name || 'Produto';
      const variantName = inventoryItem.variant?.name || 'Principal';
      
      return res.status(200).json({
        inventory: updatedInventory[0],
        history: historyEntry[0],
        message,
        status,
        productName,
        variantName
      });
    } catch (error) {
      return handleError(res, error, 'Erro ao registrar movimento de estoque');
    }
  });

  // Endpoints para Métodos de Envio

  // Listar métodos de envio disponíveis
  app.get(`${apiPrefix}/projects/:projectId/shipping-methods`, async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const { active } = req.query;
      
      // Construir consulta base
      let query = and(
        eq(schema.shippingMethods.projectId, projectId)
      );
      
      // Filtrar por status ativo/inativo
      if (active === 'true') {
        query = and(query, eq(schema.shippingMethods.isActive, true));
      } else if (active === 'false') {
        query = and(query, eq(schema.shippingMethods.isActive, false));
      }
      
      // Buscar métodos de envio com filtros aplicados
      const shippingMethods = await db.query.shippingMethods.findMany({
        where: query,
        orderBy: [asc(schema.shippingMethods.displayOrder)]
      });
      
      return res.status(200).json(shippingMethods);
    } catch (error) {
      return handleError(res, error, 'Erro ao listar métodos de envio');
    }
  });
  
  // Obter detalhes de um método de envio
  app.get(`${apiPrefix}/projects/:projectId/shipping-methods/:methodId`, async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const methodId = parseInt(req.params.methodId);
      
      const shippingMethod = await db.query.shippingMethods.findFirst({
        where: and(
          eq(schema.shippingMethods.id, methodId),
          eq(schema.shippingMethods.projectId, projectId)
        )
      });
      
      if (!shippingMethod) {
        return res.status(404).json({ message: 'Método de envio não encontrado' });
      }
      
      // Adicionar informações extras para exibição
      const formattedMethod = {
        ...shippingMethod,
        formattedPrice: shippingMethod.fixedPrice !== null 
          ? `R$ ${shippingMethod.fixedPrice.toFixed(2)}` 
          : 'Personalizado',
        statusText: shippingMethod.isActive ? 'Ativo' : 'Inativo',
        methodTypeText: shippingMethod.type === 'fixed' 
          ? 'Taxa fixa' 
          : shippingMethod.type === 'custom' 
            ? 'Personalizado' 
            : 'Frete calculado'
      };
      
      return res.status(200).json(formattedMethod);
    } catch (error) {
      return handleError(res, error, 'Erro ao buscar detalhes do método de envio');
    }
  });
  
  // Criar um novo método de envio
  app.post(`${apiPrefix}/projects/:projectId/shipping-methods`, isAuthenticated, async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const userId = req.session?.userId || (req.user ? req.user.id : null);
      
      if (!userId) {
        return res.status(401).json({ message: 'Usuário não autenticado' });
      }
      
      // Encontrar maior displayOrder existente para definir a ordem do novo método
      const existingMethods = await db.query.shippingMethods.findMany({
        where: eq(schema.shippingMethods.projectId, projectId),
        orderBy: [desc(schema.shippingMethods.displayOrder)],
        limit: 1
      });
      
      const nextDisplayOrder = existingMethods.length > 0 
        ? existingMethods[0].displayOrder + 1 
        : 1;
      
      // Validar dados do método de envio
      const shippingMethodData = insertShippingMethodSchema.parse({
        ...req.body,
        projectId,
        displayOrder: req.body.displayOrder || nextDisplayOrder,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      // Criar método de envio
      const newShippingMethod = await db.insert(schema.shippingMethods)
        .values(shippingMethodData)
        .returning();
      
      res.status(201).json({
        ...newShippingMethod[0],
        message: `Método de envio '${shippingMethodData.name}' criado com sucesso`
      });
    } catch (error) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ 
          message: 'Dados inválidos para o método de envio', 
          errors: error.errors 
        });
      }
      return handleError(res, error, 'Erro ao criar método de envio');
    }
  });
  
  // Atualizar um método de envio
  app.patch(`${apiPrefix}/projects/:projectId/shipping-methods/:methodId`, isAuthenticated, async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const methodId = parseInt(req.params.methodId);
      const userId = req.session?.userId || (req.user ? req.user.id : null);
      
      if (!userId) {
        return res.status(401).json({ message: 'Usuário não autenticado' });
      }
      
      // Verificar se o método de envio existe
      const shippingMethod = await db.query.shippingMethods.findFirst({
        where: and(
          eq(schema.shippingMethods.id, methodId),
          eq(schema.shippingMethods.projectId, projectId)
        )
      });
      
      if (!shippingMethod) {
        return res.status(404).json({ message: 'Método de envio não encontrado' });
      }
      
      // Construir objeto com dados a serem atualizados
      const updateData = {
        ...req.body,
        updatedAt: new Date()
      };
      
      // Remover campos que não devem ser atualizados
      delete updateData.id;
      delete updateData.projectId;
      delete updateData.createdAt;
      
      // Atualizar o método de envio
      const updatedMethod = await db.update(schema.shippingMethods)
        .set(updateData)
        .where(and(
          eq(schema.shippingMethods.id, methodId),
          eq(schema.shippingMethods.projectId, projectId)
        ))
        .returning();
      
      res.status(200).json({
        ...updatedMethod[0],
        message: `Método de envio atualizado com sucesso`
      });
    } catch (error) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ 
          message: 'Dados inválidos para atualização do método de envio', 
          errors: error.errors 
        });
      }
      return handleError(res, error, 'Erro ao atualizar método de envio');
    }
  });
  
  // Excluir um método de envio
  app.delete(`${apiPrefix}/projects/:projectId/shipping-methods/:methodId`, isAuthenticated, async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const methodId = parseInt(req.params.methodId);
      const userId = req.session?.userId || (req.user ? req.user.id : null);
      
      if (!userId) {
        return res.status(401).json({ message: 'Usuário não autenticado' });
      }
      
      // Verificar se o método de envio existe
      const shippingMethod = await db.query.shippingMethods.findFirst({
        where: and(
          eq(schema.shippingMethods.id, methodId),
          eq(schema.shippingMethods.projectId, projectId)
        )
      });
      
      if (!shippingMethod) {
        return res.status(404).json({ message: 'Método de envio não encontrado' });
      }
      
      // Excluir o método de envio
      await db.delete(schema.shippingMethods)
        .where(and(
          eq(schema.shippingMethods.id, methodId),
          eq(schema.shippingMethods.projectId, projectId)
        ));
      
      res.status(200).json({ 
        message: `Método de envio '${shippingMethod.name}' excluído com sucesso`
      });
    } catch (error) {
      return handleError(res, error, 'Erro ao excluir método de envio');
    }
  });
  
  // Calcular custo de envio para um pedido
  app.post(`${apiPrefix}/projects/:projectId/calculate-shipping`, async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const { 
        items, 
        destination, 
        postalCode, 
        methodId,
        subtotal
      } = req.body;
      
      // Validar dados de entrada
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: 'Itens do pedido são obrigatórios' });
      }
      
      // Se methodId foi fornecido, calcular para método específico
      if (methodId) {
        const shippingMethod = await db.query.shippingMethods.findFirst({
          where: and(
            eq(schema.shippingMethods.id, parseInt(methodId)),
            eq(schema.shippingMethods.projectId, projectId),
            eq(schema.shippingMethods.isActive, true)
          )
        });
        
        if (!shippingMethod) {
          return res.status(404).json({ message: 'Método de envio não encontrado ou inativo' });
        }
        
        // Calcular o custo de envio baseado no tipo de método
        let shippingCost = 0;
        let estimatedDeliveryDays = null;
        
        if (shippingMethod.type === 'fixed') {
          // Para método de taxa fixa, usar o valor configurado
          shippingCost = shippingMethod.fixedPrice || 0;
          estimatedDeliveryDays = shippingMethod.estimatedDeliveryTime || null;
        } else if (shippingMethod.type === 'calculated') {
          // Para método calculado, usar regras definidas (baseado em peso, distância, etc.)
          // Implementação simplificada para demonstração
          const totalWeight = items.reduce((sum, item) => {
            return sum + (item.weight || 0) * (item.quantity || 1);
          }, 0);
          
          // Regras básicas de cálculo (personalizadas para cada loja)
          if (shippingMethod.settings?.rules) {
            const rules = shippingMethod.settings.rules;
            for (const rule of rules) {
              if (rule.type === 'weight_based' && totalWeight <= rule.maxWeight) {
                shippingCost = rule.price;
                break;
              }
            }
          } else {
            // Regra padrão baseada no peso
            shippingCost = Math.max(shippingMethod.minimumPrice || 0, totalWeight * 0.5);
          }
          
          estimatedDeliveryDays = shippingMethod.estimatedDeliveryTime || null;
        } else if (shippingMethod.type === 'free') {
          // Frete grátis - verificar se há valor mínimo
          const orderTotal = subtotal || 0;
          if (shippingMethod.minimumOrderValue && orderTotal < shippingMethod.minimumOrderValue) {
            shippingCost = shippingMethod.fixedPrice || 0; // Cobra taxa se não atingir o mínimo
          } else {
            shippingCost = 0; // Frete grátis
          }
          estimatedDeliveryDays = shippingMethod.estimatedDeliveryTime || null;
        } else if (shippingMethod.type === 'table_based') {
          // Baseado em tabela de valores por região ou distancia
          // Lógica simplificada para demonstração
          const region = destination?.region || '';
          if (shippingMethod.settings?.regions && shippingMethod.settings.regions[region]) {
            shippingCost = shippingMethod.settings.regions[region] || shippingMethod.fixedPrice || 0;
          } else {
            shippingCost = shippingMethod.fixedPrice || 0;
          }
          estimatedDeliveryDays = shippingMethod.estimatedDeliveryTime || null;
        }
        
        // Adicionar informações de exibição
        return res.status(200).json({
          method: {
            id: shippingMethod.id,
            name: shippingMethod.name,
            description: shippingMethod.description,
            type: shippingMethod.type,
            cost: shippingCost,
            formattedCost: `R$ ${shippingCost.toFixed(2)}`,
            estimatedDeliveryDays,
            estimatedDeliveryText: estimatedDeliveryDays 
              ? `Entrega em aproximadamente ${estimatedDeliveryDays} dias úteis` 
              : null
          }
        });
      }
      
      // Se methodId não for fornecido, retornar todos os métodos disponíveis com seus custos calculados
      const availableMethods = await db.query.shippingMethods.findMany({
        where: and(
          eq(schema.shippingMethods.projectId, projectId),
          eq(schema.shippingMethods.isActive, true)
        ),
        orderBy: [asc(schema.shippingMethods.displayOrder)]
      });
      
      // Calcular o custo para cada método disponível
      const shippingOptions = await Promise.all(availableMethods.map(async (method) => {
        let shippingCost = 0;
        let estimatedDeliveryDays = null;
        let isAvailable = true;
        let unavailableReason = null;
        
        try {
          // Cálculo similar ao acima, mas para cada método
          if (method.type === 'fixed') {
            shippingCost = method.fixedPrice || 0;
          } else if (method.type === 'calculated') {
            const totalWeight = items.reduce((sum, item) => {
              return sum + (item.weight || 0) * (item.quantity || 1);
            }, 0);
            
            if (method.settings?.rules) {
              const rules = method.settings.rules;
              for (const rule of rules) {
                if (rule.type === 'weight_based' && totalWeight <= rule.maxWeight) {
                  shippingCost = rule.price;
                  break;
                }
              }
            } else {
              shippingCost = Math.max(method.minimumPrice || 0, totalWeight * 0.5);
            }
          } else if (method.type === 'free') {
            const orderTotal = subtotal || 0;
            if (method.minimumOrderValue && orderTotal < method.minimumOrderValue) {
              shippingCost = method.fixedPrice || 0;
              isAvailable = true;
              unavailableReason = `Adicione R$ ${(method.minimumOrderValue - orderTotal).toFixed(2)} ao pedido para frete grátis`;
            } else {
              shippingCost = 0;
            }
          } else if (method.type === 'table_based') {
            const region = destination?.region || '';
            if (method.settings?.regions && method.settings.regions[region]) {
              shippingCost = method.settings.regions[region] || method.fixedPrice || 0;
            } else {
              shippingCost = method.fixedPrice || 0;
            }
          }
          
          estimatedDeliveryDays = method.estimatedDeliveryTime || null;
        } catch (err) {
          console.error(`Erro ao calcular frete para o método ${method.name}:`, err);
          isAvailable = false;
          unavailableReason = 'Erro ao calcular frete para este método';
        }
        
        return {
          id: method.id,
          name: method.name,
          description: method.description,
          type: method.type,
          cost: shippingCost,
          formattedCost: `R$ ${shippingCost.toFixed(2)}`,
          estimatedDeliveryDays,
          estimatedDeliveryText: estimatedDeliveryDays 
            ? `Entrega em aproximadamente ${estimatedDeliveryDays} dias úteis` 
            : null,
          isAvailable,
          unavailableReason
        };
      }));
      
      // Filtrar apenas os métodos disponíveis
      const availableOptions = shippingOptions.filter(option => option.isAvailable);
      
      res.status(200).json({
        methods: availableOptions,
        totalAvailable: availableOptions.length
      });
    } catch (error) {
      return handleError(res, error, 'Erro ao calcular opções de envio');
    }
  });

  // Endpoints para Product Tags (Tags de Produtos)

  // Listar todas as tags disponíveis
  app.get(`${apiPrefix}/projects/:projectId/product-tags`, async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      
      // Buscar as tags do projeto ordenadas por nome
      const tags = await db.query.productTags.findMany({
        where: eq(schema.productTags.projectId, projectId),
        orderBy: [asc(schema.productTags.name)]
      });
      
      // Contar quantos produtos estão associados a cada tag
      const tagsWithCounts = await Promise.all(tags.map(async (tag) => {
        const relations = await db.query.productTagRelations.findMany({
          where: and(
            eq(schema.productTagRelations.tagId, tag.id),
            eq(schema.productTagRelations.projectId, projectId)
          )
        });
        
        // Quantidade total de produtos associados a esta tag
        const productCount = relations.length;
        
        // Formatar a cor da tag como estilo CSS
        const tagStyle = tag.color ? { backgroundColor: tag.color } : undefined;
        
        return {
          ...tag,
          productCount,
          tagStyle
        };
      }));
      
      return res.status(200).json(tagsWithCounts);
    } catch (error) {
      return handleError(res, error, 'Erro ao listar tags de produtos');
    }
  });
  
  // Obter detalhes de uma tag específica
  app.get(`${apiPrefix}/projects/:projectId/product-tags/:tagId`, async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const tagId = parseInt(req.params.tagId);
      
      // Buscar a tag
      const tag = await db.query.productTags.findFirst({
        where: and(
          eq(schema.productTags.id, tagId),
          eq(schema.productTags.projectId, projectId)
        )
      });
      
      if (!tag) {
        return res.status(404).json({ message: 'Tag não encontrada' });
      }
      
      // Buscar produtos associados a esta tag
      const taggedProducts = await db.query.productTagRelations.findMany({
        where: and(
          eq(schema.productTagRelations.tagId, tagId),
          eq(schema.productTagRelations.projectId, projectId)
        ),
        with: {
          product: {
            columns: {
              id: true,
              name: true,
              slug: true,
              price: true,
              status: true,
              thumbnail: true
            }
          }
        }
      });
      
      // Filtrar apenas produtos ativos para exibição
      const activeProducts = taggedProducts
        .filter(relation => relation.product && relation.product.status === 'published')
        .map(relation => relation.product);
      
      // Formatar a cor da tag como estilo CSS
      const tagStyle = tag.color ? { backgroundColor: tag.color } : undefined;
      
      // Adicionar informações extras para exibição
      const result = {
        ...tag,
        productCount: taggedProducts.length,
        activeProductCount: activeProducts.length,
        products: activeProducts,
        tagStyle
      };
      
      return res.status(200).json(result);
    } catch (error) {
      return handleError(res, error, 'Erro ao buscar detalhes da tag');
    }
  });
  
  // Criar uma nova tag de produto
  app.post(`${apiPrefix}/projects/:projectId/product-tags`, isAuthenticated, async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const userId = req.session?.userId || (req.user ? req.user.id : null);
      
      if (!userId) {
        return res.status(401).json({ message: 'Usuário não autenticado' });
      }
      
      // Validar dados da tag
      const tagData = insertProductTagSchema.parse({
        ...req.body,
        projectId,
        slug: req.body.slug || slugify(req.body.name),
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      // Verificar se já existe uma tag com o mesmo nome ou slug
      const existingTag = await db.query.productTags.findFirst({
        where: and(
          eq(schema.productTags.projectId, projectId),
          or(
            eq(schema.productTags.name, tagData.name),
            eq(schema.productTags.slug, tagData.slug)
          )
        )
      });
      
      if (existingTag) {
        return res.status(409).json({ 
          message: `Já existe uma tag com o nome '${tagData.name}' ou slug '${tagData.slug}'` 
        });
      }
      
      // Criar a tag
      const newTag = await db.insert(schema.productTags).values(tagData).returning();
      
      // Se foram fornecidos IDs de produtos, associar a tag a eles
      if (req.body.productIds && Array.isArray(req.body.productIds) && req.body.productIds.length > 0) {
        const relations = req.body.productIds.map(productId => ({
          tagId: newTag[0].id,
          productId: parseInt(productId),
          projectId
        }));
        
        await db.insert(schema.productTagRelations).values(relations);
      }
      
      res.status(201).json({
        ...newTag[0],
        message: `Tag '${tagData.name}' criada com sucesso`
      });
    } catch (error) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ 
          message: 'Dados inválidos para a tag', 
          errors: error.errors 
        });
      }
      return handleError(res, error, 'Erro ao criar tag de produto');
    }
  });
  
  // Atualizar uma tag
  app.patch(`${apiPrefix}/projects/:projectId/product-tags/:tagId`, isAuthenticated, async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const tagId = parseInt(req.params.tagId);
      const userId = req.session?.userId || (req.user ? req.user.id : null);
      
      if (!userId) {
        return res.status(401).json({ message: 'Usuário não autenticado' });
      }
      
      // Verificar se a tag existe
      const tag = await db.query.productTags.findFirst({
        where: and(
          eq(schema.productTags.id, tagId),
          eq(schema.productTags.projectId, projectId)
        )
      });
      
      if (!tag) {
        return res.status(404).json({ message: 'Tag não encontrada' });
      }
      
      // Preparar dados para atualização
      const updateData = {
        ...req.body,
        updatedAt: new Date()
      };
      
      // Se o nome foi alterado e o slug não foi fornecido, gerar um novo slug
      if (updateData.name && updateData.name !== tag.name && !updateData.slug) {
        updateData.slug = slugify(updateData.name);
      }
      
      // Remover campos que não devem ser atualizados
      delete updateData.id;
      delete updateData.projectId;
      delete updateData.createdAt;
      delete updateData.productIds;
      
      // Se o nome ou slug foi alterado, verificar unicidade
      if ((updateData.name && updateData.name !== tag.name) || (updateData.slug && updateData.slug !== tag.slug)) {
        const existingTag = await db.query.productTags.findFirst({
          where: and(
            eq(schema.productTags.projectId, projectId),
            or(
              updateData.name ? eq(schema.productTags.name, updateData.name) : sql`FALSE`,
              updateData.slug ? eq(schema.productTags.slug, updateData.slug) : sql`FALSE`
            ),
            // Excluir a tag atual da verificação
            sql`${schema.productTags.id} != ${tagId}`
          )
        });
        
        if (existingTag) {
          return res.status(409).json({ 
            message: `Já existe outra tag com o nome '${updateData.name || tag.name}' ou slug '${updateData.slug || tag.slug}'` 
          });
        }
      }
      
      // Atualizar a tag
      const updatedTag = await db.update(schema.productTags)
        .set(updateData)
        .where(and(
          eq(schema.productTags.id, tagId),
          eq(schema.productTags.projectId, projectId)
        ))
        .returning();
      
      res.status(200).json({
        ...updatedTag[0],
        message: `Tag atualizada com sucesso`
      });
    } catch (error) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ 
          message: 'Dados inválidos para atualização da tag', 
          errors: error.errors 
        });
      }
      return handleError(res, error, 'Erro ao atualizar tag');
    }
  });
  
  // Excluir uma tag
  app.delete(`${apiPrefix}/projects/:projectId/product-tags/:tagId`, isAuthenticated, async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const tagId = parseInt(req.params.tagId);
      const userId = req.session?.userId || (req.user ? req.user.id : null);
      
      if (!userId) {
        return res.status(401).json({ message: 'Usuário não autenticado' });
      }
      
      // Verificar se a tag existe
      const tag = await db.query.productTags.findFirst({
        where: and(
          eq(schema.productTags.id, tagId),
          eq(schema.productTags.projectId, projectId)
        )
      });
      
      if (!tag) {
        return res.status(404).json({ message: 'Tag não encontrada' });
      }
      
      // Primeiro remover todas as relações desta tag com produtos
      await db.delete(schema.productTagRelations)
        .where(and(
          eq(schema.productTagRelations.tagId, tagId),
          eq(schema.productTagRelations.projectId, projectId)
        ));
      
      // Excluir a tag
      await db.delete(schema.productTags)
        .where(and(
          eq(schema.productTags.id, tagId),
          eq(schema.productTags.projectId, projectId)
        ));
      
      res.status(200).json({ 
        message: `Tag '${tag.name}' excluída com sucesso` 
      });
    } catch (error) {
      return handleError(res, error, 'Erro ao excluir tag');
    }
  });
  
  // Adicionar produtos a uma tag
  app.post(`${apiPrefix}/projects/:projectId/product-tags/:tagId/products`, isAuthenticated, async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const tagId = parseInt(req.params.tagId);
      const { productIds } = req.body;
      const userId = req.session?.userId || (req.user ? req.user.id : null);
      
      if (!userId) {
        return res.status(401).json({ message: 'Usuário não autenticado' });
      }
      
      // Validar dados de entrada
      if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
        return res.status(400).json({ message: 'Lista de IDs de produtos é obrigatória' });
      }
      
      // Verificar se a tag existe
      const tag = await db.query.productTags.findFirst({
        where: and(
          eq(schema.productTags.id, tagId),
          eq(schema.productTags.projectId, projectId)
        )
      });
      
      if (!tag) {
        return res.status(404).json({ message: 'Tag não encontrada' });
      }
      
      // Verificar produtos existentes nesta tag para evitar duplicação
      const existingRelations = await db.query.productTagRelations.findMany({
        where: and(
          eq(schema.productTagRelations.tagId, tagId),
          eq(schema.productTagRelations.projectId, projectId)
        )
      });
      
      const existingProductIds = existingRelations.map(rel => rel.productId);
      
      // Filtrar apenas os novos produtos a adicionar
      const newProductIds = productIds
        .map(id => typeof id === 'string' ? parseInt(id) : id)
        .filter(id => !existingProductIds.includes(id));
      
      if (newProductIds.length === 0) {
        return res.status(200).json({ 
          message: 'Nenhum produto novo para adicionar à tag', 
          addedCount: 0 
        });
      }
      
      // Verificar se todos os produtos pertencem ao projeto
      const validProducts = await db.query.products.findMany({
        where: and(
          inArray(schema.products.id, newProductIds),
          eq(schema.products.projectId, projectId)
        ),
        columns: {
          id: true
        }
      });
      
      const validProductIds = validProducts.map(p => p.id);
      
      // Criar novos relacionamentos
      if (validProductIds.length > 0) {
        const relationData = validProductIds.map(productId => ({
          tagId,
          productId,
          projectId
        }));
        
        await db.insert(schema.productTagRelations).values(relationData);
      }
      
      // Buscar produtos adicionados para incluir na resposta
      const addedProducts = await db.query.products.findMany({
        where: and(
          inArray(schema.products.id, validProductIds),
          eq(schema.products.projectId, projectId)
        ),
        columns: {
          id: true,
          name: true,
          slug: true
        }
      });
      
      res.status(200).json({
        message: `${validProductIds.length} produtos adicionados à tag '${tag.name}'`,
        addedCount: validProductIds.length,
        addedProducts
      });
    } catch (error) {
      return handleError(res, error, 'Erro ao adicionar produtos à tag');
    }
  });
  
  // Remover um produto de uma tag
  app.delete(`${apiPrefix}/projects/:projectId/product-tags/:tagId/products/:productId`, isAuthenticated, async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const tagId = parseInt(req.params.tagId);
      const productId = parseInt(req.params.productId);
      const userId = req.session?.userId || (req.user ? req.user.id : null);
      
      if (!userId) {
        return res.status(401).json({ message: 'Usuário não autenticado' });
      }
      
      // Verificar se a tag existe
      const tag = await db.query.productTags.findFirst({
        where: and(
          eq(schema.productTags.id, tagId),
          eq(schema.productTags.projectId, projectId)
        )
      });
      
      if (!tag) {
        return res.status(404).json({ message: 'Tag não encontrada' });
      }
      
      // Verificar se o produto existe
      const product = await db.query.products.findFirst({
        where: and(
          eq(schema.products.id, productId),
          eq(schema.products.projectId, projectId)
        ),
        columns: {
          id: true,
          name: true
        }
      });
      
      if (!product) {
        return res.status(404).json({ message: 'Produto não encontrado' });
      }
      
      // Remover a relação
      const deletedCount = await db.delete(schema.productTagRelations)
        .where(and(
          eq(schema.productTagRelations.tagId, tagId),
          eq(schema.productTagRelations.productId, productId),
          eq(schema.productTagRelations.projectId, projectId)
        ))
        .returning();
      
      // Verificar se a relação existia
      if (deletedCount.length === 0) {
        return res.status(404).json({ 
          message: `O produto não estava associado a esta tag` 
        });
      }
      
      res.status(200).json({ 
        message: `Produto '${product.name}' removido da tag '${tag.name}'` 
      });
    } catch (error) {
      return handleError(res, error, 'Erro ao remover produto da tag');
    }
  });
  
  // Obter produtos por tag
  app.get(`${apiPrefix}/projects/:projectId/products/by-tag/:tagSlug`, async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const { tagSlug } = req.params;
      const { page = '1', limit = '20', sort = 'name_asc' } = req.query;
      
      // Buscar a tag pelo slug
      const tag = await db.query.productTags.findFirst({
        where: and(
          eq(schema.productTags.slug, tagSlug),
          eq(schema.productTags.projectId, projectId)
        )
      });
      
      if (!tag) {
        return res.status(404).json({ message: 'Tag não encontrada' });
      }
      
      // Converter parâmetros para números
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const offset = (pageNum - 1) * limitNum;
      
      // Buscar ids dos produtos relacionados a esta tag
      const relations = await db.query.productTagRelations.findMany({
        where: and(
          eq(schema.productTagRelations.tagId, tag.id),
          eq(schema.productTagRelations.projectId, projectId)
        )
      });
      
      const productIds = relations.map(rel => rel.productId);
      
      if (productIds.length === 0) {
        return res.status(200).json({
          products: [],
          pagination: {
            total: 0,
            page: pageNum,
            limit: limitNum,
            pages: 0
          },
          tag
        });
      }
      
      // Definir ordem baseada no parâmetro sort
      let orderBy;
      switch (sort) {
        case 'name_asc':
          orderBy = [asc(schema.products.name)];
          break;
        case 'name_desc':
          orderBy = [desc(schema.products.name)];
          break;
        case 'price_asc':
          orderBy = [asc(schema.products.price)];
          break;
        case 'price_desc':
          orderBy = [desc(schema.products.price)];
          break;
        case 'newest':
          orderBy = [desc(schema.products.createdAt)];
          break;
        case 'oldest':
          orderBy = [asc(schema.products.createdAt)];
          break;
        default:
          orderBy = [asc(schema.products.name)];
      }
      
      // Contar total de produtos válidos
      const totalCount = await db.select({ count: count() })
        .from(schema.products)
        .where(and(
          inArray(schema.products.id, productIds),
          eq(schema.products.projectId, projectId),
          eq(schema.products.status, 'published')
        ));
      
      const total = parseInt(totalCount[0]?.count?.toString() || '0');
      
      // Buscar produtos paginados
      const products = await db.query.products.findMany({
        where: and(
          inArray(schema.products.id, productIds),
          eq(schema.products.projectId, projectId),
          eq(schema.products.status, 'published')
        ),
        limit: limitNum,
        offset,
        orderBy,
        with: {
          category: true,
          variants: {
            limit: 5
          }
        }
      });
      
      // Preparar resultado formatado
      const result = {
        products,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum)
        },
        tag
      };
      
      return res.status(200).json(result);
    } catch (error) {
      return handleError(res, error, 'Erro ao buscar produtos por tag');
    }
  });

  app.get(`${apiPrefix}/products/:id`, async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const product = await db.query.products.findFirst({
        where: eq(schema.products.id, productId),
      });

      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      // Get variants
      const variants = await db.query.productVariants.findMany({
        where: eq(schema.productVariants.productId, productId),
      });

      // Get categories
      const productCategoryRelations = await db.query.productCategoryRelations.findMany({
        where: eq(schema.productCategoryRelations.productId, productId),
        with: {
          category: true
        }
      });

      const categories = productCategoryRelations.map(relation => relation.category);

      res.status(200).json({
        ...product,
        variants,
        categories
      });
    } catch (error) {
      console.error('Error fetching product:', error);
      res.status(500).json({ message: 'Failed to fetch product' });
    }
  });

  // Cart routes
  app.post(`${apiPrefix}/carts`, async (req, res) => {
    try {
      const { projectId } = req.body;
      const sessionId = req.session.id || randomUUID();
      const customerId = req.session.userId || null;

      // Check if cart already exists for this session
      const existingCart = await db.query.carts.findFirst({
        where: and(
          eq(schema.carts.sessionId, sessionId),
          eq(schema.carts.projectId, projectId)
        ),
      });

      if (existingCart) {
        return res.status(200).json(existingCart);
      }

      // Create a new cart
      const cartData = insertCartSchema.parse({
        projectId,
        sessionId,
        customerId,
        currency: 'USD',
      });

      const [newCart] = await db.insert(schema.carts).values(cartData).returning();
      res.status(201).json(newCart);
    } catch (error) {
      console.error('Error creating cart:', error);
      res.status(500).json({ message: 'Failed to create cart' });
    }
  });

  app.get(`${apiPrefix}/carts/:id`, async (req, res) => {
    try {
      const cartId = parseInt(req.params.id);
      const cart = await db.query.carts.findFirst({
        where: eq(schema.carts.id, cartId),
        with: {
          items: {
            with: {
              product: true,
              variant: true
            }
          }
        }
      });

      if (!cart) {
        return res.status(404).json({ message: 'Cart not found' });
      }

      let total = 0;
      const items = cart.items.map(item => {
        // Use variant price if available, otherwise product price
        const price = item.variant?.price || item.product.price;
        const salePrice = item.variant?.salePrice || item.product.salePrice;
        const itemPrice = salePrice || price;
        const subtotal = parseFloat(itemPrice) * item.quantity;
        total += subtotal;

        return {
          ...item,
          price: itemPrice,
          subtotal
        };
      });

      res.status(200).json({
        ...cart,
        items,
        total
      });
    } catch (error) {
      console.error('Error fetching cart:', error);
      res.status(500).json({ message: 'Failed to fetch cart' });
    }
  });

  app.post(`${apiPrefix}/carts/:id/items`, async (req, res) => {
    try {
      const cartId = parseInt(req.params.id);
      const { productId, variantId, quantity } = req.body;

      // Verify cart exists
      const cart = await db.query.carts.findFirst({
        where: eq(schema.carts.id, cartId),
      });

      if (!cart) {
        return res.status(404).json({ message: 'Cart not found' });
      }

      // Check if item already exists in cart
      let existingItem = null;
      if (variantId) {
        existingItem = await db.query.cartItems.findFirst({
          where: and(
            eq(schema.cartItems.cartId, cartId),
            eq(schema.cartItems.productId, productId),
            eq(schema.cartItems.variantId, variantId)
          ),
        });
      } else {
        existingItem = await db.query.cartItems.findFirst({
          where: and(
            eq(schema.cartItems.cartId, cartId),
            eq(schema.cartItems.productId, productId),
            sql`${schema.cartItems.variantId} IS NULL`
          ),
        });
      }

      if (existingItem) {
        // Update quantity
        const newQuantity = existingItem.quantity + (quantity || 1);
        const [updatedItem] = await db.update(schema.cartItems)
          .set({ quantity: newQuantity })
          .where(eq(schema.cartItems.id, existingItem.id))
          .returning();

        return res.status(200).json(updatedItem);
      }

      // Create new cart item
      const cartItemData = insertCartItemSchema.parse({
        cartId,
        productId,
        variantId,
        quantity: quantity || 1,
      });

      const [newCartItem] = await db.insert(schema.cartItems).values(cartItemData).returning();
      res.status(201).json(newCartItem);
    } catch (error) {
      console.error('Error adding item to cart:', error);
      res.status(500).json({ message: 'Failed to add item to cart' });
    }
  });

  app.delete(`${apiPrefix}/carts/:cartId/items/:itemId`, async (req, res) => {
    try {
      const cartId = parseInt(req.params.cartId);
      const itemId = parseInt(req.params.itemId);

      // Verify cart exists
      const cart = await db.query.carts.findFirst({
        where: eq(schema.carts.id, cartId),
      });

      if (!cart) {
        return res.status(404).json({ message: 'Cart not found' });
      }

      // Verify cart item exists
      const cartItem = await db.query.cartItems.findFirst({
        where: and(
          eq(schema.cartItems.id, itemId),
          eq(schema.cartItems.cartId, cartId)
        ),
      });

      if (!cartItem) {
        return res.status(404).json({ message: 'Cart item not found' });
      }

      // Delete cart item
      await db.delete(schema.cartItems).where(eq(schema.cartItems.id, itemId));
      res.status(204).end();
    } catch (error) {
      console.error('Error removing item from cart:', error);
      res.status(500).json({ message: 'Failed to remove item from cart' });
    }
  });

  app.put(`${apiPrefix}/carts/:cartId/items/:itemId`, async (req, res) => {
    try {
      const cartId = parseInt(req.params.cartId);
      const itemId = parseInt(req.params.itemId);
      const { quantity } = req.body;

      // Verify cart exists
      const cart = await db.query.carts.findFirst({
        where: eq(schema.carts.id, cartId),
      });

      if (!cart) {
        return res.status(404).json({ message: 'Cart not found' });
      }

      // Verify cart item exists
      const cartItem = await db.query.cartItems.findFirst({
        where: and(
          eq(schema.cartItems.id, itemId),
          eq(schema.cartItems.cartId, cartId)
        ),
      });

      if (!cartItem) {
        return res.status(404).json({ message: 'Cart item not found' });
      }

      // Update cart item quantity
      const [updatedItem] = await db.update(schema.cartItems)
        .set({ quantity })
        .where(eq(schema.cartItems.id, itemId))
        .returning();

      res.status(200).json(updatedItem);
    } catch (error) {
      console.error('Error updating cart item:', error);
      res.status(500).json({ message: 'Failed to update cart item' });
    }
  });

  // Checkout & Order routes
  app.post(`${apiPrefix}/orders`, async (req, res) => {
    try {
      const { projectId, cartId, customer, shippingAddress, billingAddress, paymentMethod, shippingMethod } = req.body;
      const customerId = req.session.userId || null;

      // Get the cart with its items
      const cart = await db.query.carts.findFirst({
        where: eq(schema.carts.id, cartId),
        with: {
          items: {
            with: {
              product: true,
              variant: true
            }
          }
        }
      });

      if (!cart) {
        return res.status(404).json({ message: 'Cart not found' });
      }

      // Calculate order totals
      let subtotal = 0;
      cart.items.forEach(item => {
        const price = item.variant?.price || item.product.price;
        const salePrice = item.variant?.salePrice || item.product.salePrice;
        const itemPrice = salePrice || price;
        subtotal += parseFloat(itemPrice) * item.quantity;
      });

      const tax = subtotal * 0.1; // 10% tax for demo
      const shipping = 10; // Fixed shipping cost for demo
      const total = subtotal + tax + shipping;

      // Generate a unique order number
      const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      // Create the order
      const [newOrder] = await db.insert(schema.orders).values({
        projectId,
        customerId,
        orderNumber,
        status: 'pending',
        paymentStatus: 'pending',
        shippingStatus: 'pending',
        currency: cart.currency || 'USD',
        subtotal: subtotal.toString(),
        tax: tax.toString(),
        shipping: shipping.toString(),
        total: total.toString(),
        paymentMethod,
        shippingMethod,
        metadata: JSON.stringify({ customer, shippingAddress, billingAddress })
      }).returning();

      // Create order items
      for (const item of cart.items) {
        const price = item.variant?.price || item.product.price;
        const salePrice = item.variant?.salePrice || item.product.salePrice;
        const itemPrice = salePrice || price;
        const subtotal = parseFloat(itemPrice) * item.quantity;

        await db.insert(schema.orderItems).values({
          orderId: newOrder.id,
          productId: item.productId,
          variantId: item.variantId,
          name: item.variant?.name || item.product.name,
          sku: item.variant?.sku || item.product.sku,
          quantity: item.quantity,
          price: itemPrice,
          subtotal: subtotal.toString()
        });
      }

      // Empty the cart
      await db.delete(schema.cartItems).where(eq(schema.cartItems.cartId, cartId));

      // Return the new order
      const completeOrder = await db.query.orders.findFirst({
        where: eq(schema.orders.id, newOrder.id),
        with: {
          items: true
        }
      });

      res.status(201).json(completeOrder);
    } catch (error) {
      console.error('Error creating order:', error);
      res.status(500).json({ message: 'Failed to create order' });
    }
  });

  app.get(`${apiPrefix}/orders/:id`, async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const order = await db.query.orders.findFirst({
        where: eq(schema.orders.id, orderId),
        with: {
          items: {
            with: {
              product: true,
              variant: true
            }
          }
        }
      });

      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      res.status(200).json(order);
    } catch (error) {
      console.error('Error fetching order:', error);
      res.status(500).json({ message: 'Failed to fetch order' });
    }
  });

  // Rotas para banco de dados visual já implementadas abaixo
  // Não registrando aqui para evitar duplicação

  // Payment integration routes
  if (stripeInstance) {
    app.post(`${apiPrefix}/create-payment-intent`, async (req, res) => {
      try {
        const { amount } = req.body;
        const paymentIntent = await stripeInstance.paymentIntents.create({
          amount: Math.round(amount * 100), // Convert to cents
          currency: "usd",
        });
        res.json({ clientSecret: paymentIntent.client_secret });
      } catch (error: any) {
        res
          .status(500)
          .json({ message: "Error creating payment intent: " + error.message });
      }
    });
  }

  // PayPal routes
  app.get("/api/paypal/setup", async (req, res) => {
    await loadPaypalDefault(req, res);
  });

  app.post("/api/paypal/order", async (req, res) => {
    await createPaypalOrder(req, res);
  });

  app.post("/api/paypal/order/:orderID/capture", async (req, res) => {
    await capturePaypalOrder(req, res);
  });

  // Funções auxiliares para rotas de banco de dados dinâmico
  function mapTypeToSQL(type: string): string {
    switch (type.toLowerCase()) {
      case 'string':
        return 'VARCHAR(255)';
      case 'text':
        return 'TEXT';
      case 'integer':
      case 'int':
        return 'INTEGER';
      case 'number':
      case 'float':
      case 'decimal':
        return 'NUMERIC';
      case 'boolean':
        return 'BOOLEAN';
      case 'date':
        return 'DATE';
      case 'datetime':
        return 'TIMESTAMP';
      case 'json':
        return 'JSONB';
      default:
        return 'VARCHAR(255)';
    }
  }

  function formatSQLValue(value: any, type: string): string {
    if (value === null || value === undefined) {
      return 'NULL';
    }

    switch (type.toLowerCase()) {
      case 'string':
      case 'text':
        return `'${value.toString().replace(/'/g, "''")}'`;
      case 'date':
      case 'datetime':
        return `'${value}'`;
      case 'boolean':
        return value ? 'TRUE' : 'FALSE';
      case 'json':
        return `'${JSON.stringify(value).replace(/'/g, "''")}'::JSONB`;
      default:
        return `${value}`;
    }
  }

  // Rotas para gerenciamento de banco de dados dinâmico
  
  // Endpoint para obter todas as tabelas criadas dinamicamente
  app.get(`${apiPrefix}/database/tables`, async (req, res) => {
    try {
      const projectId = req.query.projectId ? parseInt(req.query.projectId as string, 10) : null;
      
      if (!projectId) {
        return res.status(400).json({ message: "É necessário fornecer o ID do projeto" });
      }
      
      // Primeiro, verificar se temos tabelas registradas para este projeto
      const projectTables = await db.query.projectDatabases.findMany({
        where: eq(schema.projectDatabases.projectId, projectId)
      });
      
      // Se já temos tabelas registradas, retornamos elas
      if (projectTables.length > 0) {
        const tablesWithDetails = await Promise.all(projectTables.map(async (table) => {
          // Contar registros na tabela
          let rowCount = 0;
          try {
            const countQuery = sql`SELECT COUNT(*) as count FROM ${sql.identifier(table.tableName)}`;
            const countResult = await db.execute(countQuery);
            rowCount = parseInt(countResult.rows[0].count, 10);
          } catch (err) {
            console.error(`Erro ao contar registros da tabela ${table.tableName}:`, err);
          }
          
          return {
            id: table.id,
            name: table.tableName,
            displayName: table.displayName,
            rowCount,
            description: table.description || "",
            hasApi: table.apiEnabled,
            isBuiltIn: table.isBuiltIn,
            createdAt: table.createdAt.toISOString()
          };
        }));
        
        return res.json({ tables: tablesWithDetails });
      }
      
      // Se não temos tabelas registradas ainda, verificamos quais tabelas poderiam pertencer ao projeto
      // Buscar todas as tabelas disponíveis no banco de dados
      const query = sql`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        AND table_name NOT IN ('_drizzle_migrations', 'project_databases', 'project_apis',
                              'users', 'projects', 'pages', 'elements', 'templates', 'template_elements')
        ORDER BY table_name;
      `;
      
      const result = await db.execute(query);
      
      // Filtrar apenas tabelas que poderiam ser do projeto (prefixo p{id}_)
      const projectPrefix = `p${projectId}_`;
      const projectTableNames = result.rows
        .map((row: any) => row.table_name)
        .filter((tableName: string) => 
          tableName.startsWith(projectPrefix) || 
          // Verificar também se a tabela está nas tabelas de e-commerce e tem projectId
          ['products', 'product_categories', 'orders', 'customers', 'carts'].includes(tableName));
      
      // Registrar estas tabelas no banco de dados para o projeto
      for (const tableName of projectTableNames) {
        const isEcommerceTable = ['products', 'product_categories', 'orders', 'customers', 'carts'].includes(tableName);
        
        // Registra a tabela no sistema
        await db.insert(schema.projectDatabases).values({
          projectId,
          tableName,
          displayName: isEcommerceTable 
            ? tableName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
            : schema.getDisplayNameFromTableName(tableName),
          description: isEcommerceTable ? `Tabela de e-commerce: ${tableName}` : `Tabela personalizada para o projeto`,
          isBuiltIn: isEcommerceTable,
          isGenerated: true,
          apiEnabled: true,
          structure: {}
        });
      }
      
      // Agora busca as tabelas recém-registradas
      const newProjectTables = await db.query.projectDatabases.findMany({
        where: eq(schema.projectDatabases.projectId, projectId)
      });
      
      const tablesWithDetails = await Promise.all(newProjectTables.map(async (table) => {
        // Contar registros na tabela
        let rowCount = 0;
        try {
          const countQuery = sql`SELECT COUNT(*) as count FROM ${sql.identifier(table.tableName)}`;
          const countResult = await db.execute(countQuery);
          rowCount = parseInt(countResult.rows[0].count, 10);
        } catch (err) {
          console.error(`Erro ao contar registros da tabela ${table.tableName}:`, err);
        }
        
        return {
          id: table.id,
          name: table.tableName,
          displayName: table.displayName,
          rowCount,
          description: table.description || "",
          hasApi: table.apiEnabled,
          isBuiltIn: table.isBuiltIn,
          createdAt: table.createdAt.toISOString()
        };
      }));
      
      res.json({ tables: tablesWithDetails });
    } catch (error) {
      handleError(res, error, "Erro ao buscar tabelas do banco de dados");
    }
  });
  
  // Endpoint para criar uma nova tabela no banco de dados
  app.post(`${apiPrefix}/database/tables`, handleCreateDatabaseTable);
  
  // Rotas específicas para tabelas por projeto
  app.get(`${apiPrefix}/projects/:projectId/database/tables`, (req, res) => {
    // Passar o ID do projeto via query para reutilizar o handler existente
    req.query.projectId = req.params.projectId;
    handleGetDatabaseTables(req, res);
  });
  
  // Rota para criar tabela dentro de um projeto específico
  app.post(`${apiPrefix}/projects/:projectId/database/tables`, (req, res) => {
    // Inserir o ID do projeto dos parâmetros no corpo da requisição
    req.body.projectId = req.params.projectId;
    handleCreateDatabaseTable(req, res);
  });
  
  // Rota para obter schema de uma tabela específica por projeto
  app.get(`${apiPrefix}/projects/:projectId/database/tables/:tableName/schema`, (req, res) => {
    req.query.projectId = req.params.projectId;
    req.params.tableName = req.params.tableName;
    return handleGetTableSchema(req, res);
  });
  
  // Rota para buscar dados de uma tabela específica por projeto
  app.get(`${apiPrefix}/projects/:projectId/database/tables/:tableName/data`, (req, res) => {
    req.query.projectId = req.params.projectId;
    req.params.tableName = req.params.tableName;
    return handleGetTableData(req, res);
  });
  
  // ============= APIS DINÂMICAS E GERENCIAMENTO =============
  
  // Endpoint para listar as APIs registradas para um projeto
  app.get(`${apiPrefix}/project-apis`, async (req, res) => {
    try {
      const projectId = req.query.projectId ? parseInt(req.query.projectId as string, 10) : null;
      
      if (!projectId) {
        return res.status(400).json({ message: "É necessário fornecer o ID do projeto" });
      }
      
      // Buscar APIs registradas para o projeto
      const apis = await db.query.projectApis.findMany({
        where: eq(schema.projectApis.projectId, projectId),
        with: {
          table: true
        }
      });
      
      // Se já temos APIs registradas, retornamos elas
      if (apis.length > 0) {
        return res.json({
          apis: apis.map(api => ({
            id: api.id,
            projectId: api.projectId,
            path: api.apiPath,
            method: api.method,
            description: api.description || "",
            tableName: api.table?.tableName,
            displayName: api.table?.displayName,
            isActive: api.isActive,
            isCustom: api.isCustom,
            createdAt: api.createdAt.toISOString()
          }))
        });
      }
      
      // Se não temos APIs ainda, vamos criar as APIs padrão para tabelas registradas
      const projectTables = await db.query.projectDatabases.findMany({
        where: eq(schema.projectDatabases.projectId, projectId)
      });
      
      // Para cada tabela, criamos endpoints CRUD padrão
      const createdApis = [];
      for (const table of projectTables) {
        if (table.apiEnabled) {
          // Lista todos os registros
          const listApi = await db.insert(schema.projectApis).values({
            projectId,
            tableId: table.id,
            apiPath: `/api/p${projectId}/${table.tableName}`,
            method: 'GET',
            description: `Listar todos os registros da tabela ${table.displayName}`,
            isActive: true,
            isCustom: false,
            configuration: {
              operation: 'list',
              params: [],
              filters: [],
              pagination: true
            }
          }).returning();
          createdApis.push(listApi[0]);
          
          // Buscar por ID
          const getByIdApi = await db.insert(schema.projectApis).values({
            projectId,
            tableId: table.id,
            apiPath: `/api/p${projectId}/${table.tableName}/:id`,
            method: 'GET',
            description: `Buscar registro por ID na tabela ${table.displayName}`,
            isActive: true,
            isCustom: false,
            configuration: {
              operation: 'getById',
              params: [{ name: 'id', type: 'number', in: 'path' }],
              filters: []
            }
          }).returning();
          createdApis.push(getByIdApi[0]);
          
          // Criar novo registro
          const createApi = await db.insert(schema.projectApis).values({
            projectId,
            tableId: table.id,
            apiPath: `/api/p${projectId}/${table.tableName}`,
            method: 'POST',
            description: `Criar novo registro na tabela ${table.displayName}`,
            isActive: true,
            isCustom: false,
            configuration: {
              operation: 'create',
              params: [{ name: 'body', type: 'object', in: 'body' }],
              filters: []
            }
          }).returning();
          createdApis.push(createApi[0]);
          
          // Atualizar registro
          const updateApi = await db.insert(schema.projectApis).values({
            projectId,
            tableId: table.id,
            apiPath: `/api/p${projectId}/${table.tableName}/:id`,
            method: 'PUT',
            description: `Atualizar registro na tabela ${table.displayName}`,
            isActive: true,
            isCustom: false,
            configuration: {
              operation: 'update',
              params: [
                { name: 'id', type: 'number', in: 'path' },
                { name: 'body', type: 'object', in: 'body' }
              ],
              filters: []
            }
          }).returning();
          createdApis.push(updateApi[0]);
          
          // Excluir registro
          const deleteApi = await db.insert(schema.projectApis).values({
            projectId,
            tableId: table.id,
            apiPath: `/api/p${projectId}/${table.tableName}/:id`,
            method: 'DELETE',
            description: `Excluir registro da tabela ${table.displayName}`,
            isActive: true,
            isCustom: false,
            configuration: {
              operation: 'delete',
              params: [{ name: 'id', type: 'number', in: 'path' }],
              filters: []
            }
          }).returning();
          createdApis.push(deleteApi[0]);
        }
      }
      
      // Formatar resposta
      const formattedApis = createdApis.map(api => ({
        id: api.id,
        projectId: api.projectId,
        path: api.apiPath,
        method: api.method,
        description: api.description || "",
        tableName: projectTables.find(t => t.id === api.tableId)?.tableName,
        displayName: projectTables.find(t => t.id === api.tableId)?.displayName,
        isActive: api.isActive,
        isCustom: api.isCustom,
        createdAt: api.createdAt.toISOString()
      }));
      
      res.json({ apis: formattedApis });
    } catch (error) {
      handleError(res, error, "Erro ao buscar APIs do projeto");
    }
  });
  
  // Handlers para tabelas de banco de dados
  async function handleGetTableSchema(req: Request, res: Response) {
    try {
      const { tableName } = req.params;
      const projectId = req.query.projectId ? parseInt(req.query.projectId as string, 10) : null;
      
      if (!projectId) {
        return res.status(400).json({ message: "É necessário fornecer o ID do projeto" });
      }
      
      // Construir o nome real da tabela com o prefixo do projeto
      const fullTableName = `p${projectId}_${tableName}`;
      
      // Verificar se a tabela pertence ao projeto
      const projectTable = await db.query.projectDatabases.findFirst({
        where: and(
          eq(schema.projectDatabases.projectId, projectId),
          eq(schema.projectDatabases.tableName, fullTableName)
        )
      });
      
      if (!projectTable) {
        return res.status(404).json({ message: `Tabela ${tableName} não encontrada para o projeto ${projectId}` });
      }
      
      // Consultar as colunas da tabela
      const query = sql`
        SELECT 
          column_name, 
          data_type, 
          is_nullable, 
          column_default,
          character_maximum_length
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = ${fullTableName}
        ORDER BY ordinal_position;
      `;
      
      const result = await db.execute(query);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Tabela não encontrada" });
      }
      
      // Buscar informações sobre as chaves primárias
      const primaryKeyQuery = sql`
        SELECT c.column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.constraint_column_usage AS ccu USING (constraint_schema, constraint_name)
        JOIN information_schema.columns AS c ON c.table_schema = tc.constraint_schema
          AND tc.table_name = c.table_name AND ccu.column_name = c.column_name
        WHERE tc.constraint_type = 'PRIMARY KEY' AND tc.table_name = ${fullTableName};
      `;
      
      const primaryKeyResult = await db.execute(primaryKeyQuery);
      const primaryKeys = primaryKeyResult.rows.map((row: any) => row.column_name);
      
      res.json({
        tableName,
        fullTableName,
        columns: result.rows,
        primaryKeys
      });
    } catch (error) {
      handleError(res, error, "Erro ao buscar schema da tabela");
    }
  }
  
  // Registrar as rotas antigas para compatibilidade retroativa
  app.get(`${apiPrefix}/database/tables/:tableName/schema`, handleGetTableSchema);
  app.get(`${apiPrefix}/database/tables/:tableName/data`, handleGetTableData);
  
  // Handler para buscar dados de uma tabela
  async function handleGetTableData(req: Request, res: Response) {
    try {
      const { tableName } = req.params;
      const projectId = req.query.projectId ? parseInt(req.query.projectId as string, 10) : null;
      const page = Number(req.query.page) || 1;
      const limit = Math.min(Number(req.query.limit) || 20, 100);
      const offset = (page - 1) * limit;
      
      if (!projectId) {
        return res.status(400).json({ message: "É necessário fornecer o ID do projeto" });
      }
      
      // Construir o nome real da tabela com o prefixo do projeto
      const fullTableName = `p${projectId}_${tableName}`;
      
      // Verificar se a tabela pertence ao projeto
      const projectTable = await db.query.projectDatabases.findFirst({
        where: and(
          eq(schema.projectDatabases.projectId, projectId),
          eq(schema.projectDatabases.tableName, fullTableName)
        )
      });
      
      if (!projectTable) {
        return res.status(404).json({ message: `Tabela ${tableName} não encontrada para o projeto ${projectId}` });
      }
      
      // Extrair filtros da query string
      const filters: any[] = [];
      Object.keys(req.query).forEach(key => {
        const match = key.match(/^filter_(\d+)_(field|operator|value)$/);
        if (match) {
          const [, index, type] = match;
          if (!filters[Number(index)]) filters[Number(index)] = {};
          filters[Number(index)][type] = req.query[key];
        }
      });
      
      // Construir a consulta base
      let queryText = `SELECT * FROM "${fullTableName}" WHERE 1=1`;
      const queryParams: any[] = [];
      
      // Adicionar filtros à consulta
      filters.forEach((filter, i) => {
        if (filter && filter.field && filter.operator && filter.value !== undefined) {
          const paramIndex = i + 1;
          
          switch (filter.operator) {
            case 'equals':
              queryText += ` AND "${filter.field}" = $${paramIndex}`;
              queryParams.push(filter.value);
              break;
            case 'notEquals':
              queryText += ` AND "${filter.field}" != $${paramIndex}`;
              queryParams.push(filter.value);
              break;
            case 'contains':
              queryText += ` AND "${filter.field}" ILIKE $${paramIndex}`;
              queryParams.push(`%${filter.value}%`);
              break;
            case 'greaterThan':
              queryText += ` AND "${filter.field}" > $${paramIndex}`;
              queryParams.push(filter.value);
              break;
            case 'lessThan':
              queryText += ` AND "${filter.field}" < $${paramIndex}`;
              queryParams.push(filter.value);
              break;
          }
        }
      });
      
      // Adicionar ordenação, limite e offset
      queryText += ` ORDER BY id DESC LIMIT ${limit} OFFSET ${offset}`;
      
      // Executar a consulta
      const query = sql.raw(queryText, queryParams);
      const result = await db.execute(query);
      
      // Contar o total de registros (para paginação)
      let countQueryText = `SELECT COUNT(*) as total FROM "${fullTableName}" WHERE 1=1`;
      
      // Adicionar os mesmos filtros à consulta de contagem
      filters.forEach((filter, i) => {
        if (filter && filter.field && filter.operator && filter.value !== undefined) {
          const paramIndex = i + 1;
          
          switch (filter.operator) {
            case 'equals':
              countQueryText += ` AND "${filter.field}" = $${paramIndex}`;
              break;
            case 'notEquals':
              countQueryText += ` AND "${filter.field}" != $${paramIndex}`;
              break;
            case 'contains':
              countQueryText += ` AND "${filter.field}" ILIKE $${paramIndex}`;
              break;
            case 'greaterThan':
              countQueryText += ` AND "${filter.field}" > $${paramIndex}`;
              break;
            case 'lessThan':
              countQueryText += ` AND "${filter.field}" < $${paramIndex}`;
              break;
          }
        }
      });
      
      const countQuery = sql.raw(countQueryText, queryParams);
      const countResult = await db.execute(countQuery);
      const total = Number(countResult.rows[0].total);
      
      res.json({
        data: result.rows,
        meta: {
          pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      handleError(res, error, "Erro ao buscar dados da tabela");
    }
  }
  
  // Handler para criar um novo registro em uma tabela
  async function handleCreateRecord(req: Request, res: Response) {
    try {
      const { tableName } = req.params;
      const projectId = req.query.projectId ? parseInt(req.query.projectId as string, 10) : null;
      const data = req.body;
      
      if (!projectId) {
        return res.status(400).json({ message: "É necessário fornecer o ID do projeto" });
      }
      
      // Construir o nome completo da tabela com o prefixo do projeto
      const fullTableName = `p${projectId}_${tableName}`;
      
      // Verificar se o tableName é válido para evitar SQL injection
      const tableCheck = await db.execute(sql`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.tables 
          WHERE table_schema = 'public' AND table_name = ${fullTableName}
        ) as exists
      `);
      
      if (!tableCheck.rows[0].exists) {
        return res.status(404).json({ error: `Tabela ${tableName} não encontrada para o projeto ${projectId}` });
      }
      
      // Construir a inserção dinâmica
      const columns = Object.keys(data);
      const values = Object.values(data);
      
      // Criar cláusula SQL para inserção
      const columnStr = columns.map(col => `"${col}"`).join(', ');
      const valuePlaceholders = columns.map((_, i) => `$${i+1}`).join(', ');
      
      const insertQuery = sql.raw(
        `INSERT INTO "${fullTableName}" (${columnStr}) VALUES (${valuePlaceholders}) RETURNING *`,
        values
      );
      
      const result = await db.execute(insertQuery);
      
      res.status(201).json(result.rows[0]);
    } catch (error) {
      handleError(res, error, "Erro ao criar registro");
    }
  }
  
  // Endpoint para criar novo registro em uma tabela
  app.post(`${apiPrefix}/database/tables/:tableName/data`, handleCreateRecord);
  
  // Endpoint personalizado para projetos - inserir registros em uma tabela
  app.post(`${apiPrefix}/projects/:projectId/database/tables/:tableName/data`, (req, res) => {
    // Transferir o ID do projeto dos parâmetros para a query
    req.query.projectId = req.params.projectId;
    
    // Chamar o handler de criação de registros
    handleCreateRecord(req, res);
  });
  
  // Endpoint para atualizar um registro
  app.put(`${apiPrefix}/database/tables/:tableName/data/:id`, async (req, res) => {
    try {
      const { tableName, id } = req.params;
      const data = req.body;
      
      // Verificar se o tableName é válido
      const tableCheck = await db.execute(sql`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.tables 
          WHERE table_schema = 'public' AND table_name = ${tableName}
        ) as exists
      `);
      
      if (!tableCheck.rows[0].exists) {
        return res.status(404).json({ error: "Tabela não encontrada" });
      }
      
      // Construir a atualização dinâmica
      const columns = Object.keys(data);
      const values = Object.values(data);
      
      // Criar cláusula SET para atualização
      const setClause = columns.map((col, i) => `"${col}" = $${i+1}`).join(', ');
      
      // Adicionar o ID como último parâmetro
      const updateQuery = sql.raw(
        `UPDATE "${tableName}" SET ${setClause} WHERE id = $${columns.length+1} RETURNING *`,
        [...values, id]
      );
      
      const result = await db.execute(updateQuery);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Registro não encontrado" });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      handleError(res, error, "Erro ao atualizar registro");
    }
  });
  
  // Endpoint para excluir um registro
  app.delete(`${apiPrefix}/database/tables/:tableName/data/:id`, async (req, res) => {
    try {
      const { tableName, id } = req.params;
      
      // Verificar se o tableName é válido
      const tableCheck = await db.execute(sql`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.tables 
          WHERE table_schema = 'public' AND table_name = ${tableName}
        ) as exists
      `);
      
      if (!tableCheck.rows[0].exists) {
        return res.status(404).json({ error: "Tabela não encontrada" });
      }
      
      // Verificar se existe coluna deleted_at para soft delete
      const columnCheck = await db.execute(sql`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_schema = 'public' AND table_name = ${tableName} AND column_name = 'deleted_at'
        ) as exists
      `);
      
      let result;
      
      if (columnCheck.rows[0].exists) {
        // Soft delete - apenas atualizar deleted_at
        const updateQuery = sql.raw(
          `UPDATE "${tableName}" SET "deleted_at" = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id`,
          [id]
        );
        result = await db.execute(updateQuery);
      } else {
        // Hard delete - remover o registro permanentemente
        const deleteQuery = sql.raw(
          `DELETE FROM "${tableName}" WHERE id = $1 RETURNING id`,
          [id]
        );
        result = await db.execute(deleteQuery);
      }
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Registro não encontrado" });
      }
      
      res.json({ success: true, message: "Registro excluído com sucesso" });
    } catch (error) {
      handleError(res, error, "Erro ao excluir registro");
    }
  });
  
  // Endpoint para criar uma nova tabela (dinâmica)
  app.post(`${apiPrefix}/database/tables`, async (req, res) => {
    try {
      const { tableName, columns } = req.body;
      
      if (!tableName || !columns || !Array.isArray(columns) || columns.length === 0) {
        return res.status(400).json({ error: "Nome da tabela e definição de colunas são obrigatórios" });
      }
      
      // Verificar se a tabela já existe
      const tableCheck = await db.execute(sql`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.tables 
          WHERE table_schema = 'public' AND table_name = ${tableName}
        ) as exists
      `);
      
      if (tableCheck.rows[0].exists) {
        return res.status(400).json({ error: "Tabela já existe" });
      }
      
      // Construir a cláusula de criação de tabela
      let columnsDefinition = columns.map(col => {
        let def = `"${col.name}" ${mapTypeToSQL(col.type)}`;
        
        if (col.primary) {
          def += " PRIMARY KEY";
        }
        
        if (col.notNull) {
          def += " NOT NULL";
        }
        
        if (col.defaultValue !== undefined) {
          def += ` DEFAULT ${formatSQLValue(col.defaultValue, col.type)}`;
        }
        
        return def;
      }).join(', ');
      
      // Adicionar colunas de timestamp e soft delete se solicitado
      const includeTimestamps = req.body.timestamps !== false;
      const includeSoftDelete = req.body.softDelete === true;
      
      if (includeTimestamps) {
        columnsDefinition += `, "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP`;
      }
      
      if (includeSoftDelete) {
        columnsDefinition += `, "deleted_at" TIMESTAMP`;
      }
      
      // Criar a tabela
      const createTableQuery = sql.raw(`CREATE TABLE "${tableName}" (${columnsDefinition})`);
      await db.execute(createTableQuery);
      
      res.status(201).json({
        success: true,
        message: "Tabela criada com sucesso",
        tableName,
        columns: columns.map(col => col.name)
      });
    } catch (error) {
      handleError(res, error, "Erro ao criar tabela");
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
