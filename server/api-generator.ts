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

import { Request, Response } from 'express';
import { db } from '@db';
import { pool } from '@db';
import { z } from 'zod';
import { SQL, eq, and, sql, asc, desc } from 'drizzle-orm';
import { projectApis, projectDatabases } from '@shared/schema';
import { ApiFilter, ApiParameterRule, ApiOperationType, FilterOperator } from '@shared/api-schema-validation';
import { validateTableBelongsToProject, parseProjectTableName } from '@shared/project-database-association';

// Interface para endpoints de API
export interface APIEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  description: string;
  parameters?: APIParameter[];
  responseSchema: any;
  implementation: (req: Request, res: Response) => Promise<void>;
}

// Parâmetros aceitos pelos endpoints
interface APIParameter {
  name: string;
  description: string;
  in: 'path' | 'query' | 'body';
  required: boolean;
  type: string;
  schema?: any;
}

// Definição de tabela para geração de API
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

// Definição de coluna para geração de tabela
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

// Definição de relacionamento entre tabelas
interface RelationshipDefinition {
  type: 'oneToMany' | 'manyToOne' | 'oneToOne' | 'manyToMany';
  sourceColumn: string;
  targetTable: string;
  targetColumn: string;
  joinTable?: string; // Para relacionamentos many-to-many
}

// Cache de APIs para otimizar o desempenho
interface APICache {
  tables: Map<string, any>; // PgTable objetos
  schemas: Map<string, {
    insertSchema: z.ZodSchema<any>;
    selectSchema: z.ZodSchema<any>;
  }>;
  endpoints: APIEndpoint[];
}

// Inicialização do cache de API
const apiCache: APICache = {
  tables: new Map(),
  schemas: new Map(),
  endpoints: []
};

// Funções mapeadoras entre tipos
const typeMappers = {
  sqlToJs: (sqlType: string): string => {
    // Esta função mapeia tipos SQL para tipos JavaScript
    const mappings: Record<string, string> = {
      'INTEGER': 'number',
      'SERIAL': 'number',
      'BIGINT': 'number',
      'NUMERIC': 'number',
      'REAL': 'number',
      'DOUBLE PRECISION': 'number',
      'TEXT': 'string',
      'VARCHAR': 'string',
      'CHAR': 'string',
      'UUID': 'string',
      'BOOLEAN': 'boolean',
      'JSONB': 'object',
      'JSON': 'object',
      'DATE': 'string', // ou Date no frontend
      'TIMESTAMP': 'string', // ou Date no frontend
      'TIME': 'string'
    };
    
    // Normalizando para uppercase e removendo parâmetros
    const normalizedType = sqlType.toUpperCase().split('(')[0].trim();
    return mappings[normalizedType] || 'string'; // default é string
  },
  
  jsToZod: (jsType: string): z.ZodTypeAny => {
    // Esta função mapeia tipos JavaScript para tipos Zod
    const mappings: Record<string, () => z.ZodTypeAny> = {
      'number': () => z.number(),
      'string': () => z.string(),
      'boolean': () => z.boolean(),
      'object': () => z.object({}).passthrough(), // permitindo qualquer objeto
      'array': () => z.array(z.any())
    };
    
    return mappings[jsType] ? mappings[jsType]() : z.any(); // default é any
  }
};

/**
 * Registra todas as APIs geradas no Express
 */
export function registerGeneratedAPIs(app: any, basePath: string = '/api') {
  // Registra todos os endpoints cacheados
  apiCache.endpoints.forEach(endpoint => {
    const method = endpoint.method.toLowerCase();
    const fullPath = `${basePath}${endpoint.path}`;
    
    // Se o método existir no app, registre a rota
    if (app[method]) {
      app[method](fullPath, asyncHandler(endpoint.implementation));
      console.log(`API registrada: ${endpoint.method} ${fullPath}`);
    } else {
      console.error(`Método HTTP '${method}' não suportado ao registrar ${fullPath}`);
    }
  });
}

