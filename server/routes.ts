import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertProjectSchema, insertPageSchema, insertElementSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes prefix
  const apiPrefix = '/api';

  // User routes
  app.post(`${apiPrefix}/auth/register`, async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const newUser = await storage.createUser(userData);
      res.status(201).json({
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        fullName: newUser.fullName,
        avatarUrl: newUser.avatarUrl,
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        return res.status(409).json({ message: 'Username or email already exists' });
      }
      console.error('Error creating user:', error);
      res.status(500).json({ message: 'Failed to create user' });
    }
  });

  app.post(`${apiPrefix}/auth/login`, async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await storage.getUserByUsername(username);
      
      if (!user) {
        return res.status(401).json({ message: 'Invalid username or password' });
      }
      
      const isValidPassword = await storage.validatePassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid username or password' });
      }
      
      req.session.userId = user.id;
      res.status(200).json({
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
      });
    } catch (error) {
      console.error('Error during login:', error);
      res.status(500).json({ message: 'An error occurred during login' });
    }
  });

  app.post(`${apiPrefix}/auth/logout`, (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error('Error during logout:', err);
        return res.status(500).json({ message: 'Failed to logout' });
      }
      res.status(200).json({ message: 'Logged out successfully' });
    });
  });

  // Project routes
  app.get(`${apiPrefix}/projects`, async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const projects = await storage.getProjectsByUserId(userId);
      res.status(200).json(projects);
    } catch (error) {
      console.error('Error fetching projects:', error);
      res.status(500).json({ message: 'Failed to fetch projects' });
    }
  });

  app.post(`${apiPrefix}/projects`, async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const projectData = insertProjectSchema.parse({
        ...req.body,
        userId,
      });
      
      const newProject = await storage.createProject(projectData);
      res.status(201).json(newProject);
    } catch (error) {
      console.error('Error creating project:', error);
      res.status(500).json({ message: 'Failed to create project' });
    }
  });

  app.get(`${apiPrefix}/projects/:id`, async (req, res) => {
    try {
      const userId = req.session.userId;
      const projectId = parseInt(req.params.id);
      
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const project = await storage.getProjectById(projectId);
      
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      
      if (project.userId !== userId && !project.isPublic) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      
      res.status(200).json(project);
    } catch (error) {
      console.error('Error fetching project:', error);
      res.status(500).json({ message: 'Failed to fetch project' });
    }
  });

  app.put(`${apiPrefix}/projects/:id`, async (req, res) => {
    try {
      const userId = req.session.userId;
      const projectId = parseInt(req.params.id);
      
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const project = await storage.getProjectById(projectId);
      
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      
      if (project.userId !== userId) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      
      const updatedProject = await storage.updateProject(projectId, req.body);
      res.status(200).json(updatedProject);
    } catch (error) {
      console.error('Error updating project:', error);
      res.status(500).json({ message: 'Failed to update project' });
    }
  });

  app.delete(`${apiPrefix}/projects/:id`, async (req, res) => {
    try {
      const userId = req.session.userId;
      const projectId = parseInt(req.params.id);
      
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const project = await storage.getProjectById(projectId);
      
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      
      if (project.userId !== userId) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      
      await storage.deleteProject(projectId);
      res.status(204).end();
    } catch (error) {
      console.error('Error deleting project:', error);
      res.status(500).json({ message: 'Failed to delete project' });
    }
  });

  // Page routes
  app.get(`${apiPrefix}/projects/:projectId/pages`, async (req, res) => {
    try {
      const userId = req.session.userId;
      const projectId = parseInt(req.params.projectId);
      
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const project = await storage.getProjectById(projectId);
      
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      
      if (project.userId !== userId && !project.isPublic) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      
      const pages = await storage.getPagesByProjectId(projectId);
      res.status(200).json(pages);
    } catch (error) {
      console.error('Error fetching pages:', error);
      res.status(500).json({ message: 'Failed to fetch pages' });
    }
  });

  app.post(`${apiPrefix}/projects/:projectId/pages`, async (req, res) => {
    try {
      const userId = req.session.userId;
      const projectId = parseInt(req.params.projectId);
      
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const project = await storage.getProjectById(projectId);
      
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      
      if (project.userId !== userId) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      
      const pageData = insertPageSchema.parse({
        ...req.body,
        projectId,
      });
      
      const newPage = await storage.createPage(pageData);
      res.status(201).json(newPage);
    } catch (error) {
      console.error('Error creating page:', error);
      res.status(500).json({ message: 'Failed to create page' });
    }
  });

  app.get(`${apiPrefix}/pages/:id`, async (req, res) => {
    try {
      const userId = req.session.userId;
      const pageId = parseInt(req.params.id);
      
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const page = await storage.getPageById(pageId);
      
      if (!page) {
        return res.status(404).json({ message: 'Page not found' });
      }
      
      const project = await storage.getProjectById(page.projectId);
      
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      
      if (project.userId !== userId && !project.isPublic) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      
      res.status(200).json(page);
    } catch (error) {
      console.error('Error fetching page:', error);
      res.status(500).json({ message: 'Failed to fetch page' });
    }
  });

  app.put(`${apiPrefix}/pages/:id`, async (req, res) => {
    try {
      const userId = req.session.userId;
      const pageId = parseInt(req.params.id);
      
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const page = await storage.getPageById(pageId);
      
      if (!page) {
        return res.status(404).json({ message: 'Page not found' });
      }
      
      const project = await storage.getProjectById(page.projectId);
      
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      
      if (project.userId !== userId) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      
      const updatedPage = await storage.updatePage(pageId, req.body);
      res.status(200).json(updatedPage);
    } catch (error) {
      console.error('Error updating page:', error);
      res.status(500).json({ message: 'Failed to update page' });
    }
  });

  app.delete(`${apiPrefix}/pages/:id`, async (req, res) => {
    try {
      const userId = req.session.userId;
      const pageId = parseInt(req.params.id);
      
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const page = await storage.getPageById(pageId);
      
      if (!page) {
        return res.status(404).json({ message: 'Page not found' });
      }
      
      const project = await storage.getProjectById(page.projectId);
      
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      
      if (project.userId !== userId) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      
      await storage.deletePage(pageId);
      res.status(204).end();
    } catch (error) {
      console.error('Error deleting page:', error);
      res.status(500).json({ message: 'Failed to delete page' });
    }
  });

  // Element routes
  app.get(`${apiPrefix}/pages/:pageId/elements`, async (req, res) => {
    try {
      const userId = req.session.userId;
      const pageId = parseInt(req.params.pageId);
      
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const page = await storage.getPageById(pageId);
      
      if (!page) {
        return res.status(404).json({ message: 'Page not found' });
      }
      
      const project = await storage.getProjectById(page.projectId);
      
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      
      if (project.userId !== userId && !project.isPublic) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      
      const elements = await storage.getElementsByPageId(pageId);
      res.status(200).json(elements);
    } catch (error) {
      console.error('Error fetching elements:', error);
      res.status(500).json({ message: 'Failed to fetch elements' });
    }
  });

  app.post(`${apiPrefix}/pages/:pageId/elements`, async (req, res) => {
    try {
      const userId = req.session.userId;
      const pageId = parseInt(req.params.pageId);
      
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const page = await storage.getPageById(pageId);
      
      if (!page) {
        return res.status(404).json({ message: 'Page not found' });
      }
      
      const project = await storage.getProjectById(page.projectId);
      
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      
      if (project.userId !== userId) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      
      const elementData = insertElementSchema.parse({
        ...req.body,
        pageId,
      });
      
      const newElement = await storage.createElement(elementData);
      res.status(201).json(newElement);
    } catch (error) {
      console.error('Error creating element:', error);
      res.status(500).json({ message: 'Failed to create element' });
    }
  });

  app.put(`${apiPrefix}/pages/:pageId/elements/:id`, async (req, res) => {
    try {
      const userId = req.session.userId;
      const pageId = parseInt(req.params.pageId);
      const elementId = parseInt(req.params.id);
      
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const page = await storage.getPageById(pageId);
      
      if (!page) {
        return res.status(404).json({ message: 'Page not found' });
      }
      
      const project = await storage.getProjectById(page.projectId);
      
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      
      if (project.userId !== userId) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      
      const updatedElement = await storage.updateElement(elementId, req.body);
      res.status(200).json(updatedElement);
    } catch (error) {
      console.error('Error updating element:', error);
      res.status(500).json({ message: 'Failed to update element' });
    }
  });

  app.delete(`${apiPrefix}/pages/:pageId/elements/:id`, async (req, res) => {
    try {
      const userId = req.session.userId;
      const pageId = parseInt(req.params.pageId);
      const elementId = parseInt(req.params.id);
      
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const page = await storage.getPageById(pageId);
      
      if (!page) {
        return res.status(404).json({ message: 'Page not found' });
      }
      
      const project = await storage.getProjectById(page.projectId);
      
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      
      if (project.userId !== userId) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      
      await storage.deleteElement(elementId);
      res.status(204).end();
    } catch (error) {
      console.error('Error deleting element:', error);
      res.status(500).json({ message: 'Failed to delete element' });
    }
  });

  // Templates routes
  app.get(`${apiPrefix}/templates`, async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      const templates = await storage.getTemplates(category);
      res.status(200).json(templates);
    } catch (error) {
      console.error('Error fetching templates:', error);
      res.status(500).json({ message: 'Failed to fetch templates' });
    }
  });

  app.get(`${apiPrefix}/templates/:id`, async (req, res) => {
    try {
      const templateId = parseInt(req.params.id);
      const template = await storage.getTemplateById(templateId);
      
      if (!template) {
        return res.status(404).json({ message: 'Template not found' });
      }
      
      const elements = await storage.getTemplateElementsByTemplateId(templateId);
      
      res.status(200).json({
        ...template,
        elements,
      });
    } catch (error) {
      console.error('Error fetching template:', error);
      res.status(500).json({ message: 'Failed to fetch template' });
    }
  });

  app.post(`${apiPrefix}/apply-template`, async (req, res) => {
    try {
      const userId = req.session.userId;
      const { templateId, pageId } = req.body;
      
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const page = await storage.getPageById(pageId);
      
      if (!page) {
        return res.status(404).json({ message: 'Page not found' });
      }
      
      const project = await storage.getProjectById(page.projectId);
      
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      
      if (project.userId !== userId) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      
      const template = await storage.getTemplateById(templateId);
      
      if (!template) {
        return res.status(404).json({ message: 'Template not found' });
      }
      
      const templateElements = await storage.getTemplateElementsByTemplateId(templateId);
      
      // Clear existing elements
      await storage.deleteElementsByPageId(pageId);
      
      // Create new elements from template
      const newElements = await storage.createElementsFromTemplate(pageId, templateElements);
      
      res.status(200).json({
        message: 'Template applied successfully',
        elements: newElements,
      });
    } catch (error) {
      console.error('Error applying template:', error);
      res.status(500).json({ message: 'Failed to apply template' });
    }
  });

  // Publish project
  app.post(`${apiPrefix}/projects/:id/publish`, async (req, res) => {
    try {
      const userId = req.session.userId;
      const projectId = parseInt(req.params.id);
      
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const project = await storage.getProjectById(projectId);
      
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      
      if (project.userId !== userId) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      
      // Generate a unique URL for the published project
      const publishedUrl = `site-${projectId}-${Date.now()}`;
      
      // Update project with published URL and make it public
      const updatedProject = await storage.updateProject(projectId, {
        isPublic: true,
        publishedUrl,
      });
      
      res.status(200).json({
        message: 'Project published successfully',
        publishedUrl,
      });
    } catch (error) {
      console.error('Error publishing project:', error);
      res.status(500).json({ message: 'Failed to publish project' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
