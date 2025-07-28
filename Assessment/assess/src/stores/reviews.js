import { defineStore } from 'pinia'
import { useAuthStore } from './auth'
import { sanitizeContent, preventXSS } from '@/utils/security'
import { validateRating, validateComment } from '@/utils/validation'

// Mock review data
const mockReviews = [
  {
    id: 1,
    serviceId: 1,
    userId: 3,
    username: 'user',
    rating: 5,
    comment: 'The service is excellent, the staff is very professional, and the environment is comfortable.',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    isVerified: true,
    helpfulCount: 12,
    reportCount: 0
  },
  {
    id: 2,
    serviceId: 1,
    userId: 2,
    username: 'volunteer',
    rating: 4,
    comment: 'Overall experience is good, but the waiting time is a bit long.',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
    isVerified: true,
    helpfulCount: 8,
    reportCount: 0
  },
  {
    id: 3,
    serviceId: 2,
    userId: 3,
    username: 'user',
    rating: 5,
    comment: 'The psychological counselor is very professional and very helpful.',
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-01-25'),
    isVerified: true,
    helpfulCount: 15,
    reportCount: 0
  }
]

export const useReviewsStore = defineStore('reviews', {
  state: () => ({
    reviews: [...mockReviews],
    loading: false,
    error: null,
    userReviewLimits: {}, // User review limit records
    reportedReviews: [] // Reported reviews
  }),
  
  getters: {
    // Get reviews for specific service
    getReviewsByService: (state) => (serviceId) => {
      return state.reviews
        .filter(review => review.serviceId === serviceId && review.reportCount < 3)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    },
    
    // 获取特定服务的平均评分
    getAverageRating: (state) => (serviceId) => {
      const serviceReviews = state.reviews.filter(review => 
        review.serviceId === serviceId && review.reportCount < 3
      )
      if (serviceReviews.length === 0) return 0
      
      const totalRating = serviceReviews.reduce((sum, review) => sum + review.rating, 0)
      return Math.round((totalRating / serviceReviews.length) * 10) / 10
    },
    
    // 获取特定服务的评价统计
    getReviewStats: (state) => (serviceId) => {
      const serviceReviews = state.reviews.filter(review => 
        review.serviceId === serviceId && review.reportCount < 3
      )
      
      const stats = {
        total: serviceReviews.length,
        average: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      }
      
      if (serviceReviews.length > 0) {
        const totalRating = serviceReviews.reduce((sum, review) => sum + review.rating, 0)
        stats.average = Math.round((totalRating / serviceReviews.length) * 10) / 10
        
        serviceReviews.forEach(review => {
          stats.distribution[review.rating]++
        })
      }
      
      return stats
    },
    
    // 获取用户的评价
    getUserReviews: (state) => (userId) => {
      return state.reviews
        .filter(review => review.userId === userId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    },
    
    // Check if user has already reviewed a service
    hasUserReviewed: (state) => (serviceId, userId) => {
      return state.reviews.some(review => 
        review.serviceId === serviceId && review.userId === userId
      )
    }
  },
  
  actions: {
    // 提交评价
    async submitReview(reviewData) {
      try {
        this.loading = true
        this.error = null
        
        const authStore = useAuthStore()
        if (!authStore.isAuthenticated) {
          throw new Error('请先登录后再评价')
        }
        
        const { serviceId, rating, comment } = reviewData
        const userId = authStore.currentUser.id
        const username = authStore.currentUser.username
        
        // 验证输入
        if (!validateRating(rating)) {
          throw new Error('Rating must be between 1-5')
        }
        
        if (!validateComment(comment)) {
          throw new Error('Review content does not meet requirements')
        }
        
        // 检查是否已经评价过
        if (this.hasUserReviewed(serviceId, userId)) {
          throw new Error('您已经评价过这个服务了')
        }
        
        // 检查评价频率限制
        const today = new Date().toDateString()
        const userKey = `${userId}_${today}`
        const todayReviews = this.userReviewLimits[userKey] || 0
        
        if (todayReviews >= 5) {
          throw new Error('每天最多只能提交5个评价')
        }
        
        // 清理和防护输入内容
        const cleanComment = preventXSS(sanitizeContent(comment.trim()))
        
        // 创建新评价
        const newReview = {
          id: this.reviews.length + 1,
          serviceId: parseInt(serviceId),
          userId,
          username,
          rating: parseInt(rating),
          comment: cleanComment,
          createdAt: new Date(),
          updatedAt: new Date(),
          isVerified: false, // 新评价需要验证
          helpfulCount: 0,
          reportCount: 0
        }
        
        // 添加到评价列表
        this.reviews.push(newReview)
        
        // 更新用户评价限制
        this.userReviewLimits[userKey] = todayReviews + 1
        
        // 在实际应用中，这里应该发送到后端API
        console.log('新评价提交:', newReview)
        
        return newReview
        
      } catch (error) {
        this.error = error.message
        console.error('提交评价失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },
    
    // 更新评价
    async updateReview(reviewId, updateData) {
      try {
        this.loading = true
        this.error = null
        
        const authStore = useAuthStore()
        if (!authStore.isAuthenticated) {
          throw new Error('Please login first')
        }
        
        const reviewIndex = this.reviews.findIndex(r => r.id === reviewId)
        if (reviewIndex === -1) {
          throw new Error('Review does not exist')
        }
        
        const review = this.reviews[reviewIndex]
        
        // 检查权限
        if (review.userId !== authStore.currentUser.id && !authStore.isAdmin) {
          throw new Error('No permission to modify this review')
        }
        
        // 验证更新数据
        if (updateData.rating && !validateRating(updateData.rating)) {
          throw new Error('评分必须在1-5之间')
        }
        
        if (updateData.comment && !validateComment(updateData.comment)) {
          throw new Error('评论内容不符合要求')
        }
        
        // 更新评价
        const updatedReview = {
          ...review,
          ...updateData,
          updatedAt: new Date()
        }
        
        if (updateData.comment) {
          updatedReview.comment = preventXSS(sanitizeContent(updateData.comment.trim()))
          updatedReview.isVerified = false // 重新验证
        }
        
        this.reviews[reviewIndex] = updatedReview
        
        return updatedReview
        
      } catch (error) {
        this.error = error.message
        console.error('Failed to update review:', error)
        throw error
      } finally {
        this.loading = false
      }
    },
    
    // 删除评价
    async deleteReview(reviewId) {
      try {
        this.loading = true
        this.error = null
        
        const authStore = useAuthStore()
        if (!authStore.isAuthenticated) {
          throw new Error('请先登录')
        }
        
        const reviewIndex = this.reviews.findIndex(r => r.id === reviewId)
        if (reviewIndex === -1) {
          throw new Error('Review does not exist')
        }
        
        const review = this.reviews[reviewIndex]
        
        // 检查权限
        if (review.userId !== authStore.currentUser.id && !authStore.isAdmin) {
          throw new Error('没有权限删除此评价')
        }
        
        // 删除评价
        this.reviews.splice(reviewIndex, 1)
        
        return true
        
      } catch (error) {
        this.error = error.message
        console.error('删除评价失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },
    
    // 标记评价为有用
    async markReviewHelpful(reviewId) {
      try {
        const authStore = useAuthStore()
        if (!authStore.isAuthenticated) {
          throw new Error('请先登录')
        }
        
        const reviewIndex = this.reviews.findIndex(r => r.id === reviewId)
        if (reviewIndex === -1) {
          throw new Error('评价不存在')
        }
        
        // 增加有用计数
        this.reviews[reviewIndex].helpfulCount++
        
        return true
        
      } catch (error) {
        this.error = error.message
        console.error('标记评价失败:', error)
        throw error
      }
    },
    
    // 举报评价
    async reportReview(reviewId, reason) {
      try {
        const authStore = useAuthStore()
        if (!authStore.isAuthenticated) {
          throw new Error('请先登录')
        }
        
        const reviewIndex = this.reviews.findIndex(r => r.id === reviewId)
        if (reviewIndex === -1) {
          throw new Error('评价不存在')
        }
        
        // 增加举报计数
        this.reviews[reviewIndex].reportCount++
        
        // 记录举报信息
        const report = {
          id: this.reportedReviews.length + 1,
          reviewId,
          reporterId: authStore.currentUser.id,
          reason: sanitizeContent(reason),
          createdAt: new Date(),
          status: 'pending'
        }
        
        this.reportedReviews.push(report)
        
        // 如果举报次数过多，自动隐藏评价
        if (this.reviews[reviewIndex].reportCount >= 3) {
          console.log(`评价 ${reviewId} 因举报过多被自动隐藏`)
        }
        
        return true
        
      } catch (error) {
        this.error = error.message
        console.error('举报评价失败:', error)
        throw error
      }
    },
    
    // Admin verify review
    async verifyReview(reviewId, isVerified) {
      try {
        const authStore = useAuthStore()
        if (!authStore.isAdmin) {
          throw new Error('No permission to perform this operation')
        }
        
        const reviewIndex = this.reviews.findIndex(r => r.id === reviewId)
        if (reviewIndex === -1) {
          throw new Error('评价不存在')
        }
        
        this.reviews[reviewIndex].isVerified = isVerified
        this.reviews[reviewIndex].updatedAt = new Date()
        
        return true
        
      } catch (error) {
        this.error = error.message
        console.error('Failed to verify review:', error)
        throw error
      }
    },
    
    // Clear error
    clearError() {
      this.error = null
    },
    
    // Get pending reviews (admin function)
    getPendingReviews() {
      const authStore = useAuthStore()
      if (!authStore.isAdmin) {
        throw new Error('No permission to access this feature')
      }
      
      return this.reviews.filter(review => !review.isVerified)
    },
    
    // Get reported reviews (admin function)
    getReportedReviews() {
      const authStore = useAuthStore()
      if (!authStore.isAdmin) {
        throw new Error('No permission to access this feature')
      }
      
      return this.reportedReviews.filter(report => report.status === 'pending')
    }
  }
})