// Utilitário para transformar handlers assíncronos em handlers Express padrão
function asyncHandler(fn: (req: Request, res: Response) => Promise<void>) {
  return async (req: Request, res: Response) => {
    try {
      await fn(req, res);
    } catch (error) {
      console.error('Erro em API gerada:', error);
      if (error instanceof APIError) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Erro interno no servidor' });
      }
    }
  };
}

// Classe de erro personalizada para APIs geradas
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
  // Essa função seria usada para gerar definições de tabela programaticamente
  // Como estamos usando SQL direto para criar tabelas, não precisamos implementar isso
  // Mas poderia ser útil no futuro para gerar schemas TypeScript a partir das definições
  return null;
}

/**
 * Gera endpoints CRUD padrão para uma tabela
 */
function generateCRUDEndpoints(tableDef: TableDefinition, table: any) {
  const endpoints: APIEndpoint[] = [];
  const { name, tableName, description } = tableDef;
  const { projectId } = parseProjectTableName(tableName);
  
  // Endpoint para listar todos os registros (GET /api/projects/:projectId/:resource)
  const listEndpoint: APIEndpoint = {
    method: 'GET',
    path: `/projects/${projectId}/${name.toLowerCase()}`,
    description: `Lista todos os registros de ${name}`,
    parameters: [
      {
        name: 'page',
        description: 'Página dos resultados (começando em 1)',
        in: 'query',
        required: false,
        type: 'integer'
      },
      {
        name: 'limit',
        description: 'Número de registros por página',
        in: 'query',
        required: false,
        type: 'integer'
      },
      {
        name: 'sortBy',
        description: 'Campo para ordenação',
        in: 'query',
        required: false,
        type: 'string'
      },
      {
        name: 'sortOrder',
        description: 'Direção da ordenação (asc ou desc)',
        in: 'query',
        required: false,
        type: 'string'
      }
    ],
    responseSchema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            description: `Item de ${name}`
          }
        },
        meta: {
          type: 'object',
          properties: {
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'integer' },
                limit: { type: 'integer' },
                total: { type: 'integer' },
                totalPages: { type: 'integer' }
              }
            }
          }
        }
      }
    },
    implementation: async (req: Request, res: Response) => {
      try {
        // Extrai e valida parâmetros da query
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const sortBy = (req.query.sortBy as string) || 'id';
        const sortOrder = (req.query.sortOrder as string || 'asc').toLowerCase();
        
        // Validação para evitar SQL injection em campos de ordenação
        const validColumns = tableDef.columns.map(col => col.name);
        if (!validColumns.includes(sortBy)) {
          throw new APIError(`Campo de ordenação inválido: ${sortBy}`, 400);
        }
        
        // Prepara query SQL segura com parameterização
        const offset = (page - 1) * limit;
        
        // Cria a consulta SQL para os dados
        const dataQuery = sql`
          SELECT * FROM ${sql.identifier(tableName)}
          ORDER BY ${sql.identifier(sortBy)} ${sortOrder === 'desc' ? sql`DESC` : sql`ASC`}
          LIMIT ${limit} OFFSET ${offset}
        `;
        
        // Cria a consulta SQL para contar o total
        const countQuery = sql`SELECT COUNT(*) as total FROM ${sql.identifier(tableName)}`;
        
        // Executa as consultas
        const dataResult = await db.execute(dataQuery);
        const countResult = await db.execute(countQuery);
        
        // Calcula informações de paginação
        const total = parseInt(countResult.rows[0]?.total || '0', 10);
        const totalPages = Math.ceil(total / limit);
        
        // Retorna os resultados formatados
        res.json({
          data: dataResult.rows,
          meta: {
            pagination: {
              page,
              limit,
              total,
              totalPages
            }
          }
        });
      } catch (error) {
        console.error(`Erro ao listar registros de ${tableName}:`, error);
        if (error instanceof APIError) {
          res.status(error.statusCode).json({ error: error.message });
        } else {
          res.status(500).json({ error: 'Erro ao processar a solicitação' });
        }
      }
    }
  };
  
  // Endpoint para buscar um registro pelo ID (GET /api/projects/:projectId/:resource/:id)
  const getByIdEndpoint: APIEndpoint = {
    method: 'GET',
    path: `/projects/${projectId}/${name.toLowerCase()}/:id`,
    description: `Busca um registro de ${name} pelo ID`,
    parameters: [
      {
        name: 'id',
        description: 'ID do registro',
        in: 'path',
        required: true,
        type: 'integer'
      }
    ],
    responseSchema: {
      type: 'object',
      description: `Item de ${name}`
    },
    implementation: async (req: Request, res: Response) => {
      try {
        const id = parseInt(req.params.id);
        
        if (isNaN(id)) {
          throw new APIError('ID inválido', 400);
        }
        
        // Busca o registro pelo ID
        const query = sql`
          SELECT * FROM ${sql.identifier(tableName)}
          WHERE id = ${id}
        `;
        
        const result = await db.execute(query);
        
        if (!result.rows.length) {
          throw new APIError('Registro não encontrado', 404);
        }
        
        res.json(result.rows[0]);
      } catch (error) {
        console.error(`Erro ao buscar registro de ${tableName}:`, error);
        if (error instanceof APIError) {
          res.status(error.statusCode).json({ error: error.message });
        } else {
          res.status(500).json({ error: 'Erro ao processar a solicitação' });
        }
      }
    }
  };
  
  // Endpoint para criar um novo registro (POST /api/projects/:projectId/:resource)
  const createEndpoint: APIEndpoint = {
    method: 'POST',
    path: `/projects/${projectId}/${name.toLowerCase()}`,
    description: `Cria um novo registro de ${name}`,
    parameters: [
      {
        name: 'body',
        description: 'Dados do registro',
        in: 'body',
        required: true,
        type: 'object'
      }
    ],
    responseSchema: {
      type: 'object',
      description: `Item de ${name} criado`
    },
    implementation: async (req: Request, res: Response) => {
      try {
        // Prepara as colunas e valores
        const columnNames: string[] = [];
        const placeholders: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;
        
        // Processa cada campo do corpo da requisição
        for (const [field, value] of Object.entries(req.body)) {
          // Verifica se o campo existe na definição de tabela
          const columnDef = tableDef.columns.find(c => c.name === field);
          if (!columnDef) continue; // Ignora campos que não estão na definição
          
          // Adiciona o campo e o placeholder
          columnNames.push(field);
          placeholders.push(`$${paramIndex}`);
          values.push(value);
          paramIndex++;
        }
        
        // Adiciona campos de timestamp se necessário
        if (tableDef.timestamps) {
          const now = new Date();
          columnNames.push('created_at', 'updated_at');
          placeholders.push(`$${paramIndex}`, `$${paramIndex + 1}`);
          values.push(now, now);
        }
        
        // Cria a query SQL
        const query = `
          INSERT INTO ${tableName} (${columnNames.join(', ')})
          VALUES (${placeholders.join(', ')})
          RETURNING *
        `;
        
        // Executa a query
        const result = await pool.query(query, values);
        
        // Retorna o registro criado
        res.status(201).json(result.rows[0]);
      } catch (error) {
        console.error(`Erro ao criar registro em ${tableName}:`, error);
        if (error instanceof APIError) {
          res.status(error.statusCode).json({ error: error.message });
        } else {
          res.status(500).json({ error: 'Erro ao processar a solicitação' });
        }
      }
    }
  };
  
  // Endpoint para atualizar um registro (PUT /api/projects/:projectId/:resource/:id)
  const updateEndpoint: APIEndpoint = {
    method: 'PUT',
    path: `/projects/${projectId}/${name.toLowerCase()}/:id`,
    description: `Atualiza um registro de ${name}`,
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
        description: 'Dados do registro',
        in: 'body',
        required: true,
        type: 'object'
      }
    ],
    responseSchema: {
      type: 'object',
      description: `Item de ${name} atualizado`
    },
    implementation: async (req: Request, res: Response) => {
      try {
        const id = parseInt(req.params.id);
        
        if (isNaN(id)) {
          throw new APIError('ID inválido', 400);
        }
        
        // Prepara os campos a serem atualizados
        const updates: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;
        
        // Processa cada campo do corpo da requisição
        for (const [field, value] of Object.entries(req.body)) {
          // Verifica se o campo existe na definição de tabela
          const columnDef = tableDef.columns.find(c => c.name === field);
          if (!columnDef) continue; // Ignora campos que não estão na definição
          
          // Adiciona o campo e o placeholder
          updates.push(`${field} = $${paramIndex}`);
          values.push(value);
          paramIndex++;
        }
        
        // Adiciona campo updated_at se necessário
        if (tableDef.timestamps) {
          updates.push(`updated_at = $${paramIndex}`);
          values.push(new Date());
          paramIndex++;
        }
        
        // Adiciona condição WHERE
        values.push(id);
        
        // Cria a query SQL
        const query = `
          UPDATE ${tableName}
          SET ${updates.join(', ')}
          WHERE id = $${paramIndex}
          RETURNING *
        `;
        
        // Executa a query
        const result = await pool.query(query, values);
        
        if (!result.rows.length) {
          throw new APIError('Registro não encontrado', 404);
        }
        
        // Retorna o registro atualizado
        res.json(result.rows[0]);
      } catch (error) {
        console.error(`Erro ao atualizar registro em ${tableName}:`, error);
        if (error instanceof APIError) {
          res.status(error.statusCode).json({ error: error.message });
        } else {
          res.status(500).json({ error: 'Erro ao processar a solicitação' });
        }
      }
    }
  };
  
  // Endpoint para excluir um registro (DELETE /api/projects/:projectId/:resource/:id)
  const deleteEndpoint: APIEndpoint = {
    method: 'DELETE',
    path: `/projects/${projectId}/${name.toLowerCase()}/:id`,
    description: `Remove um registro de ${name}`,
    parameters: [
      {
        name: 'id',
        description: 'ID do registro',
        in: 'path',
        required: true,
        type: 'integer'
      }
    ],
    responseSchema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' }
      }
    },
    implementation: async (req: Request, res: Response) => {
      try {
        const id = parseInt(req.params.id);
        
        if (isNaN(id)) {
          throw new APIError('ID inválido', 400);
        }
        
        // Verifica se é soft delete
        if (tableDef.softDelete) {
          // Soft delete (atualiza o campo deleted_at)
          const query = `
            UPDATE ${tableName}
            SET deleted_at = $1
            WHERE id = $2
            RETURNING id
          `;
          
          const result = await pool.query(query, [new Date(), id]);
          
          if (!result.rows.length) {
            throw new APIError('Registro não encontrado', 404);
          }
          
          res.json({
            success: true,
            message: 'Registro marcado como excluído'
          });
        } else {
          // Hard delete (remove o registro)
          const query = `
            DELETE FROM ${tableName}
            WHERE id = $1
            RETURNING id
          `;
          
          const result = await pool.query(query, [id]);
          
          if (!result.rows.length) {
            throw new APIError('Registro não encontrado', 404);
          }
          
          res.json({
            success: true,
            message: 'Registro excluído com sucesso'
          });
        }
      } catch (error) {
        console.error(`Erro ao excluir registro em ${tableName}:`, error);
        if (error instanceof APIError) {
          res.status(error.statusCode).json({ error: error.message });
        } else {
          res.status(500).json({ error: 'Erro ao processar a solicitação' });
        }
      }
    }
  };
  
  // Adiciona todos os endpoints ao array
  endpoints.push(listEndpoint, getByIdEndpoint, createEndpoint, updateEndpoint, deleteEndpoint);
  
  // Adiciona todos os endpoints ao cache
  apiCache.endpoints.push(...endpoints);
  
  return endpoints;
}

