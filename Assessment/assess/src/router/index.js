import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import ServiceDetail from '../views/ServiceDetail.vue'
import Services from '../views/Services.vue'
import About from '../views/About.vue'
import Admin from '../views/Admin.vue'
import EmailSender from '../views/EmailSender.vue'
import UserManagement from '../views/UserManagement.vue'
import ServiceRecords from '../views/ServiceRecords.vue'
import { useAuthStore } from '../stores/auth'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  },
  {
    path: '/service/:id',
    name: 'ServiceDetail',
    component: ServiceDetail,
    props: true
  },
  {
    path: '/services',
    name: 'Services',
    component: Services
  },
  {
    path: '/about',
    name: 'About',
    component: About
  },
  {
    path: '/admin',
    name: 'Admin',
    component: Admin,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
      path: '/email',
      name: 'EmailSender',
      component: EmailSender,
      meta: { requiresAuth: true }
    },
    {
      path: '/users',
      name: 'UserManagement',
      component: UserManagement,
      meta: { requiresAuth: true }
    },
    {
      path: '/records',
      name: 'ServiceRecords',
      component: ServiceRecords,
      meta: { requiresAuth: true }
    }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  try {
    // Check if session is valid
    if (authStore.isAuthenticated) {
      authStore.checkSession()
    }
    
    // Check if authentication is required
    if (to.matched.some(record => record.meta.requiresAuth)) {
      if (!authStore.isAuthenticated) {
        next({ path: '/login', query: { redirect: to.fullPath } })
        return
      }
      
      // Check admin permissions
      if (to.matched.some(record => record.meta.requiresAdmin) && !authStore.isAdmin) {
        next('/')
        return
      }
      
      // Check volunteer permissions
      if (to.matched.some(record => record.meta.requiresVolunteer) && 
          !authStore.isVolunteer && !authStore.isAdmin) {
        next('/')
        return
      }
      
      // Check specific permissions
      if (to.meta.permission && !authStore.hasPermission(to.meta.permission)) {
        next('/')
        return
      }
    }
    
    // If logged-in user accesses login or register page, redirect to home
    if (authStore.isAuthenticated && (to.path === '/login' || to.path === '/register')) {
      next('/')
      return
    }
    
    next()
    
  } catch (error) {
    // Session expired or other error, redirect to login page
    console.warn('Route guard error:', error.message)
    if (to.path !== '/login') {
      next({ path: '/login', query: { redirect: to.fullPath } })
    } else {
      next()
    }
  }
})

export default router