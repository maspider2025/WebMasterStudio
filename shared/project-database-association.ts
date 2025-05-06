/**
 * Project Database Association Module
 * 
 * Este módulo fornece utilitários para gerenciar associações entre projetos e bancos de dados.
 * Ele garante que as tabelas sejam isoladas por projeto e facilita a descoberta e manipulação
 * de recursos específicos de cada projeto.
 */

import { db } from "@db";
import { projectDatabases, projects } from "./schema";
import { eq } from "drizzle-orm";

// Interfaces para metadados de associação
export interface ProjectDatabaseAssociation {
  projectId: number;
  tableId: number;
  tableName: string; // Nome real da tabela no banco (com prefixo)
  displayName: string; // Nome amigável para exibição
  description?: string;
  isBuiltIn: boolean; // Se é uma tabela padrão (não criada pelo usuário)
}

// Cache em memória para otimizar consultas frequentes
// Esta é uma abordagem simples de cache, sistemas mais robustos
// usariam Redis ou outra solução de cache distribuído
const tableNameCache = new Map<string, number>(); // tableName -> projectId
const projectCache = new Map<number, Set<string>>(); // projectId -> Set de tableNames

/**
 * Gera um nome de tabela prefixado para garantir isolamento por projeto
 * Este padrão é fundamental para evitar colisões entre tabelas de projetos diferentes
 */
export function generateProjectTableName(projectId: number, baseName: string): string {
  // Padronização do nome de tabela com prefixo de projeto
  return `p${projectId}_${baseName}`;
}

/**
 * Extrai o ID do projeto e o nome base da tabela a partir do nome real da tabela
 * Esta função é o inverso de generateProjectTableName
 */
export function parseProjectTableName(fullTableName: string): { projectId: number | null; baseName: string } {
  // Regex para extrair o ID do projeto e o nome base
  const match = fullTableName.match(/^p(\d+)_(.+)$/);
  if (!match) {
    return { projectId: null, baseName: fullTableName };
  }
  
  return {
    projectId: parseInt(match[1], 10),
    baseName: match[2]
  };
}

/**
 * Registra uma nova associação entre projeto e tabela
 */
