export interface ValidationError {
  field: string
  message: string
}

export interface ContactValidation {
  email: string
  phone?: string
  company?: string
  position?: string
}

export function validateContact(data: ContactValidation): ValidationError[] {
  const errors: ValidationError[] = []

  // Email validation
  if (!data.email) {
    errors.push({ field: 'email', message: 'Email is required' })
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push({ field: 'email', message: 'Invalid email format' })
  }

  // Phone validation (if provided)
  if (data.phone && !/^\+?[\d\s-()]+$/.test(data.phone)) {
    errors.push({ field: 'phone', message: 'Invalid phone format' })
  }

  return errors
} 