<template>
  <div class="register-container">
    <h2>Register</h2>
    <form @submit.prevent="handleRegister" class="register-form">
      <div class="form-group">
        <label for="username">Username:</label>
        <input type="text" id="username" v-model="username" required>
      </div>
      <div class="form-group">
        <label for="password">Password:</label>
        <input type="password" id="password" v-model="password" required>
      </div>
      <div class="form-group">
        <label for="confirmPassword">Confirm Password:</label>
        <input type="password" id="confirmPassword" v-model="confirmPassword" required>
      </div>
      <button type="submit" class="register-button">Register</button>
      <p v-if="error" class="error-message">{{ error }}</p>
    </form>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'

export default {
  name: 'Register',
  setup() {
    const authStore = useAuthStore()
    const username = ref('')
    const password = ref('')
    const confirmPassword = ref('')
    const error = ref('')

    const handleRegister = async () => {
      if (password.value !== confirmPassword.value) {
        error.value = 'The two passwords entered do not match.'
        return
      }
      error.value = ''
      const success = await authStore.register(username.value, password.value)
      if (!success) {
        error.value = 'Registration failed, please try again later.'
      }
    }

    return {
      username,
      password,
      confirmPassword,
      error,
      handleRegister
    }
  }
}
</script>

<style scoped>
.register-container {
  max-width: 400px;
  margin: 50px auto;
  padding: 30px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
}

h2 {
  color: #2c3e50;
  margin-bottom: 25px;
  font-size: 2em;
}

.register-form .form-group {
  margin-bottom: 20px;
  text-align: left;
}

.register-form label {
  display: block;
  margin-bottom: 8px;
  color: #34495e;
  font-weight: bold;
}

.register-form input[type="text"],
.register-form input[type="password"] {
  width: calc(100% - 20px);
  padding: 12px 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 1em;
  box-sizing: border-box;
}

.register-button {
  width: 100%;
  padding: 12px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 1.1em;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.register-button:hover {
  background-color: #369f77;
}

.error-message {
  color: #e74c3c;
  margin-top: 15px;
  font-weight: bold;
}
</style>