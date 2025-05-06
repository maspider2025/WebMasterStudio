import { Element, ElementTypes } from './element-types';

/**
 * Módulo de Configuração de Banco de Dados
 * 
 * Este módulo gerencia o mapeamento entre elementos visuais
 * e suas correspondências no banco de dados e APIs.
 * 
 * Funcionalidades:
 * - Mapeamento de elementos para estruturas de banco
 * - Geração automática de campos baseado em conteúdo do elemento
 * - Integração com gerador de API
 */

export interface DatabaseField {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  defaultValue?: any;
  options?: Array<{ value: string; label: string }>;
  validation?: {
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: string;
    custom?: string; // Expressão de validação personalizada
  };
  width?: string; // 'full', 'half', 'third', etc.
  placeholder?: string;
  helpText?: string;
  isHidden?: boolean;
  isReadOnly?: boolean;
  group?: string;
  order?: number;
  relationOptions?: {
    foreignTable: string;
    displayField: string;
    valueField: string;
    filterCondition?: string;
    sortField?: string;
    sortOrder?: 'asc' | 'desc';
  };
}

export interface DatabaseTable {
  name: string;
  slug: string; // Versão normalizada do nome para URLs e banco de dados
  description?: string;
  fields: DatabaseField[];
  timestamps?: boolean; // Adiciona created_at e updated_at
  softDelete?: boolean; // Adiciona deleted_at para exclusão lógica
  api?: {
    enabled: boolean;
    basePath?: string;
    disabledActions?: Array<'create' | 'read' | 'update' | 'delete' | 'list'>;
    pagination?: {
      defaultLimit: number;
      maxLimit: number;
    };
    auth?: {
      required: boolean;
      roles?: string[];
    };
  };
  relationships?: Array<{
    type: 'oneToMany' | 'manyToOne' | 'oneToOne' | 'manyToMany';
    table: string;
    localField: string;
    foreignField: string;
    joinTable?: string; // Para relações many-to-many
  }>;
  triggers?: Array<{
    event: 'beforeCreate' | 'afterCreate' | 'beforeUpdate' | 'afterUpdate' | 'beforeDelete' | 'afterDelete';
    action: string; // Código JavaScript para executar
  }>;
  indexes?: Array<{
    fields: string[];
    type?: 'unique' | 'index';
    name?: string;
  }>;
  sqlDDL?: string; // DDL SQL personalizado se necessário
}

export interface DatabaseSchema {
  projectId: string;
  tables: DatabaseTable[];
  views?: Array<{
    name: string;
    description?: string;
    sql: string;
    api?: boolean;
  }>;
  functions?: Array<{
    name: string;
    description?: string;
    parameters: Array<{
      name: string;
      type: string;
    }>;
    returns: string;
    definition: string;
    api?: boolean;
  }>;
  version: number;
  createdAt: string;
  updatedAt: string;
}

// Cache de esquemas por projeto
const schemaCache = new Map<string, DatabaseSchema>();

/**
 * Obtém ou cria um esquema para o projeto atual
 */
