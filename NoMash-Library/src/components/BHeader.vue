<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isAuthenticated = ref(false)
const username = ref('')

onMounted(() => {
  checkAuthStatus()
})

const checkAuthStatus = () => {
  isAuthenticated.value = localStorage.getItem('isAuthenticated') === 'true'
  username.value = localStorage.getItem('user') || ''
}

const logout = () => {
  localStorage.removeItem('isAuthenticated')
  localStorage.removeItem('user')
  isAuthenticated.value = false
  username.value = ''
  router.push('/login')
}
</script>

<template>
  <div class="container">
    <header class="d-flex justify-content-between align-items-center py-3">
      <ul class="nav nav-pills">
        <li class="nav-item">
          <router-link to="/" class="nav-link" active-class="active" aria-current="page">
            Home (Week 5)
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/about" class="nav-link" active-class="active">About</router-link>
        </li>
        <li class="nav-item">
          <router-link to="/addbook" class="nav-link" active-class="active">Add book</router-link>
        </li>
        <li class="nav-item">
          <router-link to="/FireLogin" class="nav-link" active-class="active">Firebase Login</router-link>
        </li>
        <li class="nav-item">
          <router-link to="/FireRegister" class="nav-link" active-class="active">Firebase Register</router-link>
        </li>
        <li class="nav-item">
          <router-link to="/WeatherCheck" class="nav-link" active-class="active">Get Weather</router-link>
        </li>
        <li class="nav-item">
          <router-link to="/CountBookAPI" class="nav-link" active-class="active">Count Book API</router-link>
        </li>

      </ul>
      
      <div v-if="isAuthenticated" class="d-flex align-items-center">
        <span class="me-3">Welcome, {{ username }}</span>
        <button class="btn btn-outline-danger btn-sm" @click="logout">Sign Out</button>
      </div>
      <router-link v-else to="/login" class="btn btn-primary btn-sm">Sign In</router-link>
    </header>
  </div>
</template>
```
