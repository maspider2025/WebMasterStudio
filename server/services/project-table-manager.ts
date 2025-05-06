/**
 * Serviço de Gerenciamento de Tabelas de Projetos
 * 
 * Este serviço gerencia operações relacionadas a tabelas de projetos,
 * proporcionando uma interface de alto nível para manipulação
 * consistente e segura de tabelas por projeto.
 * 
 * Funcionalidades:
 * - Criação e remoção de tabelas por projeto
 * - Isolamento de tabelas por projeto usando prefixos
 * - Validação de estrutura e dados
 * - Operações CRUD otimizadas para tabelas de projeto
 */

import { db, pool } from '../../db';
import { idGenerator, EntityType } from './id-generator';
import { dataValidator, ValidationSchema } from './data-validator';
import { SQL, desc, eq, sql } from 'drizzle-orm';

/**
 * Interface para informações de coluna
 */
export interface ColumnInfo {
  name: string;
  type: string;
  nullable: boolean;
  defaultValue?: any;
  primaryKey?: boolean;
  unique?: boolean;
  autoIncrement?: boolean;
  references?: {
    table: string;
    column: string;
  };
}

/**
 * Interface para definição de tabela
 */
export interface TableDefinition {
  name: string;
  description?: string;
  columns: ColumnInfo[];
  primaryKey?: string[];
  uniqueConstraints?: { name: string; columns: string[] }[];
  indexes?: { name: string; columns: string[] }[];
}

/**
 * Interface para resultados de query
 */
export interface QueryResult {
  success: boolean;
  data?: any;
  error?: string;
  count?: number;
  page?: number;
  pageSize?: number;
  totalPages?: number;
}

/**
 * Interface para opções de páginação
 */
export interface PaginationOptions {
  page?: number;
  pageSize?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

/**
 * Interface para filtros de consulta
 */
export interface QueryFilter {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'ilike' | 'in' | 'between';
  value: any;
}

/**
 * Gerenciador de tabelas de projetos
 */
export class ProjectTableManager {
  private projectIdCache: Map<string, number> = new Map();
  
  /**
   * Constrói o nome completo da tabela com o prefixo do projeto
   * @param projectId ID do projeto
   * @param tableName Nome da tabela
   * @returns Nome completo da tabela
   */
  getFullTableName(projectId: number, tableName: string): string {
    return `p${projectId}_${tableName}`;
  }
  
  /**
   * Cria uma nova tabela para um projeto
   * @param projectId ID do projeto
   * @param definition Definição da tabela
   * @returns Resultado da operação
   */
  async createTable(projectId: number, definition: TableDefinition): Promise<QueryResult> {
    try {
      // Validar project ID e nome da tabela
      if (!projectId || projectId <= 0) {
        return { success: false, error: 'ID de projeto inválido' };
      }
      
      if (!definition.name || !/^[a-zA-Z][a-zA-Z0-9_]*$/.test(definition.name)) {
        return { success: false, error: 'Nome de tabela inválido. Use apenas letras, números e sublinhados, começando com uma letra.' };
      }
      
      if (!definition.columns || definition.columns.length === 0) {
        return { success: false, error: 'A tabela deve ter pelo menos uma coluna' };
      }
      
      const fullTableName = this.getFullTableName(projectId, definition.name);
      
      // Verificar se a tabela já existe
      const tableCheck = await db.execute<{ exists: boolean }>(sql`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.tables 
          WHERE table_schema = 'public' AND table_name = ${fullTableName}
        ) as exists
      `);
      
      if (tableCheck.rows[0].exists) {
        return { success: false, error: `Tabela '${definition.name}' já existe para o projeto ${projectId}` };
      }
      
      // Construir a query de criação da tabela
      let createTableQuery = sql`CREATE TABLE ${sql.identifier(fullTableName)} (`;
      
      // Se não existe coluna ID, adicionar automaticamente
      let hasId = definition.columns.some(col => col.name.toLowerCase() === 'id');
      
      if (!hasId) {
        definition.columns.unshift({
          name: 'id',
          type: 'varchar',
          nullable: false,
          primaryKey: true
        });
      }
      
      // Adicionar timestamps se não existirem
      let hasCreatedAt = definition.columns.some(col => col.name.toLowerCase() === 'created_at');
      let hasUpdatedAt = definition.columns.some(col => col.name.toLowerCase() === 'updated_at');
      
      if (!hasCreatedAt) {
        definition.columns.push({
          name: 'created_at',
          type: 'timestamp',
          nullable: false,
          defaultValue: 'CURRENT_TIMESTAMP'
        });
      }
      
      if (!hasUpdatedAt) {
        definition.columns.push({
          name: 'updated_at',
          type: 'timestamp',
          nullable: false,
          defaultValue: 'CURRENT_TIMESTAMP'
        });
      }
      
      // Adicionar cada coluna na query
      const columnDefinitions: SQL[] = [];
      
      for (const column of definition.columns) {
        let columnSql = sql`${sql.identifier(column.name)} ${sql.raw(column.type.toUpperCase())}`;
        
        if (column.primaryKey) {
          columnSql = sql`${columnSql} PRIMARY KEY`;
        }
        
        if (!column.nullable) {
          columnSql = sql`${columnSql} NOT NULL`;
        }
        
        if (column.unique) {
          columnSql = sql`${columnSql} UNIQUE`;
        }
        
        if (column.defaultValue !== undefined) {
          if (typeof column.defaultValue === 'string' && column.defaultValue.toUpperCase() === 'CURRENT_TIMESTAMP') {
            columnSql = sql`${columnSql} DEFAULT CURRENT_TIMESTAMP`;
          } else {
            columnSql = sql`${columnSql} DEFAULT ${column.defaultValue}`;
          }
        }
        
        if (column.references) {
          const refTableName = this.getFullTableName(projectId, column.references.table);
          columnSql = sql`${columnSql} REFERENCES ${sql.identifier(refTableName)}(${sql.identifier(column.references.column)})`;
        }
        
        columnDefinitions.push(columnSql);
      }
      
      createTableQuery = sql`${createTableQuery}${sql.join(columnDefinitions, sql`, `)})`;
      
      // Executar a query de criação da tabela
      await db.execute(createTableQuery);
      
      // Registrar a tabela no sistema
      await db.execute(sql`
        INSERT INTO tables (project_id, name, table_name, description, created_at, updated_at)
        VALUES (${projectId}, ${definition.name}, ${fullTableName}, ${definition.description || null}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING id
      `);
      
      return { 
        success: true, 
        data: { 
          projectId, 
          tableName: definition.name,
          fullTableName,
          columns: definition.columns.map(c => c.name)
        } 
      };
    } catch (error) {
      console.error('Erro ao criar tabela:', error);
      return { 
        success: false, 
        error: `Erro ao criar tabela: ${String(error)}` 
      };
    }
  }
  
