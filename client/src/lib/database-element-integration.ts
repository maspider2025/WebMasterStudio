import { apiRequest } from './queryClient';
import { useToast } from '@/hooks/use-toast';

/**
 * Conjunto de funções para integração entre elementos do editor visual e banco de dados
 * 
 * Essas funções permitem a comunicação entre elementos visuais (como formulários, listas, tabelas)
 * e fontes de dados no banco de dados, facilitando a criação de aplicações CRUD sem código.
 */

// Cache para armazenar dados de tabelas para evitar chamadas repetidas
interface SchemaCache {
  [projectId: string]: {
    tables: any[];
    fields: { [tableName: string]: any[] };
    timestamp: number;
  };
}

const schemaCache: SchemaCache = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos em milissegundos

/**
 * Busca todas as tabelas disponíveis para um projeto
 */
export async function fetchDatabaseTables(projectId: string): Promise<any[]> {
  try {
    const response = await apiRequest('GET', `/api/database/tables`);
    
    if (!response.ok) {
      throw new Error(`Falha ao buscar tabelas: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.tables || [];
  } catch (error) {
    console.error('Erro ao buscar tabelas do banco de dados:', error);
    return [];
  }
}

/**
 * Busca os campos (colunas) de uma tabela específica
 */
export async function fetchTableFields(projectId: string, tableName: string): Promise<any[]> {
  try {
    const response = await apiRequest('GET', `/api/database/tables/${tableName}/schema`);
    
    if (!response.ok) {
      throw new Error(`Falha ao buscar schema da tabela: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.columns || [];
  } catch (error) {
    console.error(`Erro ao buscar campos da tabela ${tableName}:`, error);
    return [];
  }
}

/**
 * Função sincrona para obter tabelas do cache ou buscar novas (mock para desenvolvimento)
 */
export function getAvailableTables(projectId: string): any[] {
  // Se tiver no cache e estiver válido, retorna do cache
  if (
    schemaCache[projectId] && 
    schemaCache[projectId].tables && 
    (Date.now() - schemaCache[projectId].timestamp) < CACHE_DURATION
  ) {
    return schemaCache[projectId].tables;
  }
  
  // Em um cenário real, isso enviaria uma requisição assíncrona
  // Por enquanto, vamos usar dados mock para desenvolvimento
  const mockTables = [
    { name: 'Produtos', slug: 'products', fieldCount: 12, hasAPI: true },
    { name: 'Categorias', slug: 'categories', fieldCount: 5, hasAPI: true },
    { name: 'Clientes', slug: 'customers', fieldCount: 8, hasAPI: true },
    { name: 'Pedidos', slug: 'orders', fieldCount: 10, hasAPI: true },
    { name: 'Carrinho', slug: 'cart', fieldCount: 5, hasAPI: true },
    { name: 'Usuários', slug: 'users', fieldCount: 7, hasAPI: true },
    { name: 'Comentários', slug: 'comments', fieldCount: 6, hasAPI: true },
    { name: 'Contatos', slug: 'contacts', fieldCount: 9, hasAPI: false },
  ];
  
  // Atualizar o cache
  if (!schemaCache[projectId]) {
    schemaCache[projectId] = { tables: [], fields: {}, timestamp: 0 };
  }
  
  schemaCache[projectId].tables = mockTables;
  schemaCache[projectId].timestamp = Date.now();
  
  return mockTables;
}

/**
 * Função sincrona para obter campos de uma tabela (mock para desenvolvimento)
 */
export function getTableFields(projectId: string, tableName: string): any[] {
  // Se tiver no cache e estiver válido, retorna do cache
  if (
    schemaCache[projectId] && 
    schemaCache[projectId].fields && 
    schemaCache[projectId].fields[tableName] && 
    (Date.now() - schemaCache[projectId].timestamp) < CACHE_DURATION
  ) {
    return schemaCache[projectId].fields[tableName];
  }
  
  // Em um cenário real, isso enviaria uma requisição assíncrona
  // Por enquanto, vamos usar dados mock para desenvolvimento
  const mockFields: {[key: string]: any[]} = {
    'products': [
      { name: 'id', type: 'integer', required: true, isPrimary: true, label: 'ID' },
      { name: 'name', type: 'string', required: true, isPrimary: false, label: 'Nome do Produto' },
      { name: 'slug', type: 'string', required: true, isPrimary: false, label: 'Slug' },
      { name: 'description', type: 'text', required: false, isPrimary: false, label: 'Descrição' },
      { name: 'price', type: 'number', required: true, isPrimary: false, label: 'Preço' },
      { name: 'sale_price', type: 'number', required: false, isPrimary: false, label: 'Preço Promocional' },
      { name: 'sku', type: 'string', required: false, isPrimary: false, label: 'SKU' },
      { name: 'stock', type: 'integer', required: true, isPrimary: false, label: 'Estoque', defaultValue: 0 },
      { name: 'category_id', type: 'integer', required: false, isPrimary: false, label: 'Categoria' },
      { name: 'featured', type: 'boolean', required: false, isPrimary: false, label: 'Destaque', defaultValue: false },
      { name: 'created_at', type: 'datetime', required: true, isPrimary: false, label: 'Data de Criação' },
      { name: 'updated_at', type: 'datetime', required: true, isPrimary: false, label: 'Data de Atualização' },
    ],
    'categories': [
      { name: 'id', type: 'integer', required: true, isPrimary: true, label: 'ID' },
      { name: 'name', type: 'string', required: true, isPrimary: false, label: 'Nome da Categoria' },
      { name: 'slug', type: 'string', required: true, isPrimary: false, label: 'Slug' },
      { name: 'description', type: 'text', required: false, isPrimary: false, label: 'Descrição' },
      { name: 'created_at', type: 'datetime', required: true, isPrimary: false, label: 'Data de Criação' },
    ],
    'customers': [
      { name: 'id', type: 'integer', required: true, isPrimary: true, label: 'ID' },
      { name: 'name', type: 'string', required: true, isPrimary: false, label: 'Nome Completo' },
      { name: 'email', type: 'string', required: true, isPrimary: false, label: 'Email' },
      { name: 'phone', type: 'string', required: false, isPrimary: false, label: 'Telefone' },
      { name: 'address', type: 'text', required: false, isPrimary: false, label: 'Endereço' },
      { name: 'city', type: 'string', required: false, isPrimary: false, label: 'Cidade' },
      { name: 'state', type: 'string', required: false, isPrimary: false, label: 'Estado' },
      { name: 'created_at', type: 'datetime', required: true, isPrimary: false, label: 'Data de Criação' },
    ],
    'orders': [
      { name: 'id', type: 'integer', required: true, isPrimary: true, label: 'ID' },
      { name: 'customer_id', type: 'integer', required: true, isPrimary: false, label: 'Cliente' },
      { name: 'status', type: 'string', required: true, isPrimary: false, label: 'Status' },
      { name: 'total', type: 'number', required: true, isPrimary: false, label: 'Total' },
      { name: 'shipping', type: 'number', required: false, isPrimary: false, label: 'Frete' },
      { name: 'tax', type: 'number', required: false, isPrimary: false, label: 'Impostos' },
      { name: 'payment_method', type: 'string', required: false, isPrimary: false, label: 'Método de Pagamento' },
      { name: 'notes', type: 'text', required: false, isPrimary: false, label: 'Observações' },
      { name: 'created_at', type: 'datetime', required: true, isPrimary: false, label: 'Data de Criação' },
      { name: 'updated_at', type: 'datetime', required: true, isPrimary: false, label: 'Data de Atualização' },
    ],
    'users': [
      { name: 'id', type: 'integer', required: true, isPrimary: true, label: 'ID' },
      { name: 'name', type: 'string', required: true, isPrimary: false, label: 'Nome' },
      { name: 'email', type: 'string', required: true, isPrimary: false, label: 'Email' },
      { name: 'password', type: 'string', required: true, isPrimary: false, label: 'Senha' },
      { name: 'role', type: 'string', required: true, isPrimary: false, label: 'Função' },
      { name: 'active', type: 'boolean', required: true, isPrimary: false, label: 'Ativo', defaultValue: true },
      { name: 'created_at', type: 'datetime', required: true, isPrimary: false, label: 'Data de Criação' },
    ],
    'contacts': [
      { name: 'id', type: 'integer', required: true, isPrimary: true, label: 'ID' },
      { name: 'name', type: 'string', required: true, isPrimary: false, label: 'Nome' },
      { name: 'email', type: 'string', required: true, isPrimary: false, label: 'Email' },
      { name: 'phone', type: 'string', required: false, isPrimary: false, label: 'Telefone' },
      { name: 'subject', type: 'string', required: true, isPrimary: false, label: 'Assunto' },
      { name: 'message', type: 'text', required: true, isPrimary: false, label: 'Mensagem' },
      { name: 'status', type: 'string', required: true, isPrimary: false, label: 'Status', defaultValue: 'new' },
      { name: 'created_at', type: 'datetime', required: true, isPrimary: false, label: 'Data de Envio' },
      { name: 'responded_at', type: 'datetime', required: false, isPrimary: false, label: 'Data de Resposta' },
    ],
    'comments': [
      { name: 'id', type: 'integer', required: true, isPrimary: true, label: 'ID' },
      { name: 'product_id', type: 'integer', required: true, isPrimary: false, label: 'Produto' },
      { name: 'user_id', type: 'integer', required: false, isPrimary: false, label: 'Usuário' },
      { name: 'name', type: 'string', required: false, isPrimary: false, label: 'Nome (para não logados)' },
      { name: 'content', type: 'text', required: true, isPrimary: false, label: 'Conteúdo' },
      { name: 'created_at', type: 'datetime', required: true, isPrimary: false, label: 'Data' },
    ],
    'cart': [
      { name: 'id', type: 'integer', required: true, isPrimary: true, label: 'ID' },
      { name: 'session_id', type: 'string', required: true, isPrimary: false, label: 'ID da Sessão' },
      { name: 'user_id', type: 'integer', required: false, isPrimary: false, label: 'Usuário' },
      { name: 'created_at', type: 'datetime', required: true, isPrimary: false, label: 'Data de Criação' },
      { name: 'updated_at', type: 'datetime', required: true, isPrimary: false, label: 'Data de Atualização' },
    ],
  };
  
  // Retornar campos mock para a tabela especificada ou um array vazio se não houver
  const fields = mockFields[tableName] || [];
  
  // Atualizar o cache
  if (!schemaCache[projectId]) {
    schemaCache[projectId] = { tables: [], fields: {}, timestamp: 0 };
  }
  
  if (!schemaCache[projectId].fields) {
    schemaCache[projectId].fields = {};
  }
  
  schemaCache[projectId].fields[tableName] = fields;
  schemaCache[projectId].timestamp = Date.now();
  
  return fields;
}

/**
 * Busca detalhes específicos de uma tabela
 */
export function getTableDetails(projectId: string, tableName: string): any {
  // Buscar tabela do cache ou mock
  const tables = getAvailableTables(projectId);
  const table = tables.find(t => t.slug === tableName);
  
  if (!table) {
    return null;
  }
  
  // Buscar campos da tabela
  const fields = getTableFields(projectId, tableName);
  
  // Construir detalhes completos
  return {
    ...table,
    fields,
    api: {
      enabled: table.hasAPI,
      basePath: `/api/${tableName}`,
      endpoints: [
        { method: 'GET', path: `/api/${tableName}`, description: 'Listar todos os registros' },
        { method: 'GET', path: `/api/${tableName}/:id`, description: 'Obter registro por ID' },
        { method: 'POST', path: `/api/${tableName}`, description: 'Criar novo registro' },
        { method: 'PUT', path: `/api/${tableName}/:id`, description: 'Atualizar registro' },
        { method: 'DELETE', path: `/api/${tableName}/:id`, description: 'Excluir registro' },
      ],
    },
    relations: getTableRelations(projectId, tableName),
    indexes: [],
  };
}

/**
 * Retorna relações para uma tabela
 */
function getTableRelations(projectId: string, tableName: string): any[] {
  // Em um cenário real, isso seria buscado do backend
  // Por enquanto, mock simples baseado em convenções de nome
  const relations: any[] = [];
  
  const fields = getTableFields(projectId, tableName);
  
  fields.forEach(field => {
    // Se o campo terminar com _id, provavelmente é uma chave estrangeira
    if (field.name.endsWith('_id')) {
      const targetTableName = field.name.replace('_id', '');
      // Verificar se a tabela alvo existe
      const tables = getAvailableTables(projectId);
      const targetExists = tables.some(t => t.slug === targetTableName || t.slug === `${targetTableName}s`);
      
      if (targetExists) {
        const targetTable = tables.find(t => t.slug === targetTableName || t.slug === `${targetTableName}s`);
        relations.push({
          type: 'manyToOne',
          table: targetTable?.slug || targetTableName,
          field: field.name,
          targetField: 'id',
          label: `${field.label.replace(' ID', '')}`,
        });
      }
    }
  });
  
  return relations;
}

/**
 * Gera dados para visualização do schema no DatabaseVisualizer
 */
export function getDatabaseSchemaVisualData(projectId: string): any {
  const tables = getAvailableTables(projectId);
  
  // Adicionar campos a cada tabela
  tables.forEach(table => {
    const fields = getTableFields(projectId, table.slug);
    table.fieldCount = fields.length;
  });
  
  return { tables };
}

/**
 * Gera um diagrama ER simples para visualização
 */
export function generateERDiagram(projectId: string): string {
  const tables = getAvailableTables(projectId);
  let diagram = 'erDiagram\n';
  
  // Gerar entidades
  tables.forEach(table => {
    const fields = getTableFields(projectId, table.slug);
    
    diagram += `    ${table.slug} {\n`;
    fields.forEach(field => {
      const nullable = field.required ? '' : '?';
      diagram += `        ${field.type}${nullable} ${field.name}\n`;
    });
    diagram += '    }\n';
    
    // Gerar relações
    const relations = getTableRelations(projectId, table.slug);
    relations.forEach(relation => {
      if (relation.type === 'manyToOne') {
        diagram += `    ${table.slug} }o--|| ${relation.table} : "${relation.field}"\n`;
      } else if (relation.type === 'oneToMany') {
        diagram += `    ${table.slug} ||--o{ ${relation.table} : "${relation.field}"\n`;
      } else if (relation.type === 'oneToOne') {
        diagram += `    ${table.slug} ||--|| ${relation.table} : "${relation.field}"\n`;
      } else if (relation.type === 'manyToMany') {
        diagram += `    ${table.slug} }o--o{ ${relation.table} : "${relation.joinTable}"\n`;
      }
    });
  });
  
  return diagram;
}

/**
 * Cria uma nova tabela no banco de dados
 */
export async function createDatabaseTable(
  tableName: string, 
  columns: Array<{ name: string; type: string; notNull?: boolean; primary?: boolean; defaultValue?: any }>,
  options: { timestamps?: boolean; softDelete?: boolean; description?: string } = {}
): Promise<any> {
  try {
    const response = await apiRequest('POST', '/api/database/tables', {
      tableName,
      columns,
      ...options
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao criar tabela');
    }
    
    // Limpar cache para forçar recarregamento dos dados
    Object.keys(schemaCache).forEach(key => {
      schemaCache[key].timestamp = 0;
    });
    
    return await response.json();
  } catch (error) {
    console.error('Erro ao criar tabela:', error);
    throw error;
  }
}

/**
 * Busca registros de uma tabela com suporte a paginação e filtros
 */
export async function fetchTableData(
  tableName: string,
  options: { 
    page?: number; 
    limit?: number; 
    filters?: Array<{field: string; operator: string; value: any}>;
    filterType?: 'and' | 'or';
    orderBy?: string;
    orderDirection?: 'asc' | 'desc';
  } = {}
): Promise<{data: any[]; meta: any}> {
  try {
    const { page = 1, limit = 20, filters = [], filterType = 'and', orderBy, orderDirection = 'desc' } = options;
    
    // Construir query string para a API
    let url = `/api/database/tables/${tableName}/data?page=${page}&limit=${limit}`;
    
    // Adicionar filtros se houverem
    if (filters && filters.length > 0) {
      filters.forEach((filter, index) => {
        url += `&filter_${index}_field=${filter.field}&filter_${index}_operator=${filter.operator}`;
        if (filter.value !== undefined && !['isNull', 'isNotNull'].includes(filter.operator)) {
          url += `&filter_${index}_value=${encodeURIComponent(filter.value)}`;
        }
      });
    }
    
    // Adicionar ordenação
    if (orderBy) {
      url += `&orderBy=${orderBy}&orderDirection=${orderDirection}`;
    }
    
    const response = await apiRequest('GET', url);
    
    if (!response.ok) {
      throw new Error(`Falha ao buscar dados: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Erro ao buscar dados da tabela ${tableName}:`, error);
    return { data: [], meta: { pagination: { total: 0, page: 1, limit: 20, pages: 0 } } };
  }
}

/**
 * Envia dados de um formulário para o banco de dados
 */
export async function submitFormData(
  tableName: string,
  data: any,
  mode: 'create' | 'edit' = 'create',
  recordId?: number
): Promise<any> {
  try {
    let url = `/api/database/tables/${tableName}/data`;
    let method = 'POST';
    
    if (mode === 'edit' && recordId) {
      url += `/${recordId}`;
      method = 'PUT';
    }
    
    const response = await apiRequest(method, url, data);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Falha ao ${mode === 'create' ? 'criar' : 'atualizar'} registro`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Erro ao ${mode === 'create' ? 'criar' : 'atualizar'} registro em ${tableName}:`, error);
    throw error;
  }
}