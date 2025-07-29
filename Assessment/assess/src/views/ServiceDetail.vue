<template>
  <div class="service-detail-container">
    <div v-if="loading" class="loading-spinner"></div>
    
    <div v-if="error" class="error-message">{{ error }}</div>

    <div v-if="!loading && !error && service" class="service-detail">
      <div class="service-header">
        <div class="service-image">
          <img :src="service.imageUrl" :alt="service.title" />
        </div>
        <div class="service-info">
          <h1 class="service-title">{{ service.title }}</h1>
          <p class="service-category">{{ service.category }}</p>
          <div class="service-rating">
            <span class="stars">{{ getStars(service.rating) }}</span>
            <span class="rating-value">{{ service.rating }}/5 ({{ service.reviewCount || 0 }} reviews)</span>
          </div>
          <p class="service-description">{{ service.description }}</p>
          <div class="service-details">
            <h3>Service Details</h3>
            <ul>
              <li v-for="detail in service.details" :key="detail">{{ detail }}</li>
            </ul>
          </div>
          <div class="service-schedule">
            <h3>Service Hours</h3>
            <p>{{ service.schedule }}</p>
          </div>
          <div class="contact-info">
            <h3>Contact Information</h3>
            <p>Phone: {{ service.contact?.phone || '400-123-4567' }}</p>
            <p>Address: {{ service.contact?.address || '123 Health Street, Chaoyang District, Beijing' }}</p>
          </div>
        </div>
      </div>

      <!-- 评价系统 -->
      <div class="reviews-section">
        <h2>User Reviews</h2>
        
        <!-- 添加评价表单 -->
        <div v-if="isAuthenticated" class="add-review">
          <h3>Add Your Review</h3>
          <form @submit.prevent="submitReview">
            <div class="rating-input">
              <label>Rating:</label>
              <select v-model="newReview.rating" required>
                <option value="">Please select a rating</option>
                <option value="5">5 stars - Very Satisfied</option>
                <option value="4">4 stars - Satisfied</option>
                <option value="3">3 stars - Average</option>
                <option value="2">2 stars - Dissatisfied</option>
                <option value="1">1 star - Very Dissatisfied</option>
              </select>
            </div>
            <div class="comment-input">
              <label>Review Content:</label>
              <textarea 
                v-model="newReview.comment" 
                placeholder="Please share your experience..."
                rows="4"
                required
                maxlength="500"
              ></textarea>
              <small>{{ newReview.comment.length }}/500</small>
            </div>
            <button type="submit" class="submit-review-btn" :disabled="submittingReview">
              {{ submittingReview ? 'Submitting...' : 'Submit Review' }}
            </button>
          </form>
        </div>
        
        <div v-else class="login-prompt">
          <p>Please <router-link to="/login">login</router-link> to add a review</p>
        </div>

        <!-- 评价列表 -->
        <div class="reviews-list">
          <div v-for="review in reviews" :key="review.id" class="review-item">
            <div class="review-header">
              <span class="reviewer-name">{{ review.username }}</span>
              <span class="review-rating">{{ getStars(review.rating) }}</span>
              <span class="review-date">{{ formatDate(review.date) }}</span>
            </div>
            <p class="review-comment">{{ review.comment }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'

export default {
  name: 'ServiceDetail',
  setup() {
    const route = useRoute()
    const authStore = useAuthStore()
    const service = ref(null)
    const reviews = ref([])
    const loading = ref(true)
    const error = ref('')
    const submittingReview = ref(false)
    
    const newReview = ref({
      rating: '',
      comment: ''
    })

    const isAuthenticated = computed(() => authStore.isAuthenticated)

    const fetchServiceDetail = async () => {
      try {
        const serviceId = parseInt(route.params.id)
        await new Promise(resolve => setTimeout(resolve, 800))
        
        // Mock service detail data
        const services = {
          1: {
            id: 1,
            title: 'Free Health Checkup',
            category: 'Preventive Care',
            rating: 4.8,
            reviewCount: 156,
            description: 'Comprehensive free health checkup services for vulnerable groups, including basic physical examination, blood tests, ECG and other items.',
            imageUrl: '/images/health-checkup.jpg',
            details: [
              'Comprehensive physical examination',
              'Blood biochemistry tests',
              'Electrocardiogram (ECG)',
              'Chest X-ray examination',
              'Professional doctor consultation',
              'Health report interpretation'
            ],
            schedule: 'Monday to Friday 8:00-17:00, Saturday 8:00-12:00',
            contact: {
              phone: '400-123-4567',
              address: '123 Health Street, Chaoyang District, Beijing'
            }
          },
          2: {
            id: 2,
            title: 'Mental Health Counseling',
            category: 'Mental Health Support',
            rating: 4.9,
            reviewCount: 89,
            description: 'Professional counselors provide free mental health support to help alleviate psychological stress and improve mental state.',
            imageUrl: '/images/psychological-counseling.jpg',
            details: [
              'One-on-one psychological counseling',
              'Group psychotherapy',
              'Mental health assessment',
              'Emotional management guidance',
              'Stress relief techniques',
              'Psychological crisis intervention'
            ],
            schedule: 'Monday to Sunday 9:00-21:00 (Appointment required)',
            contact: {
              phone: '400-123-4568',
              address: 'Mental Health Center, Chaoyang District, Beijing'
            }
          }
          // More service details can be added
        }
        
        service.value = services[serviceId] || null
        if (!service.value) {
          error.value = 'Service not found'
          return
        }
        
        // Mock review data
        reviews.value = [
          {
            id: 1,
            username: 'Ms. Zhang',
            rating: 5,
            comment: 'Excellent service! The doctors are very professional and thorough in their examinations. Highly recommended!',
            date: new Date('2024-12-01')
          },
          {
            id: 2,
            username: 'Mr. Li',
            rating: 4,
            comment: 'Overall very good, just a bit of waiting time, but the service quality is excellent.',
            date: new Date('2024-11-28')
          },
          {
            id: 3,
            username: 'Ms. Wang',
            rating: 5,
            comment: 'Amazing that free services can reach this level of quality. Thank you for the help!',
            date: new Date('2024-11-25')
          }
        ]
        
      } catch (err) {
        error.value = 'Unable to load service details, please try again later.'
      } finally {
        loading.value = false
      }
    }

    const submitReview = async () => {
      if (!newReview.value.rating || !newReview.value.comment.trim()) {
        alert('Please fill in complete review information')
        return
      }
      
      submittingReview.value = true
      
      try {
        // Mock review submission
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const review = {
          id: reviews.value.length + 1,
          username: authStore.currentUser?.username || 'Anonymous User',
          rating: parseInt(newReview.value.rating),
          comment: newReview.value.comment.trim(),
          date: new Date()
        }
        
        reviews.value.unshift(review)
        
        // Recalculate average rating
        const totalRating = reviews.value.reduce((sum, r) => sum + r.rating, 0)
        service.value.rating = (totalRating / reviews.value.length).toFixed(1)
        service.value.reviewCount = reviews.value.length
        
        // Reset form
        newReview.value = { rating: '', comment: '' }
        
        alert('Review submitted successfully!')
        
      } catch (err) {
        alert('Review submission failed, please try again later')
      } finally {
        submittingReview.value = false
      }
    }

    const getStars = (rating) => {
      const fullStars = Math.floor(rating)
      const hasHalfStar = rating % 1 !== 0
      let stars = '★'.repeat(fullStars)
      if (hasHalfStar) {
        stars += '☆'
      }
      return stars + '☆'.repeat(5 - Math.ceil(rating))
    }

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('zh-CN')
    }

    onMounted(fetchServiceDetail)

    return {
      service,
      reviews,
      loading,
      error,
      newReview,
      submittingReview,
      isAuthenticated,
      submitReview,
      getStars,
      formatDate
    }
  }
}
</script>