  /**
   * Exclui uma tabela de um projeto
   * @param projectId ID do projeto
   * @param tableName Nome da tabela
   * @returns Resultado da operação
   */
  async dropTable(projectId: number, tableName: string): Promise<QueryResult> {
    try {
      const fullTableName = this.getFullTableName(projectId, tableName);
      
      // Verificar se a tabela existe
      const tableCheck = await db.execute<{ exists: boolean }>(sql`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.tables 
          WHERE table_schema = 'public' AND table_name = ${fullTableName}
        ) as exists
      `);
      
      if (!tableCheck.rows[0].exists) {
        return { success: false, error: `Tabela '${tableName}' não existe para o projeto ${projectId}` };
      }
      
      // Excluir a tabela
      await db.execute(sql`DROP TABLE ${sql.identifier(fullTableName)}`);
      
      // Remover registro da tabela no sistema
      await db.execute(sql`
        DELETE FROM tables 
        WHERE project_id = ${projectId} AND name = ${tableName}
      `);
      
      return { 
        success: true, 
        data: { 
          projectId, 
          tableName,
          message: `Tabela '${tableName}' excluída com sucesso` 
        } 
      };
    } catch (error) {
      console.error('Erro ao excluir tabela:', error);
      return { 
        success: false, 
        error: `Erro ao excluir tabela: ${String(error)}` 
      };
    }
  }
  
  /**
   * Obtém a estrutura de uma tabela
   * @param projectId ID do projeto
   * @param tableName Nome da tabela
   * @returns Resultado da operação com a estrutura da tabela
   */
  async getTableSchema(projectId: number, tableName: string): Promise<QueryResult> {
    try {
      const fullTableName = this.getFullTableName(projectId, tableName);
      
      // Verificar se a tabela existe
      const tableCheck = await db.execute<{ exists: boolean }>(sql`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.tables 
          WHERE table_schema = 'public' AND table_name = ${fullTableName}
        ) as exists
      `);
      
      if (!tableCheck.rows[0].exists) {
        return { success: false, error: `Tabela '${tableName}' não existe para o projeto ${projectId}` };
      }
      
      // Obter estrutura da tabela
      const columns = await db.execute(sql`
        SELECT column_name, data_type, is_nullable, column_default, 
          (SELECT EXISTS (
              SELECT 1 FROM information_schema.table_constraints tc
              INNER JOIN information_schema.constraint_column_usage ccu 
                ON tc.constraint_name = ccu.constraint_name
              WHERE tc.constraint_type = 'PRIMARY KEY'
                AND tc.table_name = ${fullTableName}
                AND ccu.column_name = c.column_name
            )) as is_primary_key
        FROM information_schema.columns c
        WHERE table_name = ${fullTableName}
        AND table_schema = 'public'
        ORDER BY ordinal_position
      `);
      
      // Obter informações da tabela
      const tableInfo = await db.execute(sql`
        SELECT name, description, created_at, updated_at
        FROM tables
        WHERE project_id = ${projectId} AND name = ${tableName}
      `);
      
      const schema = {
        name: tableName,
        fullName: fullTableName,
        description: tableInfo.rows[0]?.description || '',
        createdAt: tableInfo.rows[0]?.created_at || null,
        updatedAt: tableInfo.rows[0]?.updated_at || null,
        columns: columns.rows.map(col => ({
          name: col.column_name,
          type: col.data_type,
          nullable: col.is_nullable === 'YES',
          defaultValue: col.column_default,
          isPrimaryKey: col.is_primary_key
        }))
      };
      
      return { success: true, data: schema };
    } catch (error) {
      console.error('Erro ao obter estrutura da tabela:', error);
      return { 
        success: false, 
        error: `Erro ao obter estrutura da tabela: ${String(error)}` 
      };
    }
  }
  
