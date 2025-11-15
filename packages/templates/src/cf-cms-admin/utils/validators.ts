/**
 * CF-CMS.js Validation Utilities
 * 
 * Form validation functions and rules
 */

import { ValidationRule } from '../types'

// ============================================================================
// Built-in Validation Functions
// ============================================================================

export interface ValidationResult {
  valid: boolean
  error?: string
}

export interface ValidationContext {
  field: string
  value: any
  formData: Record<string, any>
  rules: ValidationRule[]
}

export type ValidatorFunction = (value: any, context: ValidationContext) => ValidationResult

// ============================================================================
// Required Validators
// ============================================================================

export const required: ValidatorFunction = (value, context) => {
  if (value === null || value === undefined || value === '') {
    return { valid: false, error: `${context.field} is required` }
  }
  if (Array.isArray(value) && value.length === 0) {
    return { valid: false, error: `${context.field} is required` }
  }
  return { valid: true }
}

export const requiredIf = (condition: (formData: Record<string, any>) => boolean): ValidatorFunction => {
  return (value, context) => {
    if (condition(context.formData)) {
      return required(value, context)
    }
    return { valid: true }
  }
}

export const requiredUnless = (condition: (formData: Record<string, any>) => boolean): ValidatorFunction => {
  return (value, context) => {
    if (!condition(context.formData)) {
      return required(value, context)
    }
    return { valid: true }
  }
}

// ============================================================================
// String Validators
// ============================================================================

export const minLength = (min: number): ValidatorFunction => {
  return (value, context) => {
    if (value && typeof value === 'string' && value.length < min) {
      return { valid: false, error: `${context.field} must be at least ${min} characters long` }
    }
    return { valid: true }
  }
}

export const maxLength = (max: number): ValidatorFunction => {
  return (value, context) => {
    if (value && typeof value === 'string' && value.length > max) {
      return { valid: false, error: `${context.field} must not exceed ${max} characters` }
    }
    return { valid: true }
  }
}

export const exactLength = (length: number): ValidatorFunction => {
  return (value, context) => {
    if (value && typeof value === 'string' && value.length !== length) {
      return { valid: false, error: `${context.field} must be exactly ${length} characters long` }
    }
    return { valid: true }
  }
}

export const pattern = (regex: RegExp, message?: string): ValidatorFunction => {
  return (value, context) => {
    if (value && typeof value === 'string' && !regex.test(value)) {
      return { valid: false, error: message || `${context.field} format is invalid` }
    }
    return { valid: true }
  }
}

export const email = pattern(
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  'Please enter a valid email address'
)

export const url = pattern(
  /^https?:\/\/.+/,
  'Please enter a valid URL starting with http:// or https://'
)

export const phone = pattern(
  /^\+?[\d\s\-\(\)]+$/,
  'Please enter a valid phone number'
)

export const alphanumeric = pattern(
  /^[a-zA-Z0-9]+$/,
  'Only alphanumeric characters are allowed'
)

export const alpha = pattern(
  /^[a-zA-Z]+$/,
  'Only alphabetic characters are allowed'
}

export const numeric = pattern(
  /^\d+$/,
  'Only numeric characters are allowed'
}

export const slug = pattern(
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  'Only lowercase letters, numbers, and hyphens are allowed'
)

export const uuid = pattern(
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  'Please enter a valid UUID'
)

// ============================================================================
// Number Validators
// ============================================================================

export const min = (minimum: number): ValidatorFunction => {
  return (value, context) => {
    const num = Number(value)
    if (!isNaN(num) && num < minimum) {
      return { valid: false, error: `${context.field} must be at least ${minimum}` }
    }
    return { valid: true }
  }
}

export const max = (maximum: number): ValidatorFunction => {
  return (value, context) => {
    const num = Number(value)
    if (!isNaN(num) && num > maximum) {
      return { valid: false, error: `${context.field} must not exceed ${maximum}` }
    }
    return { valid: true }
  }
}

export const range = (minimum: number, maximum: number): ValidatorFunction => {
  return (value, context) => {
    const num = Number(value)
    if (!isNaN(num) && (num < minimum || num > maximum)) {
      return { valid: false, error: `${context.field} must be between ${minimum} and ${maximum}` }
    }
    return { valid: true }
  }
}

export const positive: ValidatorFunction = (value, context) => {
  const num = Number(value)
  if (!isNaN(num) && num <= 0) {
    return { valid: false, error: `${context.field} must be positive` }
  }
  return { valid: true }
}

