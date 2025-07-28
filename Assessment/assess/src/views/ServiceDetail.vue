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
        
        // 模拟服务详情数据
        const services = {
          1: {
            id: 1,
            title: '免费健康检查',
            category: '预防保健',
            rating: 4.8,
            reviewCount: 156,
            description: '为弱势群体提供全面的免费健康检查服务，包括基础体检、血液检查、心电图等项目。',
            imageUrl: 'https://via.placeholder.com/400x300.png?text=健康检查',
            details: [
              '全面身体检查',
              '血液生化检查',
              '心电图检查',
              '胸部X光检查',
              '专业医生咨询',
              '健康报告解读'
            ],
            schedule: '周一至周五 8:00-17:00，周六 8:00-12:00',
            contact: {
              phone: '400-123-4567',
              address: '北京市朝阳区健康大街123号'
            }
          },
          2: {
            id: 2,
            title: '心理健康咨询',
            category: '心理支持',
            rating: 4.9,
            reviewCount: 89,
            description: '专业心理咨询师提供免费心理健康支持，帮助缓解心理压力，改善心理状态。',
            imageUrl: 'https://via.placeholder.com/400x300.png?text=心理咨询',
            details: [
              '一对一心理咨询',
              '团体心理治疗',
              '心理健康评估',
              '情绪管理指导',
              '压力缓解技巧',
              '心理危机干预'
            ],
            schedule: '周一至周日 9:00-21:00（需预约）',
            contact: {
              phone: '400-123-4568',
              address: '北京市朝阳区心理健康中心'
            }
          }
          // 可以添加更多服务详情
        }
        
        service.value = services[serviceId] || null
        if (!service.value) {
          error.value = '服务不存在'
          return
        }
        
        // 模拟评价数据
        reviews.value = [
          {
            id: 1,
            username: '张女士',
            rating: 5,
            comment: '服务非常好，医生很专业，检查很仔细，强烈推荐！',
            date: new Date('2024-12-01')
          },
          {
            id: 2,
            username: '李先生',
            rating: 4,
            comment: '整体不错，就是等待时间稍长，但服务质量很好。',
            date: new Date('2024-11-28')
          },
          {
            id: 3,
            username: '王女士',
            rating: 5,
            comment: '免费的服务能做到这个水平真的很不错，感谢机构的帮助！',
            date: new Date('2024-11-25')
          }
        ]
        
      } catch (err) {
        error.value = '无法加载服务详情，请稍后再试。'
      } finally {
        loading.value = false
      }
    }

    const submitReview = async () => {
      if (!newReview.value.rating || !newReview.value.comment.trim()) {
        alert('请填写完整的评价信息')
        return
      }
      
      submittingReview.value = true
      
      try {
        // 模拟提交评价
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const review = {
          id: reviews.value.length + 1,
          username: authStore.currentUser?.username || '匿名用户',
          rating: parseInt(newReview.value.rating),
          comment: newReview.value.comment.trim(),
          date: new Date()
        }
        
        reviews.value.unshift(review)
        
        // 重新计算平均评分
        const totalRating = reviews.value.reduce((sum, r) => sum + r.rating, 0)
        service.value.rating = (totalRating / reviews.value.length).toFixed(1)
        service.value.reviewCount = reviews.value.length
        
        // 重置表单
        newReview.value = { rating: '', comment: '' }
        
        alert('评价提交成功！')
        
      } catch (err) {
        alert('评价提交失败，请稍后再试')
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