  /**
   * Insere um registro em uma tabela
   * @param projectId ID do projeto
   * @param tableName Nome da tabela
   * @param data Dados a serem inseridos
   * @param schema Esquema de validação opcional
   * @returns Resultado da operação
   */
  async insertRecord(projectId: number, tableName: string, data: Record<string, any>, schema?: ValidationSchema): Promise<QueryResult> {
    try {
      const fullTableName = this.getFullTableName(projectId, tableName);
      
      // Verificar se a tabela existe
      const tableCheck = await db.execute<{ exists: boolean }>(sql`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.tables 
          WHERE table_schema = 'public' AND table_name = ${fullTableName}
        ) as exists
      `);
      
      if (!tableCheck.rows[0].exists) {
        return { success: false, error: `Tabela '${tableName}' não existe para o projeto ${projectId}` };
      }
      
      // Obter estrutura da tabela
      const tableSchema = await db.execute(sql`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = ${fullTableName}
        AND table_schema = 'public'
      `);
      
      // Transformar em um mapa para fácil acesso
      const columnsMap: { [key: string]: { dataType: string, isNullable: boolean } } = {};
      for (const col of tableSchema.rows) {
        columnsMap[col.column_name] = {
          dataType: col.data_type,
          isNullable: col.is_nullable === 'YES'
        };
      }
      
      // Validar os dados fornecidos contra o esquema da tabela
      const validatedData: Record<string, any> = {};
      const errors: string[] = [];
      
      // Acompanhar as colunas disponíveis
      const availableColumns = new Set(Object.keys(columnsMap));
      
      // Para cada campo nos dados
      for (const [key, value] of Object.entries(data)) {
        // Verificar se o campo existe na tabela
        if (!availableColumns.has(key)) {
          errors.push(`Campo '${key}' não existe na tabela ${tableName}`);
          continue;
        }
        
        // Verificar valores nulos
        if (value === null && !columnsMap[key].isNullable) {
          errors.push(`Campo '${key}' não pode ser nulo`);
          continue;
        }
        
        // Validar o tipo de dados
        if (value !== null && !this.validateDataType(value, columnsMap[key].dataType)) {
          errors.push(`Valor inválido para o campo '${key}': esperado ${columnsMap[key].dataType}`);
          continue;
        }
        
        // Se passou pelas validações, adiciona aos dados validados
        validatedData[key] = value;
      }
      
      // Se fornecido um esquema de validação personalizado, aplicar
      if (schema) {
        const validationResult = dataValidator.validateSchema(validatedData, schema);
        if (!validationResult.valid) {
          return { 
            success: false, 
            error: 'Erros de validação nos dados fornecidos',
            data: { errors: validationResult.errors }
          };
        }
      }
      
      // Se houver erros, retornar
      if (errors.length > 0) {
        return { 
          success: false, 
          error: 'Erros de validação nos dados fornecidos',
          data: { errors }
        };
      }
      
      // Gerar um ID se não foi fornecido
      if (!validatedData['id'] && availableColumns.has('id')) {
        validatedData['id'] = idGenerator.generateEntityId(tableName.toUpperCase());
      }
      
      // Adicionar timestamps se existirem
      if (availableColumns.has('created_at') && !validatedData['created_at']) {
        validatedData['created_at'] = new Date();
      }
      
      if (availableColumns.has('updated_at') && !validatedData['updated_at']) {
        validatedData['updated_at'] = new Date();
      }
      
      // Construir a query de inserção
      const columns = Object.keys(validatedData);
      const values = Object.values(validatedData);
      
      // Construir a query manualmente com valores
      const columnsSql = columns.map(col => sql.identifier(col));
      const valuesSql = values.map(val => sql`${val}`);
      
      // Construir a query completa
      const insertQuery = sql`
        INSERT INTO ${sql.identifier(fullTableName)} (
          ${sql.join(columnsSql, sql`, `)}
        ) VALUES (
          ${sql.join(valuesSql, sql`, `)}
        )
        RETURNING *
      `;
      
      // Executar a query com os parâmetros
      const result = await db.execute(insertQuery);
      
      return { 
        success: true, 
        data: result.rows[0] 
      };
    } catch (error) {
      console.error('Erro ao inserir registro na tabela:', error);
      return { 
        success: false, 
        error: `Erro ao inserir registro na tabela: ${String(error)}` 
      };
    }
  }
  
