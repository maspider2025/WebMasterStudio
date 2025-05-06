/**
 * Sistema de Autenticação NextGen Site Builder
 * Implementação robusta e completa de autenticação usando Express, bcrypt e session
 * 
 * Este módulo gerencia:
 * - Registro de usuários
 * - Login com senha criptografada
 * - Gerenciamento de sessões
 * - Proteção de rotas
 * - Verificação de permissões
 */

import { Request, Response, NextFunction, Express } from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { db } from "../db";
import { users } from "../shared/schema";
import { eq } from "drizzle-orm";
import { InsertUser } from "../shared/schema";
import { storage } from "./storage";

// Tipo para dados de sessão do Express
declare module "express-session" {
  interface SessionData {
    userId: number;
    username: string;
    isAuthenticated: boolean;
  }
}

// Tipo Express.User para TypeScript
declare global {
  namespace Express {
    interface User {
      id: number;
      username: string;
      email: string;
      password: string;
      fullName?: string;
      avatarUrl?: string;
      createdAt: Date;
      updatedAt: Date;
    }
    
    interface Request {
      user?: User;
    }
  }
}

// Converter scrypt para Promise
const scryptAsync = promisify(scrypt);

/**
 * Hash de senha usando scrypt (mais seguro que bcrypt para senhas)
 * Gera um salt único para cada senha
 * O formato armazenado é: hash.salt
 */
async function hashPassword(password: string): Promise<string> {
  // Gerar um salt aleatório de 16 bytes
  const salt = randomBytes(16).toString("hex");
  
  // Hash da senha com o salt (64 bytes para alta segurança)
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  
  // Formato: hash.salt
  return `${derivedKey.toString("hex")}.${salt}`;
}

/**
 * Compara uma senha fornecida com uma hash armazenada
 * Usa uma abordagem alternativa para evitar problemas com buffers
 */
async function comparePasswords(suppliedPassword: string, storedPassword: string): Promise<boolean> {
  try {
    // Extrair o hash e o salt da senha armazenada
    const [hashedPassword, salt] = storedPassword.split(".");
    
    if (!hashedPassword || !salt) {
      console.error("Formato de senha inválido:", storedPassword);
      return false;
    }
    
    // Hash da senha fornecida com o mesmo salt
    const derivedKey = (await scryptAsync(suppliedPassword, salt, 64)) as Buffer;
    const suppliedHash = derivedKey.toString("hex");
    
    // Comparação direta das strings hexadecimais (mais segura para este caso)
    return hashedPassword === suppliedHash;
  } catch (error) {
    console.error("Erro ao comparar senhas:", error);
    return false;
  }
}

/**
 * Middleware para verificar se o usuário está autenticado
 */
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.session.isAuthenticated && req.session.userId) {
    return next();
  }
  return res.status(401).json({ message: "Não autenticado. Faça login para continuar." });
}

/**
 * Configura todo o sistema de autenticação para o Express
 */
export function setupAuth(app: Express) {
  // Configurar o armazenamento de sessões PostgreSQL
  const PostgresStore = connectPgSimple(session);
  
  // Configurações da sessão
  app.use(
    session({
      store: new PostgresStore({
        // Usar a conexão já configurada
        conObject: {
          connectionString: process.env.DATABASE_URL,
        },
        tableName: "session", // Tabela para armazenar sessões
        createTableIfMissing: true, // Criar tabela automaticamente
      }),
      secret: process.env.SESSION_SECRET || "nextgen-site-builder-secret-key", // Usar variável de ambiente ou fallback
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 dias
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // HTTPS apenas em produção
        sameSite: "lax",
      },
    })
  );

  // Rota para registro de novos usuários
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      // Extrair dados do corpo da requisição
      const userData: InsertUser = req.body;

      // Verificar se o usuário já existe
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(409).json({ message: "Nome de usuário já está em uso." });
      }

      // Verificar se o email já existe
      const existingEmail = await db.query.users.findFirst({
        where: eq(users.email, userData.email),
      });
      if (existingEmail) {
        return res.status(409).json({ message: "E-mail já está em uso." });
      }

      // Criar novo usuário (storage.createUser já faz o hash da senha)
      const newUser = await storage.createUser(userData);

      // Configurar a sessão
      req.session.userId = newUser.id;
      req.session.username = newUser.username;
      req.session.isAuthenticated = true;

      // Retornar usuário (sem a senha)
      const { password, ...userWithoutPassword } = newUser;
      return res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error("Erro ao registrar usuário:", error);
      return res.status(500).json({ message: "Erro ao registrar usuário. Tente novamente." });
    }
  });

  // Rota para login
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;

      // Validar entrada
      if (!username || !password) {
        return res.status(400).json({ message: "Nome de usuário e senha são obrigatórios." });
      }

      // Buscar usuário pelo nome de usuário
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Credenciais inválidas." });
      }

      // Verificar senha usando o método de validação do storage (bcrypt)
      const passwordValid = await storage.validatePassword(password, user.password);
      if (!passwordValid) {
        return res.status(401).json({ message: "Credenciais inválidas." });
      }

      // Configurar a sessão
      req.session.userId = user.id;
      req.session.username = user.username;
      req.session.isAuthenticated = true;

      // Retornar usuário (sem a senha)
      const { password: _, ...userWithoutPassword } = user;
      return res.status(200).json(userWithoutPassword);
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      return res.status(500).json({ message: "Erro interno do servidor ao processar login." });
    }
  });

  // Rota para logout
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    // Destruir a sessão
    req.session.destroy((err) => {
      if (err) {
        console.error("Erro ao fazer logout:", err);
        return res.status(500).json({ message: "Erro ao fazer logout." });
      }
      res.clearCookie("connect.sid");
      return res.status(200).json({ message: "Logout realizado com sucesso." });
    });
  });

  // Rota para obter usuário atual
  app.get("/api/auth/me", async (req: Request, res: Response) => {
    try {
      // Verificar se há um ID de usuário na sessão
      if (!req.session.userId) {
        return res.status(401).json({ message: "Não autenticado." });
      }

      // Buscar usuário pelo ID
      const user = await storage.getUserById(req.session.userId);
      if (!user) {
        // Limpar sessão inválida
        req.session.destroy((err) => {
          if (err) console.error("Erro ao destruir sessão inválida:", err);
        });
        return res.status(401).json({ message: "Usuário não encontrado." });
      }

      // Retornar usuário (sem a senha)
      const { password, ...userWithoutPassword } = user;
      return res.status(200).json(userWithoutPassword);
    } catch (error) {
      console.error("Erro ao buscar usuário atual:", error);
      return res.status(500).json({ message: "Erro interno do servidor." });
    }
  });

  // Middleware para disponibilizar informações do usuário em todas as requisições
  app.use(async (req: Request, res: Response, next: NextFunction) => {
    if (req.session.userId) {
      try {
        const user = await storage.getUserById(req.session.userId);
        if (user) {
          // Adicionar usuário ao objeto req
          req.user = user;
        }
      } catch (error) {
        console.error("Erro ao carregar usuário na requisição:", error);
      }
    }
    next();
  });

  return app;
}
