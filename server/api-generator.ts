import { Request, Response } from 'express';
import { db } from '../db';
import * as schema from '../shared/schema';
import { eq, and, or, like, desc, asc } from 'drizzle-orm';
import { SQL } from 'drizzle-orm';
import { pgTable, serial, text, integer, timestamp, boolean, jsonb, numeric } from 'drizzle-orm/pg-core';
import { z } from 'zod';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

/**
 * API Generator
 * 
 * Este módulo gerencia a criação dinâmica de tabelas e APIs baseadas
 * nas definições criadas no editor visual.
 * 
 * Funcionalidades:
 * - Criação dinâmica de tabelas
 * - Geração de rotas CRUD
 * - Validação baseada em esquemas
 * - Relacionamentos entre tabelas
 */

export interface APIEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  description: string;
  parameters?: APIParameter[];
  responseSchema: any;
  implementation: (req: Request, res: Response) => Promise<void>;
}

interface APIParameter {
  name: string;
  description: string;
  in: 'path' | 'query' | 'body';
  required: boolean;
  type: string;
  schema?: any;
}

export interface TableDefinition {
  name: string;
  description?: string;
  tableName: string; // Nome real na base de dados
  columns: ColumnDefinition[];
  relationships?: RelationshipDefinition[];
  apiEndpoints?: boolean; // Se true, gera endpoints CRUD padrão
  customEndpoints?: APIEndpoint[];
  timestamps?: boolean; // Se true, adiciona createdAt e updatedAt
  softDelete?: boolean; // Se true, adiciona deletedAt (soft delete)
}

interface ColumnDefinition {
  name: string;
  type: 'string' | 'integer' | 'number' | 'boolean' | 'json' | 'date' | 'reference';
  description?: string;
  required?: boolean;
  unique?: boolean;
  default?: any;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  reference?: {
    table: string;
    column: string;
  };
  validation?: any; // Validação específica para este campo
}

interface RelationshipDefinition {
  type: 'oneToMany' | 'manyToOne' | 'oneToOne' | 'manyToMany';
  sourceColumn: string;
  targetTable: string;
  targetColumn: string;
  joinTable?: string; // Para relacionamentos many-to-many
}

// Cache de tabelas e endpoints já gerados
interface APICache {
  tables: Map<string, any>; // PgTable objetos
  schemas: Map<string, {
    insertSchema: z.ZodSchema<any>;
    selectSchema: z.ZodSchema<any>;
  }>;
  endpoints: APIEndpoint[];
}

const apiCache: APICache = {
  tables: new Map(),
  schemas: new Map(),
  endpoints: []
};

/**
 * Registra todas as APIs geradas no Express
 */
export function registerGeneratedAPIs(app: any, basePath: string = '/api') {
  for (const endpoint of apiCache.endpoints) {
    const path = `${basePath}${endpoint.path}`;
    
    switch (endpoint.method) {
      case 'GET':
        app.get(path, asyncHandler(endpoint.implementation));
        break;
      case 'POST':
        app.post(path, asyncHandler(endpoint.implementation));
        break;
      case 'PUT':
        app.put(path, asyncHandler(endpoint.implementation));
        break;
      case 'PATCH':
        app.patch(path, asyncHandler(endpoint.implementation));
        break;
      case 'DELETE':
        app.delete(path, asyncHandler(endpoint.implementation));
        break;
    }
    
    console.log(`API registrada: ${endpoint.method} ${path} - ${endpoint.description}`);
  }
}

// Wrapper para manipulação de erros em rotas assíncronas
function asyncHandler(fn: (req: Request, res: Response) => Promise<void>) {
  return async (req: Request, res: Response) => {
    try {
      await fn(req, res);
    } catch (error) {
      console.error('Erro na API:', error);
      const statusCode = error instanceof APIError ? error.statusCode : 500;
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';
      res.status(statusCode).json({ error: message });
    }
  };
}

// Classe customizada para erros de API
class APIError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'APIError';
  }
}

/**
 * Gera as definições de tabela do Drizzle a partir de nossas configurações
 */