  /**
   * Atualiza um registro em uma tabela
   * @param projectId ID do projeto
   * @param tableName Nome da tabela
   * @param id ID do registro
   * @param data Dados para atualização
   * @param schema Esquema de validação opcional
   * @returns Resultado da operação
   */
  async updateRecord(projectId: number, tableName: string, id: string, data: Record<string, any>, schema?: ValidationSchema): Promise<QueryResult> {
    try {
      const fullTableName = this.getFullTableName(projectId, tableName);
      
      // Verificar se a tabela existe
      const tableCheck = await db.execute<{ exists: boolean }>(sql`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.tables 
          WHERE table_schema = 'public' AND table_name = ${fullTableName}
        ) as exists
      `);
      
      if (!tableCheck.rows[0].exists) {
        return { success: false, error: `Tabela '${tableName}' não existe para o projeto ${projectId}` };
      }
      
      // Verificar se existem dados para atualizar
      if (!data || Object.keys(data).length === 0) {
        return { success: false, error: 'Nenhum dado fornecido para atualização' };
      }
      
      // Verificar se o registro existe
      const checkRecord = await db.execute<{ exists: boolean }>(sql`
        SELECT EXISTS (
          SELECT 1 FROM ${sql.identifier(fullTableName)}
          WHERE id = ${id}
        ) as exists
      `);
      
      if (!checkRecord.rows[0].exists) {
        return { success: false, error: `Registro com ID ${id} não encontrado na tabela ${tableName}` };
      }
      
      // Obter estrutura da tabela
      const tableSchema = await db.execute(sql`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = ${fullTableName}
        AND table_schema = 'public'
      `);
      
      // Transformar em um mapa para fácil acesso
      const columnsMap: { [key: string]: { dataType: string, isNullable: boolean } } = {};
      for (const col of tableSchema.rows) {
        columnsMap[col.column_name] = {
          dataType: col.data_type,
          isNullable: col.is_nullable === 'YES'
        };
      }
      
      // Validar os dados fornecidos contra o schema
      const validatedData: Record<string, any> = {};
      const errors: string[] = [];
      
      // Acompanhar as colunas disponíveis
      const availableColumns = new Set(Object.keys(columnsMap));
      
      // Não permitir atualização do ID
      delete data.id;
      
      // Para cada campo nos dados
      for (const [key, value] of Object.entries(data)) {
        // Verificar se o campo existe na tabela
        if (!availableColumns.has(key)) {
          errors.push(`Campo '${key}' não existe na tabela ${tableName}`);
          continue;
        }
        
        // Verificar valores nulos
        if (value === null && !columnsMap[key].isNullable) {
          errors.push(`Campo '${key}' não pode ser nulo`);
          continue;
        }
        
        // Validar o tipo de dados
        if (value !== null && !this.validateDataType(value, columnsMap[key].dataType)) {
          errors.push(`Valor inválido para o campo '${key}': esperado ${columnsMap[key].dataType}`);
          continue;
        }
        
        // Se passou pelas validações, adicionar aos dados validados
        if (value !== undefined) {
          validatedData[key] = value;
        }
      }
      
      // Se fornecido um esquema de validação personalizado, aplicar
      if (schema) {
        const validationResult = dataValidator.validateSchema(validatedData, schema);
        if (!validationResult.valid) {
          return { 
            success: false, 
            error: 'Erros de validação nos dados fornecidos',
            data: { errors: validationResult.errors }
          };
        }
      }
      
      // Se houver erros, retornar
      if (errors.length > 0) {
        return { 
          success: false, 
          error: 'Erros de validação nos dados fornecidos',
          data: { errors }
        };
      }
      
      // Atualizar timestamp se existir
      if (availableColumns.has('updated_at')) {
        validatedData['updated_at'] = new Date();
      }
      
      // Construir a query manualmente com valores
      const updateItems = Object.entries(validatedData).map(
        ([key, value]) => sql`${sql.identifier(key)} = ${value}`
      );
      
      // Construir a query diretamente com valores
      const updateQuery = sql`
        UPDATE ${sql.identifier(fullTableName)}
        SET ${sql.join(updateItems, sql`, `)}
        WHERE id = ${id}
        RETURNING *
      `;
      
      // Executar a query com os parâmetros
      const result = await db.execute(updateQuery);
      
      return { 
        success: true, 
        data: result.rows[0] 
      };
    } catch (error) {
      console.error('Erro ao atualizar registro na tabela:', error);
      return { 
        success: false, 
        error: `Erro ao atualizar registro na tabela: ${String(error)}` 
      };
    }
  }
  
  /**
   * Exclui um registro de uma tabela
   * @param projectId ID do projeto
   * @param tableName Nome da tabela
   * @param id ID do registro
   * @returns Resultado da operação
   */
  async deleteRecord(projectId: number, tableName: string, id: string): Promise<QueryResult> {
    try {
      const fullTableName = this.getFullTableName(projectId, tableName);
      
      // Verificar se a tabela existe
      const tableCheck = await db.execute<{ exists: boolean }>(sql`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.tables 
          WHERE table_schema = 'public' AND table_name = ${fullTableName}
        ) as exists
      `);
      
      if (!tableCheck.rows[0].exists) {
        return { success: false, error: `Tabela '${tableName}' não existe para o projeto ${projectId}` };
      }
      
      // Verificar se o registro existe
      const checkRecord = await db.execute<{ exists: boolean }>(sql`
        SELECT EXISTS (
          SELECT 1 FROM ${sql.identifier(fullTableName)}
          WHERE id = ${id}
        ) as exists
      `);
      
      if (!checkRecord.rows[0].exists) {
        return { success: false, error: `Registro com ID ${id} não encontrado na tabela ${tableName}` };
      }
      
      // Verificar se a tabela tem suporte a soft delete
      const hasSoftDelete = await db.execute<{ exists: boolean }>(sql`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = ${fullTableName}
          AND column_name = 'deleted_at'
          AND table_schema = 'public'
        ) as exists
      `);
      
      if (hasSoftDelete.rows[0].exists) {
        // Se suporta soft delete, apenas marca como excluído
        await db.execute(sql`
          UPDATE ${sql.identifier(fullTableName)}
          SET "deleted_at" = CURRENT_TIMESTAMP
          WHERE id = ${id}
        `);
        
        return { 
          success: true, 
          data: { 
            id, 
            message: 'Registro marcado como excluído (soft delete)',
            softDelete: true
          } 
        };
      } else {
        // Senão, exclui permanentemente
        await db.execute(sql`
          DELETE FROM ${sql.identifier(fullTableName)}
          WHERE id = ${id}
        `);
        
        return { 
          success: true, 
          data: { 
            id, 
            message: 'Registro excluído com sucesso'
          } 
        };
      }
    } catch (error) {
      console.error('Erro ao excluir registro da tabela:', error);
      return { 
        success: false, 
        error: `Erro ao excluir registro da tabela: ${String(error)}` 
      };
    }
  }
  
