// Security utility functions

/**
 * HTML escaping to prevent XSS attacks
 * @param {string} str - String to be escaped
 * @returns {string} - Escaped string
 */
export const escapeHtml = (str) => {
  if (typeof str !== 'string') {
    return str
  }
  
  const htmlEscapes = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
  }
  
  return str.replace(/[&<>"'`=\/]/g, (match) => htmlEscapes[match])
}

/**
 * Remove HTML tags
 * @param {string} str - String containing HTML
 * @returns {string} - String with HTML removed
 */
export const stripHtml = (str) => {
  if (typeof str !== 'string') {
    return str
  }
  
  return str.replace(/<[^>]*>/g, '')
}

/**
 * Content filtering to prevent XSS attacks
 * @param {string} content - User input content
 * @returns {string} - Filtered safe content
 */
export const sanitizeContent = (content) => {
  if (typeof content !== 'string') {
    return content
  }
  
  // Remove dangerous HTML tags and attributes
  let sanitized = content
    // Remove script tags
    .replace(/<script[^>]*>.*?<\/script>/gis, '')
    // Remove iframe tags
    .replace(/<iframe[^>]*>.*?<\/iframe>/gis, '')
    // Remove object tags
    .replace(/<object[^>]*>.*?<\/object>/gis, '')
    // Remove embed tags
    .replace(/<embed[^>]*>/gis, '')
    // Remove link tags
    .replace(/<link[^>]*>/gis, '')
    // Remove style tags
    .replace(/<style[^>]*>.*?<\/style>/gis, '')
    // Remove meta tags
    .replace(/<meta[^>]*>/gis, '')
    // Remove javascript: protocol
    .replace(/javascript:/gi, '')
    // Remove vbscript: protocol
    .replace(/vbscript:/gi, '')
    // Remove data: protocol
    .replace(/data:/gi, '')
    // Remove event handlers
    .replace(/on\w+\s*=/gi, '')
    // Remove expression
    .replace(/expression\s*\(/gi, '')
    // Remove eval
    .replace(/eval\s*\(/gi, '')
  
  return sanitized.trim()
}

/**
 * Validate if URL is safe
 * @param {string} url - URL to be validated
 * @returns {boolean} - Whether it's a safe URL
 */
export const isValidUrl = (url) => {
  if (typeof url !== 'string') {
    return false
  }
  
  try {
    const urlObj = new URL(url)
    // Only allow http and https protocols
    return ['http:', 'https:'].includes(urlObj.protocol)
  } catch {
    return false
  }
}

/**
 * Generate random token
 * @param {number} length - Token length
 * @returns {string} - Random token
 */
export const generateToken = (length = 32) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * Generate CSRF token
 * @returns {string} - CSRF token
 */
export const generateCSRFToken = () => {
  return generateToken(40)
}

/**
 * Validate CSRF token
 * @param {string} token - Submitted token
 * @param {string} sessionToken - Token in session
 * @returns {boolean} - Validation result
 */
export const validateCSRFToken = (token, sessionToken) => {
  return token === sessionToken && token.length === 40
}

/**
 * Password hashing (simple version, should use bcrypt etc. in real applications)
 * @param {string} password - Original password
 * @param {string} salt - Salt value
 * @returns {string} - Hashed password
 */
export const hashPassword = async (password, salt = '') => {
  const encoder = new TextEncoder()
  const data = encoder.encode(password + salt)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Generate salt value
 * @returns {string} - Random salt value
 */
export const generateSalt = () => {
  return generateToken(16)
}

/**
 * Content Security Policy (CSP) header generation
 * @returns {string} - CSP policy string
 */
export const generateCSPHeader = () => {
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ')
}

/**
 * Check if input contains SQL injection patterns
 * @param {string} input - User input
 * @returns {boolean} - Whether it contains suspicious patterns
 */
export const detectSQLInjection = (input) => {
  if (typeof input !== 'string') {
    return false
  }
  
  const sqlPatterns = [
    /('|(\-\-)|(;)|(\||\|)|(\*|\*))/i,
    /(union|select|insert|delete|update|drop|create|alter|exec|execute)/i,
    /(script|javascript|vbscript|onload|onerror|onclick)/i
  ]
  
  return sqlPatterns.some(pattern => pattern.test(input))
}

/**
 * Limit string length to prevent DoS attacks
 * @param {string} str - Input string
 * @param {number} maxLength - Maximum length
 * @returns {string} - Truncated string
 */
export const limitStringLength = (str, maxLength = 1000) => {
  if (typeof str !== 'string') {
    return str
  }
  
  return str.length > maxLength ? str.substring(0, maxLength) : str
}

/**
 * Validate if file type is safe
 * @param {string} filename - Filename
 * @param {array} allowedTypes - Allowed file types
 * @returns {boolean} - Whether it's a safe file type
 */
export const isValidFileType = (filename, allowedTypes = ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx']) => {
  if (typeof filename !== 'string') {
    return false
  }
  
  const extension = filename.split('.').pop()?.toLowerCase()
  return allowedTypes.includes(extension)
}

/**
 * Validate file size
 * @param {number} fileSize - File size (bytes)
 * @param {number} maxSize - Maximum allowed size (bytes)
 * @returns {boolean} - Whether it's within allowed range
 */
export const isValidFileSize = (fileSize, maxSize = 5 * 1024 * 1024) => { // Default 5MB
  return typeof fileSize === 'number' && fileSize > 0 && fileSize <= maxSize
}

/**
 * Safe JSON parsing
 * @param {string} jsonString - JSON string
 * @returns {object|null} - Parsing result or null
 */
export const safeJSONParse = (jsonString) => {
  try {
    return JSON.parse(jsonString)
  } catch {
    return null
  }
}

/**
 * Check if it's a valid email domain
 * @param {string} email - Email address
 * @param {array} allowedDomains - List of allowed domains
 * @returns {boolean} - Whether it's an allowed domain
 */
export const isValidEmailDomain = (email, allowedDomains = []) => {
  if (typeof email !== 'string' || allowedDomains.length === 0) {
    return true // If no restrictions, allow all domains
  }
  
  const domain = email.split('@')[1]?.toLowerCase()
  return allowedDomains.includes(domain)
}

/**
 * Rate limit check (simple version)
 * @param {string} identifier - Identifier (such as IP address or user ID)
 * @param {number} limit - Limit count
 * @param {number} windowMs - Time window (milliseconds)
 * @returns {boolean} - Whether it exceeds the limit
 */
const rateLimitStore = new Map()

export const checkRateLimit = (identifier, limit = 10, windowMs = 60000) => {
  const now = Date.now()
  const key = `${identifier}_${Math.floor(now / windowMs)}`
  
  const current = rateLimitStore.get(key) || 0
  
  if (current >= limit) {
    return false // Exceeds limit
  }
  
  rateLimitStore.set(key, current + 1)
  
  // Clean up expired records
  setTimeout(() => {
    rateLimitStore.delete(key)
  }, windowMs)
  
  return true // Does not exceed limit
}

/**
 * Prevent XSS attacks - alias for sanitizeContent
 * @param {string} content - User input content
 * @returns {string} - Filtered safe content
 */
export const preventXSS = sanitizeContent

export default {
  escapeHtml,
  stripHtml,
  sanitizeContent,
  preventXSS,
  isValidUrl,
  generateToken,
  generateCSRFToken,
  validateCSRFToken,
  hashPassword,
  generateSalt,
  generateCSPHeader,
  detectSQLInjection,
  limitStringLength,
  isValidFileType,
  isValidFileSize,
  safeJSONParse,
  isValidEmailDomain,
  checkRateLimit
}