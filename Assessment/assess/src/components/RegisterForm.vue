<template>
  <div class="register-form">
    <div class="form-container">
      <div class="form-header">
        <h2>Register Account</h2>
        <p>Join Health Care Charity Organization to care for vulnerable groups together</p>
      </div>

      <form @submit.prevent="handleRegister" class="register-form-content" novalidate>
        <!-- Username input -->
        <div class="form-group">
          <label for="username">Username *</label>
          <input
            id="username"
            v-model="formData.username"
            type="text"
            placeholder="Please enter username (3-20 characters)"
            :class="{ 'error': errors.username, 'success': validFields.username }"
            @blur="validateField('username')"
            @input="handleInput('username')"
          />
          <span v-if="errors.username" class="error-message">{{ errors.username }}</span>
          <span v-else-if="validFields.username" class="success-message">✓ Username available</span>
        </div>

        <!-- Email input -->
        <div class="form-group">
          <label for="email">Email Address *</label>
          <input
            id="email"
            v-model="formData.email"
            type="email"
            placeholder="Please enter email address"
            :class="{ 'error': errors.email, 'success': validFields.email }"
            @blur="validateField('email')"
            @input="handleInput('email')"
          />
          <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
          <span v-else-if="validFields.email" class="success-message">✓ Email format correct</span>
        </div>

        <!-- Phone number input -->
        <div class="form-group">
          <label for="phone">Phone Number *</label>
          <input
            id="phone"
            v-model="formData.phone"
            type="tel"
            placeholder="Please enter 11-digit phone number"
            :class="{ 'error': errors.phone, 'success': validFields.phone }"
            @blur="validateField('phone')"
            @input="handleInput('phone')"
            maxlength="11"
          />
          <span v-if="errors.phone" class="error-message">{{ errors.phone }}</span>
          <span v-else-if="validFields.phone" class="success-message">✓ Phone number format correct</span>
        </div>

        <!-- Password input -->
        <div class="form-group">
          <label for="password">Password *</label>
          <div class="password-input">
            <input
              id="password"
              v-model="formData.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Please enter password (at least 8 characters, including letters and numbers)"
              :class="{ 'error': errors.password, 'success': validFields.password }"
              @blur="validateField('password')"
              @input="handleInput('password')"
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
          <div class="password-strength">
            <div class="strength-bar">
              <div 
                class="strength-fill" 
                :class="passwordStrength.class"
                :style="{ width: passwordStrength.width }"
              ></div>
            </div>
            <span class="strength-text">{{ passwordStrength.text }}</span>
          </div>
          <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
        </div>

        <!-- Confirm password input -->
        <div class="form-group">
          <label for="confirmPassword">Confirm Password *</label>
          <div class="password-input">
            <input
              id="confirmPassword"
              v-model="formData.confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              placeholder="Please enter password again"
              :class="{ 'error': errors.confirmPassword, 'success': validFields.confirmPassword }"
              @blur="validateField('confirmPassword')"
              @input="handleInput('confirmPassword')"
            />
            <button
              type="button"
              class="password-toggle"
              @click="toggleConfirmPassword"
              :aria-label="showConfirmPassword ? 'Hide password' : 'Show password'"
            >
              <i :class="showConfirmPassword ? 'icon-eye-off' : 'icon-eye'"></i>
            </button>
          </div>
          <span v-if="errors.confirmPassword" class="error-message">{{ errors.confirmPassword }}</span>
          <span v-else-if="validFields.confirmPassword" class="success-message">✓ Passwords match</span>
        </div>

        <!-- Age input -->
        <div class="form-group">
          <label for="age">Age</label>
          <input
            id="age"
            v-model.number="formData.age"
            type="number"
            placeholder="Please enter age (optional)"
            min="1"
            max="120"
            :class="{ 'error': errors.age, 'success': validFields.age }"
            @blur="validateField('age')"
            @input="handleInput('age')"
          />
          <span v-if="errors.age" class="error-message">{{ errors.age }}</span>
        </div>

        <!-- ID card input (optional) -->
        <div class="form-group">
          <label for="idCard">ID Card Number (Optional)</label>
          <input
            id="idCard"
            v-model="formData.idCard"
            type="text"
            placeholder="Please enter 18-digit ID card number (optional)"
            maxlength="18"
            :class="{ 'error': errors.idCard, 'success': validFields.idCard }"
            @blur="validateField('idCard')"
            @input="handleInput('idCard')"
          />
          <span v-if="errors.idCard" class="error-message">{{ errors.idCard }}</span>
          <span v-else-if="validFields.idCard" class="success-message">✓ ID card number format correct</span>
        </div>

        <!-- User agreement -->
        <div class="form-group checkbox-group">
          <label class="checkbox-label">
            <input
              v-model="formData.agreeTerms"
              type="checkbox"
              class="checkbox"
            />
            <span class="checkmark"></span>
            I have read and agree to
            <a href="/terms" target="_blank" class="terms-link">Terms of Service</a>
            and
            <a href="/privacy" target="_blank" class="terms-link">Privacy Policy</a>
          </label>
          <span v-if="errors.agreeTerms" class="error-message">{{ errors.agreeTerms }}</span>
        </div>

        <!-- Error message display -->
        <div v-if="registerError" class="error-alert">
          <i class="icon-alert"></i>
          {{ registerError }}
        </div>

        <!-- Submit button -->
        <button
          type="submit"
          class="submit-btn"
          :disabled="isLoading || !isFormValid"
        >
          <span v-if="isLoading" class="loading-spinner"></span>
          {{ isLoading ? 'Registering...' : 'Register Account' }}
        </button>

        <!-- Other options -->
        <div class="form-footer">
          <div class="login-link">
            Already have an account?
            <router-link to="/login">Login Now</router-link>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { 
  validateEmail, 
  validatePassword, 
  validateUsername, 
  validatePhone, 
  validateIdCard, 
  validateAge,
  sanitizeInput 
} from '@/utils/validation'
import { escapeHtml, checkRateLimit } from '@/utils/security'