  /**
   * Busca registros em uma tabela
   * @param projectId ID do projeto
   * @param tableName Nome da tabela
   * @param filters Filtros para busca
   * @param pagination Opções de paginação
   * @returns Resultado da operação
   */
  async queryRecords(projectId: number, tableName: string, filters: QueryFilter[] = [], pagination: PaginationOptions = {}): Promise<QueryResult> {
    try {
      const fullTableName = this.getFullTableName(projectId, tableName);
      
      // Verificar se a tabela existe
      const tableCheck = await db.execute<{ exists: boolean }>(sql`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.tables 
          WHERE table_schema = 'public' AND table_name = ${fullTableName}
        ) as exists
      `);
      
      if (!tableCheck.rows[0].exists) {
        return { success: false, error: `Tabela '${tableName}' não existe para o projeto ${projectId}` };
      }
      
      // Inicializar a query base
      let baseQuery = sql`SELECT * FROM ${sql.identifier(fullTableName)}`;
      let whereConditions: SQL[] = [];
      
      // Verificar se a tabela suporta soft delete
      const hasSoftDelete = await db.execute<{ exists: boolean }>(sql`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = ${fullTableName}
          AND column_name = 'deleted_at'
          AND table_schema = 'public'
        ) as exists
      `);
      
      // Adicionar condição para ignorar registros soft deleted
      if (hasSoftDelete.rows[0].exists) {
        whereConditions.push(sql`"deleted_at" IS NULL`);
      }
      
      // Verificar campos numéricos armazenados como texto
      const numericFieldsMap = new Map<string, boolean>();
      
      // Obter informações de colunas para filtros numéricos em campos VARCHAR
      const columnsInfo = await db.execute(sql`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = ${fullTableName} 
      `);
      
      // Mapear quais campos são numéricos armazenados como texto
      for (const col of columnsInfo.rows) {
        const dataType = col.data_type.toLowerCase();
        const columnName = col.column_name;
        
        // Se for VARCHAR mas potencialmente contém valores numéricos e tem nome sugestivo (preço, valor, etc)
        if (['character varying', 'varchar', 'text'].includes(dataType) && 
            (columnName === 'preco' || columnName.includes('price') || 
             columnName === 'valor' || columnName.includes('value'))) {
          numericFieldsMap.set(columnName, true);
        }
      }

      // Aplicar filtros
      for (const filter of filters) {
        const { field, operator, value } = filter;
        let condition: SQL;
        const isNumericField = numericFieldsMap.has(field);
        
        switch (operator) {
          case 'eq':
            condition = isNumericField 
              ? sql`CAST(${sql.identifier(field)} AS NUMERIC) = ${value}` 
              : sql`${sql.identifier(field)} = ${value}`;
            break;
          case 'neq':
            condition = isNumericField 
              ? sql`CAST(${sql.identifier(field)} AS NUMERIC) <> ${value}` 
              : sql`${sql.identifier(field)} <> ${value}`;
            break;
          case 'gt':
            condition = isNumericField 
              ? sql`CAST(${sql.identifier(field)} AS NUMERIC) > ${value}` 
              : sql`${sql.identifier(field)} > ${value}`;
            break;
          case 'gte':
            condition = isNumericField 
              ? sql`CAST(${sql.identifier(field)} AS NUMERIC) >= ${value}` 
              : sql`${sql.identifier(field)} >= ${value}`;
            break;
          case 'lt':
            condition = isNumericField 
              ? sql`CAST(${sql.identifier(field)} AS NUMERIC) < ${value}` 
              : sql`${sql.identifier(field)} < ${value}`;
            break;
          case 'lte':
            condition = isNumericField 
              ? sql`CAST(${sql.identifier(field)} AS NUMERIC) <= ${value}` 
              : sql`${sql.identifier(field)} <= ${value}`;
            break;
          case 'like':
            condition = sql`${sql.identifier(field)} LIKE ${`%${value}%`}`;
            break;
          case 'ilike':
            condition = sql`${sql.identifier(field)} ILIKE ${`%${value}%`}`;
            break;
          case 'in':
            if (!Array.isArray(value)) {
              return { success: false, error: `Valor inválido para operador 'in'. Esperado array.` };
            }
            // Formatar o IN para SQL com os valores do array
            const inValues = value.map(v => sql`${v}`);
            condition = sql`${sql.identifier(field)} IN (${sql.join(inValues, sql`, `)})`;
            break;
          case 'between':
            if (!Array.isArray(value) || value.length !== 2) {
              return { success: false, error: `Valor inválido para operador 'between'. Esperado array com 2 elementos.` };
            }
            condition = sql`${sql.identifier(field)} BETWEEN ${value[0]} AND ${value[1]}`;
            break;
          default:
            return { success: false, error: `Operador de filtro '${operator}' não suportado.` };
        }
        
        whereConditions.push(condition);
      }
      
      // Adicionar condições WHERE
      if (whereConditions.length > 0) {
        baseQuery = sql`${baseQuery} WHERE ${sql.join(whereConditions, sql` AND `)}`;
      }
      
      // Contar total de registros para paginação
      const countQuery = sql`SELECT COUNT(*) FROM (${baseQuery}) as count_query`;
      const countResult = await db.execute(countQuery);
      const totalCount = parseInt(countResult.rows[0].count);
      
      // Aplicar ordenação
      if (pagination.orderBy) {
        const direction = pagination.orderDirection === 'desc' ? sql` DESC` : sql``;
        
        // Verificar se o campo de ordenação é um campo numérico armazenado como string
        // Especialmente útil para campos como 'preco' que podem ser VARCHAR mas conter números
        let isNumericField = false;
        
        // Verificar tipo de coluna diretamente do schema
        const columnInfo = await db.execute(sql`
          SELECT data_type 
          FROM information_schema.columns 
          WHERE table_schema = 'public' 
            AND table_name = ${fullTableName} 
            AND column_name = ${pagination.orderBy}
        `);
        
        if (columnInfo.rows.length > 0) {
          const dataType = columnInfo.rows[0].data_type.toLowerCase();
          // Se for VARCHAR mas potencialmente contém valores numéricos
          if (['character varying', 'varchar', 'text'].includes(dataType) && 
              (pagination.orderBy === 'preco' || pagination.orderBy.includes('price'))) {
            isNumericField = true;
          }
        }
        
        if (isNumericField) {
          // Usar CAST para ordenar numericamente quando o campo é string mas contém números
          baseQuery = sql`${baseQuery} ORDER BY CAST(${sql.identifier(pagination.orderBy)} AS NUMERIC)${direction}`;
        } else {
          // Ordenação padrão para outros campos
          baseQuery = sql`${baseQuery} ORDER BY ${sql.identifier(pagination.orderBy)}${direction}`;
        }
      } else {
        // Ordená-los por ID ou created_at por padrão
        const hasCreatedAt = await db.execute<{ exists: boolean }>(sql`
          SELECT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = ${fullTableName}
            AND column_name = 'created_at'
            AND table_schema = 'public'
          ) as exists
        `);
        
        if (hasCreatedAt.rows[0].exists) {
          baseQuery = sql`${baseQuery} ORDER BY "created_at" DESC`;
        } else {
          baseQuery = sql`${baseQuery} ORDER BY "id"`;
        }
      }
      
      // Aplicar paginação
      const page = pagination.page || 1;
      const pageSize = pagination.pageSize || 10;
      const offset = (page - 1) * pageSize;
      
      baseQuery = sql`${baseQuery} LIMIT ${pageSize} OFFSET ${offset}`;
      
      // Executar a query final
      const result = await db.execute(baseQuery);
      
      // Calcular total de páginas
      const totalPages = Math.ceil(totalCount / pageSize);
      
      return { 
        success: true, 
        data: result.rows,
        count: totalCount,
        page,
        pageSize,
        totalPages
      };
    } catch (error) {
      console.error('Erro ao consultar registros da tabela:', error);
      return { 
        success: false, 
        error: `Erro ao consultar registros da tabela: ${String(error)}` 
      };
    }
  }
  