// Helpers para SQL
function count(): SQL<number> {
  return sql`count(*) as count`;
}

// Helper para construir SQL seguro
function sql(strings: TemplateStringsArray, ...values: any[]): SQL<unknown> {
  return null as any; // Placeholder, pois já temos o sql importado do drizzle
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
      description: e.description
    }))
  };
}

/**
 * Cria uma definição de tabela e API para um formulário
 */
export async function createFormTableDefinition(formConfig: {
  name: string;
  description?: string;
  projectId: number;
  fields: Array<{
    name: string;
    type: string;
    label: string;
    required?: boolean;
    placeholder?: string;
    defaultValue?: any;
    options?: Array<{value: string; label: string}>
  }>
}): Promise<TableDefinition> {
  // Gera um nome de tabela baseado no nome do formulário
  const tableName = `p${formConfig.projectId}_form_${formConfig.name.toLowerCase().replace(/\s+/g, '_')}`;
  
  // Cria colunas baseadas nos campos do formulário
  const columns: ColumnDefinition[] = [
    // Coluna ID padrão para todas as tabelas
    {
      name: 'id',
      type: 'integer',
      required: true,
      // Esta será uma coluna SERIAL (autoincrement)
    },
    // Colunas baseadas nos campos do formulário
    ...formConfig.fields.map(field => ({
      name: field.name.toLowerCase().replace(/\s+/g, '_'),
      type: mapInputTypeToColumnType(field.type),
      description: field.label,
      required: !!field.required,
      default: field.defaultValue
    })),
    // Campo para registrar a data de envio do formulário
    {
      name: 'submission_date',
      type: 'date',
      description: 'Data de envio do formulário',
      required: true,
    }
  ];
  
  // Definição completa da tabela
  const tableDefinition: TableDefinition = {
    name: `form_${formConfig.name}`,
    description: formConfig.description || `Tabela para o formulário ${formConfig.name}`,
    tableName,
    columns,
    apiEndpoints: true, // Gerar endpoints CRUD por padrão
    timestamps: true, // Adicionar campos de timestamp
    softDelete: true // Permitir exclusão segura de registros
  };
  
  return tableDefinition;
}

