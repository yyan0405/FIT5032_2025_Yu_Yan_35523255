<template>
  <div class="services-container">
    <div class="hero-section">
      <h1 class="hero-title">Our Health Services</h1>
      <p class="hero-description">Providing comprehensive health support services for vulnerable groups</p>
    </div>

    <!-- Service Category Filter -->
    <div class="filter-section">
      <h2>Service Categories</h2>
      <div class="filter-buttons">
        <button 
          @click="selectedCategory = ''"
          :class="{ active: selectedCategory === '' }"
          class="filter-btn"
        >
          All Services
        </button>
        <button 
          v-for="category in categories"
          :key="category"
          @click="selectedCategory = category"
          :class="{ active: selectedCategory === category }"
          class="filter-btn"
        >
          {{ category }}
        </button>
      </div>
    </div>

    <!-- Search Function -->
    <div class="search-section">
      <div class="search-box">
        <input 
          v-model="searchQuery"
          type="text"
          placeholder="Search services..."
          class="search-input"
        />
        <button class="search-btn">🔍</button>
      </div>
    </div>

    <div v-if="loading" class="loading-spinner"></div>
    
    <div v-if="error" class="error-message">{{ error }}</div>

    <!-- Service List -->
    <div v-if="!loading && !error" class="services-grid">
      <ServiceCard 
        v-for="service in filteredServices" 
        :key="service.id" 
        :service="service" 
      />
    </div>

    <div v-if="!loading && !error && filteredServices.length === 0" class="no-results">
      <p>No services found matching the criteria</p>
    </div>

    <!-- Service Statistics -->
    <div class="stats-section">
      <h2>Service Statistics</h2>
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-number">{{ totalServices }}</div>
          <div class="stat-label">Service Items</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">{{ totalBeneficiaries }}</div>
          <div class="stat-label">Beneficiaries</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">{{ averageRating }}</div>
          <div class="stat-label">Average Rating</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">{{ totalReviews }}</div>
          <div class="stat-label">User Reviews</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import ServiceCard from '../components/ServiceCard.vue'

export default {
  name: 'Services',
  components: {
    ServiceCard
  },
  setup() {
    const services = ref([])
    const loading = ref(true)
    const error = ref('')
    const selectedCategory = ref('')
    const searchQuery = ref('')

    const categories = ref([
      'Preventive Care',
      'Mental Health Support', 
      'Nutrition & Health',
      'Disease Management',
      'Health Education',
      'Rehabilitation Services'
    ])

    const fetchServices = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000))
        services.value = [
          { 
            id: 1, 
            title: 'Free Health Checkup', 
            category: 'Preventive Care', 
            rating: 4.8, 
            description: 'Comprehensive free health checkup services for vulnerable groups, including basic physical examination and blood tests', 
            imageUrl: '/images/health-checkup.jpg',
            beneficiaries: 1200,
            reviews: 156
          },
          { 
            id: 2, 
            title: 'Mental Health Counseling', 
            category: 'Mental Health Support', 
            rating: 4.9, 
            description: 'Professional counselors provide free mental health support to help alleviate psychological stress', 
            imageUrl: '/images/psychological-counseling.jpg',
            beneficiaries: 800,
            reviews: 89
          },
          { 
            id: 3, 
            title: 'Nutritional Diet Guidance', 
            category: 'Nutrition & Health', 
            rating: 4.7, 
            description: 'Nutritionists provide personalized dietary guidance and nutritional advice to improve dietary health', 
            imageUrl: '/images/nutrition-guidance.jpg',
            beneficiaries: 950,
            reviews: 134
          },
          { 
            id: 4, 
            title: 'Chronic Disease Management', 
            category: 'Disease Management', 
            rating: 4.6, 
            description: 'Professional disease management services for chronic disease patients, including medication guidance', 
            imageUrl: '/images/medication-assistance.jpg',
            beneficiaries: 650,
            reviews: 78
          },
          { 
            id: 5, 
            title: 'Health Education Seminars', 
            category: 'Health Education', 
            rating: 4.5, 
            description: 'Regular health knowledge seminars to improve community residents\' health awareness', 
            imageUrl: '/images/health-education.jpg',
            beneficiaries: 2000,
            reviews: 245
          },
          { 
            id: 6, 
            title: 'Rehabilitation Training Guidance', 
            category: 'Rehabilitation Services', 
            rating: 4.8, 
            description: 'Professional rehabilitation therapists guide physical function recovery training to help patients regain health', 
            imageUrl: '/images/rehabilitation.jpg',
            beneficiaries: 450,
            reviews: 67
          },
          { 
            id: 7, 
            title: 'Elderly Health Management', 
            category: 'Preventive Care', 
            rating: 4.7, 
            description: 'Specialized health management services for the elderly, including regular checkups and health monitoring', 
            imageUrl: '/images/home-care.jpg',
            beneficiaries: 750,
            reviews: 98
          },
          { 
            id: 8, 
            title: 'Children Nutrition Support', 
            category: 'Nutrition & Health', 
            rating: 4.9, 
            description: 'Nutritional supplements and dietary guidance services for children from low-income families', 
            imageUrl: '/images/nutrition-guidance.jpg',
            beneficiaries: 600,
            reviews: 112
          }
        ]
      } catch (err) {
        error.value = 'Unable to load service list, please try again later.'
      } finally {
        loading.value = false
      }
    }

    const filteredServices = computed(() => {
      let filtered = services.value
      
      // Filter by category
      if (selectedCategory.value) {
        filtered = filtered.filter(service => service.category === selectedCategory.value)
      }
      
      // Filter by search keywords
      if (searchQuery.value.trim()) {
        const query = searchQuery.value.toLowerCase().trim()
        filtered = filtered.filter(service => 
          service.title.toLowerCase().includes(query) ||
          service.description.toLowerCase().includes(query) ||
          service.category.toLowerCase().includes(query)
        )
      }
      
      return filtered
    })

    const totalServices = computed(() => services.value.length)
    const totalBeneficiaries = computed(() => 
      services.value.reduce((sum, service) => sum + (service.beneficiaries || 0), 0)
    )
    const averageRating = computed(() => {
      if (services.value.length === 0) return 0
      const total = services.value.reduce((sum, service) => sum + service.rating, 0)
      return (total / services.value.length).toFixed(1)
    })
    const totalReviews = computed(() => 
      services.value.reduce((sum, service) => sum + (service.reviews || 0), 0)
    )

    onMounted(fetchServices)

    return {
      services,
      loading,
      error,
      selectedCategory,
      searchQuery,
      categories,
      filteredServices,
      totalServices,
      totalBeneficiaries,
      averageRating,
      totalReviews
    }
  }
}
</script>