  /**
   * Recupera um registro específico pelo ID
   * @param projectId ID do projeto
   * @param tableName Nome da tabela
   * @param id ID do registro
   * @returns Resultado da operação
   */
  async getRecordById(projectId: number, tableName: string, id: string): Promise<QueryResult> {
    try {
      const fullTableName = this.getFullTableName(projectId, tableName);
      
      // Verificar se a tabela existe
      const tableCheck = await db.execute<{ exists: boolean }>(sql`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.tables 
          WHERE table_schema = 'public' AND table_name = ${fullTableName}
        ) as exists
      `);
      
      if (!tableCheck.rows[0].exists) {
        return { success: false, error: `Tabela '${tableName}' não existe para o projeto ${projectId}` };
      }
      
      // Verificar se a tabela tem suporte a soft delete
      const hasSoftDelete = await db.execute<{ exists: boolean }>(sql`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = ${fullTableName}
          AND column_name = 'deleted_at'
          AND table_schema = 'public'
        ) as exists
      `);
      
      // Construir a query base
      let query = sql`SELECT * FROM ${sql.identifier(fullTableName)} WHERE id = ${id}`;
      
      // Adicionar condição para ignorar registros deletados
      if (hasSoftDelete.rows[0].exists) {
        query = sql`${query} AND "deleted_at" IS NULL`;
      }
      
      // Executar a query
      const result = await db.execute(query);
      
      if (result.rows.length === 0) {
        return { success: false, error: `Registro com ID ${id} não encontrado na tabela ${tableName}` };
      }
      
      return { success: true, data: result.rows[0] };
    } catch (error) {
      console.error('Erro ao obter registro por ID:', error);
      return { 
        success: false, 
        error: `Erro ao obter registro por ID: ${String(error)}` 
      };
    }
  }
  
