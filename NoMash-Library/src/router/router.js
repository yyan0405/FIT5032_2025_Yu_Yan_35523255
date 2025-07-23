/**
 * @file router/index.js
 * @description Router configuration for the library management system
 */

import { createRouter, createWebHistory } from 'vue-router'

// View imports
import HomeView from '../views/HomeView.vue'
import AboutView from '../views/AboutView.vue'
import LoginView from '../views/LoginView.vue'
import AccessDeniedView from '../views/AccessDeniedView.vue'

/**
 * Route Configurations
 */
const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
    meta: {
      title: 'Home | Library Management System',
      requiresAuth: false
    }
  },
  {
    path: '/about',
    name: 'About',
    component: AboutView,
    meta: { 
      title: 'About | Library Management System',
      requiresAuth: true
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: {
      title: 'Sign In | Library Management System',
      requiresAuth: false
    }
  },
  {
    path: '/access-denied',
    name: 'AccessDenied',
    component: AccessDeniedView,
    meta: {
      title: 'Access Denied | Library Management System',
      requiresAuth: false
    }
  }
]

/**
 * Router Instance Creation
 */
const router = createRouter({
  history: createWebHistory(),
  routes,
  // Scroll behavior
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

/**
 * Authentication check
 * @returns {boolean} Whether the user is authenticated
 */
const isAuthenticated = () => {
  return localStorage.getItem('isAuthenticated') === 'true'
}

/**
 * Navigation Guards
 */
router.beforeEach((to, from, next) => {
  // Update page title
  document.title = to.meta.title || 'Library Management System'
  
  // Authentication check
  if (to.meta.requiresAuth && !isAuthenticated()) {
    next({
      path: '/access-denied',
      query: { redirect: to.fullPath }
    })
  } 
  // Prevent authenticated users from accessing login
  else if (to.path === '/login' && isAuthenticated()) {
    next({ path: '/' })
  }
  // Allow navigation
  else {
    next()
  }
})

export default router