export async function generateTableDefinition(tableDef: TableDefinition): Promise<any> {
  // Se já existe no cache, retorna
  if (apiCache.tables.has(tableDef.tableName)) {
    return apiCache.tables.get(tableDef.tableName);
  }
  
  // Construir as colunas da tabela
  const columns: Record<string, any> = {};
  
  // ID sempre presente como chave primária
  columns.id = serial('id').primaryKey();
  
  // Adicionar todas as colunas definidas
  for (const column of tableDef.columns) {
    switch (column.type) {
      case 'string':
        columns[column.name] = column.required 
          ? text(column.name).notNull() 
          : text(column.name);
        break;
      case 'integer':
        columns[column.name] = column.required 
          ? integer(column.name).notNull() 
          : integer(column.name);
        break;
      case 'number':
        columns[column.name] = column.required 
          ? numeric(column.name).notNull() 
          : numeric(column.name);
        break;
      case 'boolean':
        columns[column.name] = column.required 
          ? boolean(column.name).notNull() 
          : boolean(column.name);
        break;
      case 'json':
        columns[column.name] = column.required 
          ? jsonb(column.name).notNull() 
          : jsonb(column.name);
        break;
      case 'date':
        columns[column.name] = column.required 
          ? timestamp(column.name).notNull() 
          : timestamp(column.name);
        break;
      case 'reference':
        if (column.reference) {
          // Certificar que a tabela referenciada existe
          if (!apiCache.tables.has(column.reference.table)) {
            throw new Error(`Tabela referenciada ${column.reference.table} não existe no cache.`);
          }
          
          // Buscar tabela referenciada do cache
          const refTable = apiCache.tables.get(column.reference.table);
          
          columns[column.name] = column.required 
            ? integer(column.name).references(() => refTable[column.reference.column]).notNull() 
            : integer(column.name).references(() => refTable[column.reference.column]);
        }
        break;
    }
    
    // Adicionar unique se necessário
    if (column.unique && columns[column.name]) {
      columns[column.name] = columns[column.name].unique();
    }
  }
  
  // Adicionar timestamps se solicitado
  if (tableDef.timestamps !== false) { // Por padrão, adiciona timestamps
    columns.createdAt = timestamp('created_at').defaultNow().notNull();
    columns.updatedAt = timestamp('updated_at').defaultNow().notNull();
  }
  
  // Adicionar soft delete se solicitado
  if (tableDef.softDelete) {
    columns.deletedAt = timestamp('deleted_at');
  }
  
  // Criar a definição da tabela
  const table = pgTable(tableDef.tableName, columns);
  
  // Armazenar no cache
  apiCache.tables.set(tableDef.tableName, table);
  
  // Criar os esquemas de validação
  const insertSchema = createInsertSchema(table);
  const selectSchema = createSelectSchema(table);
  
  // Armazenar esquemas no cache
  apiCache.schemas.set(tableDef.tableName, {
    insertSchema,
    selectSchema
  });
  
  // Se solicitado, gerar endpoints CRUD padrão
  if (tableDef.apiEndpoints) {
    generateCRUDEndpoints(tableDef, table);
  }
  
  // Adicionar endpoints personalizados se existirem
  if (tableDef.customEndpoints) {
    apiCache.endpoints.push(...tableDef.customEndpoints);
  }
  
  return table;
}

/**
 * Gera endpoints CRUD padrão para uma tabela
 */
