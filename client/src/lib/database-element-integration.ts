import { Element, ElementTypes } from './element-types';
import { DatabaseField, DatabaseTable, DatabaseSchema, getOrCreateSchema, updateSchemaFromElements } from './database-config';
import { apiRequest } from './queryClient';
import { toast } from '@/hooks/use-toast';

/**
 * Módulo de Integração de Elementos com Banco de Dados
 * 
 * Este módulo provê funcionalidades para conectar elementos visuais
 * do editor com o banco de dados e operações de API automaticamente geradas.
 * 
 * - Integra o editor com o gerenciador de banco de dados
 * - Provê métodos para recuperar e salvar dados
 * - Gerencia atualizações automáticas entre elementos e entidades do banco
 */

// Status de operações assíncronas de banco de dados
export interface DatabaseOperationStatus {
  loading: boolean;
  error: string | null;
  lastUpdated?: Date;
}

// Armazena o estado das operações por elemento
const operationStatusMap = new Map<string, DatabaseOperationStatus>();

// Inicializa o status para um elemento
export function initializeElementDatabaseStatus(elementId: string): void {
  if (!operationStatusMap.has(elementId)) {
    operationStatusMap.set(elementId, {
      loading: false,
      error: null
    });
  }
}

// Obtém o status atual de operações de banco de dados para um elemento
export function getElementDatabaseStatus(elementId: string): DatabaseOperationStatus {
  if (!operationStatusMap.has(elementId)) {
    initializeElementDatabaseStatus(elementId);
  }
  
  return operationStatusMap.get(elementId)!;
}

// Funções para atualizar o status das operações
function setLoadingStatus(elementId: string, loading: boolean): void {
  const status = getElementDatabaseStatus(elementId);
  operationStatusMap.set(elementId, { ...status, loading });
}

function setErrorStatus(elementId: string, error: string | null): void {
  const status = getElementDatabaseStatus(elementId);
  operationStatusMap.set(elementId, { ...status, error, lastUpdated: new Date() });
}

// Cache de dados por elemento e fonte de dados
const dataCache = new Map<string, any>();

// Gera uma chave para o cache de dados
function generateCacheKey(elementId: string, dataSource: string, filters?: any): string {
  const filtersStr = filters ? JSON.stringify(filters) : '';
  return `${elementId}:${dataSource}${filtersStr}`;
}

/**
 * Busca dados para um elemento baseado em sua configuração de conexão
 */
export async function fetchDataForElement(element: Element): Promise<any> {
  if (!element.dataConnection?.configured || !element.dataConnection.dataSource) {
    return null;
  }
  
  const { dataSource, operation, filters } = element.dataConnection;
  const cacheKey = generateCacheKey(element.id, dataSource, filters);
  
  // Verificar cache
  if (dataCache.has(cacheKey)) {
    return dataCache.get(cacheKey);
  }
  
  setLoadingStatus(element.id, true);
  setErrorStatus(element.id, null);
  
  try {
    const endpoint = `/api/${dataSource}`;
    
    // Construir parâmetros com base nos filtros
    const queryParams: Record<string, string> = {};
    
    // Adicionar filtros como parâmetros de consulta
    if (filters && filters.length > 0) {
      filters.forEach((filter: any, index: number) => {
        if (filter.field && filter.value) {
          queryParams[`filter_${index}_field`] = filter.field;
          queryParams[`filter_${index}_operator`] = filter.operator || 'eq';
          queryParams[`filter_${index}_value`] = filter.value;
        }
      });
    }
    
    // Adicionar outros parâmetros com base na operação
    if (operation === 'search' && element.dataConnection.customQuery) {
      queryParams.q = element.dataConnection.customQuery;
    }
    
    // Realizar a solicitação à API
    const url = new URL(endpoint, window.location.origin);
    
    // Adicionar parâmetros de consulta
    Object.keys(queryParams).forEach(key => {
      url.searchParams.append(key, queryParams[key]);
    });
    
    const response = await apiRequest('GET', url.toString());
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Erro ao buscar dados');
    }
    
    const data = await response.json();
    
    // Armazenar no cache
    dataCache.set(cacheKey, data);
    
    setLoadingStatus(element.id, false);
    
    return data;
  } catch (error) {
    console.error('Erro ao buscar dados para o elemento:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    setErrorStatus(element.id, errorMessage);
    setLoadingStatus(element.id, false);
    throw error;
  }
}

