/**
 * Middleware de validação para rotas da API
 */
import { Request, Response, NextFunction } from 'express';

export interface ValidationRule {
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'email' | 'phone' | 'date';
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  choices?: any[];
  custom?: (value: any) => boolean | string;
}

export interface ValidationSchema {
  [key: string]: ValidationRule;
}

export class ValidationError extends Error {
  public field: string;
  public code: string;

  constructor(message: string, field: string, code: string = 'VALIDATION_ERROR') {
    super(message);
    this.field = field;
    this.code = code;
    this.name = 'ValidationError';
  }
}

export class Validator {
  private static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private static validatePhone(phone: string): boolean {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  }

  private static validateDate(date: string): boolean {
    const dateObj = new Date(date);
    return !isNaN(dateObj.getTime());
  }

  public static validateField(value: any, rule: ValidationRule, fieldName: string): any {
    // Check if field is required
    if (rule.required && (value === undefined || value === null || value === '')) {
      throw new ValidationError(`Campo ${fieldName} é obrigatório`, fieldName, 'REQUIRED');
    }

    // If value is empty and not required, return as is
    if (!rule.required && (value === undefined || value === null || value === '')) {
      return value;
    }

    // Type validation
    if (rule.type) {
      switch (rule.type) {
        case 'string':
          if (typeof value !== 'string') {
            throw new ValidationError(`Campo ${fieldName} deve ser uma string`, fieldName, 'INVALID_TYPE');
          }
          break;
        case 'number':
          if (typeof value !== 'number' && isNaN(Number(value))) {
            throw new ValidationError(`Campo ${fieldName} deve ser um número`, fieldName, 'INVALID_TYPE');
          }
          value = Number(value);
          break;
        case 'boolean':
          if (typeof value !== 'boolean') {
            throw new ValidationError(`Campo ${fieldName} deve ser um boolean`, fieldName, 'INVALID_TYPE');
          }
          break;
        case 'email':
          if (typeof value !== 'string' || !this.validateEmail(value)) {
            throw new ValidationError(`Campo ${fieldName} deve ser um email válido`, fieldName, 'INVALID_EMAIL');
          }
          break;
        case 'phone':
          if (typeof value !== 'string' || !this.validatePhone(value)) {
            throw new ValidationError(`Campo ${fieldName} deve ser um telefone válido`, fieldName, 'INVALID_PHONE');
          }
          break;
        case 'date':
          if (typeof value !== 'string' || !this.validateDate(value)) {
            throw new ValidationError(`Campo ${fieldName} deve ser uma data válida`, fieldName, 'INVALID_DATE');
          }
          break;
      }
    }

    // String length validation
    if (rule.type === 'string' && typeof value === 'string') {
      if (rule.minLength && value.length < rule.minLength) {
        throw new ValidationError(
          `Campo ${fieldName} deve ter pelo menos ${rule.minLength} caracteres`,
          fieldName,
          'MIN_LENGTH'
        );
      }
      if (rule.maxLength && value.length > rule.maxLength) {
        throw new ValidationError(
          `Campo ${fieldName} deve ter no máximo ${rule.maxLength} caracteres`,
          fieldName,
          'MAX_LENGTH'
        );
      }
    }

    // Number range validation
    if (rule.type === 'number' && typeof value === 'number') {
      if (rule.min !== undefined && value < rule.min) {
        throw new ValidationError(
          `Campo ${fieldName} deve ser maior ou igual a ${rule.min}`,
          fieldName,
          'MIN_VALUE'
        );
      }
      if (rule.max !== undefined && value > rule.max) {
        throw new ValidationError(
          `Campo ${fieldName} deve ser menor ou igual a ${rule.max}`,
          fieldName,
          'MAX_VALUE'
        );
      }
    }

    // Pattern validation
    if (rule.pattern && typeof value === 'string') {
      if (!rule.pattern.test(value)) {
        throw new ValidationError(
          `Campo ${fieldName} não atende ao padrão exigido`,
          fieldName,
          'INVALID_PATTERN'
        );
      }
    }

    // Choices validation
    if (rule.choices && !rule.choices.includes(value)) {
      throw new ValidationError(
        `Campo ${fieldName} deve ser um dos seguintes valores: ${rule.choices.join(', ')}`,
        fieldName,
        'INVALID_CHOICE'
      );
    }

    // Custom validation
    if (rule.custom) {
      const result = rule.custom(value);
      if (result !== true) {
        const message = typeof result === 'string' ? result : `Campo ${fieldName} é inválido`;
        throw new ValidationError(message, fieldName, 'CUSTOM_VALIDATION');
      }
    }

    return value;
  }

