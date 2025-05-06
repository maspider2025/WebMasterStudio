/**
 * Project-Database Association Module
 * 
 * Este módulo gerencia a associação entre projetos e suas tabelas de banco de dados personalizadas.
 * Permite que cada projeto tenha suas próprias tabelas isoladas, separando o banco de dados por projeto.
 */

import { pgTable, serial, text, integer, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

// Tabela para mapear projetos e suas tabelas no banco de dados
export const projectDatabases = pgTable('project_databases', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id').notNull(),
  tableName: text('table_name').notNull(),
  displayName: text('display_name').notNull(),
  description: text('description'),
  isBuiltIn: boolean('is_built_in').default(false),
  isGenerated: boolean('is_generated').default(true),
  apiEnabled: boolean('api_enabled').default(true),
  structure: jsonb('structure'),  // Armazena estrutura da tabela (colunas, tipos)
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Tabela para mapear APIs geradas para projetos
export const projectApis = pgTable('project_apis', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id').notNull(),
  apiPath: text('api_path').notNull(),
  method: text('method').notNull(),
  description: text('description'),
  isActive: boolean('is_active').default(true),
  tableId: integer('table_id'),  // FK para project_databases se associada a tabela
  isCustom: boolean('is_custom').default(false),
  configuration: jsonb('configuration'),  // Armazena configuração da API
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Definição de relacionamentos
export const projectDatabasesRelations = relations(projectDatabases, ({ many }) => ({
  apis: many(projectApis),
}));

export const projectApisRelations = relations(projectApis, ({ one }) => ({
  table: one(projectDatabases, {
    fields: [projectApis.tableId],
    references: [projectDatabases.id],
  }),
}));

// Esquemas para validação com Zod
export const projectDatabasesInsertSchema = createInsertSchema(projectDatabases);
export const projectDatabasesSelectSchema = createSelectSchema(projectDatabases);

export const projectApisInsertSchema = createInsertSchema(projectApis);
export const projectApisSelectSchema = createSelectSchema(projectApis);

// Tipos baseados nos esquemas
export type ProjectDatabase = z.infer<typeof projectDatabasesSelectSchema>;
export type InsertProjectDatabase = z.infer<typeof projectDatabasesInsertSchema>;

export type ProjectApi = z.infer<typeof projectApisSelectSchema>;
export type InsertProjectApi = z.infer<typeof projectApisInsertSchema>;

/**
 * Função auxiliar para criar o nome da tabela para um projeto
 * Garante que a tabela seja nomeada de forma consistente e única
 */
export function generateProjectTableName(projectId: number, basename: string): string {
  // Remover caracteres especiais e espaços
  const cleanBasename = basename.toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_|_$/g, '');
    
  return `p${projectId}_${cleanBasename}`;
}

/**
 * Função auxiliar para verificar se uma tabela pertence a um projeto
 */
export function isProjectTable(tableName: string, projectId: number): boolean {
  return tableName.startsWith(`p${projectId}_`);
}

/**
 * Função para gerar nome de exibição a partir do nome da tabela
 */
export function getDisplayNameFromTableName(tableName: string): string {
  // Remover prefixo p{id}_
  const displayName = tableName.replace(/^p\d+_/, '');
  
  // Transformar snake_case em título
  return displayName
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
