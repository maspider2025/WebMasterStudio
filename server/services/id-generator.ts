/**
 * Serviço de Geração de IDs
 * 
 * Este serviço gerencia a criação de identificadores únicos
 * para diferentes tipos de entidades no sistema.
 * 
 * Funcionalidades:
 * - Geração de IDs com prefixos por tipo de entidade
 * - Geração de IDs numéricos sequenciais em memória (útil para testes)
 * - Geração de IDs UUID compliant
 * - Validação de formato de ID
 */

import { randomBytes } from 'crypto';

/**
 * Interface para o modelo de geração de IDs
 */
export interface IdGeneratorOptions {
  prefix?: string;
  useTimestamp?: boolean;
  useRandom?: boolean;
  randomLength?: number;
  separator?: string;
}

/**
 * Tipos de entidades reconhecidas pelo sistema
 */
export enum EntityType {
  PRODUCT = 'PRD',
  USER = 'USR',
  ORDER = 'ORD',
  INVOICE = 'INV',
  CUSTOMER = 'CST',
  PROJECT = 'PRJ',
  PAGE = 'PGE',
  ELEMENT = 'ELM',
  TEMPLATE = 'TPL',
  DISCOUNT = 'DSC',
  COUPON = 'CPN',
  PAYMENT = 'PMT',
  FILE = 'FIL',
  BLOG = 'BLG',
  COMMENT = 'CMT',
  CATEGORY = 'CAT',
  TAG = 'TAG',
  CUSTOM = 'CST'
}

/**
 * Gerador de IDs com várias estratégias
 */
export class IdGenerator {
  private counters: Map<string, number> = new Map();
  
  /**
   * Gera um ID único com base nas opções fornecidas
   * @param options Opções de configuração do formato do ID
   * @returns String contendo o ID gerado
   */
  generateId(options: IdGeneratorOptions = {}): string {
    const {
      prefix = '',
      useTimestamp = true,
      useRandom = true,
      randomLength = 4,
      separator = '-'
    } = options;
    
    const parts: string[] = [];
    
    // Adicionar o prefixo (se fornecido)
    if (prefix) {
      parts.push(prefix);
    }
    
    // Adicionar timestamp
    if (useTimestamp) {
      parts.push(Date.now().toString());
    }
    
    // Adicionar parte aleatória
    if (useRandom) {
      const randomPart = Math.floor(Math.random() * Math.pow(10, randomLength))
        .toString()
        .padStart(randomLength, '0');
      parts.push(randomPart);
    }
    
    // Combinar as partes com o separador
    return parts.join(separator);
  }
  
  /**
   * Gera um ID para uma entidade específica
   * @param entityType Tipo da entidade
   * @returns String contendo o ID gerado
   */
  generateEntityId(entityType: EntityType | string): string {
    const prefix = entityType.toString();
    return this.generateId({ prefix, useTimestamp: true, useRandom: true });
  }
  
  /**
   * Gera um ID numérico sequencial para uma chave específica
   * Útil para testes ou quando precisamos de IDs numerados
   * @param key Chave para o contador
   * @returns Próximo número na sequência
   */
  getNextSequence(key: string): number {
    const currentValue = this.counters.get(key) || 0;
    const nextValue = currentValue + 1;
    this.counters.set(key, nextValue);
    return nextValue;
  }
  
  /**
   * Gera um ID no formato UUID v4
   * @returns String contendo UUID v4
   */
  generateUUID(): string {
    const bytes = randomBytes(16);
    
    // Ajusta os bits conforme UUID v4
    bytes[6] = (bytes[6] & 0x0f) | 0x40; // Versão 4
    bytes[8] = (bytes[8] & 0x3f) | 0x80; // Variante
    
    // Converte para string no formato UUID
    let uuid = '';
    for (let i = 0; i < 16; i++) {
      uuid += bytes[i].toString(16).padStart(2, '0');
      if (i === 3 || i === 5 || i === 7 || i === 9) {
        uuid += '-';
      }
    }
    
    return uuid;
  }
  
  /**
   * Verifica se um ID está no formato esperado para uma entidade
   * @param id ID a ser validado
   * @param entityType Tipo da entidade esperado
   * @returns Boolean indicando se o ID é válido
   */
  validateEntityId(id: string, entityType: EntityType | string): boolean {
    const prefix = entityType.toString();
    const pattern = new RegExp(`^${prefix}-\d+-\d+$`);
    return pattern.test(id);
  }
  
  /**
   * Gera um ID amigável para URLs (slug)
   * @param text Texto para converter em slug
   * @returns String contendo o slug
   */
  generateSlug(text: string): string {
    // Remover acentos
    const withoutAccents = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    
    // Converter para minúsculas e substituir espaços por hífens
    return withoutAccents
      .toLowerCase()
      .replace(/\s+/g, '-') // Espaços para hífens
      .replace(/[^\w\-]+/g, '') // Remover caracteres especiais
      .replace(/\-\-+/g, '-') // Evitar múltiplos hífens
      .replace(/^-+/, '') // Remover hífens do início
      .replace(/-+$/, ''); // Remover hífens do final
  }
  
  /**
   * Gera um ID para uso específico em tabelas de cada projeto
   * @param projectId ID do projeto
   * @param entityType Tipo da entidade dentro do projeto
   * @returns ID formatado com o prefixo do projeto
   */
  generateProjectEntityId(projectId: number, entityType: EntityType | string): string {
    const projectPrefix = `P${projectId}`;
    const entityPrefix = entityType.toString();
    
    return `${projectPrefix}-${entityPrefix}-${Date.now()}-${this.getRandomString(4)}`;
  }
  
  /**
   * Gera uma string aleatória
   * @param length Tamanho da string
   * @returns String aleatória
   */
  private getRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      result += chars.charAt(randomIndex);
    }
    
    return result;
  }
}

// Exporta uma instância única para uso em toda a aplicação
export const idGenerator = new IdGenerator();