export function getOrCreateSchema(projectId: string): DatabaseSchema {
  if (schemaCache.has(projectId)) {
    return schemaCache.get(projectId)!;
  }
  
  const newSchema: DatabaseSchema = {
    projectId,
    tables: [],
    views: [],
    functions: [],
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  schemaCache.set(projectId, newSchema);
  return newSchema;
}

/**
 * Atualiza o esquema do banco de dados com base nos elementos do editor
 */
export function updateSchemaFromElements(projectId: string, elements: Element[]): DatabaseSchema {
  const schema = getOrCreateSchema(projectId);
  
  // Coletar todas as tabelas e campos dos elementos
  collectTablesFromElements(schema, elements);
  
  // Atualizar timestamp
  schema.updatedAt = new Date().toISOString();
  
  return schema;
}

/**
 * Coleta informações de tabelas a partir de elementos
 */
function collectTablesFromElements(schema: DatabaseSchema, elements: Element[]) {
  // Primeiro, procurar elementos de formulário
  const formElements = elements.filter(el => el.type === ElementTypes.form);
  
  for (const formElement of formElements) {
    processFormElement(schema, formElement, elements);
  }
  
  // Em seguida, coletar outros elementos que podem ter conexão com dados
  const dataElements = elements.filter(el => 
    el.dataConnection?.configured && 
    el.type !== ElementTypes.form
  );
  
  for (const dataElement of dataElements) {
    processDataElement(schema, dataElement);
  }
}

/**
 * Processa um elemento de formulário para extrair definições de tabela
 */
function processFormElement(schema: DatabaseSchema, formElement: Element, allElements: Element[]) {
  // Se o formulário não tem nome, usar um padrão
  const formName = formElement.name || `form_${formElement.id}`;
  
  // Normalizar o nome para usar como slug
  const tableSlug = normalizeNameForDatabase(formName);
  
  // Verificar se já existe uma tabela com este slug
  let table = schema.tables.find(t => t.slug === tableSlug);
  
  if (!table) {
    // Criar nova tabela
    table = {
      name: formName,
      slug: tableSlug,
      description: `Tabela gerada automaticamente para o formulário ${formName}`,
      fields: [],
      timestamps: true,
      softDelete: true,
      api: {
        enabled: true,
        basePath: `/${tableSlug}`
      }
    };
    schema.tables.push(table);
  }
  
  // Encontrar todos os elementos filhos do formulário que podem ser campos
  if (formElement.children && formElement.children.length > 0) {
    // Mapear os IDs dos filhos para elementos reais
    const childElements = formElement.children
      .map(childId => allElements.find(el => el.id === childId))
      .filter(el => el !== undefined) as Element[];
    
    // Processar cada elemento filho
    for (const childEl of childElements) {
      processFormFieldElement(table, childEl);
    }
  }
  
  // Se o formulário tem conexão de dados explicitamente configurada
  if (formElement.dataConnection?.configured) {
    // Sobrescrever nome e outras configurações se definidas
    if (formElement.dataConnection.dataSource) {
      table.name = formElement.dataConnection.dataSource;
      table.slug = normalizeNameForDatabase(formElement.dataConnection.dataSource);
    }
    
    // Configurar campos selecionados explicitamente, se houver
    if (formElement.dataConnection.fields && formElement.dataConnection.fields.length > 0) {
      // Garantir que os campos explicitamente selecionados estejam presentes
      for (const fieldName of formElement.dataConnection.fields) {
        if (!table.fields.some(f => f.name === fieldName)) {
          table.fields.push({
            name: fieldName,
            label: formatFieldLabel(fieldName),
            type: 'string'
          });
        }
      }
    }
  }
}

/**
 * Processa um elemento de campo de formulário para extrair definição de campo
 */
function processFormFieldElement(table: DatabaseTable, element: Element) {
  // Determinar tipo de campo com base no tipo do elemento
  let fieldType = 'string';
  
  switch (element.type) {
    case ElementTypes.input:
      // Verificar se há atributos HTML que especificam o tipo
      if (element.htmlAttributes?.type) {
        const inputType = element.htmlAttributes.type;
        fieldType = mapHtmlInputTypeToFieldType(inputType);
      }
      break;
      
    case ElementTypes.checkbox:
      fieldType = 'boolean';
      break;
      
    case ElementTypes.select:
      fieldType = 'string'; // Ou poderia ser 'enum' com opções
      break;
      
    // Outros tipos...
    default:
      fieldType = 'string';
  }
  
  // Nome do campo - usar o atributo name se existir, ou ID
  const fieldName = element.htmlAttributes?.name || normalizeNameForDatabase(element.name || element.id);
  
  // Label do campo - usar o conteúdo ou nome
  const fieldLabel = element.content || formatFieldLabel(fieldName);
  
  // Verificar se este campo já existe na tabela
  const existingField = table.fields.find(f => f.name === fieldName);
  
  if (existingField) {
    // Atualizar campo existente com novas informações
    existingField.label = fieldLabel;
    existingField.type = fieldType;
    
    // Atualizar validação e outras propriedades se presentes
    if (element.htmlAttributes?.required) {
      existingField.required = true;
    }
    
    if (element.htmlAttributes?.placeholder) {
      existingField.placeholder = element.htmlAttributes.placeholder;
    }
    
    // Outras propriedades de validação...
  } else {
    // Criar um novo campo
    const newField: DatabaseField = {
      name: fieldName,
      label: fieldLabel,
      type: fieldType,
      required: element.htmlAttributes?.required === 'true' || element.htmlAttributes?.required === true,
      placeholder: element.htmlAttributes?.placeholder,
      helpText: element.htmlAttributes?.title,
      defaultValue: element.htmlAttributes?.value
    };
    
    // Configurar validação com base em atributos HTML
    const validation: DatabaseField['validation'] = {};
    
    if (element.htmlAttributes?.minlength) {
      validation.minLength = parseInt(element.htmlAttributes.minlength, 10);
    }
    
    if (element.htmlAttributes?.maxlength) {
      validation.maxLength = parseInt(element.htmlAttributes.maxlength, 10);
    }
    
    if (element.htmlAttributes?.min) {
      validation.min = parseFloat(element.htmlAttributes.min);
    }
    
    if (element.htmlAttributes?.max) {
      validation.max = parseFloat(element.htmlAttributes.max);
    }
    
    if (element.htmlAttributes?.pattern) {
      validation.pattern = element.htmlAttributes.pattern;
    }
    
    // Adicionar validação se houver alguma regra
    if (Object.keys(validation).length > 0) {
      newField.validation = validation;
    }
    
    // Para elementos select, extrair opções se disponíveis no conteúdo HTML
    if (element.type === ElementTypes.select && element.content) {
      try {
        // Tentar extrair opções do HTML usando regex simples
        const optionMatches = element.content.match(/<option[^>]*value=["'](.*?)["'][^>]*>(.*?)<\/option>/g);
        
        if (optionMatches && optionMatches.length > 0) {
          const options: Array<{ value: string; label: string }> = [];
          
          for (const optionMatch of optionMatches) {
            const valueMatch = optionMatch.match(/value=["'](.*?)["']/i);
            const labelMatch = optionMatch.match(/>(.*?)<\/option>/i);
            
            if (valueMatch && valueMatch[1] && labelMatch && labelMatch[1]) {
              options.push({
                value: valueMatch[1],
                label: labelMatch[1].trim()
              });
            }
          }
          
          if (options.length > 0) {
            newField.options = options;
          }
        }
      } catch (e) {
        console.error('Erro ao analisar opções do select:', e);
      }
    }
    
    // Adicionar o novo campo à tabela
    table.fields.push(newField);
  }
}

/**
 * Processa um elemento com conexão de dados que não é um formulário
 */
function processDataElement(schema: DatabaseSchema, element: Element) {
  if (!element.dataConnection?.configured || !element.dataConnection.dataSource) {
    return;
  }
  
  const dataSource = element.dataConnection.dataSource;
  const tableSlug = normalizeNameForDatabase(dataSource);
  
  // Verificar se já existe uma tabela com este nome
  let table = schema.tables.find(t => t.slug === tableSlug);
  
  if (!table) {
    // Criar nova tabela
    table = {
      name: dataSource,
      slug: tableSlug,
      description: `Tabela criada a partir da fonte de dados ${dataSource}`,
      fields: [],
      timestamps: true,
      softDelete: true,
      api: {
        enabled: true,
        basePath: `/${tableSlug}`
      }
    };
    schema.tables.push(table);
  }
  
  // Adicionar campos especificados na conexão
  if (element.dataConnection.fields && element.dataConnection.fields.length > 0) {
    for (const fieldName of element.dataConnection.fields) {
      // Verificar se o campo já existe
      if (!table.fields.some(f => f.name === fieldName)) {
        table.fields.push({
          name: fieldName,
          label: formatFieldLabel(fieldName),
          type: 'string' // Tipo padrão, pois não temos informação mais específica
        });
      }
    }
  }
  
  // Adicionar filtros como índices potenciais
  if (element.dataConnection.filters && element.dataConnection.filters.length > 0) {
    table.indexes = table.indexes || [];
    
    for (const filter of element.dataConnection.filters) {
      // Verificar se o campo do filtro existe
      let field = table.fields.find(f => f.name === filter.field);
      
      if (!field) {
        // Criar o campo se não existir
        field = {
          name: filter.field,
          label: formatFieldLabel(filter.field),
          type: guessFieldTypeFromOperator(filter.operator)
        };
        table.fields.push(field);
      }
      
      // Verificar se já existe um índice para este campo
      if (!table.indexes.some(idx => idx.fields.includes(filter.field))) {
        table.indexes.push({
          fields: [filter.field],
          name: `idx_${tableSlug}_${filter.field}`
        });
      }
    }
  }
}

/**
 * Funções auxiliares
 */

// Normaliza um nome para uso em banco de dados
function normalizeNameForDatabase(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '_') // Espaços para _
    .replace(/[^a-z0-9_]/g, '') // Remover caracteres não alfanuméricos
    .replace(/^[0-9]/, 'n$&') // Se começar com número, adicionar 'n' na frente
    .substring(0, 63); // Limitar a 63 caracteres (limite PostgreSQL)
}

// Formata um nome de campo para um label legível
function formatFieldLabel(name: string): string {
  return name
    .replace(/_/g, ' ') // Sublinhas para espaços
    .replace(/([a-z])([A-Z])/g, '$1 $2') // camelCase para palavras separadas
    .replace(/^./, match => match.toUpperCase()) // Primeira letra maiúscula
    .trim();
}

// Mapeia tipos de input HTML para tipos de campo
function mapHtmlInputTypeToFieldType(htmlType: string): string {
  const typeMap: Record<string, string> = {
    'text': 'string',
    'email': 'string',
    'password': 'string',
    'tel': 'string',
    'url': 'string',
    'search': 'string',
    'number': 'number',
    'range': 'number',
    'date': 'date',
    'datetime-local': 'date',
    'time': 'string',
    'month': 'string',
    'week': 'string',
    'color': 'string',
    'checkbox': 'boolean',
    'radio': 'string',
    'file': 'string',
    'hidden': 'string'
  };
  
  return typeMap[htmlType] || 'string';
}

// Tenta adivinhar o tipo de campo com base no operador de comparação
function guessFieldTypeFromOperator(operator: string): string {
  const numberOperators = ['>', '<', '>=', '<='];
  const dateOperators = ['before', 'after', 'between'];
  const booleanOperators = ['is', 'is_not'];
  
  if (numberOperators.includes(operator)) {
    return 'number';
  }
  
  if (dateOperators.includes(operator)) {
    return 'date';
  }
  
  if (booleanOperators.includes(operator)) {
    return 'boolean';
  }
  
  return 'string';
}

/**
 * Exporta o esquema como JSON
 */
export function exportDatabaseSchema(projectId: string): string {
  const schema = getOrCreateSchema(projectId);
  return JSON.stringify(schema, null, 2);
}
