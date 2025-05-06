/**
 * API Schema Validation Module
 * 
 * Este módulo fornece funções e tipos para validação avançada de APIs geradas dinamicamente.
 * Ele garante que as APIs criadas pelos usuários sigam padrões de design consistentes
 * enquanto mantêm total flexibilidade e poder para customização.
 */

import { z } from 'zod';
import { SQL } from 'drizzle-orm';

// Tipos de operações suportadas pelas APIs geradas
export enum ApiOperationType {
  LIST = 'list',
  GET_BY_ID = 'getById',
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  CUSTOM_QUERY = 'customQuery',
  BULK_CREATE = 'bulkCreate',
  BULK_UPDATE = 'bulkUpdate',
  BULK_DELETE = 'bulkDelete',
  AGGREGATE = 'aggregate',
  JOIN = 'join'
}

// Tipos de parâmetros que podem ser aceitos nas APIs
export enum ApiParamType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  OBJECT = 'object',
  ARRAY = 'array',
  DATE = 'date',
  UUID = 'uuid',
  ENUM = 'enum',
  JSON = 'json'
}

// Localização de onde o parâmetro é esperado na requisição
export enum ApiParamLocation {
  PATH = 'path',
  QUERY = 'query',
  BODY = 'body',
  HEADER = 'header'
}

// Operadores de filtragem para permitir consultas avançadas
export enum FilterOperator {
  EQUALS = 'equals',
  NOT_EQUALS = 'notEquals',
  GREATER_THAN = 'greaterThan',
  LESS_THAN = 'lessThan',
  GREATER_THAN_OR_EQUALS = 'greaterThanOrEquals',
  LESS_THAN_OR_EQUALS = 'lessThanOrEquals',
  BETWEEN = 'between',
  LIKE = 'like',
  ILIKE = 'ilike',
  IN = 'in',
  NOT_IN = 'notIn',
  IS_NULL = 'isNull',
  IS_NOT_NULL = 'isNotNull',
  CONTAINS = 'contains',
  STARTS_WITH = 'startsWith',
  ENDS_WITH = 'endsWith'
}

// Função de agregação para consultas avançadas
export enum AggregateFunction {
  COUNT = 'count',
  SUM = 'sum',
  AVG = 'avg',
  MIN = 'min',
  MAX = 'max'
}

// Direção da ordenação
export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc'
}

// Interfaces para definição de parâmetros de API
export interface ApiParameter {
  name: string;
  type: ApiParamType;
  location: ApiParamLocation;
  description?: string;
  required: boolean;
  defaultValue?: any;
  validationRules?: ValidationRule[];
  enumValues?: string[];
}

// Regras de validação para parâmetros de API
export interface ValidationRule {
  type: 'min' | 'max' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
  value: any;
  message?: string;
}

// Definição de filtro para consultas avançadas
export interface ApiFilter {
  field: string;
  operator: FilterOperator;
  paramName: string;
}

// Definição de ordenação para consultas
export interface ApiSort {
  field: string;
  direction: SortDirection;
}

// Configuração de paginação para endpoints de listagem
export interface ApiPagination {
  enabled: boolean;
  defaultLimit?: number;
  maxLimit?: number;
}

// Configuração de relacionamentos para consultas JOIN
export interface ApiRelationship {
  targetTable: string;
  sourceColumn: string;
  targetColumn: string;
  type: 'oneToOne' | 'oneToMany' | 'manyToOne' | 'manyToMany';
  alias?: string;
}

// Configuração de autorizações para controle de acesso refinado
export interface ApiAuthorization {
  requireAuthentication: boolean;
  allowedRoles?: string[];
  allowOwnerOnly?: boolean;
  ownerField?: string;
  customValidator?: string; // Nome da função que implementa validação customizada
}

// Configuração de caching para otimização de performance
export interface ApiCache {
  enabled: boolean;
  ttlSeconds?: number;
  invalidationTags?: string[];
}

// Configuração completa de uma operação de API
export interface ApiConfiguration {
  operation: ApiOperationType;
  params: ApiParameter[];
  filters?: ApiFilter[];
  sort?: ApiSort[];
  pagination?: ApiPagination;
  relationships?: ApiRelationship[];
  authorization?: ApiAuthorization;
  cache?: ApiCache;
  customSql?: string; // SQL personalizado para operações CUSTOM_QUERY
  transforms?: ApiTransform[]; // Transformações de dados antes de enviar a resposta
  hooks?: ApiHooks; // Hooks para executar código em pontos específicos
}

// Transformações de dados para pós-processamento
export interface ApiTransform {
  type: 'map' | 'filter' | 'reduce' | 'compute' | 'rename';
  config: any; // Configuração específica para cada tipo de transformação
}

// Hooks para execução de código em pontos específicos
export interface ApiHooks {
  beforeRequest?: string; // Nome da função para executar antes do processamento
  afterRequest?: string; // Nome da função para executar após processamento
  beforeResponse?: string; // Nome da função para executar antes de enviar resposta
  onError?: string; // Nome da função para executar em caso de erro
}

/**
 * Gera schema de validação Zod para parâmetros de API
 * baseado nas definições de configuração
 */
