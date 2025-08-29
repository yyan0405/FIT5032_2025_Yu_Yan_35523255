import { defineStore } from 'pinia'
import router from '../router'
import { hashPassword, generateSalt, sanitizeContent } from '@/utils/security'
import { validateEmail, validateUsername } from '@/utils/validation'
import { registerUser, loginUser, logoutUser, onAuthStateChange, getCurrentUser } from '@/firebase/auth'

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
    
    // Login functionality with Firebase Auth
    async login(email, password, rememberMe = false) {
      try {
        // Input validation and sanitization
        const cleanEmail = sanitizeContent(email.trim())
        const cleanPassword = password.trim()
        
        if (!cleanEmail || !cleanPassword) {
          throw new Error('Email and password cannot be empty')
        }
        
        // Use Firebase Auth for login
        const result = await loginUser(cleanEmail, cleanPassword)
        
        if (!result.success) {
          throw new Error(result.error)
        }
        
        // Set user status
        this.isAuthenticated = true
        
        // Check if user is admin (you can customize this logic)
        const isAdminEmail = cleanEmail === 'admin@healthcharity.org'
        const isVolunteerEmail = cleanEmail === 'volunteer@healthcharity.org'
        
        this.isAdmin = isAdminEmail
        this.isVolunteer = isVolunteerEmail
        this.currentUser = {
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName || 'User',
          role: isAdminEmail ? 'admin' : (isVolunteerEmail ? 'volunteer' : 'user')
        }
        
        // Save to local storage
        const storageType = rememberMe ? localStorage : sessionStorage
        storageType.setItem('isAuthenticated', 'true')
        storageType.setItem('isAdmin', this.isAdmin.toString())
        storageType.setItem('isVolunteer', this.isVolunteer.toString())
        storageType.setItem('currentUser', JSON.stringify(this.currentUser))
        
        this.updateActivity()
        
        // Redirect based on role
        const redirectPath = this.isAdmin ? '/admin' : '/'
        if (!router.currentRoute.value.query.redirect) {
          await router.push(redirectPath)
        }
        
        return true
        
      } catch (error) {
        console.error('Login failed:', error)
        throw error
      }
    },
    
    // Registration functionality with Firebase Auth
    async register(userData) {
      try {
        const { username, email, password } = userData
        
        // Input validation
        const usernameValidation = validateUsername(username)
        if (!usernameValidation.isValid) {
          throw new Error(usernameValidation.errors.join(', '))
        }
        
        const emailValidation = validateEmail(email)
        if (!emailValidation.isValid) {
          throw new Error(emailValidation.errors.join(', '))
        }
        
        // Use Firebase Auth for registration
        const result = await registerUser(email, password, username)
        
        if (!result.success) {
          throw new Error(result.error)
        }
        
        console.log('New user registered with Firebase:', result.user)
        
        return true
        
      } catch (error) {
        console.error('Registration failed:', error)
        throw error
      }
    },
    
    // Logout functionality with Firebase Auth
    async logout() {
      try {
        // Use Firebase Auth for logout
        await logoutUser()
        
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
      } catch (error) {
        console.error('Logout failed:', error)
      }
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
    
    // Initialize authentication state with Firebase Auth
    initAuth() {
      // Set up Firebase auth state listener
      onAuthStateChange((user) => {
        if (user) {
          // User is signed in
          this.isAuthenticated = true
          
          // Check if user is admin (customize this logic as needed)
          const isAdminEmail = user.email === 'admin@healthcharity.org'
          const isVolunteerEmail = user.email === 'volunteer@healthcharity.org'
          
          this.isAdmin = isAdminEmail
          this.isVolunteer = isVolunteerEmail
          this.currentUser = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || 'User',
            role: isAdminEmail ? 'admin' : (isVolunteerEmail ? 'volunteer' : 'user')
          }
          
          // Save to localStorage
          localStorage.setItem('isAuthenticated', 'true')
          localStorage.setItem('isAdmin', this.isAdmin.toString())
          localStorage.setItem('isVolunteer', this.isVolunteer.toString())
          localStorage.setItem('currentUser', JSON.stringify(this.currentUser))
          
          this.updateActivity()
        } else {
          // User is signed out
          this.isAuthenticated = false
          this.isAdmin = false
          this.isVolunteer = false
          this.currentUser = null
          
          // Clear storage
          localStorage.removeItem('isAuthenticated')
          localStorage.removeItem('isAdmin')
          localStorage.removeItem('isVolunteer')
          localStorage.removeItem('currentUser')
        }
      })
      
      // Also check localStorage for existing session
      const isAuth = localStorage.getItem('isAuthenticated') || sessionStorage.getItem('isAuthenticated')
      const user = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser')
      const lastAct = localStorage.getItem('lastActivity')
      
      if (isAuth === 'true' && user) {
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