  /**
   * Executa uma query SQL personalizada em uma tabela de projeto
   * @param projectId ID do projeto
   * @param tableName Nome da tabela
   * @param query Query SQL personalizada
   * @param params Parâmetros para a query
   * @returns Resultado da operação
   */
  async executeCustomQuery(projectId: number, tableName: string, query: string, params: any[] = []): Promise<QueryResult> {
    try {
      const fullTableName = this.getFullTableName(projectId, tableName);
      
      // Verificar se a tabela existe
      const tableCheck = await db.execute<{ exists: boolean }>(sql`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.tables 
          WHERE table_schema = 'public' AND table_name = ${fullTableName}
        ) as exists
      `);
      
      if (!tableCheck.rows[0].exists) {
        return { success: false, error: `Tabela '${tableName}' não existe para o projeto ${projectId}` };
      }
      
      // Substituir o nome da tabela na query pelo nome completo
      const modifiedQuery = query.replace(
        new RegExp(`\\b${tableName}\\b`, 'g'), 
        fullTableName
      );
      
      // Executar a query
      // Usamos diretamente o pool pois o método SQL tagged template não é ideal
      // para queries personalizadas fornecidas pelo usuário
      const result = await pool.query(modifiedQuery, params);
      
      return { success: true, data: result.rows };
    } catch (error) {
      console.error('Erro ao executar query personalizada:', error);
      return { 
        success: false, 
        error: `Erro ao executar query personalizada: ${String(error)}` 
      };
    }
  }
  
  /**
   * Modifica a estrutura de uma tabela existente (adicionar/remover/alterar colunas)
   * @param projectId ID do projeto
   * @param tableName Nome da tabela
   * @param alterations Alterações a serem aplicadas
   * @returns Resultado da operação
   */
  async alterTable(projectId: number, tableName: string, alterations: {
    addColumns?: ColumnInfo[];
    dropColumns?: string[];
    alterColumns?: {name: string; type?: string; nullable?: boolean}[];
  }): Promise<QueryResult> {
    try {
      const fullTableName = this.getFullTableName(projectId, tableName);
      
      // Verificar se a tabela existe
      const tableCheck = await db.execute<{ exists: boolean }>(sql`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.tables 
          WHERE table_schema = 'public' AND table_name = ${fullTableName}
        ) as exists
      `);
      
      if (!tableCheck.rows[0].exists) {
        return { success: false, error: `Tabela '${tableName}' não existe para o projeto ${projectId}` };
      }
      
      // Inicializar array de alterações
      const alterations_sql: SQL[] = [];
      
      // Adicionar novas colunas
      if (alterations.addColumns && alterations.addColumns.length > 0) {
        for (const column of alterations.addColumns) {
          let columnSql = sql`ADD COLUMN ${sql.identifier(column.name)} ${sql.raw(column.type.toUpperCase())}`;
          
          if (column.nullable === false) {
            columnSql = sql`${columnSql} NOT NULL`;
          }
          
          if (column.defaultValue !== undefined) {
            columnSql = sql`${columnSql} DEFAULT ${column.defaultValue}`;
          }
          
          alterations_sql.push(columnSql);
        }
      }
      
      // Remover colunas
      if (alterations.dropColumns && alterations.dropColumns.length > 0) {
        for (const column of alterations.dropColumns) {
          // Não permitir remover colunas essenciais
          if (column === 'id' || column === 'created_at' || column === 'updated_at') {
            return { success: false, error: `Não é permitido remover a coluna essencial '${column}'` };
          }
          
          alterations_sql.push(sql`DROP COLUMN ${sql.identifier(column)}`);
        }
      }
      
      // Alterar colunas existentes
      if (alterations.alterColumns && alterations.alterColumns.length > 0) {
        for (const column of alterations.alterColumns) {
          // Alternar o tipo da coluna
          if (column.type) {
            alterations_sql.push(
              sql`ALTER COLUMN ${sql.identifier(column.name)} TYPE ${sql.raw(column.type.toUpperCase())}`
            );
          }
          
          // Alternar a propriedade nullable
          if (column.nullable !== undefined) {
            alterations_sql.push(
              column.nullable
                ? sql`ALTER COLUMN ${sql.identifier(column.name)} DROP NOT NULL`
                : sql`ALTER COLUMN ${sql.identifier(column.name)} SET NOT NULL`
            );
          }
        }
      }
      
      // Se não houver alterações, retornar
      if (alterations_sql.length === 0) {
        return { success: false, error: 'Nenhuma alteração solicitada' };
      }
      
      // Construir a query final
      const alterQuery = sql`ALTER TABLE ${sql.identifier(fullTableName)} ${sql.join(alterations_sql, sql`, `)}`;
      
      // Executar a query
      await db.execute(alterQuery);
      
      // Obter a nova estrutura da tabela
      const newSchema = await this.getTableSchema(projectId, tableName);
      
      return { 
        success: true, 
        data: {
          message: 'Tabela alterada com sucesso',
          schema: newSchema.data
        } 
      };
    } catch (error) {
      console.error('Erro ao alterar tabela:', error);
      return { 
        success: false, 
        error: `Erro ao alterar tabela: ${String(error)}` 
      };
    }
  }
  