export function generateApiValidationSchema(apiConfig: ApiConfiguration): Record<string, z.ZodSchema> {
  const schemas: Record<string, z.ZodSchema> = {};
  
  // Parâmetros de caminho (path)
  const pathParams = apiConfig.params.filter(p => p.location === ApiParamLocation.PATH);
  if (pathParams.length > 0) {
    const pathSchema = z.object(
      pathParams.reduce((acc, param) => ({
        ...acc,
        [param.name]: createZodSchemaForParam(param)
      }), {})
    );
    schemas.path = pathSchema;
  }
  
  // Parâmetros de query string
  const queryParams = apiConfig.params.filter(p => p.location === ApiParamLocation.QUERY);
  if (queryParams.length > 0) {
    const querySchema = z.object(
      queryParams.reduce((acc, param) => ({
        ...acc,
        [param.name]: createZodSchemaForParam(param)
      }), {})
    );
    schemas.query = querySchema;
  }
  
  // Parâmetros do corpo da requisição
  const bodyParams = apiConfig.params.filter(p => p.location === ApiParamLocation.BODY);
  if (bodyParams.length > 0) {
    // Se houver apenas um parâmetro de body e for do tipo objeto, assume que é o schema inteiro
    if (bodyParams.length === 1 && bodyParams[0].type === ApiParamType.OBJECT) {
      schemas.body = z.any(); // Neste caso, o schema real será fornecido separadamente
    } else {
      const bodySchema = z.object(
        bodyParams.reduce((acc, param) => ({
          ...acc,
          [param.name]: createZodSchemaForParam(param)
        }), {})
      );
      schemas.body = bodySchema;
    }
  }
  
  // Parâmetros de cabeçalho (header)
  const headerParams = apiConfig.params.filter(p => p.location === ApiParamLocation.HEADER);
  if (headerParams.length > 0) {
    const headerSchema = z.object(
      headerParams.reduce((acc, param) => ({
        ...acc,
        [param.name]: createZodSchemaForParam(param)
      }), {})
    );
    schemas.headers = headerSchema;
  }
  
  return schemas;
}

/**
 * Cria um schema Zod apropriado para um parâmetro específico
 * baseado em seu tipo e regras de validação
 */
function createZodSchemaForParam(param: ApiParameter): z.ZodSchema {
  let schema: z.ZodSchema;
  
  // Cria o schema base baseado no tipo do parâmetro
  switch (param.type) {
    case ApiParamType.STRING:
      schema = z.string();
      break;
    case ApiParamType.NUMBER:
      schema = z.number();
      break;
    case ApiParamType.BOOLEAN:
      schema = z.boolean();
      break;
    case ApiParamType.OBJECT:
      schema = z.object({}).passthrough();
      break;
    case ApiParamType.ARRAY:
      schema = z.array(z.any());
      break;
    case ApiParamType.DATE:
      schema = z.string().refine(val => !isNaN(Date.parse(val)), {
        message: 'Invalid date format'
      });
      break;
    case ApiParamType.UUID:
      schema = z.string().uuid();
      break;
    case ApiParamType.ENUM:
      if (param.enumValues && param.enumValues.length > 0) {
        schema = z.enum(param.enumValues as [string, ...string[]]);
      } else {
        schema = z.string();
      }
      break;
    case ApiParamType.JSON:
      schema = z.string().refine(val => {
        try {
          JSON.parse(val);
          return true;
        } catch {
          return false;
        }
      }, { message: 'Invalid JSON string' });
      break;
    default:
      schema = z.any();
  }
  
  // Aplica regras de validação adicionais se existirem
  if (param.validationRules) {
    for (const rule of param.validationRules) {
      switch (rule.type) {
        case 'min':
          if (param.type === ApiParamType.NUMBER) {
            schema = (schema as z.ZodNumber).min(rule.value, rule.message);
          }
          break;
        case 'max':
          if (param.type === ApiParamType.NUMBER) {
            schema = (schema as z.ZodNumber).max(rule.value, rule.message);
          }
          break;
        case 'minLength':
          if (param.type === ApiParamType.STRING) {
            schema = (schema as z.ZodString).min(rule.value, rule.message);
          } else if (param.type === ApiParamType.ARRAY) {
            schema = (schema as z.ZodArray<any>).min(rule.value, rule.message);
          }
          break;
        case 'maxLength':
          if (param.type === ApiParamType.STRING) {
            schema = (schema as z.ZodString).max(rule.value, rule.message);
          } else if (param.type === ApiParamType.ARRAY) {
            schema = (schema as z.ZodArray<any>).max(rule.value, rule.message);
          }
          break;
        case 'pattern':
          if (param.type === ApiParamType.STRING) {
            schema = (schema as z.ZodString).regex(new RegExp(rule.value), rule.message);
          }
          break;
      }
    }
  }
  
  // Aplica validação de 'obrigatório' ou 'opcional' baseado no parâmetro
  if (!param.required) {
    schema = schema.optional();
    if (param.defaultValue !== undefined) {
      schema = schema.default(param.defaultValue);
    }
  }
  
  return schema;
}

/**
 * Gera uma consulta SQL baseada na configuração de API e parâmetros de requisição
 * Esta função é usada para APIs personalizadas e avançadas
 */
export function generateSqlFromApiConfig(
  table: string,
  config: ApiConfiguration,
  params: Record<string, any>,
  req: any
): SQL {
  // A implementação completa desta função seria muito extensa
  // e requer integração profunda com o dialeto SQL específico e ORM
  // Este é apenas um esboço para demonstrar o conceito
  
  // Retorna uma instância fictícia de SQL para compatibilidade com a interface
  return {
    sql: '',
    params: [],
    // @ts-ignore: método de implementação fictício
    getSQL: () => ''
  } as SQL;
}

/**
 * Gera uma estrutura de documentação completa para uma API
 * Esta função é usada para gerar documentação interativa para os usuários
 */
export function generateApiDocumentation(apiConfig: ApiConfiguration): any {
  // Implementação fictícia para demonstrar o conceito
  return {
    operation: apiConfig.operation,
    parameters: apiConfig.params.map(p => ({
      name: p.name,
      type: p.type,
      location: p.location,
      required: p.required,
      description: p.description || ''
    })),
    filters: apiConfig.filters,
    pagination: apiConfig.pagination,
    relationships: apiConfig.relationships
  };
}
