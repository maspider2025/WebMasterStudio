/**
 * Serviço de Validação de Dados
 * 
 * Este serviço fornece funcionalidades robustas para validação
 * de dados em vários contextos da aplicação, incluindo validação
 * de entrada de usuário, dados para persistência e validações específicas
 * para diferentes tipos de entidades.
 * 
 * Funcionalidades:
 * - Validação de tipos de dados básicos
 * - Validação de formatos (email, telefone, etc.)
 * - Validação de dados para persistência
 * - Regras de validação personalizadas por entidade
 */

/**
 * Interface para erros de validação
 */
export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

/**
 * Interface para resultado de validação
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

/**
 * Interface para regras de validação de campo
 */
export interface FieldValidationRule {
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'date' | 'email' | 'url' | 'array' | 'object';
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  enum?: any[];
  custom?: (value: any) => boolean | string;
  message?: string;
}

/**
 * Tipo para esquema de validação
 */
export type ValidationSchema = Record<string, FieldValidationRule>;

/**
 * Serviço de validação de dados
 */
export class DataValidator {
  private static EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  private static URL_REGEX = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\w\.-]*)*\/?$/;
  private static PHONE_REGEX = /^\+?\d{10,15}$/;
  
  /**
   * Valida um objeto de acordo com um esquema de validação
   * @param data Objeto a ser validado
   * @param schema Esquema de validação
   * @returns Resultado da validação
   */
  validateSchema(data: Record<string, any>, schema: ValidationSchema): ValidationResult {
    const errors: ValidationError[] = [];
    
    // Itera sobre cada campo no esquema
    for (const [field, rules] of Object.entries(schema)) {
      const value = data[field];
      
      // Verifica se o campo é obrigatório
      if (rules.required && (value === undefined || value === null || value === '')) {
        errors.push({
          field,
          message: rules.message || `O campo '${field}' é obrigatório`,
          code: 'REQUIRED'
        });
        continue;
      }
      
      // Se o valor é undefined ou null e não é obrigatório, pula as validações
      if (value === undefined || value === null) {
        continue;
      }
      
      // Valida o tipo
      if (rules.type) {
        const typeError = this.validateType(value, rules.type, field);
        if (typeError) {
          errors.push(typeError);
          continue;
        }
      }
      
      // Valida tamanho de string
      if (typeof value === 'string') {
        if (rules.minLength !== undefined && value.length < rules.minLength) {
          errors.push({
            field,
            message: rules.message || `O campo '${field}' deve ter no mínimo ${rules.minLength} caracteres`,
            code: 'MIN_LENGTH'
          });
        }
        
        if (rules.maxLength !== undefined && value.length > rules.maxLength) {
          errors.push({
            field,
            message: rules.message || `O campo '${field}' deve ter no máximo ${rules.maxLength} caracteres`,
            code: 'MAX_LENGTH'
          });
        }
        
        if (rules.pattern && !rules.pattern.test(value)) {
          errors.push({
            field,
            message: rules.message || `O campo '${field}' não está no formato correto`,
            code: 'PATTERN'
          });
        }
      }
      
      // Valida valor numérico
      if (typeof value === 'number') {
        if (rules.min !== undefined && value < rules.min) {
          errors.push({
            field,
            message: rules.message || `O campo '${field}' deve ser maior ou igual a ${rules.min}`,
            code: 'MIN_VALUE'
          });
        }
        
        if (rules.max !== undefined && value > rules.max) {
          errors.push({
            field,
            message: rules.message || `O campo '${field}' deve ser menor ou igual a ${rules.max}`,
            code: 'MAX_VALUE'
          });
        }
      }
      
      // Valida enum
      if (rules.enum && !rules.enum.includes(value)) {
        errors.push({
          field,
          message: rules.message || `O campo '${field}' deve ser um dos valores: ${rules.enum.join(', ')}`,
          code: 'ENUM'
        });
      }
      
      // Validação personalizada
      if (rules.custom) {
        const customResult = rules.custom(value);
        if (customResult !== true) {
          errors.push({
            field,
            message: typeof customResult === 'string' ? customResult : (rules.message || `O campo '${field}' não é válido`),
            code: 'CUSTOM'
          });
        }
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Valida um valor com base no tipo esperado
   * @param value Valor a ser validado
   * @param type Tipo esperado
   * @param field Nome do campo (para mensagem de erro)
   * @returns Erro de validação ou null se válido
   */
  private validateType(value: any, type: string, field: string): ValidationError | null {
    switch (type) {
      case 'string':
        if (typeof value !== 'string') {
          return {
            field,
            message: `O campo '${field}' deve ser uma string`,
            code: 'TYPE_STRING'
          };
        }
        break;
        
      case 'number':
        if (typeof value !== 'number' || isNaN(value)) {
          return {
            field,
            message: `O campo '${field}' deve ser um número`,
            code: 'TYPE_NUMBER'
          };
        }
        break;
        
      case 'boolean':
        if (typeof value !== 'boolean') {
          return {
            field,
            message: `O campo '${field}' deve ser um booleano`,
            code: 'TYPE_BOOLEAN'
          };
        }
        break;
        
      case 'date':
        if (!(value instanceof Date) && isNaN(Date.parse(value))) {
          return {
            field,
            message: `O campo '${field}' deve ser uma data válida`,
            code: 'TYPE_DATE'
          };
        }
        break;
        
      case 'email':
        if (typeof value !== 'string' || !DataValidator.EMAIL_REGEX.test(value)) {
          return {
            field,
            message: `O campo '${field}' deve ser um e-mail válido`,
            code: 'TYPE_EMAIL'
          };
        }
        break;
        
      case 'url':
        if (typeof value !== 'string' || !DataValidator.URL_REGEX.test(value)) {
          return {
            field,
            message: `O campo '${field}' deve ser uma URL válida`,
            code: 'TYPE_URL'
          };
        }
        break;
        
      case 'array':
        if (!Array.isArray(value)) {
          return {
            field,
            message: `O campo '${field}' deve ser um array`,
            code: 'TYPE_ARRAY'
          };
        }
        break;
        
      case 'object':
        if (typeof value !== 'object' || value === null || Array.isArray(value)) {
          return {
            field,
            message: `O campo '${field}' deve ser um objeto`,
            code: 'TYPE_OBJECT'
          };
        }
        break;
        
      default:
        return {
          field,
          message: `Tipo de validação '${type}' não suportado`,
          code: 'UNSUPPORTED_TYPE'
        };
    }
    
    return null;
  }
  
  /**
   * Valida um e-mail
   * @param email E-mail a ser validado
   * @returns true se válido, false caso contrário
   */
  isValidEmail(email: string): boolean {
    return DataValidator.EMAIL_REGEX.test(email);
  }
  
  /**
   * Valida uma URL
   * @param url URL a ser validada
   * @returns true se válida, false caso contrário
   */
  isValidUrl(url: string): boolean {
    return DataValidator.URL_REGEX.test(url);
  }
  
  /**
   * Valida um número de telefone
   * @param phone Número de telefone a ser validado
   * @returns true se válido, false caso contrário
   */
  isValidPhone(phone: string): boolean {
    return DataValidator.PHONE_REGEX.test(phone);
  }
  
  /**
   * Valida o formato de um CPF brasileiro
   * @param cpf CPF a ser validado
   * @returns true se válido, false caso contrário
   */
  isValidCPF(cpf: string): boolean {
    // Remove caracteres especiais
    cpf = cpf.replace(/[^\d]/g, '');
    
    // Verifica se tem 11 dígitos
    if (cpf.length !== 11) {
      return false;
    }
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1+$/.test(cpf)) {
      return false;
    }
    
    // Valida dígitos verificadores
    let sum = 0;
    let remainder;
    
    // Primeiro dígito verificador
    for (let i = 1; i <= 9; i++) {
      sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    }
    
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) {
      remainder = 0;
    }
    if (remainder !== parseInt(cpf.substring(9, 10))) {
      return false;
    }
    
    // Segundo dígito verificador
    sum = 0;
    for (let i = 1; i <= 10; i++) {
      sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    }
    
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) {
      remainder = 0;
    }
    if (remainder !== parseInt(cpf.substring(10, 11))) {
      return false;
    }
    
    return true;
  }
  
  /**
   * Valida o formato de um CNPJ brasileiro
   * @param cnpj CNPJ a ser validado
   * @returns true se válido, false caso contrário
   */
  isValidCNPJ(cnpj: string): boolean {
    // Remove caracteres especiais
    cnpj = cnpj.replace(/[^\d]/g, '');
    
    // Verifica se tem 14 dígitos
    if (cnpj.length !== 14) {
      return false;
    }
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1+$/.test(cnpj)) {
      return false;
    }
    
    // Valida dígitos verificadores
    let size = cnpj.length - 2;
    let numbers = cnpj.substring(0, size);
    const digits = cnpj.substring(size);
    let sum = 0;
    let pos = size - 7;
    
    // Primeiro dígito verificador
    for (let i = size; i >= 1; i--) {
      sum += parseInt(numbers.charAt(size - i)) * pos--;
      if (pos < 2) {
        pos = 9;
      }
    }
    
    let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(0))) {
      return false;
    }
    
    // Segundo dígito verificador
    size += 1;
    numbers = cnpj.substring(0, size);
    sum = 0;
    pos = size - 7;
    
    for (let i = size; i >= 1; i--) {
      sum += parseInt(numbers.charAt(size - i)) * pos--;
      if (pos < 2) {
        pos = 9;
      }
    }
    
    result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(1))) {
      return false;
    }
    
    return true;
  }
  
  /**
   * Valida um cartão de crédito usando o algoritmo de Luhn
   * @param cardNumber Número do cartão de crédito
   * @returns true se válido, false caso contrário
   */
  isValidCreditCard(cardNumber: string): boolean {
    // Remove espaços e traços
    cardNumber = cardNumber.replace(/[\s-]/g, '');
    
    // Verifica se contém apenas dígitos
    if (!/^\d+$/.test(cardNumber)) {
      return false;
    }
    
    // Verifica o comprimento (13-19 dígitos para a maioria dos cartões)
    if (cardNumber.length < 13 || cardNumber.length > 19) {
      return false;
    }
    
    // Algoritmo de Luhn (mod 10)
    let sum = 0;
    let alternate = false;
    
    for (let i = cardNumber.length - 1; i >= 0; i--) {
      let n = parseInt(cardNumber.substring(i, i + 1));
      
      if (alternate) {
        n *= 2;
        if (n > 9) {
          n = (n % 10) + 1;
        }
      }
      
      sum += n;
      alternate = !alternate;
    }
    
    return (sum % 10 === 0);
  }
  
  /**
   * Valida se uma data é uma data futura
   * @param date Data a ser validada
   * @returns true se for uma data futura, false caso contrário
   */
  isFutureDate(date: Date | string): boolean {
    const dateToCheck = date instanceof Date ? date : new Date(date);
    return dateToCheck > new Date();
  }
  
  /**
   * Valida se uma data é uma data de nascimento válida (idade entre 0 e 120 anos)
   * @param date Data a ser validada
   * @returns true se for uma data de nascimento válida, false caso contrário
   */
  isValidBirthDate(date: Date | string): boolean {
    const birthDate = date instanceof Date ? date : new Date(date);
    const now = new Date();
    
    // Calcula a idade
    let age = now.getFullYear() - birthDate.getFullYear();
    const monthDiff = now.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birthDate.getDate())) {
      age--;
    }
    
    // Verifica se a idade está entre 0 e 120 anos
    return age >= 0 && age <= 120;
  }
  
  /**
   * Valida uma senha baseada em critérios comuns de segurança
   * @param password Senha a ser validada
   * @param minLength Tamanho mínimo (padrão: 8)
   * @param requireSpecial Requer caractere especial (padrão: true)
   * @param requireNumber Requer número (padrão: true)
   * @param requireUppercase Requer letra maiúscula (padrão: true)
   * @returns Objeto com resultado e mensagem
   */
  validatePassword(password: string, minLength = 8, requireSpecial = true, requireNumber = true, requireUppercase = true): { valid: boolean; message?: string } {
    if (password.length < minLength) {
      return { valid: false, message: `A senha deve ter no mínimo ${minLength} caracteres` };
    }
    
    if (requireSpecial && !/[!@#$%^&*(),.?":{}|<>]/g.test(password)) {
      return { valid: false, message: 'A senha deve conter pelo menos um caractere especial' };
    }
    
    if (requireNumber && !/\d/.test(password)) {
      return { valid: false, message: 'A senha deve conter pelo menos um número' };
    }
    
    if (requireUppercase && !/[A-Z]/.test(password)) {
      return { valid: false, message: 'A senha deve conter pelo menos uma letra maiúscula' };
    }
    
    return { valid: true };
  }
  
  /**
   * Sanitiza uma string para inserção em HTML
   * @param str String a ser sanitizada
   * @returns String sanitizada
   */
  sanitizeHTML(str: string): string {
    return str.replace(/[&<>"']/g, (match) => {
      switch (match) {
        case '&': return '&amp;';
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '"': return '&quot;';
        case "'": return '&#39;';
        default: return match;
      }
    });
  }
}

// Exporta uma instância única para uso em toda a aplicação
export const dataValidator = new DataValidator();