const router = useRouter()
const authStore = useAuthStore()

// Form data
const formData = reactive({
  username: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  age: null,
  idCard: '',
  agreeTerms: false
})

// Form state
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const isLoading = ref(false)
const registerError = ref('')
const errors = reactive({
  username: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  age: '',
  idCard: '',
  agreeTerms: ''
})

const validFields = reactive({
  username: false,
  email: false,
  phone: false,
  password: false,
  confirmPassword: false,
  age: false,
  idCard: false
})

// Password strength calculation
const passwordStrength = computed(() => {
  const password = formData.password
  if (!password) {
    return { width: '0%', class: '', text: '' }
  }
  
  let score = 0
  let feedback = []
  
  // Length check
  if (password.length >= 8) score += 1
  else feedback.push('At least 8 characters')
  
  // Contains lowercase letters
  if (/[a-z]/.test(password)) score += 1
  else feedback.push('Contains lowercase letters')
  
  // Contains uppercase letters
  if (/[A-Z]/.test(password)) score += 1
  else feedback.push('Contains uppercase letters')
  
  // Contains numbers
  if (/\d/.test(password)) score += 1
  else feedback.push('Contains numbers')
  
  // Contains special characters
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1
  else feedback.push('Contains special characters')
  
  const strengthLevels = [
    { width: '20%', class: 'very-weak', text: 'Very Weak' },
    { width: '40%', class: 'weak', text: 'Weak' },
    { width: '60%', class: 'medium', text: 'Medium' },
    { width: '80%', class: 'strong', text: 'Strong' },
    { width: '100%', class: 'very-strong', text: 'Very Strong' }
  ]
  
  return strengthLevels[Math.min(score, 4)]
})

// Computed properties
const isFormValid = computed(() => {
  const requiredFields = ['username', 'email', 'phone', 'password', 'confirmPassword']
  const hasRequiredFields = requiredFields.every(field => formData[field].trim())
  const hasNoErrors = Object.values(errors).every(error => !error)
  return hasRequiredFields && hasNoErrors && formData.agreeTerms
})

// Methods
const togglePassword = () => {
  showPassword.value = !showPassword.value
}

const toggleConfirmPassword = () => {
  showConfirmPassword.value = !showConfirmPassword.value
}

