/**
 * @file AccessDeniedView.vue
 * @description Access denied page shown when unauthenticated users try to access protected routes
 */

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const navigateToLogin = () => {
  router.push('/login')
}

const navigateToHome = () => {
  router.push('/')
}
</script>

<template>
  <div class="container-fluid min-vh-100 bg-light d-flex align-items-center justify-content-center p-4">
    <div class="card shadow-lg border-0 p-5" style="max-width: 480px;">
      <!-- Icon -->
      <div class="text-danger mb-4 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="64" height="64">
          <path fill="none" d="M0 0h24v24H0z"/>
          <path 
            d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm-1-5h2v2h-2v-2zm0-8h2v6h-2V7z"
            fill="currentColor"
          />
        </svg>
      </div>

      <!-- Message -->
      <h1 class="h3 text-center mb-3">Access Denied</h1>
      <p class="text-muted text-center mb-4">
        You need to be logged in to access this page. Please sign in to continue.
      </p>

      <!-- Actions -->
      <div class="d-flex gap-3 justify-content-center">
        <button @click="navigateToLogin" class="btn btn-primary px-4 py-2">
          Sign In
        </button>
        <button @click="navigateToHome" class="btn btn-light px-4 py-2">
          Back to Home
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.btn {
  transition: all 0.2s ease;
}

.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.btn:active {
  transform: translateY(0);
  box-shadow: none;
}
</style>
