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
    
    // Get average rating for specific service
    getAverageRating: (state) => (serviceId) => {
      const serviceReviews = state.reviews.filter(review => 
        review.serviceId === serviceId && review.reportCount < 3
      )
      if (serviceReviews.length === 0) return 0
      
      const totalRating = serviceReviews.reduce((sum, review) => sum + review.rating, 0)
      return Math.round((totalRating / serviceReviews.length) * 10) / 10
    },
    
    // Get review statistics for specific service
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
    
    // Get user reviews
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
    // Submit review
    async submitReview(reviewData) {
      try {
        this.loading = true
        this.error = null
        
        const authStore = useAuthStore()
        if (!authStore.isAuthenticated) {
          throw new Error('Please login first to submit a review')
        }
        
        const { serviceId, rating, comment } = reviewData
        const userId = authStore.currentUser.id
        const username = authStore.currentUser.username
        
        // Validate input
        if (!validateRating(rating)) {
          throw new Error('Rating must be between 1-5')
        }
        
        if (!validateComment(comment)) {
          throw new Error('Review content does not meet requirements')
        }
        
        // Check if user has already reviewed
        if (this.hasUserReviewed(serviceId, userId)) {
          throw new Error('You have already reviewed this service')
        }
        
        // Check review frequency limit
        const today = new Date().toDateString()
        const userKey = `${userId}_${today}`
        const todayReviews = this.userReviewLimits[userKey] || 0
        
        if (todayReviews >= 5) {
          throw new Error('Maximum 5 reviews per day allowed')
        }
        
        // Clean and sanitize input content
        const cleanComment = preventXSS(sanitizeContent(comment.trim()))
        
        // Create new review
        const newReview = {
          id: this.reviews.length + 1,
          serviceId: parseInt(serviceId),
          userId,
          username,
          rating: parseInt(rating),
          comment: cleanComment,
          createdAt: new Date(),
          updatedAt: new Date(),
          isVerified: false, // New reviews need verification
          helpfulCount: 0,
          reportCount: 0
        }
        
        // Add to reviews list
        this.reviews.push(newReview)
        
        // Update user review limits
        this.userReviewLimits[userKey] = todayReviews + 1
        
        // In real application, this should be sent to backend API
        console.log('New review submitted:', newReview)
        
        return newReview
        
      } catch (error) {
        this.error = error.message
        console.error('Failed to submit review:', error)
        throw error
      } finally {
        this.loading = false
      }
    },
    
    // Update review
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
        
        // Check permissions
        if (review.userId !== authStore.currentUser.id && !authStore.isAdmin) {
          throw new Error('No permission to modify this review')
        }
        
        // Validate update data
        if (updateData.rating && !validateRating(updateData.rating)) {
          throw new Error('Rating must be between 1-5')
        }
        
        if (updateData.comment && !validateComment(updateData.comment)) {
          throw new Error('Comment content does not meet requirements')
        }
        
        // Update review
        const updatedReview = {
          ...review,
          ...updateData,
          updatedAt: new Date()
        }
        
        if (updateData.comment) {
          updatedReview.comment = preventXSS(sanitizeContent(updateData.comment.trim()))
          updatedReview.isVerified = false // Re-verify
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
    
    // Delete review
    async deleteReview(reviewId) {
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
        
        // Check permissions
        if (review.userId !== authStore.currentUser.id && !authStore.isAdmin) {
          throw new Error('No permission to delete this review')
        }
        
        // Delete review
        this.reviews.splice(reviewIndex, 1)
        
        return true
        
      } catch (error) {
        this.error = error.message
        console.error('Failed to delete review:', error)
        throw error
      } finally {
        this.loading = false
      }
    },
    
    // Mark review as helpful
    async markReviewHelpful(reviewId) {
      try {
        const authStore = useAuthStore()
        if (!authStore.isAuthenticated) {
          throw new Error('Please login first')
        }
        
        const reviewIndex = this.reviews.findIndex(r => r.id === reviewId)
        if (reviewIndex === -1) {
          throw new Error('Review does not exist')
        }
        
        // Increase helpful count
        this.reviews[reviewIndex].helpfulCount++
        
        return true
        
      } catch (error) {
        this.error = error.message
        console.error('Failed to mark review:', error)
        throw error
      }
    },
    
    // Report review
    async reportReview(reviewId, reason) {
      try {
        const authStore = useAuthStore()
        if (!authStore.isAuthenticated) {
          throw new Error('Please login first')
        }
        
        const reviewIndex = this.reviews.findIndex(r => r.id === reviewId)
        if (reviewIndex === -1) {
          throw new Error('Review does not exist')
        }
        
        // Increase report count
        this.reviews[reviewIndex].reportCount++
        
        // Record report information
        const report = {
          id: this.reportedReviews.length + 1,
          reviewId,
          reporterId: authStore.currentUser.id,
          reason: sanitizeContent(reason),
          createdAt: new Date(),
          status: 'pending'
        }
        
        this.reportedReviews.push(report)
        
        // Auto-hide review if reported too many times
        if (this.reviews[reviewIndex].reportCount >= 3) {
          console.log(`Review ${reviewId} auto-hidden due to excessive reports`)
        }
        
        return true
        
      } catch (error) {
        this.error = error.message
        console.error('Failed to report review:', error)
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
          throw new Error('Review does not exist')
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