function generateCRUDEndpoints(tableDef: TableDefinition, table: any) {
  const tableName = tableDef.tableName;
  const basePath = `/${tableName}`;
  const schemas = apiCache.schemas.get(tableName);
  
  if (!schemas) {
    throw new Error(`Esquemas para tabela ${tableName} não encontrados.`);
  }
  
  // 1. Endpoint GET - Listar todos (com paginação e filtros)
  const listEndpoint: APIEndpoint = {
    method: 'GET',
    path: basePath,
    description: `Lista todos os registros de ${tableDef.name}`,
    parameters: [
      {
        name: 'page',
        description: 'Número da página',
        in: 'query',
        required: false,
        type: 'integer'
      },
      {
        name: 'limit',
        description: 'Número de itens por página',
        in: 'query',
        required: false,
        type: 'integer'
      },
      {
        name: 'sort',
        description: 'Campo para ordenação',
        in: 'query',
        required: false,
        type: 'string'
      },
      {
        name: 'order',
        description: 'Direção da ordenação (asc/desc)',
        in: 'query',
        required: false,
        type: 'string'
      }
    ],
    responseSchema: z.object({
      data: z.array(schemas.selectSchema),
      pagination: z.object({
        total: z.number(),
        page: z.number(),
        limit: z.number(),
        pages: z.number()
      })
    }),
    implementation: async (req: Request, res: Response) => {
      const page = Number(req.query.page) || 1;
      const limit = Math.min(Number(req.query.limit) || 20, 100); // Máximo de 100 itens por página
      const offset = (page - 1) * limit;
      const sortField = String(req.query.sort || 'id');
      const sortOrder = req.query.order === 'desc' ? 'desc' : 'asc';
      
      // Para soft delete, filtrar apenas itens não deletados
      const whereClause = tableDef.softDelete ? [{ deletedAt: null }] : [];
      
      // Construir filtros dinâmicos a partir de query params
      // Excluir parâmetros especiais (page, limit, sort, order)
      const specialParams = ['page', 'limit', 'sort', 'order'];
      for (const [key, value] of Object.entries(req.query)) {
        if (!specialParams.includes(key) && table[key] && value) {
          // Se o tipo da coluna for string, usar LIKE para busca parcial
          if (tableDef.columns.find(c => c.name === key)?.type === 'string') {
            whereClause.push(like(table[key], `%${value}%`));
          } else {
            whereClause.push(eq(table[key], value));
          }
        }
      }
      
      // Contar total de registros para paginação
      const countResult = await db.select({ count: count() }).from(table)
        .where(and(...whereClause));
      const total = Number(countResult[0].count);
      
      // Buscar registros com paginação e ordenação
      const orderBy: any = sortOrder === 'desc' ? desc(table[sortField]) : asc(table[sortField]);
      
      const data = await db.select().from(table)
        .where(and(...whereClause))
        .limit(limit)
        .offset(offset)
        .orderBy(orderBy);
      
      res.json({
        data,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      });
    }
  };
  
  // 2. Endpoint GET - Obter por ID
  const getByIdEndpoint: APIEndpoint = {
    method: 'GET',
    path: `${basePath}/:id`,
    description: `Obtém um registro de ${tableDef.name} por ID`,
    parameters: [
      {
        name: 'id',
        description: 'ID do registro',
        in: 'path',
        required: true,
        type: 'integer'
      }
    ],
    responseSchema: schemas.selectSchema,
    implementation: async (req: Request, res: Response) => {
      const id = Number(req.params.id);
      
      if (isNaN(id)) {
        throw new APIError('ID inválido', 400);
      }
      
      // Para soft delete, verificar se o item foi deletado
      const whereClause = [eq(table.id, id)];
      if (tableDef.softDelete) {
        whereClause.push(eq(table.deletedAt, null));
      }
      
      const result = await db.select().from(table)
        .where(and(...whereClause))
        .limit(1);
      
      if (result.length === 0) {
        throw new APIError('Registro não encontrado', 404);
      }
      
      res.json(result[0]);
    }
  };
  
  // 3. Endpoint POST - Criar
  const createEndpoint: APIEndpoint = {
    method: 'POST',
    path: basePath,
    description: `Cria um novo registro de ${tableDef.name}`,
    parameters: [
      {
        name: 'body',
        description: 'Dados do registro',
        in: 'body',
        required: true,
        type: 'object',
        schema: schemas.insertSchema
      }
    ],
    responseSchema: schemas.selectSchema,
    implementation: async (req: Request, res: Response) => {
      // Validar dados com o esquema
      const validatedData = schemas.insertSchema.parse(req.body);
      
      // Inserir no banco
      const result = await db.insert(table).values(validatedData).returning();
      
      res.status(201).json(result[0]);
    }
  };
  
  // 4. Endpoint PUT - Atualizar
  const updateEndpoint: APIEndpoint = {
    method: 'PUT',
    path: `${basePath}/:id`,
    description: `Atualiza um registro de ${tableDef.name}`,
    parameters: [
      {
        name: 'id',
        description: 'ID do registro',
        in: 'path',
        required: true,
        type: 'integer'
      },
      {
        name: 'body',
        description: 'Dados atualizados do registro',
        in: 'body',
        required: true,
        type: 'object',
        schema: schemas.insertSchema
      }
    ],
    responseSchema: schemas.selectSchema,
    implementation: async (req: Request, res: Response) => {
      const id = Number(req.params.id);
      
      if (isNaN(id)) {
        throw new APIError('ID inválido', 400);
      }
      
      // Validar dados com o esquema
      const validatedData = schemas.insertSchema.parse(req.body);
      
      // Para soft delete, verificar se o item existe e não foi deletado
      const whereClause = [eq(table.id, id)];
      if (tableDef.softDelete) {
        whereClause.push(eq(table.deletedAt, null));
      }
      
      // Verificar se o registro existe
      const existingRecord = await db.select({ id: table.id }).from(table)
        .where(and(...whereClause))
        .limit(1);
      
      if (existingRecord.length === 0) {
        throw new APIError('Registro não encontrado', 404);
      }
      
      // Atualizar o registro
      const updateData = { ...validatedData };
      if (tableDef.timestamps !== false) {
        updateData.updatedAt = new Date();
      }
      
      const result = await db.update(table)
        .set(updateData)
        .where(eq(table.id, id))
        .returning();
      
      res.json(result[0]);
    }
  };
  
  // 5. Endpoint DELETE - Excluir (ou soft delete)
  const deleteEndpoint: APIEndpoint = {
    method: 'DELETE',
    path: `${basePath}/:id`,
    description: `Remove um registro de ${tableDef.name}`,
    parameters: [
      {
        name: 'id',
        description: 'ID do registro',
        in: 'path',
        required: true,
        type: 'integer'
      }
    ],
    responseSchema: z.object({
      success: z.boolean(),
      message: z.string()
    }),
    implementation: async (req: Request, res: Response) => {
      const id = Number(req.params.id);
      
      if (isNaN(id)) {
        throw new APIError('ID inválido', 400);
      }
      
      // Para soft delete, verificar se o item existe e não foi deletado
      const whereClause = [eq(table.id, id)];
      if (tableDef.softDelete) {
        whereClause.push(eq(table.deletedAt, null));
      }
      
      // Verificar se o registro existe
      const existingRecord = await db.select({ id: table.id }).from(table)
        .where(and(...whereClause))
        .limit(1);
      
      if (existingRecord.length === 0) {
        throw new APIError('Registro não encontrado', 404);
      }
      
      // Se for soft delete, apenas atualizar o campo deletedAt
      if (tableDef.softDelete) {
        await db.update(table)
          .set({ deletedAt: new Date() })
          .where(eq(table.id, id));
      } else {
        // Se não for soft delete, remover o registro completamente
        await db.delete(table).where(eq(table.id, id));
      }
      
      res.json({
        success: true,
        message: `Registro de ${tableDef.name} removido com sucesso`
      });
    }
  };
  
  // Adicionar todos os endpoints ao cache
  apiCache.endpoints.push(
    listEndpoint,
    getByIdEndpoint,
    createEndpoint,
    updateEndpoint,
    deleteEndpoint
  );
}