const handleInput = (field) => {
  // Clear error messages in real time
  if (errors[field]) {
    errors[field] = ''
  }
  if (registerError.value) {
    registerError.value = ''
  }
  
  // Real-time validation (delayed execution)
  clearTimeout(window.validationTimeout)
  window.validationTimeout = setTimeout(() => {
    validateField(field)
  }, 500)
}

const validateField = (field) => {
  const value = typeof formData[field] === 'string' ? formData[field].trim() : formData[field]
  
  switch (field) {
    case 'username':
      if (!value) {
        errors.username = 'Username should not be empty'
        validFields.username = false
      } else if (!validateUsername(value)) {
        errors.username = 'Username format incorrect (3-20 characters, can only contain letters, numbers, underscores and Chinese characters)'
        validFields.username = false
      } else {
        errors.username = ''
        validFields.username = true
      }
      break
      
    case 'email':
      if (!value) {
        errors.email = 'Email should not be empty'
        validFields.email = false
      } else if (!validateEmail(value)) {
        errors.email = 'Please enter a valid email address'
        validFields.email = false
      } else {
        errors.email = ''
        validFields.email = true
      }
      break
      
    case 'phone':
      if (!value) {
        errors.phone = 'Phone number should not be empty'
        validFields.phone = false
      } else if (!validatePhone(value)) {
        errors.phone = 'Please enter a valid 11-digit phone number'
        validFields.phone = false
      } else {
        errors.phone = ''
        validFields.phone = true
      }
      break
      
    case 'password':
      if (!value) {
        errors.password = 'Password should not be empty'
        validFields.password = false
      } else {
        const passwordValidation = validatePassword(value)
        if (!passwordValidation.isValid) {
          errors.password = passwordValidation.errors.join(', ')
          validFields.password = false
        } else {
          errors.password = ''
          validFields.password = true
          // Re-validate confirm password
          if (formData.confirmPassword) {
            validateField('confirmPassword')
          }
        }
      }
      break
      
    case 'confirmPassword':
      if (!value) {
        errors.confirmPassword = 'Confirm password should not be empty'
        validFields.confirmPassword = false
      } else if (value !== formData.password) {
        errors.confirmPassword = 'The two passwords do not match'
        validFields.confirmPassword = false
      } else {
        errors.confirmPassword = ''
        validFields.confirmPassword = true
      }
      break
      
    case 'age':
      if (value !== null && value !== '') {
        if (!validateAge(value)) {
          errors.age = 'Please enter a valid age (1-120 years old)'
          validFields.age = false
        } else {
          errors.age = ''
          validFields.age = true
        }
      } else {
        errors.age = ''
        validFields.age = false
      }
      break
      
    case 'idCard':
      if (value) {
        if (!validateIdCard(value)) {
          errors.idCard = 'Please enter a valid 18-digit ID card number'
          validFields.idCard = false
        } else {
          errors.idCard = ''
          validFields.idCard = true
        }
      } else {
        errors.idCard = ''
        validFields.idCard = false
      }
      break
  }
}

const handleRegister = async () => {
  // Validate all fields
  const fieldsToValidate = ['username', 'email', 'phone', 'password', 'confirmPassword']
  if (formData.age !== null && formData.age !== '') fieldsToValidate.push('age')
  if (formData.idCard) fieldsToValidate.push('idCard')
  
  fieldsToValidate.forEach(field => validateField(field))
  
  // Validate user agreement
  if (!formData.agreeTerms) {
    errors.agreeTerms = 'Please agree to the Terms of Service and Privacy Policy'
    return
  } else {
    errors.agreeTerms = ''
  }
  
  if (!isFormValid.value) {
    return
  }
  
  // Rate limit check
  const clientId = 'register_' + (navigator.userAgent || 'unknown')
  if (!checkRateLimit(clientId, 3, 600000)) { // 3次/10分钟
    registerError.value = 'Registration attempts too frequent, please try again later'
    return
  }
  
  isLoading.value = true
  registerError.value = ''
  
  try {
    // Clean input data
    const cleanData = {
      username: sanitizeInput(formData.username.trim()),
      email: sanitizeInput(formData.email.trim()),
      phone: sanitizeInput(formData.phone.trim()),
      password: formData.password.trim(),
      age: formData.age,
      idCard: formData.idCard ? sanitizeInput(formData.idCard.trim()) : ''
    }
    
    // Call registration
    await authStore.register(cleanData)
    
    // Registration successful, redirect to login page
    await router.push('/login?message=Registration successful, please login')
    
  } catch (error) {
    console.error('Registration failed:', error)
    registerError.value = error.message || 'Registration failed, please try again later'
  } finally {
    isLoading.value = false
  }
}