export const negative: ValidatorFunction = (value, context) => {
  const num = Number(value)
  if (!isNaN(num) && num >= 0) {
    return { valid: false, error: `${context.field} must be negative` }
  }
  return { valid: true }
}

export const integer: ValidatorFunction = (value, context) => {
  const num = Number(value)
  if (!isNaN(num) && !Number.isInteger(num)) {
    return { valid: false, error: `${context.field} must be an integer` }
  }
  return { valid: true }
}

export const decimal = (decimalPlaces = 2): ValidatorFunction => {
  return (value, context) => {
    const num = Number(value)
    if (!isNaN(num)) {
      const decimalPart = num.toString().split('.')[1]
      if (decimalPart && decimalPart.length > decimalPlaces) {
        return { valid: false, error: `${context.field} can have at most ${decimalPlaces} decimal places` }
      }
    }
    return { valid: true }
  }
}

// ============================================================================
// Date Validators
// ============================================================================

export const date = pattern(
  /^\d{4}-\d{2}-\d{2}$/,
  'Please enter a valid date in YYYY-MM-DD format'
)

export const datetime = pattern(
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/,
  'Please enter a valid datetime in YYYY-MM-DDTHH:mm:ss format'
)

export const minDate = (minDate: Date): ValidatorFunction => {
  return (value, context) => {
    if (value) {
      const date = new Date(value)
      if (date < minDate) {
        return { valid: false, error: `${context.field} must be on or after ${minDate.toISOString().split('T')[0]}` }
      }
    }
    return { valid: true }
  }
}

export const maxDate = (maxDate: Date): ValidatorFunction => {
  return (value, context) => {
    if (value) {
      const date = new Date(value)
      if (date > maxDate) {
        return { valid: false, error: `${context.field} must be on or before ${maxDate.toISOString().split('T')[0]}` }
      }
    }
    return { valid: true }
  }
}

export const dateRange = (minDate: Date, maxDate: Date): ValidatorFunction => {
  return (value, context) => {
    if (value) {
      const date = new Date(value)
      if (date < minDate || date > maxDate) {
        return { valid: false, error: `${context.field} must be between ${minDate.toISOString().split('T')[0]} and ${maxDate.toISOString().split('T')[0]}` }
      }
    }
    return { valid: true }
  }
}

export const futureDate: ValidatorFunction = (value, context) => {
  if (value) {
    const date = new Date(value)
    const now = new Date()
    if (date <= now) {
      return { valid: false, error: `${context.field} must be in the future` }
    }
  }
  return { valid: true }
}

export const pastDate: ValidatorFunction = (value, context) => {
  if (value) {
    const date = new Date(value)
    const now = new Date()
    if (date >= now) {
      return { valid: false, error: `${context.field} must be in the past` }
    }
  }
  return { valid: true }
}