  /**
   * Adiciona um índice a uma tabela
   * @param projectId ID do projeto
   * @param tableName Nome da tabela
   * @param indexName Nome do índice
   * @param columns Colunas para o índice
   * @param unique Se o índice deve ser único
   * @returns Resultado da operação
   */
  async addIndex(projectId: number, tableName: string, indexName: string, columns: string[], unique: boolean = false): Promise<QueryResult> {
    try {
      const fullTableName = this.getFullTableName(projectId, tableName);
      const fullIndexName = `idx_${projectId}_${tableName}_${indexName}`;
      
      // Verificar se a tabela existe
      const tableCheck = await db.execute<{ exists: boolean }>(sql`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.tables 
          WHERE table_schema = 'public' AND table_name = ${fullTableName}
        ) as exists
      `);
      
      if (!tableCheck.rows[0].exists) {
        return { success: false, error: `Tabela '${tableName}' não existe para o projeto ${projectId}` };
      }
      
      // Verificar se o índice já existe
      const indexCheck = await db.execute<{ exists: boolean }>(sql`
        SELECT EXISTS (
          SELECT 1 FROM pg_indexes
          WHERE tablename = ${fullTableName}
          AND indexname = ${fullIndexName}
        ) as exists
      `);
      
      if (indexCheck.rows[0].exists) {
        return { success: false, error: `Índice '${indexName}' já existe na tabela ${tableName}` };
      }
      
      // Construir a query para criar o índice
      const uniqueClause = unique ? sql`UNIQUE ` : sql``;
      const columnIdents = columns.map(col => sql.identifier(col));
      
      const createIndexQuery = sql`
        CREATE ${uniqueClause}INDEX ${sql.identifier(fullIndexName)}
        ON ${sql.identifier(fullTableName)} (${sql.join(columnIdents, sql`, `)})
      `;
      
      // Executar a query
      await db.execute(createIndexQuery);
      
      return { 
        success: true, 
        data: {
          message: `Índice '${indexName}' criado com sucesso`,
          indexName: fullIndexName,
          tableName,
          columns,
          unique
        } 
      };
    } catch (error) {
      console.error('Erro ao criar índice:', error);
      return { 
        success: false, 
        error: `Erro ao criar índice: ${String(error)}` 
      };
    }
  }
  
  /**
   * Remove um índice de uma tabela
   * @param projectId ID do projeto
   * @param tableName Nome da tabela
   * @param indexName Nome do índice
   * @returns Resultado da operação
   */
  async dropIndex(projectId: number, tableName: string, indexName: string): Promise<QueryResult> {
    try {
      const fullTableName = this.getFullTableName(projectId, tableName);
      const fullIndexName = `idx_${projectId}_${tableName}_${indexName}`;
      
      // Verificar se o índice existe
      const indexCheck = await db.execute<{ exists: boolean }>(sql`
        SELECT EXISTS (
          SELECT 1 FROM pg_indexes
          WHERE tablename = ${fullTableName}
          AND indexname = ${fullIndexName}
        ) as exists
      `);
      
      if (!indexCheck.rows[0].exists) {
        return { success: false, error: `Índice '${indexName}' não existe na tabela ${tableName}` };
      }
      
      // Construir a query para remover o índice
      const dropIndexQuery = sql`DROP INDEX ${sql.identifier(fullIndexName)}`;
      
      // Executar a query
      await db.execute(dropIndexQuery);
      
      return { 
        success: true, 
        data: {
          message: `Índice '${indexName}' removido com sucesso`
        } 
      };
    } catch (error) {
      console.error('Erro ao remover índice:', error);
      return { 
        success: false, 
        error: `Erro ao remover índice: ${String(error)}` 
      };
    }
  }
  
  /**
   * Helper para validar tipos de dados
   * @param value Valor a ser validado
   * @param dataType Tipo de dados esperado (do PostgreSQL)
   * @returns true se válido, false caso contrário
   */
  private validateDataType(value: any, dataType: string): boolean {
    // Tipo simples
    switch (dataType.toLowerCase()) {
      case 'integer':
      case 'int':
      case 'int4':
      case 'smallint':
      case 'bigint':
        return Number.isInteger(Number(value));
        
      case 'numeric':
      case 'decimal':
      case 'real':
      case 'double precision':
      case 'float':
      case 'float4':
      case 'float8':
        return !isNaN(Number(value));
        
      case 'boolean':
      case 'bool':
        return typeof value === 'boolean' || value === 'true' || value === 'false' || value === 't' || value === 'f' || value === '1' || value === '0';
        
      case 'character varying':
      case 'varchar':
      case 'character':
      case 'char':
      case 'text':
        return typeof value === 'string';
        
      case 'json':
      case 'jsonb':
        if (typeof value === 'object') return true;
        try {
          JSON.parse(value);
          return true;
        } catch {
          return false;
        }
        
      case 'timestamp':
      case 'timestamp without time zone':
      case 'timestamp with time zone':
      case 'date':
      case 'time':
        return !isNaN(Date.parse(value));
        
      case 'uuid':
        return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
        
      default:
        // Para outros tipos, aceitamos como string
        return true;
    }
  }
}

// Exporta uma instância única para uso em toda a aplicação
export const projectTableManager = new ProjectTableManager();