// Watch password changes, re-validate confirm password
watch(() => formData.password, () => {
  if (formData.confirmPassword) {
    validateField('confirmPassword')
  }
})
</script>

<style scoped>
.register-form {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.form-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  padding: 3rem;
  width: 100%;
  max-width: 500px;
  border: 1px solid #e1e5e9;
}

.form-header {
  text-align: center;
  margin-bottom: 2rem;
}

.form-header h2 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
  font-size: 2rem;
  font-weight: 700;
}

.form-header p {
  color: #6c757d;
  font-size: 1rem;
  line-height: 1.5;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #374151;
  font-weight: 600;
  font-size: 0.9rem;
}

.form-group input[type="text"],
.form-group input[type="email"],
.form-group input[type="tel"],
.form-group input[type="password"],
.form-group input[type="number"] {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 2px solid #e1e5e9;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background-color: #fafafa;
}

.form-group input:focus {
  outline: none;
  border-color: #3b82f6;
  background-color: white;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

.form-group input.error {
  border-color: #ef4444;
  background-color: #fef2f2;
}

.form-group input.success {
  border-color: #10b981;
  background-color: #f0fdf4;
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

.password-strength {
  margin-top: 0.5rem;
}

.strength-bar {
  height: 4px;
  background-color: #e5e7eb;
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 0.25rem;
}

.strength-fill {
  height: 100%;
  transition: all 0.3s ease;
  border-radius: 2px;
}

.strength-fill.very-weak {
  background-color: #ef4444;
}

.strength-fill.weak {
  background-color: #f97316;
}

.strength-fill.medium {
  background-color: #eab308;
}

.strength-fill.strong {
  background-color: #22c55e;
}

.strength-fill.very-strong {
  background-color: #10b981;
}

.strength-text {
  font-size: 0.8rem;
  color: #6b7280;
}

.checkbox-group {
  margin-bottom: 1rem;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  cursor: pointer;
  font-size: 0.9rem;
  color: #374151;
  line-height: 1.5;
}

.checkbox {
  margin-right: 0.5rem;
  margin-top: 0.1rem;
}

.terms-link {
  color: #3b82f6;
  text-decoration: none;
  font-weight: 500;
  margin: 0 0.25rem;
}

.terms-link:hover {
  text-decoration: underline;
}

.error-message {
  color: #ef4444;
  font-size: 0.8rem;
  margin-top: 0.25rem;
  display: block;
}

.success-message {
  color: #10b981;
  font-size: 0.8rem;
  margin-top: 0.25rem;
  display: block;
}

.error-alert {
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 0.875rem 1rem;
  border-radius: 10px;
  margin-bottom: 1.5rem;
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
  padding: 1rem 1rem;
  border-radius: 10px;
  font-size: 1.1rem;
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
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
}

.submit-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.loading-spinner {
  width: 1.2rem;
  height: 1.2rem;
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
  margin-top: 2rem;
  text-align: center;
}

.login-link {
  color: #6b7280;
  font-size: 0.9rem;
}

.login-link a {
  color: #3b82f6;
  text-decoration: none;
  font-weight: 600;
  margin-left: 0.25rem;
  transition: color 0.2s ease;
}

.login-link a:hover {
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
  .register-form {
    padding: 1rem;
    min-height: 100vh;
  }
  
  .form-container {
    padding: 2rem 1.5rem;
    box-shadow: none;
    border: none;
    border-radius: 0;
  }
  
  .form-header h2 {
    font-size: 1.6rem;
  }
}

@media (max-width: 480px) {
  .form-container {
    padding: 1.5rem 1rem;
  }
  
  .form-header h2 {
    font-size: 1.4rem;
  }
  
  .form-header p {
    font-size: 0.9rem;
  }
}
</style>