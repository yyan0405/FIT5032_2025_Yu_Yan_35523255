<template>
  <div class="login-form">
    <div class="form-container">
      <div class="form-header">
        <h2>Login Account</h2>
        <p>Welcome back to Health Care Charity Organization</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form-content" novalidate>
        <!-- Username/Email input -->
        <div class="form-group">
          <label for="username">Username or Email</label>
          <input
            id="username"
            v-model="formData.username"
            type="text"
            placeholder="Please enter username or email"
            :class="{ 'error': errors.username }"
            @blur="validateField('username')"
            @input="clearError('username')"
          />
          <span v-if="errors.username" class="error-message">{{ errors.username }}</span>
        </div>

        <!-- Password input -->
        <div class="form-group">
          <label for="password">Password</label>
          <div class="password-input">
            <input
              id="password"
              v-model="formData.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Please enter password"
              :class="{ 'error': errors.password }"
              @blur="validateField('password')"
              @input="clearError('password')"
            />
            <button
              type="button"
              class="password-toggle"
              @click="togglePassword"
              :aria-label="showPassword ? 'Hide password' : 'Show password'"
            >
              <i :class="showPassword ? 'icon-eye-off' : 'icon-eye'"></i>
            </button>
          </div>
          <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
        </div>

        <!-- Remember me -->
        <div class="form-group checkbox-group">
          <label class="checkbox-label">
            <input
              v-model="formData.rememberMe"
              type="checkbox"
              class="checkbox"
            />
            <span class="checkmark"></span>
            Remember me
          </label>
        </div>

        <!-- Error message display -->
        <div v-if="loginError" class="error-alert">
          <i class="icon-alert"></i>
          {{ loginError }}
        </div>

        <!-- Submit button -->
        <button
          type="submit"
          class="submit-btn"
          :disabled="isLoading || !isFormValid"
        >
          <span v-if="isLoading" class="loading-spinner"></span>
          {{ isLoading ? 'Logging in...' : 'Login' }}
        </button>

        <!-- Other options -->
        <div class="form-footer">
          <router-link to="/forgot-password" class="forgot-link">
            Forgot password?
          </router-link>
          <div class="register-link">
            Don't have an account yet?
            <router-link to="/register">Register Now</router-link>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { validateEmail, validatePassword, sanitizeInput } from '@/utils/validation'
import { escapeHtml, checkRateLimit } from '@/utils/security'

const router = useRouter()
const authStore = useAuthStore()

// Form data
const formData = reactive({
  username: '',
  password: '',
  rememberMe: false
})

// Form state
const showPassword = ref(false)
const isLoading = ref(false)
const loginError = ref('')
const errors = reactive({
  username: '',
  password: ''
})

// Computed properties
const isFormValid = computed(() => {
  return formData.username.trim() && 
         formData.password.trim() && 
         !errors.username && 
         !errors.password
})

// Methods
const togglePassword = () => {
  showPassword.value = !showPassword.value
}

const validateField = (field) => {
  const value = formData[field].trim()
  
  switch (field) {
    case 'username':
      if (!value) {
        errors.username = 'Username or email should not be empty'
      } else if (value.includes('@')) {
        // If contains @, validate as email
        if (!validateEmail(value)) {
          errors.username = 'Please enter a valid email address'
        } else {
          errors.username = ''
        }
      } else {
        // Validate as username
        if (value.length < 3) {
          errors.username = 'Username must be at least 3 characters'
        } else if (!/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/.test(value)) {
          errors.username = 'Username can only contain letters, numbers, underscores and Chinese characters'
        } else {
          errors.username = ''
        }
      }
      break
      
    case 'password':
      if (!value) {
        errors.password = 'Password should not be empty'
      } else {
        const passwordValidation = validatePassword(value)
        if (!passwordValidation.isValid) {
          errors.password = passwordValidation.errors.join(', ')
        } else {
          errors.password = ''
        }
      }
      break
  }
}

