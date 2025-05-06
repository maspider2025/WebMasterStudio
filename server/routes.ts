import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertProjectSchema, insertPageSchema, insertElementSchema, insertProductSchema, insertProductCategorySchema, insertProductVariantSchema, insertCartSchema, insertCartItemSchema } from "@shared/schema";
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
    const { name, description, generateApi, columns } = req.body;
    
    if (!name || !columns || !Array.isArray(columns) || columns.length === 0) {
      return res.status(400).json({
        message: 'Nome da tabela e colunas são obrigatórios'
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
    
    // Execute SQL para criar a tabela
    await pool.query(createTableSQL);
    
    // Registrar no sistema de metadados
    // TODO: Implementar registro em tabela de metadados para gerenciamento visual
    
    // Gerar API dinamicamente se solicitado
    if (generateApi) {
      // TODO: Implementar geração dinâmica de API
      // Isso será feito usando o api-generator.ts
    }
    
    return res.status(201).json({
      message: `Tabela ${name} criada com sucesso`,
      sql: createTableSQL,
      name,
      generateApi
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
    // Consulta para obter todas as tabelas do schema public exceto as do drizzle
    const tablesQuery = `
      SELECT 
        tablename as name,
        obj_description(('public.' || tablename)::regclass, 'pg_class') as description,
        (SELECT COUNT(*) FROM ${name}) as "rowCount",
        NOW() as "createdAt"
      FROM 
        pg_tables 
      WHERE 
        schemaname = 'public' 
        AND tablename NOT LIKE 'drizzle%'
        AND tablename != 'pgmigrations'
      ORDER BY 
        tablename
    `;
    
    try {
      const result = await pool.query(tablesQuery.replace(/\${name}/g, 'information_schema.tables'));
      
      // Para cada tabela, consultar novamente para obter o número real de linhas
      const tablesWithCounts = await Promise.all(result.rows.map(async (table) => {
        try {
          const countResult = await pool.query(`SELECT COUNT(*) as count FROM ${table.name}`);
          return {
            ...table,
            rowCount: parseInt(countResult.rows[0].count, 10)
          };
        } catch (err) {
          // Se houver erro ao contar, manter o valor zero
          return {
            ...table,
            rowCount: 0
          };
        }
      }));
      
      return res.json({
        tables: tablesWithCounts
      });
    } catch (error) {
      // Se ocorrer um erro ao listar as tabelas, retornar lista vazia
      console.error("Erro ao listar tabelas:", error);
      return res.json({ tables: [] });
    }
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
  app.get(`${apiPrefix}/projects`, async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const projects = await storage.getProjectsByUserId(userId);
      res.status(200).json(projects);
    } catch (error) {
      console.error('Error fetching projects:', error);
      res.status(500).json({ message: 'Failed to fetch projects' });
    }
  });

  app.post(`${apiPrefix}/projects`, async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const projectData = insertProjectSchema.parse({
        ...req.body,
        userId,
      });
      
      const newProject = await storage.createProject(projectData);
      res.status(201).json(newProject);
    } catch (error) {
      console.error('Error creating project:', error);
      res.status(500).json({ message: 'Failed to create project' });
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
      
      // Buscar avaliações
      // Nota: Esta é uma implementação simples. Em um sistema real, as avaliações seriam armazenadas em uma tabela separada.
      // Para simular, vamos retornar avaliações aleatórias
      const mockReviews = [
        {
          id: 1,
          productId: productId,
          userId: 1,
          userName: "João Silva",
          rating: 5,
          title: "Excelente produto!",
          comment: "Comprei para minha filha e ela adorou. Produto de qualidade e entrega rápida.",
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          helpfulCount: 12
        },
        {
          id: 2,
          productId: productId,
          userId: 2,
          userName: "Maria Oliveira",
          rating: 4,
          title: "Bom custo-benefício",
          comment: "O produto atendeu às expectativas. Entrega foi mais rápida do que o esperado.",
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          helpfulCount: 7
        },
        {
          id: 3,
          productId: productId,
          userId: 3,
          userName: "Pedro Santos",
          rating: 3,
          title: "Bom, mas pode melhorar",
          comment: "O produto é bom, mas esperava mais durabilidade. O atendimento ao cliente foi excelente quando precisei de ajuda.",
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          helpfulCount: 3
        }
      ];
      
      res.status(200).json(mockReviews);
    } catch (error) {
      return handleError(res, error, 'Erro ao buscar avaliações do produto');
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
      // Buscar todas as tabelas disponíveis no banco de dados
      const query = sql`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        AND table_name NOT IN ('_drizzle_migrations')
        ORDER BY table_name;
      `;
      
      const result = await db.execute(query);
      const tables = result.rows.map((row: any) => row.table_name);
      
      res.json({ tables });
    } catch (error) {
      handleError(res, error, "Erro ao buscar tabelas do banco de dados");
    }
  });
  
  // Endpoint para obter schema de uma tabela específica
  app.get(`${apiPrefix}/database/tables/:tableName/schema`, async (req, res) => {
    try {
      const { tableName } = req.params;
      
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
        AND table_name = ${tableName}
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
        WHERE tc.constraint_type = 'PRIMARY KEY' AND tc.table_name = ${tableName};
      `;
      
      const primaryKeyResult = await db.execute(primaryKeyQuery);
      const primaryKeys = primaryKeyResult.rows.map((row: any) => row.column_name);
      
      res.json({
        tableName,
        columns: result.rows,
        primaryKeys
      });
    } catch (error) {
      handleError(res, error, "Erro ao buscar schema da tabela");
    }
  });
  
  // Endpoint para buscar dados de uma tabela (com paginação e filtros)
  app.get(`${apiPrefix}/database/tables/:tableName/data`, async (req, res) => {
    try {
      const { tableName } = req.params;
      const page = Number(req.query.page) || 1;
      const limit = Math.min(Number(req.query.limit) || 20, 100);
      const offset = (page - 1) * limit;
      
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
      let queryText = `SELECT * FROM "${tableName}" WHERE 1=1`;
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
      let countQueryText = `SELECT COUNT(*) as total FROM "${tableName}" WHERE 1=1`;
      
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
  });
  
  // Endpoint para criar novo registro em uma tabela
  app.post(`${apiPrefix}/database/tables/:tableName/data`, async (req, res) => {
    try {
      const { tableName } = req.params;
      const data = req.body;
      
      // Verificar se o tableName é válido para evitar SQL injection
      const tableCheck = await db.execute(sql`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.tables 
          WHERE table_schema = 'public' AND table_name = ${tableName}
        ) as exists
      `);
      
      if (!tableCheck.rows[0].exists) {
        return res.status(404).json({ error: "Tabela não encontrada" });
      }
      
      // Construir a inserção dinâmica
      const columns = Object.keys(data);
      const values = Object.values(data);
      
      // Criar cláusula SQL para inserção
      const columnStr = columns.map(col => `"${col}"`).join(', ');
      const valuePlaceholders = columns.map((_, i) => `$${i+1}`).join(', ');
      
      const insertQuery = sql.raw(
        `INSERT INTO "${tableName}" (${columnStr}) VALUES (${valuePlaceholders}) RETURNING *`,
        values
      );
      
      const result = await db.execute(insertQuery);
      
      res.status(201).json(result.rows[0]);
    } catch (error) {
      handleError(res, error, "Erro ao criar registro");
    }
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
