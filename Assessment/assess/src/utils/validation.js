// Input validation utility functions

/**
 * Email format validation
 * @param {string} email - Email address
 * @returns {boolean} - Validation result
 */
export const validateEmail = (email) => {
  const result = {
    isValid: true,
    errors: []
  }

  if (!email) {
    result.isValid = false
    result.errors.push('Email is required')
    return result
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    result.isValid = false
    result.errors.push('Please enter a valid email address')
  }

  return result
}

/**
 * Password strength validation
 * @param {string} password - Password
 * @returns {object} - Validation result and error messages
 */
export const validatePassword = (password) => {
  const result = {
    isValid: true,
    errors: []
  }

  if (!password || password.length < 8) {
    result.isValid = false
    result.errors.push('Password must be at least 8 characters long')
  }

  if (!/[A-Z]/.test(password)) {
    result.isValid = false
    result.errors.push('Password must contain at least one uppercase letter')
  }

  if (!/[a-z]/.test(password)) {
    result.isValid = false
    result.errors.push('Password must contain at least one lowercase letter')
  }

  if (!/\d/.test(password)) {
    result.isValid = false
    result.errors.push('Password must contain at least one number')
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    result.isValid = false
    result.errors.push('Password must contain at least one special character')
  }

  return result
}

/**
 * Username validation
 * @param {string} username - Username
 * @returns {object} - Validation result and error messages
 */
export const validateUsername = (username) => {
  const result = {
    isValid: true,
    errors: []
  }

  if (!username || username.length < 3) {
    result.isValid = false
    result.errors.push('Username must be at least 3 characters long')
  }

  if (username && username.length > 20) {
    result.isValid = false
    result.errors.push('Username cannot exceed 20 characters')
  }

  if (username && !/^[a-zA-Z0-9_]+$/.test(username)) {
    result.isValid = false
    result.errors.push('Username can only contain letters, numbers and underscores')
  }

  return result
}

/**
 * Phone number validation
 * @param {string} phone - Phone number
 * @returns {boolean} - Validation result
 */
export const validatePhone = (phone) => {
  const phoneRegex = /^1[3-9]\d{9}$/
  return phoneRegex.test(phone)
}

/**
 * ID card validation
 * @param {string} idCard - ID card number
 * @returns {boolean} - Validation result
 */
export const validateIdCard = (idCard) => {
  const idCardRegex = /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/
  return idCardRegex.test(idCard)
}

/**
 * Age validation
 * @param {number} age - Age
 * @returns {boolean} - Validation result
 */
export const validateAge = (age) => {
  return age >= 0 && age <= 150 && Number.isInteger(age)
}

/**
 * Rating validation
 * @param {number} rating - Rating
 * @returns {boolean} - Validation result
 */
export const validateRating = (rating) => {
  return rating >= 1 && rating <= 5 && Number.isInteger(rating)
}

/**
 * Comment content validation
 * @param {string} comment - Comment content
 * @returns {object} - Validation result and error messages
 */
export const validateComment = (comment) => {
  const result = {
    isValid: true,
    errors: []
  }

  if (!comment || comment.trim().length === 0) {
    result.isValid = false
    result.errors.push('Comment content cannot be empty')
  }

  if (comment.length > 500) {
    result.isValid = false
    result.errors.push('Comment content cannot exceed 500 characters')
  }

  // Check for sensitive words
  const sensitiveWords = ['spam', 'scam', 'bad', 'complaint']
  const hasSensitiveWord = sensitiveWords.some(word => comment.includes(word))
  if (hasSensitiveWord) {
    result.isValid = false
    result.errors.push('Comment contains inappropriate content, please modify and try again')
  }

  return result
}

/**
 * Form data sanitization and escaping
 * @param {string} input - Input data
 * @returns {string} - Sanitized data
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') {
    return input
  }
  
  // Remove HTML tags
  let sanitized = input.replace(/<[^>]*>/g, '')
  
  // Escape special characters
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
  
  return sanitized.trim()
}

/**
 * Real-time validation function
 * @param {string} field - Field name
 * @param {any} value - Field value
 * @returns {object} - Validation result
 */
export const validateField = (field, value) => {
  switch (field) {
    case 'email':
      return {
        isValid: validateEmail(value),
        message: validateEmail(value) ? '' : 'Please enter a valid email address'
      }
    case 'username':
      const usernameResult = validateUsername(value)
      return {
        isValid: usernameResult.isValid,
        message: usernameResult.isValid ? '' : usernameResult.errors.join(', ')
      }
    case 'password':
      const passwordResult = validatePassword(value)
      return {
        isValid: passwordResult.isValid,
        message: passwordResult.isValid ? '' : passwordResult.errors.join(', ')
      }
    case 'phone':
      return {
        isValid: validatePhone(value),
        message: validatePhone(value) ? '' : 'Please enter a valid phone number'
      }
    case 'idCard':
      return {
        isValid: validateIdCard(value),
        message: validateIdCard(value) ? '' : 'Please enter a valid ID card number'
      }
    case 'age':
      return {
        isValid: validateAge(value),
        message: validateAge(value) ? '' : 'Please enter a valid age (0-150)'
      }
    case 'rating':
      return {
        isValid: validateRating(value),
        message: validateRating(value) ? '' : 'Please select a rating from 1-5 stars'
      }
    case 'comment':
      const commentResult = validateComment(value)
      return {
        isValid: commentResult.isValid,
        message: commentResult.isValid ? '' : commentResult.errors.join(', ')
      }
    default:
      return {
        isValid: true,
        message: ''
      }
  }
}

/**
 * Batch form validation
 * @param {object} formData - Form data
 * @param {array} rules - Validation rules
 * @returns {object} - Validation result
 */
export const validateForm = (formData, rules) => {
  const errors = {}
  let isValid = true

  rules.forEach(rule => {
    const { field, required = false } = rule
    const value = formData[field]

    // Check required fields
    if (required && (!value || value.toString().trim() === '')) {
      errors[field] = 'This field should not be empty'
      isValid = false
      return
    }

    // If there is a value, perform field validation
    if (value) {
      const fieldValidation = validateField(field, value)
      if (!fieldValidation.isValid) {
        errors[field] = fieldValidation.message
        isValid = false
      }
    }
  })

  return {
    isValid,
    errors
  }
}

/**
 * Input filtering to prevent XSS attacks
 * @param {string} input - Input content
 * @returns {string} - Filtered content
 */
export const preventXSS = (input) => {
  if (typeof input !== 'string') {
    return input
  }

  // Remove potential XSS attack code
  return input
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/eval\(/gi, '')
    .replace(/expression\(/gi, '')
}

export default {
  validateEmail,
  validatePassword,
  validateUsername,
  validatePhone,
  validateIdCard,
  validateAge,
  validateRating,
  validateComment,
  sanitizeInput,
  validateField,
  validateForm,
  preventXSS
}