export async function registerProjectTable(
  projectId: number,
  tableData: {
    displayName: string;
    tableName: string;
    description?: string;
    apiEnabled?: boolean;
    isBuiltIn?: boolean;
  }
): Promise<number> {
  try {
    // Inserir na tabela de metadados
    const [savedTable] = await db.insert(projectDatabases).values({
      projectId,
      tableName: tableData.tableName,
      displayName: tableData.displayName,
      description: tableData.description || "",
      apiEnabled: !!tableData.apiEnabled,
      isBuiltIn: !!tableData.isBuiltIn,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    
    // Atualizar o cache
    tableNameCache.set(tableData.tableName, projectId);
    
    if (!projectCache.has(projectId)) {
      projectCache.set(projectId, new Set());
    }
    projectCache.get(projectId)?.add(tableData.tableName);
    
    return savedTable.id;
  } catch (error) {
    console.error(`Erro ao registrar associação entre projeto ${projectId} e tabela ${tableData.tableName}:`, error);
    throw error;
  }
}

/**
 * Busca o ID do projeto associado a uma tabela pelo nome
 */
export async function getProjectIdForTable(tableName: string): Promise<number | null> {
  // Verificar primeiro no cache
  if (tableNameCache.has(tableName)) {
    return tableNameCache.get(tableName) || null;
  }
  
  try {
    // Em seguida, tentar extrair do nome da tabela usando o padrão
    const { projectId } = parseProjectTableName(tableName);
    if (projectId !== null) {
      // Atualizar o cache
      tableNameCache.set(tableName, projectId);
      return projectId;
    }
    
    // Por último, consultar o banco de dados
    const result = await db.query.projectDatabases.findFirst({
      where: eq(projectDatabases.tableName, tableName),
      columns: { projectId: true }
    });
    
    if (result) {
      // Atualizar o cache
      tableNameCache.set(tableName, result.projectId);
      return result.projectId;
    }
    
    return null;
  } catch (error) {
    console.error(`Erro ao buscar projeto para tabela ${tableName}:`, error);
    return null;
  }
}

/**
 * Lista todas as tabelas associadas a um projeto
 */
export async function getProjectTables(projectId: number, includeBuiltIn: boolean = true): Promise<ProjectDatabaseAssociation[]> {
  try {
    // Consultar o banco de dados
    const tables = await db.query.projectDatabases.findMany({
      where: eq(projectDatabases.projectId, projectId),
    });
    
    // Filtrar tabelas built-in se necessário
    const filteredTables = includeBuiltIn ? tables : tables.filter(t => !t.isBuiltIn);
    
    // Atualizar o cache
    if (!projectCache.has(projectId)) {
      projectCache.set(projectId, new Set());
    }
    
    const projectTableSet = projectCache.get(projectId)!;
    for (const table of tables) {
      projectTableSet.add(table.tableName);
      tableNameCache.set(table.tableName, projectId);
    }
    
    // Mapear para o formato de resposta
    return filteredTables.map(table => ({
      projectId: table.projectId,
      tableId: table.id,
      tableName: table.tableName,
      displayName: table.displayName,
      description: table.description,
      isBuiltIn: table.isBuiltIn
    }));
  } catch (error) {
    console.error(`Erro ao listar tabelas do projeto ${projectId}:`, error);
    return [];
  }
}

/**
 * Verifica se uma tabela pertence a um projeto específico
 */
export async function validateTableBelongsToProject(tableName: string, projectId: number): Promise<boolean> {
  // Primeiro tenta resolver usando o cache
  if (tableNameCache.has(tableName)) {
    return tableNameCache.get(tableName) === projectId;
  }
  
  // Em seguida, tenta extrair do nome da tabela usando o padrão
  const { projectId: extractedId } = parseProjectTableName(tableName);
  if (extractedId !== null) {
    return extractedId === projectId;
  }
  
  // Por último, consulta o banco de dados
  try {
    const result = await db.query.projectDatabases.findFirst({
      where: eq(projectDatabases.tableName, tableName),
      columns: { projectId: true }
    });
    
    return result?.projectId === projectId;
  } catch (error) {
    console.error(`Erro ao validar pertencimento da tabela ${tableName} ao projeto ${projectId}:`, error);
    return false;
  }
}

/**
 * Resolve o nome de uma tabela para o formato completo com prefixo
 * Se já estiver no formato completo, retorna o próprio valor
 */
export function resolveTableName(projectId: number, tableName: string): string {
  // Verifica se já está no formato completo
  if (tableName.match(/^p\d+_/)) {
    return tableName;
  }
  
  // Caso contrário, adiciona o prefixo
  return generateProjectTableName(projectId, tableName);
}

/**
 * Atualiza informações de uma associação de tabela
 */
export async function updateProjectTableInfo(
  tableId: number,
  updates: {
    displayName?: string;
    description?: string;
    apiEnabled?: boolean;
  }
): Promise<boolean> {
  try {
    await db.update(projectDatabases)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(projectDatabases.id, tableId));
    
    return true;
  } catch (error) {
    console.error(`Erro ao atualizar informações da tabela ${tableId}:`, error);
    return false;
  }
}

/**
 * Remove uma associação de tabela de projeto
 * ATENÇÃO: Isso não remove a tabela física do banco de dados,
 * apenas o registro de associação nos metadados
 */
export async function unregisterProjectTable(tableId: number): Promise<boolean> {
  try {
    // Buscar informações da tabela antes de remover
    const table = await db.query.projectDatabases.findFirst({
      where: eq(projectDatabases.id, tableId),
    });
    
    if (!table) {
      return false;
    }
    
    // Remover do banco de dados
    await db.delete(projectDatabases)
      .where(eq(projectDatabases.id, tableId));
    
    // Atualizar o cache
    tableNameCache.delete(table.tableName);
    projectCache.get(table.projectId)?.delete(table.tableName);
    
    return true;
  } catch (error) {
    console.error(`Erro ao remover associação de tabela ${tableId}:`, error);
    return false;
  }
}

/**
 * Busca o projeto associado a um nome de tabela e verifica se o usuário é o dono
 * Esta função é útil para implementar controle de acesso a recursos
 */
export async function validateTableAccess(
  tableName: string,
  userId: number
): Promise<{ allowed: boolean; projectId: number | null }> {
  try {
    const projectId = await getProjectIdForTable(tableName);
    
    if (projectId === null) {
      return { allowed: false, projectId: null };
    }
    
    // Buscar o projeto para verificar o dono
    const project = await db.query.projects.findFirst({
      where: eq(projects.id, projectId),
      columns: { userId: true }
    });
    
    if (!project) {
      return { allowed: false, projectId };
    }
    
    // Verificar se o usuário é o dono do projeto
    const allowed = project.userId === userId;
    
    return { allowed, projectId };
  } catch (error) {
    console.error(`Erro ao validar acesso à tabela ${tableName} para o usuário ${userId}:`, error);
    return { allowed: false, projectId: null };
  }
}

/**
 * Limpa os caches internos
 * Útil para testes e situações onde é necessário forçar uma reconexão com o banco
 */
export function clearCaches(): void {
  tableNameCache.clear();
  projectCache.clear();
}
