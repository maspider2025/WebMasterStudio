import { db } from "@db";
import * as schema from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";
import { hash, compare } from "bcrypt";

export const storage = {
  // User operations
  async createUser(userData: schema.InsertUser) {
    const hashedPassword = await hash(userData.password, 10);
    const [user] = await db.insert(schema.users).values({
      ...userData,
      password: hashedPassword,
    }).returning();
    return user;
  },

  async getUserById(id: number) {
    return await db.query.users.findFirst({
      where: eq(schema.users.id, id),
    });
  },

  async getUserByUsername(username: string) {
    return await db.query.users.findFirst({
      where: eq(schema.users.username, username),
    });
  },

  async validatePassword(plainPassword: string, hashedPassword: string) {
    return await compare(plainPassword, hashedPassword);
  },

  async updateUser(id: number, userData: Partial<schema.InsertUser>) {
    if (userData.password) {
      userData.password = await hash(userData.password, 10);
    }
    
    const [updatedUser] = await db.update(schema.users)
      .set(userData)
      .where(eq(schema.users.id, id))
      .returning();
    
    return updatedUser;
  },

  // Project operations
  async createProject(projectData: schema.InsertProject) {
    const [project] = await db.insert(schema.projects).values(projectData).returning();
    
    // Create a default homepage
    await db.insert(schema.pages).values({
      projectId: project.id,
      name: "Home",
      slug: "home",
      isHomepage: true,
    });
    
    return project;
  },

  async getProjectById(id: number) {
    return await db.query.projects.findFirst({
      where: eq(schema.projects.id, id),
    });
  },

  async getProjectsByUserId(userId: number) {
    return await db.query.projects.findMany({
      where: eq(schema.projects.userId, userId),
      orderBy: [desc(schema.projects.updatedAt)],
    });
  },

  async updateProject(id: number, projectData: Partial<schema.InsertProject>) {
    const [updatedProject] = await db.update(schema.projects)
      .set({
        ...projectData,
        updatedAt: new Date(),
      })
      .where(eq(schema.projects.id, id))
      .returning();
    
    return updatedProject;
  },

  async deleteProject(id: number) {
    // Get all pages for this project
    const pages = await db.query.pages.findMany({
      where: eq(schema.pages.projectId, id),
    });
    
    // Delete all elements for each page
    for (const page of pages) {
      await db.delete(schema.elements).where(eq(schema.elements.pageId, page.id));
    }
    
    // Delete all pages
    await db.delete(schema.pages).where(eq(schema.pages.projectId, id));
    
    // Delete the project
    await db.delete(schema.projects).where(eq(schema.projects.id, id));
  },

  // Page operations
  async createPage(pageData: schema.InsertPage) {
    const [page] = await db.insert(schema.pages).values(pageData).returning();
    return page;
  },

  async getPageById(id: number) {
    return await db.query.pages.findFirst({
      where: eq(schema.pages.id, id),
    });
  },

  async getPagesByProjectId(projectId: number) {
    return await db.query.pages.findMany({
      where: eq(schema.pages.projectId, projectId),
    });
  },

  async updatePage(id: number, pageData: Partial<schema.InsertPage>) {
    const [updatedPage] = await db.update(schema.pages)
      .set({
        ...pageData,
        updatedAt: new Date(),
      })
      .where(eq(schema.pages.id, id))
      .returning();
    
    return updatedPage;
  },

  async deletePage(id: number) {
    // Delete all elements for this page
    await db.delete(schema.elements).where(eq(schema.elements.pageId, id));
    
    // Delete the page
    await db.delete(schema.pages).where(eq(schema.pages.id, id));
  },

  // Element operations
  async createElement(elementData: schema.InsertElement) {
    const [element] = await db.insert(schema.elements).values(elementData).returning();
    return element;
  },

  async getElementById(id: number) {
    return await db.query.elements.findFirst({
      where: eq(schema.elements.id, id),
    });
  },

  async getElementsByPageId(pageId: number) {
    return await db.query.elements.findMany({
      where: eq(schema.elements.pageId, pageId),
      orderBy: [schema.elements.zIndex],
    });
  },

  async updateElement(id: number, elementData: Partial<schema.InsertElement>) {
    const [updatedElement] = await db.update(schema.elements)
      .set({
        ...elementData,
        updatedAt: new Date(),
      })
      .where(eq(schema.elements.id, id))
      .returning();
    
    return updatedElement;
  },

  async deleteElement(id: number) {
    // Delete child elements first
    const childElements = await db.query.elements.findMany({
      where: eq(schema.elements.parent, id),
    });
    
    for (const child of childElements) {
      await this.deleteElement(child.id);
    }
    
    // Delete the element
    await db.delete(schema.elements).where(eq(schema.elements.id, id));
  },

  async deleteElementsByPageId(pageId: number) {
    await db.delete(schema.elements).where(eq(schema.elements.pageId, pageId));
  },

  // Template operations
  async getTemplates(category?: string) {
    if (category) {
      return await db.query.templates.findMany({
        where: eq(schema.templates.category, category),
      });
    }
    
    return await db.query.templates.findMany();
  },

  async getTemplateById(id: number) {
    return await db.query.templates.findFirst({
      where: eq(schema.templates.id, id),
    });
  },

  async getTemplateElementsByTemplateId(templateId: number) {
    return await db.query.templateElements.findMany({
      where: eq(schema.templateElements.templateId, templateId),
      orderBy: [schema.templateElements.zIndex],
    });
  },

  async createElementsFromTemplate(pageId: number, templateElements: schema.TemplateElement[]) {
    const idMap = new Map<number, number>();
    const elements = [];
    
    // First pass: create all elements without parents
    for (const templateElement of templateElements) {
      const [element] = await db.insert(schema.elements).values({
        pageId,
        type: templateElement.type,
        name: templateElement.name,
        x: templateElement.x,
        y: templateElement.y,
        width: templateElement.width,
        height: templateElement.height,
        content: templateElement.content,
        src: templateElement.src,
        alt: templateElement.alt,
        styles: templateElement.styles,
        zIndex: templateElement.zIndex,
        visible: templateElement.visible,
        // Parent will be updated in second pass
      }).returning();
      
      idMap.set(templateElement.id, element.id);
      elements.push(element);
    }
    
    // Second pass: update parent references
    for (let i = 0; i < templateElements.length; i++) {
      const templateElement = templateElements[i];
      const element = elements[i];
      
      if (templateElement.parent) {
        const parentId = idMap.get(templateElement.parent);
        
        if (parentId) {
          await db.update(schema.elements)
            .set({ parent: parentId })
            .where(eq(schema.elements.id, element.id));
            
          element.parent = parentId;
        }
      }
    }
    
    return elements;
  }
};
