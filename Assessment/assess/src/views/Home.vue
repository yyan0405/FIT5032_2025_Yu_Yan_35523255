<template>
  <div class="home">
    <!-- Hero Section -->
    <div class="hero-section">
      <div class="hero-content">
        <h1>Health Care Charity Organization</h1>
        <p class="hero-description">
          Dedicated to providing quality health services to vulnerable groups, ensuring everyone has access to basic medical care and health support.
          We believe that health is a fundamental right for everyone.
        </p>
        <div class="hero-actions">
          <router-link to="/services" class="btn btn-primary">Browse All Services</router-link>
          <router-link to="/about" class="btn btn-secondary">About Us</router-link>
        </div>
      </div>
    </div>
    
    <!-- Statistics Section -->
    <div class="stats-section">
      <div class="container">
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-number">{{ serviceStats.total }}</div>
            <div class="stat-label">Services</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ serviceStats.totalReviews }}</div>
            <div class="stat-label">User Reviews</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ serviceStats.averageRating }}</div>
            <div class="stat-label">Average Rating</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ serviceStats.categories }}</div>
            <div class="stat-label">Service Categories</div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Popular Services -->
    <div class="services-section">
      <div class="container">
        <div class="section-header">
          <h2>Popular Services</h2>
          <p>Most popular health service programs</p>
        </div>
        
        <div v-if="loading" class="loading">
          <div class="spinner"></div>
          <p>Loading service information...</p>
        </div>
        
        <div v-else-if="error" class="error-message">
          <p>{{ error }}</p>
          <button @click="fetchServices" class="btn btn-primary">Reload</button>
        </div>
        
        <div v-else class="services-grid">
          <ServiceCard 
            v-for="service in popularServices" 
            :key="service.id" 
            :service="service" 
          />
        </div>
        
        <div class="section-footer">
          <router-link to="/services" class="btn btn-outline">View All Services</router-link>
        </div>
      </div>
    </div>
    
    <!-- Features Introduction -->
    <div class="features-section">
      <div class="container">
        <h2>Our Features</h2>
        <div class="features-grid">
          <div class="feature-item">
            <div class="feature-icon">🏥</div>
            <h3>Professional Team</h3>
            <p>We have experienced medical staff and professional teams to provide you with quality health services.</p>
          </div>
          <div class="feature-item">
            <div class="feature-icon">💝</div>
            <h3>Free Services</h3>
            <p>All services are provided free of charge, allowing economically disadvantaged groups to enjoy professional health care.</p>
          </div>
          <div class="feature-item">
            <div class="feature-icon">🤝</div>
            <h3>Caring Service</h3>
            <p>People-oriented, providing personalized service plans and paying attention to the special needs of each service recipient.</p>
          </div>
          <div class="feature-item">
            <div class="feature-icon">📍</div>
            <h3>Convenient Service</h3>
            <p>Various service methods, including door-to-door services, so that people with mobility difficulties can also get help.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useServicesStore } from '@/stores/services'
import ServiceCard from '../components/ServiceCard.vue'

const servicesStore = useServicesStore()

// Use computed properties to get data from store
const popularServices = computed(() => servicesStore.popularServices)
const loading = computed(() => servicesStore.loading)
const error = computed(() => servicesStore.error)
const serviceStats = computed(() => servicesStore.serviceStats)

// Fetch service data
const fetchServices = async () => {
  try {
    await servicesStore.refreshServices()
  } catch (err) {
    console.error('Failed to fetch services:', err)
  }
}

onMounted(() => {
  fetchServices()
})
</script>

<style scoped>
.home {
  min-height: 100vh;
}

/* Hero Section */
.hero-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 6rem 2rem;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.hero-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 1;
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 800px;
  margin: 0 auto;
}

.hero-content h1 {
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.hero-description {
  font-size: 1.3rem;
  line-height: 1.6;
  margin-bottom: 2.5rem;
  opacity: 0.95;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

/* Button Styles */
.btn {
  display: inline-block;
  padding: 0.75rem 2rem;
  border-radius: 50px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  cursor: pointer;
  font-size: 1rem;
}

.btn-primary {
  background: #4CAF50;
  color: white;
  border-color: #4CAF50;
}

.btn-primary:hover {
  background: #45a049;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.btn-secondary {
  background: transparent;
  color: white;
  border-color: white;
}

.btn-secondary:hover {
  background: white;
  color: #667eea;
  transform: translateY(-2px);
}

.btn-outline {
  background: transparent;
  color: #4CAF50;
  border-color: #4CAF50;
}

.btn-outline:hover {
  background: #4CAF50;
  color: white;
}

/* Container */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* Statistics */
.stats-section {
  background: #f8f9fa;
  padding: 4rem 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  text-align: center;
}

.stat-item {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.stat-item:hover {
  transform: translateY(-5px);
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 700;
  color: #4CAF50;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 1rem;
  color: #666;
  font-weight: 500;
}

/* Services Section */
.services-section {
  padding: 5rem 0;
  background: white;
}

.section-header {
  text-align: center;
  margin-bottom: 3rem;
}

.section-header h2 {
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 1rem;
  font-weight: 700;
}

.section-header p {
  font-size: 1.2rem;
  color: #666;
  max-width: 600px;
  margin: 0 auto;
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.section-footer {
  text-align: center;
}

/* Loading and Error States */
.loading {
  text-align: center;
  padding: 3rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #4CAF50;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  text-align: center;
  padding: 2rem;
  background: #fff5f5;
  border: 1px solid #fed7d7;
  border-radius: 12px;
  color: #e53e3e;
}

.error-message p {
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

/* Features Introduction */
.features-section {
  background: #f8f9fa;
  padding: 5rem 0;
}

.features-section h2 {
  text-align: center;
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 3rem;
  font-weight: 700;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.feature-item {
  background: white;
  padding: 2.5rem 2rem;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.feature-item:hover {
  transform: translateY(-5px);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feature-item h3 {
  font-size: 1.3rem;
  color: #333;
  margin-bottom: 1rem;
  font-weight: 600;
}

.feature-item p {
  color: #666;
  line-height: 1.6;
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero-content h1 {
    font-size: 2.5rem;
  }
  
  .hero-description {
    font-size: 1.1rem;
  }
  
  .hero-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .btn {
    width: 200px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
  
  .services-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .container {
    padding: 0 1rem;
    max-width: 100%;
    overflow-x: hidden;
  }
  
  .section-header h2 {
    font-size: 2rem;
  }
  
  .features-section h2 {
    font-size: 2rem;
  }
}

@media (max-width: 480px) {
  .hero-section {
    padding: 4rem 1rem;
  }
  
  .hero-content h1 {
    font-size: 2rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .stat-item {
    padding: 1.5rem;
  }
  
  .stat-number {
    font-size: 2rem;
  }
}
</style>