/**
 * Mapeia tipos de input para tipos de coluna no banco de dados
 */
function mapInputTypeToColumnType(inputType: string): 'string' | 'integer' | 'number' | 'boolean' | 'json' | 'date' | 'reference' {
  const typeMap: Record<string, 'string' | 'integer' | 'number' | 'boolean' | 'json' | 'date' | 'reference'> = {
    'text': 'string',
    'textarea': 'string',
    'email': 'string',
    'tel': 'string',
    'url': 'string',
    'password': 'string',
    'number': 'number',
    'decimal': 'number',
    'integer': 'integer',
    'checkbox': 'boolean',
    'switch': 'boolean',
    'toggle': 'boolean',
    'date': 'date',
    'datetime': 'date',
    'time': 'string',
    'file': 'string', // Armazena o caminho do arquivo
    'select': 'string',
    'multiselect': 'json', // Armazena como JSON array
    'radio': 'string',
    'json': 'json',
    'reference': 'reference',
    'color': 'string',
    'range': 'number'
  };
  
  return typeMap[inputType] || 'string';
}

/**
 * Registra APIs dinamicamente para tabelas existentes
 */
export async function registerDynamicAPIs(app: any, basePath: string = '/api') {
  try {
    // Buscar todas as tabelas no registro de metadados que têm API habilitada
    const tablesWithApis = await db.query.projectDatabases.findMany({
      where: eq(projectDatabases.apiEnabled, true),
    });
    
    console.log(`Encontradas ${tablesWithApis.length} tabelas com APIs habilitadas`);
    
    // Para cada tabela, criar endpoints CRUD
    for (const tableInfo of tablesWithApis) {
      try {
        // Buscar informações sobre as colunas da tabela
        const columnQuery = `
          SELECT 
            column_name,
            data_type,
            is_nullable = 'YES' as is_nullable,
            column_default
          FROM information_schema.columns
          WHERE table_name = $1
          ORDER BY ordinal_position
        `;
        
        const columnResult = await pool.query(columnQuery, [tableInfo.tableName]);
        
        // Mapear os resultados para o formato ColumnDefinition
        const columns: ColumnDefinition[] = columnResult.rows.map(col => ({
          name: col.column_name,
          type: mapSqlTypeToColumnType(col.data_type),
          required: !col.is_nullable && !col.column_default,
        }));
        
        // Criar a definição de tabela
        const tableDef: TableDefinition = {
          name: tableInfo.displayName,
          description: tableInfo.description || '',
          tableName: tableInfo.tableName,
          columns,
          timestamps: columns.some(c => c.name === 'created_at' || c.name === 'updated_at'),
          softDelete: columns.some(c => c.name === 'deleted_at'),
        };
        
        // Gerar endpoints CRUD
        const endpoints = generateCRUDEndpoints(tableDef, null);
        
        console.log(`Gerados ${endpoints.length} endpoints para a tabela ${tableInfo.tableName}`);
      } catch (error) {
        console.error(`Erro ao gerar endpoints para tabela ${tableInfo.tableName}:`, error);
      }
    }
    
    // Registrar todas as APIs geradas
    registerGeneratedAPIs(app, basePath);
    
    console.log(`Total de ${apiCache.endpoints.length} endpoints registrados`);
  } catch (error) {
    console.error('Erro ao registrar APIs dinâmicas:', error);
  }
}