<style scoped>
.services-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  overflow-x: hidden;
}

.hero-section {
  text-align: center;
  margin-bottom: 40px;
  padding: 40px 20px;
  background: linear-gradient(135deg, #42b983 0%, #369870 100%);
  color: white;
  border-radius: 12px;
}

.hero-title {
  font-size: 3em;
  margin-bottom: 15px;
  font-weight: bold;
}

.hero-description {
  font-size: 1.3em;
  opacity: 0.9;
}

.filter-section {
  margin-bottom: 30px;
}

.filter-section h2 {
  color: #2c3e50;
  margin-bottom: 15px;
}

.filter-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.filter-btn {
  padding: 10px 20px;
  border: 2px solid #42b983;
  background: white;
  color: #42b983;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
}

.filter-btn:hover,
.filter-btn.active {
  background: #42b983;
  color: white;
}

.search-section {
  margin-bottom: 30px;
}

.search-box {
  display: flex;
  max-width: 500px;
  margin: 0 auto;
}

.search-input {
  flex: 1;
  padding: 12px 20px;
  border: 2px solid #ddd;
  border-right: none;
  border-radius: 25px 0 0 25px;
  font-size: 1em;
  outline: none;
}

.search-input:focus {
  border-color: #42b983;
}

.search-btn {
  padding: 12px 20px;
  border: 2px solid #42b983;
  background: #42b983;
  color: white;
  border-radius: 0 25px 25px 0;
  cursor: pointer;
  font-size: 1em;
}

.loading-spinner {
  border: 6px solid #f3f3f3;
  border-top: 6px solid #42b983;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
  margin: 50px auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  color: #e74c3c;
  font-size: 1.2em;
  padding: 20px;
  background-color: #fdd;
  border-radius: 8px;
  text-align: center;
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 30px;
  margin-bottom: 50px;
}

.no-results {
  text-align: center;
  padding: 50px;
  color: #666;
  font-size: 1.2em;
}

.stats-section {
  background: #f8f9fa;
  padding: 40px;
  border-radius: 12px;
  margin-top: 50px;
}

.stats-section h2 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 30px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 30px;
}

.stat-item {
  text-align: center;
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.stat-number {
  font-size: 2.5em;
  font-weight: bold;
  color: #42b983;
  margin-bottom: 10px;
}

.stat-label {
  color: #666;
  font-size: 1.1em;
}

/* Responsive Design */
@media (max-width: 768px) {
  .services-container {
    padding: 15px;
    max-width: 100%;
  }
  
  .hero-title {
    font-size: 2.2em;
  }
  
  .hero-description {
    font-size: 1.1em;
  }
  
  .filter-buttons {
    justify-content: center;
  }
  
  .filter-btn {
    padding: 8px 16px;
    font-size: 0.9em;
  }
  
  .search-box {
    max-width: 100%;
    margin: 0;
  }
  
  .search-input {
    padding: 10px 15px;
  }
  
  .search-btn {
    padding: 10px 15px;
  }
  
  .services-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
  
  .stat-item {
    padding: 20px;
  }
  
  .stat-number {
    font-size: 2em;
  }
}

@media (max-width: 480px) {
  .services-container {
    padding: 10px;
  }
  
  .hero-section {
    padding: 30px 15px;
  }
  
  .hero-title {
    font-size: 1.8em;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .filter-btn {
    padding: 6px 12px;
    font-size: 0.8em;
  }
}
</style>