export const age = (minAge: number, maxAge?: number): ValidatorFunction => {
  return (value, context) => {
    if (value) {
      const birthDate = new Date(value)
      const now = new Date()
      const age = Math.floor((now.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
      
      if (age < minAge) {
        return { valid: false, error: `You must be at least ${minAge} years old` }
      }
      
      if (maxAge && age > maxAge) {
        return { valid: false, error: `You must be no more than ${maxAge} years old` }
      }
    }
    return { valid: true }
  }
}

// ============================================================================
// Array Validators
// ============================================================================

export const minItems = (minimum: number): ValidatorFunction => {
  return (value, context) => {
    if (Array.isArray(value) && value.length < minimum) {
      return { valid: false, error: `${context.field} must have at least ${minimum} items` }
    }
    return { valid: true }
  }
}

export const maxItems = (maximum: number): ValidatorFunction => {
  return (value, context) => {
    if (Array.isArray(value) && value.length > maximum) {
      return { valid: false, error: `${context.field} must not have more than ${maximum} items` }
    }
    return { valid: true }
  }
}

export const exactItems = (count: number): ValidatorFunction => {
  return (value, context) => {
    if (Array.isArray(value) && value.length !== count) {
      return { valid: false, error: `${context.field} must have exactly ${count} items` }
    }
    return { valid: true }
  }
}

export const uniqueItems: ValidatorFunction = (value, context) => {
  if (Array.isArray(value)) {
    const unique = new Set(value)
    if (unique.size !== value.length) {
      return { valid: false, error: `${context.field} must contain unique items` }
    }
  }
  return { valid: true }
}

export const contains = (item: any): ValidatorFunction => {
  return (value, context) => {
    if (Array.isArray(value) && !value.includes(item)) {
      return { valid: false, error: `${context.field} must contain ${JSON.stringify(item)}` }
    }
    return { valid: true }
  }
}

export const excludes = (item: any): ValidatorFunction => {
  return (value, context) => {
    if (Array.isArray(value) && value.includes(item)) {
      return { valid: false, error: `${context.field} must not contain ${JSON.stringify(item)}` }
    }
    return { valid: true }
  }
}

// ============================================================================
// File Validators
// ============================================================================

export const fileType = (allowedTypes: string[]): ValidatorFunction => {
  return (value, context) => {
    if (value && value.type && !allowedTypes.includes(value.type)) {
      return { valid: false, error: `${context.field} must be one of the following types: ${allowedTypes.join(', ')}` }
    }
    return { valid: true }
  }
}

export const fileSize = (maxSize: number): ValidatorFunction => {
  return (value, context) => {
    if (value && value.size && value.size > maxSize) {
      const sizeMB = (maxSize / (1024 * 1024)).toFixed(2)
      return { valid: false, error: `${context.field} must not exceed ${sizeMB} MB` }
    }
    return { valid: true }
  }
}

export const imageFile: ValidatorFunction = (value, context) => {
  const imageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
  return fileType(imageTypes)(value, context)
}

export const documentFile: ValidatorFunction = (value, context) => {
  const docTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  return fileType(docTypes)(value, context)
}

// ============================================================================
// Password Validators
// ============================================================================

export const strongPassword: ValidatorFunction = (value, context) => {
  if (value) {
    const hasUpperCase = /[A-Z]/.test(value)
    const hasLowerCase = /[a-z]/.test(value)
    const hasNumbers = /\d/.test(value)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value)
    
    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
      return { valid: false, error: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character' }
    }
  }
  return { valid: true }
}

export const passwordStrength = (minStrength: number): ValidatorFunction => {
  return (value, context) => {
    if (value) {
      let strength = 0
      
      // Length bonus
      if (value.length >= 8) strength += 1
      if (value.length >= 12) strength += 1
      
      // Character variety bonus
      if (/[a-z]/.test(value)) strength += 1
      if (/[A-Z]/.test(value)) strength += 1
      if (/\d/.test(value)) strength += 1
      if (/[!@#$%^&*(),.?":{}|<>]/.test(value)) strength += 1
      
      if (strength < minStrength) {
        return { valid: false, error: `Password strength is too weak (minimum strength: ${minStrength}/5)` }
      }
    }
    return { valid: true }
  }
}

// ============================================================================
// Custom Validators
// ============================================================================

export const custom = (validator: ValidatorFunction): ValidatorFunction => {
  return validator
}

export const async = (validator: (value: any, context: ValidationContext) => Promise<ValidationResult>): ValidatorFunction => {
  return (value, context) => {
    // For sync validation, we'll just return a default result
    // The async validation should be handled separately
    return { valid: true }
  }
}

// ============================================================================
// Conditional Validators
// ============================================================================

export const when = (
  condition: (formData: Record<string, any>) => boolean,
  validator: ValidatorFunction
): ValidatorFunction => {
  return (value, context) => {
    if (condition(context.formData)) {
      return validator(value, context)
    }
    return { valid: true }
  }
}

export const unless = (
  condition: (formData: Record<string, any>) => boolean,
  validator: ValidatorFunction
): ValidatorFunction => {
  return (value, context) => {
    if (!condition(context.formData)) {
      return validator(value, context)
    }
    return { valid: true }
  }
}

// ============================================================================
// Composite Validators
// ============================================================================

export const allOf = (...validators: ValidatorFunction[]): ValidatorFunction => {
  return (value, context) => {
    for (const validator of validators) {
      const result = validator(value, context)
      if (!result.valid) {
        return result
      }
    }
    return { valid: true }
  }
}

export const anyOf = (...validators: ValidatorFunction[]): ValidatorFunction => {
  return (value, context) => {
    const errors: string[] = []
    
    for (const validator of validators) {
      const result = validator(value, context)
      if (result.valid) {
        return { valid: true }
      }
      if (result.error) {
        errors.push(result.error)
      }
    }
    
    return { valid: false, error: errors.join(' or ') }
  }
}

export const oneOf = (...validators: ValidatorFunction[]): ValidatorFunction => {
  return (value, context) => {
    let validCount = 0
    const errors: string[] = []
    
    for (const validator of validators) {
      const result = validator(value, context)
      if (result.valid) {
        validCount++
      } else if (result.error) {
        errors.push(result.error)
      }
    }
    
    if (validCount === 1) {
      return { valid: true }
    } else if (validCount === 0) {
      return { valid: false, error: errors.join(' or ') }
    } else {
      return { valid: false, error: 'Only one of the validation rules should pass' }
    }
  }
}

// ============================================================================
// Validation Rule Builder
// ============================================================================

export class ValidationRuleBuilder {
  private rules: ValidationRule[] = []

  static create(field: string): ValidationRuleBuilder {
    return new ValidationRuleBuilder(field)
  }

  constructor(private field: string) {}

  required(message?: string): ValidationRuleBuilder {
    this.rules.push({ type: 'required', message: message || `${this.field} is required` })
    return this
  }

  email(message?: string): ValidationRuleBuilder {
    this.rules.push({ type: 'email', message: message || 'Please enter a valid email address' })
    return this
  }

  minLength(min: number, message?: string): ValidationRuleBuilder {
    this.rules.push({ type: 'minLength', value: min, message: message || `${this.field} must be at least ${min} characters long` })
    return this
  }

  maxLength(max: number, message?: string): ValidationRuleBuilder {
    this.rules.push({ type: 'maxLength', value: max, message: message || `${this.field} must not exceed ${max} characters` })
    return this
  }

  pattern(regex: RegExp, message?: string): ValidationRuleBuilder {
    this.rules.push({ type: 'pattern', value: regex.source, message: message || `${this.field} format is invalid` })
    return this
  }

  min(min: number, message?: string): ValidationRuleBuilder {
    this.rules.push({ type: 'min', value: min, message: message || `${this.field} must be at least ${min}` })
    return this
  }

  max(max: number, message?: string): ValidationRuleBuilder {
    this.rules.push({ type: 'max', value: max, message: message || `${this.field} must not exceed ${max}` })
    return this
  }

  custom(validator: string, message?: string): ValidationRuleBuilder {
    this.rules.push({ type: 'custom', value: validator, message: message || `${this.field} is invalid` })
    return this
  }

  build(): ValidationRule[] {
    return [...this.rules]
  }
}

// ============================================================================
// Validation Engine
// ============================================================================

export interface ValidationError {
  field: string
  message: string
  rule: string
  value: any
}

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
  data: Record<string, any>
}

export class ValidationEngine {
  private validators: Map<string, ValidatorFunction[]> = new Map()

  registerValidator(name: string, validator: ValidatorFunction): void {
    const existing = this.validators.get(name) || []
    existing.push(validator)
    this.validators.set(name, existing)
  }

  validateField(fieldName: string, value: any, rules: ValidationRule[], formData: Record<string, any>): ValidationError[] {
    const errors: ValidationError[] = []

    for (const rule of rules) {
      const context: ValidationContext = {
        field: fieldName,
        value,
        formData,
        rules
      }

      let result: ValidationResult

      // Built-in validators
      switch (rule.type) {
        case 'required':
          result = required(value, context)
          break
        case 'email':
          result = email(value, context)
          break
        case 'minLength':
          result = minLength(rule.value as number)(value, context)
          break
        case 'maxLength':
          result = maxLength(rule.value as number)(value, context)
          break
        case 'pattern':
          result = pattern(new RegExp(rule.value as string), rule.message)(value, context)
          break
        case 'min':
          result = min(rule.value as number)(value, context)
          break
        case 'max':
          result = max(rule.value as number)(value, context)
          break
        case 'custom':
          const customValidators = this.validators.get(rule.value as string) || []
          let customResult: ValidationResult = { valid: true }
          for (const validator of customValidators) {
            customResult = validator(value, context)
            if (!customResult.valid) break
          }
          result = customResult
          break
        default:
          result = { valid: true }
      }

      if (!result.valid && result.error) {
        errors.push({
          field: fieldName,
          message: rule.message || result.error,
          rule: rule.type,
          value
        })
      }
    }

    return errors
  }

  validate(formData: Record<string, any>, schema: Record<string, ValidationRule[]>): ValidationResult {
    const errors: ValidationError[] = []

    for (const [fieldName, rules] of Object.entries(schema)) {
      const value = formData[fieldName]
      const fieldErrors = this.validateField(fieldName, value, rules, formData)
      errors.push(...fieldErrors)
    }

    return {
      valid: errors.length === 0,
      errors,
      data: formData
    }
  }
}

// ============================================================================
// Default Validation Engine Instance
// ============================================================================

export const validationEngine = new ValidationEngine()

// Register built-in validators
validationEngine.registerValidator('strongPassword', strongPassword)
validationEngine.registerValidator('url', url)
validationEngine.registerValidator('phone', phone)
validationEngine.registerValidator('uuid', uuid)
validationEngine.registerValidator('slug', slug)