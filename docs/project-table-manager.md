# Gerenciador de Tabelas por Projeto

## Visão Geral

O `ProjectTableManager` é um serviço especializado que gerencia todas as operações de banco de dados específicas por projeto. Ele implementa um sistema de isolamento onde cada projeto possui suas próprias tabelas no banco de dados, com um prefixo `p{projectId}_` para garantir a separação dos dados entre diferentes projetos.

## Funcionalidades Principais

### Criação de Tabelas

```typescript
async createTable(projectId: number, definition: TableDefinition): Promise<QueryResult>
```

Cria uma nova tabela no banco de dados com o prefixo do projeto. A definição da tabela inclui nome, descrição e colunas com seus tipos e configurações.

### Consulta de Registros

```typescript
async queryRecords(projectId: number, tableName: string, filters: QueryFilter[] = [], pagination: PaginationOptions = {}): Promise<QueryResult>
```

Consulta registros de uma tabela específica, com suporte para filtros avançados, paginação e ordenação.

### Operações CRUD

```typescript
async insertRecord(projectId: number, tableName: string, data: Record<string, any>, schema?: ValidationSchema): Promise<QueryResult>

async updateRecord(projectId: number, tableName: string, id: string, data: Record<string, any>, schema?: ValidationSchema): Promise<QueryResult>

async deleteRecord(projectId: number, tableName: string, id: string): Promise<QueryResult>

async getRecordById(projectId: number, tableName: string, id: string): Promise<QueryResult>
```

Métodos para manipulação de registros individuais, com suporte para validação de esquema opcional.

### Gerenciamento de Estrutura

```typescript
async getTableSchema(projectId: number, tableName: string): Promise<QueryResult>

async dropTable(projectId: number, tableName: string): Promise<QueryResult>

async alterTable(projectId: number, tableName: string, alterations: {
  addColumns?: ColumnInfo[];
  dropColumns?: string[];
  alterColumns?: {
    name: string;
    newType?: string;
    newNullable?: boolean;
  }[];
}): Promise<QueryResult>
```

Métodos para gerenciar a estrutura da tabela, incluindo obter o esquema, remover a tabela ou alterar sua estrutura.

### Índices e Desempenho

```typescript
async addIndex(projectId: number, tableName: string, indexName: string, columns: string[], unique: boolean = false): Promise<QueryResult>

async dropIndex(projectId: number, tableName: string, indexName: string): Promise<QueryResult>
```

Métodos para gerenciar índices, melhorando o desempenho das consultas.

## Filtros Avançados

O sistema suporta filtros avançados em consultas, incluindo:

- Igualdade (`eq`)
- Desigualdade (`neq`)
- Maior que (`gt`)
- Maior ou igual a (`gte`)
- Menor que (`lt`)
- Menor ou igual a (`lte`)
- Contendo texto (`like`)
- Contendo texto (case insensitive) (`ilike`)
- Em uma lista de valores (`in`)
- Entre valores (`between`)

## Paginação e Ordenação

O sistema inclui suporte para paginação e ordenação de resultados:

```typescript
interface PaginationOptions {
  page?: number;
  pageSize?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}
```

## Exemplo de Uso com API REST

### Criar uma Nova Tabela

```
POST /api/projects/:projectId/database/tables

Body:
{
  "name": "produtos",
  "description": "Tabela de produtos da loja",
  "columns": [
    {
      "name": "id",
      "type": "integer",
      "primary": true,
      "notNull": true
    },
    {
      "name": "nome",
      "type": "string",
      "notNull": true
    },
    {
      "name": "preco",
      "type": "decimal",
      "notNull": true
    }
  ],
  "timestamps": true,
  "softDelete": true,
  "generateApi": true
}
```

### Consultar Dados com Filtros

```
GET /api/projects/:projectId/database/tables/:tableName/data?page=1&pageSize=10&orderBy=nome&orderDirection=asc
```

### Obter Esquema da Tabela

```
GET /api/projects/:projectId/database/tables/:tableName/schema
```

## Integração no Frontend

No frontend, o sistema é integrado através dos componentes:

- `DatabaseVisualizer.tsx`: Visualiza as tabelas disponíveis e seus dados
- `NewDatabaseTable.tsx`: Interface para criação de novas tabelas

Estes componentes utilizam a API REST para se comunicar com o backend e o serviço `ProjectTableManager`.