// Função auxiliar para mapear tipos SQL para os tipos do nosso sistema
function mapSqlTypeToColumnType(sqlType: string): 'string' | 'integer' | 'number' | 'boolean' | 'json' | 'date' | 'reference' {
  const sqlLower = sqlType.toLowerCase();
  
  if (sqlLower.includes('int')) {
    return 'integer';
  } else if (sqlLower.includes('numeric') || sqlLower.includes('decimal') || sqlLower.includes('real') || sqlLower.includes('double')) {
    return 'number';
  } else if (sqlLower.includes('bool')) {
    return 'boolean';
  } else if (sqlLower.includes('json')) {
    return 'json';
  } else if (sqlLower.includes('date') || sqlLower.includes('time')) {
    return 'date';
  } else {
    return 'string';
  }
}

/**
 * Constrói uma query SQL a partir de filtros de API
 */
export function buildFilteredQuery(
  tableName: string,
  filters: ApiFilter[],
  params: Record<string, any>
): SQL<unknown> {
  // Constrói expressões WHERE para cada filtro
  const filterExpressions: SQL<unknown>[] = [];
  
  for (const filter of filters) {
    const { field, operator, paramName } = filter;
    const paramValue = params[paramName];
    
    // Se o valor do parâmetro não foi fornecido, ignora este filtro
    if (paramValue === undefined) continue;
    
    // Constrói a expressão SQL para cada operador
    switch (operator) {
      case FilterOperator.EQUALS:
        filterExpressions.push(sql`${sql.identifier(field)} = ${paramValue}`);
        break;
      case FilterOperator.NOT_EQUALS:
        filterExpressions.push(sql`${sql.identifier(field)} <> ${paramValue}`);
        break;
      case FilterOperator.GREATER_THAN:
        filterExpressions.push(sql`${sql.identifier(field)} > ${paramValue}`);
        break;
      case FilterOperator.LESS_THAN:
        filterExpressions.push(sql`${sql.identifier(field)} < ${paramValue}`);
        break;
      case FilterOperator.GREATER_THAN_OR_EQUALS:
        filterExpressions.push(sql`${sql.identifier(field)} >= ${paramValue}`);
        break;
      case FilterOperator.LESS_THAN_OR_EQUALS:
        filterExpressions.push(sql`${sql.identifier(field)} <= ${paramValue}`);
        break;
      case FilterOperator.LIKE:
        filterExpressions.push(sql`${sql.identifier(field)} LIKE ${`%${paramValue}%`}`);
        break;
      case FilterOperator.ILIKE:
        filterExpressions.push(sql`${sql.identifier(field)} ILIKE ${`%${paramValue}%`}`);
        break;
      case FilterOperator.IN:
        if (Array.isArray(paramValue)) {
          filterExpressions.push(sql`${sql.identifier(field)} IN ${paramValue}`);
        }
        break;
      case FilterOperator.NOT_IN:
        if (Array.isArray(paramValue)) {
          filterExpressions.push(sql`${sql.identifier(field)} NOT IN ${paramValue}`);
        }
        break;
      case FilterOperator.IS_NULL:
        if (paramValue === true) {
          filterExpressions.push(sql`${sql.identifier(field)} IS NULL`);
        }
        break;
      case FilterOperator.IS_NOT_NULL:
        if (paramValue === true) {
          filterExpressions.push(sql`${sql.identifier(field)} IS NOT NULL`);
        }
        break;
      case FilterOperator.CONTAINS:
        // Para campos JSON ou arrays
        filterExpressions.push(sql`${sql.identifier(field)} @> ${paramValue}`);
        break;
      case FilterOperator.STARTS_WITH:
        filterExpressions.push(sql`${sql.identifier(field)} LIKE ${`${paramValue}%`}`);
        break;
      case FilterOperator.ENDS_WITH:
        filterExpressions.push(sql`${sql.identifier(field)} LIKE ${`%${paramValue}`}`);
        break;
      // Outros casos podem ser adicionados conforme necessário
    }
  }
  
  // Combina todos os filtros com AND
  if (filterExpressions.length === 0) {
    return sql`SELECT * FROM ${sql.identifier(tableName)}`;
  } else if (filterExpressions.length === 1) {
    return sql`SELECT * FROM ${sql.identifier(tableName)} WHERE ${filterExpressions[0]}`;
  } else {
    return sql`SELECT * FROM ${sql.identifier(tableName)} WHERE ${sql.join(filterExpressions, sql` AND `)}`;    
  }
}