/**
 * Envia dados de um formulário para a API correspondente
 */
export async function submitFormData(formElement: Element, formData: any): Promise<any> {
  if (!formElement.dataConnection?.configured || !formElement.dataConnection.dataSource) {
    throw new Error('Formulário não configurado para envio de dados');
  }
  
  const { dataSource, operation } = formElement.dataConnection;
  setLoadingStatus(formElement.id, true);
  setErrorStatus(formElement.id, null);
  
  try {
    const endpoint = `/api/${dataSource}`;
    const method = operation === 'update' ? 'PUT' : 'POST';
    
    // Se for uma operação de atualização, verificar se há ID nos dados
    let url = endpoint;
    if (operation === 'update' && formData.id) {
      url = `${endpoint}/${formData.id}`;
    }
    
    const response = await apiRequest(method, url, formData);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage = errorData?.error || errorData?.message || `Erro ao ${operation === 'create' ? 'criar' : 'atualizar'} registro`;
      throw new Error(errorMessage);
    }
    
    const responseData = await response.json();
    
    // Limpar cache relacionado
    clearCacheForDataSource(dataSource);
    
    setLoadingStatus(formElement.id, false);
    
    // Mostrar mensagem de sucesso
    toast({
      title: 'Sucesso',
      description: `Dados ${operation === 'create' ? 'criados' : 'atualizados'} com sucesso.`,
      variant: 'success'
    });
    
    return responseData;
  } catch (error) {
    console.error('Erro ao enviar dados do formulário:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    setErrorStatus(formElement.id, errorMessage);
    setLoadingStatus(formElement.id, false);
    
    // Mostrar erro ao usuário
    toast({
      title: 'Erro',
      description: errorMessage,
      variant: 'destructive'
    });
    
    throw error;
  }
}

/**
 * Exclui um registro do banco de dados
 */
export async function deleteRecord(dataSource: string, recordId: string | number): Promise<void> {
  try {
    const endpoint = `/api/${dataSource}/${recordId}`;
    const response = await apiRequest('DELETE', endpoint);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage = errorData?.error || errorData?.message || 'Erro ao excluir registro';
      throw new Error(errorMessage);
    }
    
    // Limpar cache relacionado
    clearCacheForDataSource(dataSource);
    
    // Mostrar mensagem de sucesso
    toast({
      title: 'Sucesso',
      description: 'Registro excluído com sucesso.',
      variant: 'success'
    });
  } catch (error) {
    console.error('Erro ao excluir registro:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    
    // Mostrar erro ao usuário
    toast({
      title: 'Erro',
      description: errorMessage,
      variant: 'destructive'
    });
    
    throw error;
  }
}

/**
 * Limpa o cache para uma fonte de dados específica
 */
function clearCacheForDataSource(dataSource: string): void {
  // Remover todas as entradas do cache que correspondam à fonte de dados
  const keysToRemove: string[] = [];
  
  dataCache.forEach((_, key) => {
    if (key.includes(`:${dataSource}`)) {
      keysToRemove.push(key);
    }
  });
  
  keysToRemove.forEach(key => dataCache.delete(key));
}

/**
 * Gera automaticamente um formulário baseado em uma fonte de dados
 */
export function generateFormFieldsFromDataSource(dataSource: string, projectId: string): DatabaseField[] {
  const schema = getOrCreateSchema(projectId);
  const tableSlug = dataSource.toLowerCase().replace(/\s+/g, '_');
  
  // Buscar tabela correspondente
  const table = schema.tables.find(t => t.slug === tableSlug);
  
  if (!table || !table.fields || table.fields.length === 0) {
    // Criar campos padrão se a tabela não existir
    return [
      { name: 'name', label: 'Nome', type: 'string', required: true },
      { name: 'email', label: 'Email', type: 'string', required: true },
      { name: 'message', label: 'Mensagem', type: 'string' }
    ];
  }
  
  return table.fields;
}

/**
 * Atualiza a definição da tabela a partir de um elemento de formulário
 */
export function updateTableDefinitionFromFormElement(element: Element, projectId: string): void {
  // Garantir que é um formulário configurado
  if (element.type !== ElementTypes.form || !element.dataConnection?.configured) {
    return;
  }
  
  const schema = getOrCreateSchema(projectId);
  
  // Executar a atualização com esse elemento específico
  updateSchemaFromElements(projectId, [element]);
  
  // Dados atualizados no schema - não é necessário retornar
}

