import { defineStore } from 'pinia'
import router from '../router'
import { hashPassword, generateSalt, sanitizeContent } from '@/utils/security'
import { validateEmail, validateUsername } from '@/utils/validation'

// Mock user database
const mockUsers = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@healthcharity.org',
    password: 'admin123', // In real applications, this should be a hashed password
    role: 'admin',
    phone: '13800138000',
    createdAt: new Date('2024-01-01'),
    isActive: true
  },
  {
    id: 2,
    username: 'volunteer',
    email: 'volunteer@healthcharity.org',
    password: 'volunteer123',
    role: 'volunteer',
    phone: '13800138001',
    createdAt: new Date('2024-01-02'),
    isActive: true
  },
  {
    id: 3,
    username: 'user',
    email: 'user@example.com',
    password: 'user123',
    role: 'user',
    phone: '13800138002',
    createdAt: new Date('2024-01-03'),
    isActive: true
  }
]

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isAuthenticated: localStorage.getItem('isAuthenticated') === 'true' || false,
    isAdmin: localStorage.getItem('isAdmin') === 'true' || false,
    isVolunteer: localStorage.getItem('isVolunteer') === 'true' || false,
    currentUser: JSON.parse(localStorage.getItem('currentUser')) || null,
    users: [...mockUsers], // Mock user data
    loginAttempts: JSON.parse(localStorage.getItem('loginAttempts')) || {},
    sessionTimeout: 30 * 60 * 1000, // 30-minute session timeout
    lastActivity: Date.now()
  }),
  
  getters: {
    userRole: (state) => state.currentUser?.role || 'guest',
    hasPermission: (state) => (permission) => {
      const role = state.currentUser?.role
      const permissions = {
        admin: ['read', 'write', 'delete', 'manage_users', 'manage_services', 'view_analytics'],
        volunteer: ['read', 'write', 'manage_services', 'view_basic_analytics'],
        user: ['read', 'write_reviews']
      }
      return permissions[role]?.includes(permission) || false
    },
    isSessionValid: (state) => {
      if (!state.isAuthenticated) return false
      const now = Date.now()
      return (now - state.lastActivity) < state.sessionTimeout
    }
  },
  
  actions: {
    // Update last activity time
    updateActivity() {
      this.lastActivity = Date.now()
      localStorage.setItem('lastActivity', this.lastActivity.toString())
    },
    
    // Check if session has expired
    checkSession() {
      if (this.isAuthenticated && !this.isSessionValid) {
        this.logout()
        throw new Error('Session has expired, please log in again')
      }
      this.updateActivity()
    },
    
    // Login functionality
    async login(credentials) {
      try {
        const { username, password, rememberMe } = credentials
        
        // Input validation and sanitization
        const cleanUsername = sanitizeContent(username.trim())
        const cleanPassword = password.trim()
        
        if (!cleanUsername || !cleanPassword) {
          throw new Error('Username and password cannot be empty')
        }
        
        // Check login attempt count
        const attemptKey = cleanUsername.toLowerCase()
        const attempts = this.loginAttempts[attemptKey] || { count: 0, lastAttempt: 0 }
        const now = Date.now()
        
        // Lock if more than 5 failed attempts within 15 minutes
        if (attempts.count >= 5 && (now - attempts.lastAttempt) < 15 * 60 * 1000) {
          throw new Error('Too many login attempts, please try again in 15 minutes')
        }
        
        // Reset counter (if more than 15 minutes have passed)
        if ((now - attempts.lastAttempt) >= 15 * 60 * 1000) {
          attempts.count = 0
        }
        
        // Find user
        const user = this.users.find(u => 
          (u.username.toLowerCase() === cleanUsername.toLowerCase() || 
           u.email.toLowerCase() === cleanUsername.toLowerCase()) &&
          u.isActive
        )
        
        if (!user || user.password !== cleanPassword) {
          // Record failed attempt
          attempts.count++
          attempts.lastAttempt = now
          this.loginAttempts[attemptKey] = attempts
          localStorage.setItem('loginAttempts', JSON.stringify(this.loginAttempts))
          
          throw new Error('Incorrect username or password')
        }
        
        // Login successful, clear failure records
        delete this.loginAttempts[attemptKey]
        localStorage.setItem('loginAttempts', JSON.stringify(this.loginAttempts))
        
        // Set user status
        this.isAuthenticated = true
        this.isAdmin = user.role === 'admin'
        this.isVolunteer = user.role === 'volunteer'
        this.currentUser = {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          phone: user.phone,
          createdAt: user.createdAt
        }
        
        // Save to local storage
        const storageType = rememberMe ? localStorage : sessionStorage
        storageType.setItem('isAuthenticated', 'true')
        storageType.setItem('isAdmin', this.isAdmin.toString())
        storageType.setItem('isVolunteer', this.isVolunteer.toString())
        storageType.setItem('currentUser', JSON.stringify(this.currentUser))
        
        this.updateActivity()
        
        // Redirect based on role
        const redirectPath = user.role === 'admin' ? '/admin' : '/'
        if (!router.currentRoute.value.query.redirect) {
          await router.push(redirectPath)
        }
        
        return true
        
      } catch (error) {
        console.error('Login failed:', error)
        throw error
      }
    },
    
    // Registration functionality
    async register(userData) {
      try {
        const { username, email, phone, password, age, idCard } = userData
        
        // Input validation
        const usernameValidation = validateUsername(username)
        if (!usernameValidation.isValid) {
          throw new Error(usernameValidation.errors.join(', '))
        }
        
        const emailValidation = validateEmail(email)
        if (!emailValidation.isValid) {
          throw new Error(emailValidation.errors.join(', '))
        }
        
        // Check if username and email already exist
        const existingUser = this.users.find(u => 
          u.username.toLowerCase() === username.toLowerCase() || 
          u.email.toLowerCase() === email.toLowerCase()
        )
        
        if (existingUser) {
          throw new Error('Username or email already exists')
        }
        
        // Create new user
        const newUser = {
          id: this.users.length + 1,
          username: sanitizeContent(username.trim()),
          email: sanitizeContent(email.trim()),
          phone: sanitizeContent(phone.trim()),
          password: password.trim(), // Should be hashed in real applications
          role: 'user', // Default role
          age: age || null,
          idCard: idCard ? sanitizeContent(idCard.trim()) : '',
          createdAt: new Date(),
          isActive: true
        }
        
        // Add to user list
        this.users.push(newUser)
        
        // In real applications, this should be sent to backend API
        console.log('New user registered:', newUser)
        
        return true
        
      } catch (error) {
        console.error('Registration failed:', error)
        throw error
      }
    },
    
    // Logout functionality
    logout() {
      this.isAuthenticated = false
      this.isAdmin = false
      this.isVolunteer = false
      this.currentUser = null
      
      // Clear all storage
      localStorage.removeItem('isAuthenticated')
      localStorage.removeItem('isAdmin')
      localStorage.removeItem('isVolunteer')
      localStorage.removeItem('currentUser')
      localStorage.removeItem('lastActivity')
      
      sessionStorage.removeItem('isAuthenticated')
      sessionStorage.removeItem('isAdmin')
      sessionStorage.removeItem('isVolunteer')
      sessionStorage.removeItem('currentUser')
      
      router.push('/login')
    },
    
    // Update user information
    async updateProfile(profileData) {
      try {
        if (!this.isAuthenticated || !this.currentUser) {
          throw new Error('User not logged in')
        }
        
        // Find and update user
        const userIndex = this.users.findIndex(u => u.id === this.currentUser.id)
        if (userIndex === -1) {
          throw new Error('User does not exist')
        }
        
        // Update user data
        const updatedUser = {
          ...this.users[userIndex],
          ...profileData,
          updatedAt: new Date()
        }
        
        this.users[userIndex] = updatedUser
        
        // Update current user status
        this.currentUser = {
          id: updatedUser.id,
          username: updatedUser.username,
          email: updatedUser.email,
          role: updatedUser.role,
          phone: updatedUser.phone,
          createdAt: updatedUser.createdAt
        }
        
        // Update local storage
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser))
        
        return true
        
      } catch (error) {
        console.error('Failed to update user information:', error)
        throw error
      }
    },
    
    // Initialize authentication state
    initAuth() {
      const isAuth = localStorage.getItem('isAuthenticated') || sessionStorage.getItem('isAuthenticated')
      const isAdm = localStorage.getItem('isAdmin') || sessionStorage.getItem('isAdmin')
      const isVol = localStorage.getItem('isVolunteer') || sessionStorage.getItem('isVolunteer')
      const user = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser')
      const lastAct = localStorage.getItem('lastActivity')
      
      if (isAuth === 'true' && user) {
        this.isAuthenticated = true
        this.isAdmin = isAdm === 'true'
        this.isVolunteer = isVol === 'true'
        this.currentUser = JSON.parse(user)
        this.lastActivity = lastAct ? parseInt(lastAct) : Date.now()
        
        // Check if session has expired
        try {
          this.checkSession()
        } catch (error) {
          console.warn('Session check failed:', error.message)
        }
      }
    }
  }
})