/**
 * Publica uma tabela existente para a API
 */
export async function publishTableToAPI(tableId: number): Promise<boolean> {
  try {
    // Buscar informações da tabela
    const tableInfo = await db.query.projectDatabases.findFirst({
      where: eq(projectDatabases.id, tableId),
    });
    
    if (!tableInfo) {
      throw new Error(`Tabela com ID ${tableId} não encontrada`);
    }
    
    // Atualizar o registro para habilitar a API
    await db.update(projectDatabases)
      .set({ apiEnabled: true, updatedAt: new Date() })
      .where(eq(projectDatabases.id, tableId));
    
    // Registrar endpoints na tabela de metadados de API
    const apiMethods = ["GET", "POST", "PUT", "DELETE"];
    const { projectId, tableName, displayName } = tableInfo;
    
    // Extrair o ID e nome base da tabela
    const { projectId: extractedId, baseName } = parseProjectTableName(tableName);
    
    // Criar uma entrada para cada método
    for (const method of apiMethods) {
      const apiMetadata = {
        projectId,
        tableId,
        apiPath: `/api/projects/${projectId}/${displayName.toLowerCase()}`,
        method,
        description: `API ${method} para tabela ${displayName}`,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await db.insert(projectApis).values(apiMetadata).returning();
    }
    
    console.log(`API para tabela ${tableName} registrada com sucesso`);
    return true;
  } catch (error) {
    console.error(`Erro ao publicar tabela para API:`, error);
    return false;
  }
}

/**
 * Despublica uma tabela da API
 */
export async function unpublishTableFromAPI(tableId: number): Promise<boolean> {
  try {
    // Buscar informações da tabela
    const tableInfo = await db.query.projectDatabases.findFirst({
      where: eq(projectDatabases.id, tableId),
    });
    
    if (!tableInfo) {
      throw new Error(`Tabela com ID ${tableId} não encontrada`);
    }
    
    // Atualizar o registro para desabilitar a API
    await db.update(projectDatabases)
      .set({ apiEnabled: false, updatedAt: new Date() })
      .where(eq(projectDatabases.id, tableId));
    
    // Remover endpoints da tabela de metadados de API
    await db.delete(projectApis)
      .where(eq(projectApis.tableId, tableId));
    
    console.log(`API para tabela ${tableInfo.tableName} despublicada com sucesso`);
    return true;
  } catch (error) {
    console.error(`Erro ao despublicar tabela da API:`, error);
    return false;
  }
}