/**
 * Busca todas as fontes de dados disponíveis e seus campos
 */
export function getAvailableDataSources(projectId: string): { name: string; fields: string[] }[] {
  const schema = getOrCreateSchema(projectId);
  
  return schema.tables.map(table => ({
    name: table.name,
    fields: table.fields.map(field => field.name)
  }));
}

/**
 * Integra elementos com a API do banco de dados para operações CRUD
 */

// Define a configuração de conexão de dados para um elemento selecionado
export function configureElementDatabaseConnection(
  element: Element,
  config: {
    dataSource: string;
    operation: string;
    fields?: string[];
    filters?: Array<{field: string; operator: string; value: string}>;
    customQuery?: string;
  }
): Element {
  const updatedElement = {...element};
  
  updatedElement.dataConnection = {
    configured: true,
    ...config
  };
  
  return updatedElement;
}

// Verifica se um componente de formulário tem uma API correspondente e atualiza automaticamente o backend
export async function ensureFormHasAPI(formElement: Element, projectId: string): Promise<boolean> {
  try {
    // Verificar se o elemento é um formulário
    if (formElement.type !== ElementTypes.form) {
      return false;
    }
    
    // Garantir que o formulário tenha uma fonte de dados configurada
    if (!formElement.dataConnection?.configured || !formElement.dataConnection.dataSource) {
      // Atribuir nome padrão baseado no nome do elemento ou ID
      const formName = formElement.name || `Formulário ${formElement.id}`;
      const dataSource = formName.toLowerCase().replace(/\s+/g, '_');
      
      // Configurar conexão padrão
      formElement.dataConnection = {
        configured: true,
        dataSource,
        operation: 'create',
        fields: [] // Serão detectadas a partir dos elementos filhos
      };
    }
    
    // Atualizar o schema do banco de dados
    updateTableDefinitionFromFormElement(formElement, projectId);
    
    // Verificar se há um endpoint de API correspondente
    try {
      const response = await apiRequest('GET', `/api/${formElement.dataConnection.dataSource}`);
      return response.ok;
    } catch (error) {
      console.error('API ainda não disponível:', error);
      // Retornar true mesmo com erro, pois o backend pode criar a API depois
      return true;
    }
  } catch (error) {
    console.error('Erro ao configurar API para formulário:', error);
    return false;
  }
}

// Extrai dados de elemento de formulário para um objeto
export function extractFormData(formElement: Element, allElements: Element[]): Record<string, any> {
  const formData: Record<string, any> = {};
  
  if (!formElement.children || formElement.children.length === 0) {
    return formData;
  }
  
  // Mapear IDs dos filhos para elementos reais
  const childElements = formElement.children
    .map(childId => allElements.find(el => el.id === childId))
    .filter(el => el !== undefined) as Element[];
  
  // Processar cada elemento filho do formulário
  for (const childEl of childElements) {
    // Ignorar elementos sem atributo name
    if (!childEl.htmlAttributes?.name) {
      continue;
    }
    
    const fieldName = childEl.htmlAttributes.name;
    let fieldValue = childEl.htmlAttributes?.value || '';
    
    // Processar valor baseado no tipo do elemento
    switch (childEl.type) {
      case ElementTypes.checkbox:
        fieldValue = childEl.htmlAttributes?.checked === 'true' || childEl.htmlAttributes?.checked === true;
        break;
        
      case ElementTypes.select:
        // Já deve ter value definido
        break;
        
      case ElementTypes.input:
        // Converter valores numéricos para numbers
        if (childEl.htmlAttributes?.type === 'number') {
          fieldValue = Number(fieldValue);
        }
        break;
    }
    
    formData[fieldName] = fieldValue;
  }
  
  return formData;
}

