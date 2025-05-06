import { pgTable, text, serial, integer, boolean, jsonb, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Project schema
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  thumbnail: text("thumbnail"),
  isPublic: boolean("is_public").default(false),
  publishedUrl: text("published_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Page schema
export const pages = pgTable("pages", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  isHomepage: boolean("is_homepage").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Element schema
export const elements = pgTable("elements", {
  id: serial("id").primaryKey(),
  pageId: integer("page_id").references(() => pages.id).notNull(),
  type: text("type").notNull(),
  name: text("name"),
  x: integer("x").notNull(),
  y: integer("y").notNull(),
  width: integer("width").notNull(),
  height: integer("height").notNull(),
  content: text("content"),
  src: text("src"),
  alt: text("alt"),
  styles: jsonb("styles"),
  parent: integer("parent").references(() => elements.id),
  zIndex: integer("z_index").default(0),
  visible: boolean("visible").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Template schema
export const templates = pgTable("templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  thumbnail: text("thumbnail"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Template elements schema
export const templateElements = pgTable("template_elements", {
  id: serial("id").primaryKey(),
  templateId: integer("template_id").references(() => templates.id).notNull(),
  type: text("type").notNull(),
  name: text("name"),
  x: integer("x").notNull(),
  y: integer("y").notNull(),
  width: integer("width").notNull(),
  height: integer("height").notNull(),
  content: text("content"),
  src: text("src"),
  alt: text("alt"),
  styles: jsonb("styles"),
  parent: integer("parent").references(() => templateElements.id),
  zIndex: integer("z_index").default(0),
  visible: boolean("visible").default(true),
});

// Define relationships
export const usersRelations = relations(users, ({ many }) => ({
  projects: many(projects),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  user: one(users, { fields: [projects.userId], references: [users.id] }),
  pages: many(pages),
}));

export const pagesRelations = relations(pages, ({ one, many }) => ({
  project: one(projects, { fields: [pages.projectId], references: [projects.id] }),
  elements: many(elements),
}));

export const elementsRelations = relations(elements, ({ one, many }) => ({
  page: one(pages, { fields: [elements.pageId], references: [pages.id] }),
  parentElement: one(elements, { fields: [elements.parent], references: [elements.id] }),
  childElements: many(elements, { relationName: "parent_child" }),
}));

export const templatesRelations = relations(templates, ({ many }) => ({
  elements: many(templateElements),
}));

export const templateElementsRelations = relations(templateElements, ({ one, many }) => ({
  template: one(templates, { fields: [templateElements.templateId], references: [templates.id] }),
  parentElement: one(templateElements, { fields: [templateElements.parent], references: [templateElements.id] }),
  childElements: many(templateElements, { relationName: "template_parent_child" }),
}));

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  fullName: true,
  avatarUrl: true,
});

export const insertProjectSchema = createInsertSchema(projects).pick({
  userId: true,
  name: true,
  description: true,
  thumbnail: true,
  isPublic: true,
  publishedUrl: true,
});

export const insertPageSchema = createInsertSchema(pages).pick({
  projectId: true,
  name: true,
  slug: true,
  isHomepage: true,
});

export const insertElementSchema = createInsertSchema(elements).pick({
  pageId: true,
  type: true,
  name: true,
  x: true,
  y: true,
  width: true,
  height: true,
  content: true,
  src: true,
  alt: true,
  styles: true,
  parent: true,
  zIndex: true,
  visible: true,
});

export const insertTemplateSchema = createInsertSchema(templates).pick({
  name: true,
  description: true,
  category: true,
  thumbnail: true,
});

export const insertTemplateElementSchema = createInsertSchema(templateElements).pick({
  templateId: true,
  type: true,
  name: true,
  x: true,
  y: true,
  width: true,
  height: true,
  content: true,
  src: true,
  alt: true,
  styles: true,
  parent: true,
  zIndex: true,
  visible: true,
});

// Export types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

export type InsertPage = z.infer<typeof insertPageSchema>;
export type Page = typeof pages.$inferSelect;

export type InsertElement = z.infer<typeof insertElementSchema>;
export type Element = typeof elements.$inferSelect;

export type InsertTemplate = z.infer<typeof insertTemplateSchema>;
export type Template = typeof templates.$inferSelect;

export type InsertTemplateElement = z.infer<typeof insertTemplateElementSchema>;
export type TemplateElement = typeof templateElements.$inferSelect;