// Função auxiliar para contagem
function count(): SQL<number> {
  return sql`count(*)`;
}

// Função auxiliar para expressões SQL cruas
function sql(strings: TemplateStringsArray, ...values: any[]): SQL<unknown> {
  return { strings, values } as any;
}

/**
 * Obtém informações sobre tabelas e endpoints gerados
 */
export function getGeneratedAPIInfo() {
  return {
    tables: Array.from(apiCache.tables.keys()),
    endpoints: apiCache.endpoints.map(e => ({
      method: e.method,
      path: e.path,
      description: e.description,
      parameters: e.parameters
    }))
  };
}

/**
 * Cria uma definição de tabela e API para um formulário
 */
export async function createFormTableDefinition(formConfig: {
  formName: string;
  fields: Array<{
    name: string;
    label: string;
    type: string;
    required?: boolean;
    validation?: any;
  }>;
}) {
  const tableName = formConfig.formName.toLowerCase().replace(/\s+/g, '_');
  
  // Converter definições de campo para definições de coluna
  const columns: ColumnDefinition[] = formConfig.fields.map(field => {
    // Mapear tipos de input para tipos de coluna
    const columnType = mapInputTypeToColumnType(field.type);
    
    return {
      name: field.name.toLowerCase().replace(/\s+/g, '_'),
      type: columnType,
      description: field.label,
      required: field.required || false,
      validation: field.validation
    };
  });
  
  // Criar a definição da tabela
  const tableDefinition: TableDefinition = {
    name: formConfig.formName,
    description: `Tabela gerada automaticamente para o formulário ${formConfig.formName}`,
    tableName,
    columns,
    apiEndpoints: true, // Gerar APIs CRUD padrão
    timestamps: true,
    softDelete: true
  };
  
  // Gerar a tabela e as APIs
  await generateTableDefinition(tableDefinition);
  
  return {
    tableName,
    apiBasePath: `/${tableName}`
  };
}

/**
 * Mapeia tipos de input para tipos de coluna no banco de dados
 */
function mapInputTypeToColumnType(inputType: string): 'string' | 'integer' | 'number' | 'boolean' | 'json' | 'date' | 'reference' {
  const typeMap: Record<string, 'string' | 'integer' | 'number' | 'boolean' | 'json' | 'date' | 'reference'> = {
    'text': 'string',
    'email': 'string',
    'password': 'string',
    'tel': 'string',
    'textarea': 'string',
    'number': 'number',
    'integer': 'integer',
    'checkbox': 'boolean',
    'switch': 'boolean',
    'toggle': 'boolean',
    'date': 'date',
    'datetime': 'date',
    'time': 'string',
    'select': 'string',
    'multiselect': 'json',
    'radio': 'string',
    'file': 'string', // Caminho do arquivo
    'image': 'string', // URL ou caminho da imagem
    'color': 'string',
    'url': 'string',
    'range': 'number',
    'rating': 'integer',
    'json': 'json',
    'reference': 'reference',
    'relation': 'reference'
  };
  
  return typeMap[inputType] || 'string';
}