// Preenche elementos de formulário com dados
export function populateFormWithData(formElement: Element, allElements: Element[], data: Record<string, any>): void {
  if (!formElement.children || formElement.children.length === 0) {
    return;
  }
  
  // Mapear IDs dos filhos para elementos reais
  const childElements = formElement.children
    .map(childId => allElements.find(el => el.id === childId))
    .filter(el => el !== undefined) as Element[];
  
  // Processar cada elemento filho do formulário
  for (const childEl of childElements) {
    // Ignorar elementos sem atributo name
    if (!childEl.htmlAttributes?.name) {
      continue;
    }
    
    const fieldName = childEl.htmlAttributes.name;
    
    // Verificar se há dados para este campo
    if (data[fieldName] === undefined) {
      continue;
    }
    
    const fieldValue = data[fieldName];
    
    // Definir valor baseado no tipo do elemento
    switch (childEl.type) {
      case ElementTypes.checkbox:
        childEl.htmlAttributes.checked = Boolean(fieldValue);
        break;
        
      case ElementTypes.select:
      case ElementTypes.input:
        childEl.htmlAttributes.value = String(fieldValue);
        break;
    }
  }
}

/**
 * Retorna uma lista de operações disponíveis para elementos e formulários
 */
export function getAvailableDatabaseOperations(elementType: ElementTypes): Array<{id: string; name: string; description: string}> {
  // Operações para formulários
  if (elementType === ElementTypes.form) {
    return [
      { id: 'create', name: 'Criar registro', description: 'Cria um novo registro no banco de dados quando o formulário é enviado.' },
      { id: 'update', name: 'Atualizar registro', description: 'Atualiza um registro existente com os dados do formulário.' },
      { id: 'read', name: 'Carregar registro', description: 'Carrega dados de um registro existente para o formulário.' },
      { id: 'delete', name: 'Excluir registro', description: 'Permite excluir um registro existente.' },
    ];
  }
  
  // Operações para componentes de visualização (tabelas, cards, etc.)
  return [
    { id: 'get', name: 'Buscar dados', description: 'Obtém dados da base de dados para exibir no elemento.' },
    { id: 'search', name: 'Pesquisar dados', description: 'Busca registros com base em critérios definidos.' },
    { id: 'custom', name: 'Consulta personalizada', description: 'Define uma consulta SQL ou API personalizada.' },
  ];
}

/**
 * Funções para visualização e gerenciamento do banco de dados
 */

// Obtém informações sobre o banco de dados para exibição no editor
export function getDatabaseSchemaVisualData(projectId: string) {
  const schema = getOrCreateSchema(projectId);
  
  return {
    tables: schema.tables.map(table => ({
      name: table.name,
      slug: table.slug,
      fieldCount: table.fields.length,
      hasAPI: table.api?.enabled,
      description: table.description,
      primaryFields: table.fields.slice(0, 3).map(f => f.name)
    })),
    tableCount: schema.tables.length,
    viewCount: schema.views?.length || 0,
    functionCount: schema.functions?.length || 0,
    schemaVersion: schema.version
  };
}

// Obtém detalhes completos de uma tabela específica
export function getTableDetails(projectId: string, tableSlug: string) {
  const schema = getOrCreateSchema(projectId);
  return schema.tables.find(t => t.slug === tableSlug);
}

// Função auxiliar para gerar uma representação visual da estrutura do banco
export function generateERDiagram(projectId: string): string {
  const schema = getOrCreateSchema(projectId);
  
  let diagram = `// Diagrama ER - Projeto ${projectId}\n`;
  diagram += '// Use https://mermaid.live/ para visualizar\n';
  diagram += 'erDiagram\n';
  
  // Adicionar tabelas
  for (const table of schema.tables) {
    diagram += `    ${table.slug} {\n`;
    
    // Adicionar campos
    for (const field of table.fields) {
      const fieldType = field.type.toUpperCase();
      const required = field.required ? 'NOT NULL' : 'NULL';
      diagram += `        ${fieldType} ${field.name} ${required}\n`;
    }
    
    diagram += '    }\n';
  }
  
  // Adicionar relacionamentos
  for (const table of schema.tables) {
    if (table.relationships && table.relationships.length > 0) {
      for (const rel of table.relationships) {
        let notation = '';
        
        switch (rel.type) {
          case 'oneToMany':
            notation = '1--*';
            break;
          case 'manyToOne':
            notation = '*--1';
            break;
          case 'oneToOne':
            notation = '1--1';
            break;
          case 'manyToMany':
            notation = '*--*';
            break;
        }
        
        diagram += `    ${table.slug} ${notation} ${rel.targetTable} : "${rel.type}"\n`;
      }
    }
  }
  
  return diagram;
}