  public static validateData(data: any, schema: ValidationSchema): any {
    const validatedData: any = {};
    const errors: ValidationError[] = [];

    // Validate each field in schema
    for (const [fieldName, rule] of Object.entries(schema)) {
      try {
        validatedData[fieldName] = this.validateField(data[fieldName], rule, fieldName);
      } catch (error) {
        if (error instanceof ValidationError) {
          errors.push(error);
        }
      }
    }

    if (errors.length > 0) {
      const errorMessage = errors.map(e => e.message).join(', ');
      const error = new ValidationError(errorMessage, 'validation', 'MULTIPLE_ERRORS');
      (error as any).errors = errors;
      throw error;
    }

    return validatedData;
  }
}

/**
 * Middleware para validar dados da requisição
 */
export function validateRequest(schema: ValidationSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = Validator.validateData(req.body, schema);
      (req as any).validatedData = validatedData;
      next();
    } catch (error) {
      if (error instanceof ValidationError) {
        const errors = (error as any).errors || [error];
        return res.status(400).json({
          error: 'Dados inválidos',
          code: 'VALIDATION_ERROR',
          details: {
            validation_errors: errors.map((e: ValidationError) => ({
              field: e.field,
              message: e.message,
              code: e.code
            }))
          }
        });
      }
      
      console.error('Validation error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
}

/**
 * Middleware para validar parâmetros da URL
 */
export function validateParams(schema: ValidationSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedParams = Validator.validateData(req.params, schema);
      (req as any).validatedParams = validatedParams;
      next();
    } catch (error) {
      if (error instanceof ValidationError) {
        const errors = (error as any).errors || [error];
        return res.status(400).json({
          error: 'Parâmetros inválidos',
          code: 'VALIDATION_ERROR',
          details: {
            validation_errors: errors.map((e: ValidationError) => ({
              field: e.field,
              message: e.message,
              code: e.code
            }))
          }
        });
      }
      
      console.error('Params validation error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
}

// Schemas de validação comuns
export const commonSchemas = {
  id: {
    id: { type: 'string', pattern: /^\d+$/, required: true }
  },
  
  user: {
    email: { type: 'string', pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, required: true },
    password: { type: 'string', minLength: 6, required: true },
    name: { type: 'string', minLength: 2, maxLength: 100, required: true },
    role: { type: 'string', choices: ['admin', 'physiotherapist', 'patient'], required: true },
    phone: { type: 'string', pattern: /^\+?[1-9]\d{1,14}$/, required: false }
  },
  
  patient: {
    name: { type: 'string', minLength: 2, maxLength: 100, required: true },
    email: { type: 'string', pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, required: true },
    phone: { type: 'string', pattern: /^\+?[1-9]\d{1,14}$/, required: false },
    birth_date: { type: 'string', pattern: /^\d{4}-\d{2}-\d{2}$/, required: true },
    medical_history: { type: 'string', maxLength: 2000, required: false },
    emergency_contact: { type: 'string', maxLength: 200, required: false }
  },
  
  appointment: {
    patient_id: { type: 'number', min: 1, required: true },
    physiotherapist_id: { type: 'number', min: 1, required: true },
    date_time: { type: 'string', pattern: /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/, required: true },
    duration: { type: 'number', min: 15, max: 240, required: true },
    type: { type: 'string', choices: ['consultation', 'treatment', 'evaluation', 'follow_up'], required: false },
    notes: { type: 'string', maxLength: 1000, required: false }
  },
  
  exercise: {
    name: { type: 'string', minLength: 2, maxLength: 200, required: true },
    description: { type: 'string', minLength: 10, maxLength: 2000, required: true },
    category: { type: 'string', choices: ['strength', 'flexibility', 'balance', 'cardio', 'rehabilitation', 'mobility'], required: true },
    difficulty: { type: 'string', choices: ['beginner', 'intermediate', 'advanced'], required: true },
    duration: { type: 'number', min: 0, max: 3600, required: false },
    instructions: { type: 'string', maxLength: 5000, required: false },
    video_url: { type: 'string', pattern: /^https?:\/\/.+/, required: false },
    image_url: { type: 'string', pattern: /^https?:\/\/.+/, required: false }
  }
};