const clearError = (field) => {
  if (errors[field]) {
    errors[field] = ''
  }
  if (loginError.value) {
    loginError.value = ''
  }
}

const handleLogin = async () => {
  // Validate all fields
  validateField('username')
  validateField('password')
  
  if (!isFormValid.value) {
    return
  }
  
  // Rate limit check
  const clientId = 'login_' + (navigator.userAgent || 'unknown')
  if (!checkRateLimit(clientId, 5, 300000)) { // 5次/5分钟
    loginError.value = 'Too many login attempts, please try again later'
    return
  }
  
  isLoading.value = true
  loginError.value = ''
  
  try {
    // Clean input data
    const cleanUsername = sanitizeInput(formData.username.trim())
    const cleanPassword = formData.password.trim()
    
    // Call login
    await authStore.login({
      username: cleanUsername,
      password: cleanPassword,
      rememberMe: formData.rememberMe
    })
    
    // Login successful, redirect
    const redirectTo = router.currentRoute.value.query.redirect || '/'
    await router.push(redirectTo)
    
  } catch (error) {
    console.error('Login failed:', error)
    loginError.value = error.message || 'Login failed, please check your username and password'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.login-form {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  padding: 2rem;
}

.form-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  padding: 3rem;
  width: 100%;
  max-width: 400px;
  border: 1px solid #e1e5e9;
}

.form-header {
  text-align: center;
  margin-bottom: 2rem;
}

.form-header h2 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
  font-size: 1.8rem;
  font-weight: 600;
}

.form-header p {
  color: #6c757d;
  font-size: 0.9rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #374151;
  font-weight: 500;
  font-size: 0.9rem;
}

.form-group input[type="text"],
.form-group input[type="password"] {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background-color: #fafafa;
}

.form-group input:focus {
  outline: none;
  border-color: #3b82f6;
  background-color: white;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-group input.error {
  border-color: #ef4444;
  background-color: #fef2f2;
}

.password-input {
  position: relative;
}

.password-toggle {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: color 0.2s ease;
}

.password-toggle:hover {
  color: #374151;
}

.checkbox-group {
  margin-bottom: 1rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 0.9rem;
  color: #374151;
}

.checkbox {
  margin-right: 0.5rem;
}

.error-message {
  color: #ef4444;
  font-size: 0.8rem;
  margin-top: 0.25rem;
  display: block;
}

.error-alert {
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  font-size: 0.9rem;
}

.error-alert i {
  margin-right: 0.5rem;
}

.submit-btn {
  width: 100%;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  border: none;
  padding: 0.875rem 1rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.submit-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #2563eb, #1e40af);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.submit-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.loading-spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.form-footer {
  margin-top: 1.5rem;
  text-align: center;
}

.forgot-link {
  color: #3b82f6;
  text-decoration: none;
  font-size: 0.9rem;
  display: block;
  margin-bottom: 1rem;
  transition: color 0.2s ease;
}

.forgot-link:hover {
  color: #1d4ed8;
  text-decoration: underline;
}

.register-link {
  color: #6b7280;
  font-size: 0.9rem;
}

.register-link a {
  color: #3b82f6;
  text-decoration: none;
  font-weight: 500;
  margin-left: 0.25rem;
  transition: color 0.2s ease;
}

.register-link a:hover {
  color: #1d4ed8;
  text-decoration: underline;
}

/* 图标样式 */
.icon-eye::before {
  content: '👁';
}

.icon-eye-off::before {
  content: '🙈';
}

.icon-alert::before {
  content: '⚠️';
}

/* 响应式设计 */
@media (max-width: 768px) {
  .login-form {
    padding: 1rem;
    min-height: 70vh;
  }
  
  .form-container {
    padding: 2rem 1.5rem;
    box-shadow: none;
    border: none;
  }
  
  .form-header h2 {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .form-container {
    padding: 1.5rem 1rem;
  }
  
  .form-header h2 {
    font-size: 1.3rem;
  }
}
</style>