<style scoped>
.service-detail-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
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

.service-header {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 30px;
  margin-bottom: 40px;
}

.service-image img {
  width: 100%;
  height: 300px;
  object-fit: cover;
  border-radius: 12px;
}

.service-title {
  font-size: 2.5em;
  color: #2c3e50;
  margin-bottom: 10px;
}

.service-category {
  color: #42b983;
  font-size: 1.2em;
  font-weight: 600;
  margin-bottom: 15px;
}

.service-rating {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.stars {
  color: #ffd700;
  font-size: 1.3em;
}

.rating-value {
  color: #666;
  font-size: 1.1em;
}

.service-description {
  font-size: 1.1em;
  line-height: 1.6;
  color: #555;
  margin-bottom: 25px;
}

.service-details, .service-schedule, .contact-info {
  margin-bottom: 25px;
}

.service-details h3, .service-schedule h3, .contact-info h3 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.service-details ul {
  list-style-type: none;
  padding: 0;
}

.service-details li {
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.service-details li:before {
  content: '✓';
  color: #42b983;
  font-weight: bold;
  margin-right: 10px;
}

.reviews-section {
  border-top: 2px solid #eee;
  padding-top: 30px;
}

.reviews-section h2 {
  color: #2c3e50;
  margin-bottom: 25px;
}

.add-review {
  background: #f8f9fa;
  padding: 25px;
  border-radius: 12px;
  margin-bottom: 30px;
}

.add-review h3 {
  color: #2c3e50;
  margin-bottom: 20px;
}

.rating-input, .comment-input {
  margin-bottom: 20px;
}

.rating-input label, .comment-input label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #2c3e50;
}

.rating-input select {
  width: 100%;
  padding: 10px;
  border: 2px solid #ddd;
  border-radius: 6px;
  font-size: 1em;
}

.comment-input textarea {
  width: 100%;
  padding: 12px;
  border: 2px solid #ddd;
  border-radius: 6px;
  font-size: 1em;
  resize: vertical;
  font-family: inherit;
}

.comment-input small {
  color: #666;
  float: right;
  margin-top: 5px;
}

.submit-review-btn {
  background-color: #42b983;
  color: white;
  padding: 12px 25px;
  border: none;
  border-radius: 6px;
  font-size: 1em;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.submit-review-btn:hover:not(:disabled) {
  background-color: #369870;
}

.submit-review-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.login-prompt {
  text-align: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 30px;
}

.login-prompt a {
  color: #42b983;
  text-decoration: none;
  font-weight: 600;
}

.reviews-list {
  space-y: 20px;
}

.review-item {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.review-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 10px;
}

.reviewer-name {
  font-weight: 600;
  color: #2c3e50;
}

.review-rating {
  color: #ffd700;
}

.review-date {
  color: #666;
  font-size: 0.9em;
}

.review-comment {
  color: #555;
  line-height: 1.5;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .service-header {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .service-title {
    font-size: 2em;
  }
  
  .add-review {
    padding: 20px;
  }
  
  .review-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
}
</style>