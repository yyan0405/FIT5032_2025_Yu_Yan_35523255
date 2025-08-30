<template>
  <div id="app">
    <nav class="navbar">
      <div class="nav-container">
        <router-link to="/" class="nav-brand">💚 Health Care Charity</router-link>
        <div class="nav-menu" :class="{ 'active': isMenuOpen }">
          <router-link to="/" class="nav-link" @click="closeMenu">Home</router-link>
          <router-link to="/services" class="nav-link" @click="closeMenu">Services</router-link>
          <router-link to="/map" class="nav-link" @click="closeMenu">Map</router-link>
          <router-link to="/about" class="nav-link" @click="closeMenu">About</router-link>
          <router-link v-if="isAuthenticated" to="/email" class="nav-link" @click="closeMenu">Email</router-link>
          <router-link v-if="isAuthenticated" to="/users" class="nav-link" @click="closeMenu">User Management</router-link>
          <router-link v-if="isAuthenticated" to="/records" class="nav-link" @click="closeMenu">Service Records</router-link>
          <router-link v-if="!isAuthenticated" to="/login" class="nav-link" @click="closeMenu">Login</router-link>
          <router-link v-if="!isAuthenticated" to="/register" class="nav-link" @click="closeMenu">Register</router-link>
          <router-link v-if="isAdmin" to="/admin" class="nav-link" @click="closeMenu">Admin Panel</router-link>
          <button v-if="isAuthenticated" @click="logout" class="nav-link logout-btn">
            Logout ({{ currentUser?.username }})
          </button>
        </div>
        <div class="hamburger" @click="toggleMenu">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </nav>

    <main class="main-content">
      <router-view />
    </main>

    <footer class="footer">
      <p>&copy; 2025 Health Care Charity Organization. Dedicated to providing health services to vulnerable groups.</p>
    </footer>
  </div>
</template>

<script>
import { computed, ref } from 'vue'
import { useAuthStore } from './stores/auth'
import { useRouter } from 'vue-router'

export default {
  name: 'App',
  setup() {
    const authStore = useAuthStore()
    const router = useRouter()
    const isMenuOpen = ref(false)

    const isAuthenticated = computed(() => authStore.isAuthenticated)
    const isAdmin = computed(() => authStore.isAdmin)
    const currentUser = computed(() => authStore.currentUser)

    const logout = () => {
      authStore.logout()
      isMenuOpen.value = false // Close menu on logout
    }

    const toggleMenu = () => {
      isMenuOpen.value = !isMenuOpen.value
    }

    const closeMenu = () => {
      isMenuOpen.value = false
    }

    return {
      isAuthenticated,
      isAdmin,
      currentUser,
      logout,
      isMenuOpen,
      toggleMenu,
      closeMenu
    }
  }
}
</script>

<style>
/* Basic Reset & Body Styles */
body {
  margin: 0;
  font-family: 'Arial', sans-serif;
  background-color: #f4f4f4;
  color: #333;
}

#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
  overflow-x: hidden;
}

/* Navbar Styles */
.navbar {
  background-color: #2c3e50;
  padding: 15px 0;
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.nav-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.nav-brand {
  color: white;
  text-decoration: none;
  font-size: 1.8em;
  font-weight: bold;
}

.nav-menu {
  display: flex;
  gap: 20px;
}

.nav-link {
  color: white;
  text-decoration: none;
  font-size: 1.1em;
  padding: 5px 10px;
  transition: background-color 0.3s ease;
}

.nav-link:hover,
.nav-link.router-link-active {
  background-color: #42b983;
  border-radius: 4px;
}

.logout-btn {
  background: none;
  border: none;
  color: white;
  font-size: 1.1em;
  cursor: pointer;
  padding: 5px 10px;
  transition: background-color 0.3s ease;
}

.logout-btn:hover {
  background-color: #e74c3c;
  border-radius: 4px;
}

/* Hamburger Menu for Mobile */
.hamburger {
  display: none;
  flex-direction: column;
  cursor: pointer;
  gap: 5px;
}

.hamburger span {
  display: block;
  width: 25px;
  height: 3px;
  background-color: white;
}

/* Main Content & Footer */
.main-content {
  flex-grow: 1;
  padding: 0;
  width: 100%;
  overflow-x: hidden;
}

.footer {
  background-color: #2c3e50;
  color: white;
  text-align: center;
  padding: 15px 0;
  margin-top: 20px;
}

/* Responsive Adjustments */
@media (max-width: 768px) {
  .nav-container {
    padding: 0 15px;
  }
  
  .nav-brand {
    font-size: 1.5em;
  }
  
  .nav-menu {
    display: none;
    flex-direction: column;
    width: 100%;
    position: absolute;
    top: 60px;
    left: 0;
    background-color: #2c3e50;
    padding: 10px 0;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    z-index: 1000;
  }

  .nav-menu.active {
    display: flex;
  }

  .nav-link, .logout-btn {
    text-align: center;
    padding: 10px 20px;
    width: 100%;
  }

  .hamburger {
    display: flex;
  }
}

@media (max-width: 480px) {
  .nav-container {
    padding: 0 10px;
  }
  
  .nav-brand {
    font-size: 1.3em;
  }
}
</style>
