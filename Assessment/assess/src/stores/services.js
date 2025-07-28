import { defineStore } from 'pinia'
import { useAuthStore } from './auth'
import { useReviewsStore } from './reviews'
import { sanitizeContent } from '@/utils/security'

// Mock service data
const mockServices = [
  {
    id: 1,
    title: 'Free Health Checkup',
    category: 'Preventive Care',
    description: 'Comprehensive health checkup services for vulnerable groups, including basic examination, blood tests, ECG and other items.',
    detailedDescription: 'Our free health checkup service is specially designed for economically disadvantaged vulnerable groups, providing comprehensive and professional health examinations. Checkup items include:\n\n• Basic examination: height, weight, blood pressure, heart rate measurement\n• Blood tests: complete blood count, blood sugar, blood lipids, liver function tests\n• ECG examination\n• Chest X-ray examination\n• Urine examination\n• Professional doctor consultation\n\nAll examinations are conducted by experienced medical staff to ensure accuracy and reliability of results.',
    imageUrl: '/images/health-checkup.jpg',
    rating: 4.8,
    reviewCount: 156,
    serviceTime: 'Monday to Friday 8:00-17:00',
    location: 'Health Care Center 1st Floor Physical Examination Department',
    contact: '400-123-4567',
    features: [
      'Professional medical team',
      'Comprehensive examination items',
      'Free service',
      'Detailed report interpretation',
      'Health advice guidance'
    ],
    requirements: [
      'Advance appointment required',
      'Bring identification documents',
      'Fasting for more than 8 hours',
      'Wear loose clothing'
    ],
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: 2,
    title: 'Mental Health Counseling',
    category: 'Mental Health',
    description: 'Professional psychologists provide one-on-one mental health counseling services to help solve psychological distress and emotional problems.',
    detailedDescription: 'Our mental health counseling service is provided by experienced professional psychologists, dedicated to helping vulnerable groups solve various mental health problems.\n\nServices include:\n\n• Individual psychological counseling\n• Emotional problem guidance\n• Stress management guidance\n• Anxiety and depression intervention\n• Family relationship counseling\n• Career development guidance\n\nWe use various psychotherapy methods, including cognitive behavioral therapy, humanistic therapy, etc., to develop personalized treatment plans for each visitor.',
    imageUrl: '/images/psychological-counseling.jpg',
    rating: 4.9,
    reviewCount: 89,
    serviceTime: 'Monday to Sunday 9:00-21:00',
    location: 'Health Care Center 3rd Floor Psychology Consultation Room',
    contact: '400-123-4568',
    features: [
      'Professional psychologists',
      'One-on-one service',
      'Privacy protection',
      'Multiple treatment methods',
      'Personalized plans'
    ],
    requirements: [
      'Advance appointment required',
      'Keep an open mind',
      'Arrive on time',
      'Cooperate with treatment process'
    ],
    isActive: true,
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-20')
  },
  {
    id: 3,
    title: 'Nutrition and Diet Guidance',
    category: 'Nutritional Health',
    description: 'Professional nutritionists provide personalized nutrition and diet guidance to help improve eating habits and enhance health levels.',
    detailedDescription: 'Our nutrition and diet guidance service is provided by registered nutritionists who develop scientific and reasonable diet plans based on individual health conditions and needs.\n\nServices include:\n\n• Nutritional status assessment\n• Personalized meal plans\n• Recipe design and recommendations\n• Nutrition education\n• Chronic disease diet management\n• Weight loss and gain guidance\n\nWe pay special attention to the nutritional needs of vulnerable groups, providing economical and nutritionally balanced dietary suggestions to help improve malnutrition.',
    imageUrl: '/images/nutrition-guidance.jpg',
    rating: 4.7,
    reviewCount: 67,
    serviceTime: 'Tuesday, Thursday, Saturday 9:00-16:00',
    location: 'Health Care Center 2nd Floor Nutrition Consultation Room',
    contact: '400-123-4569',
    features: [
      'Registered nutritionists',
      'Personalized plans',
      'Economical and affordable',
      'Scientific and reasonable',
      'Continuous tracking'
    ],
    requirements: [
      'Advance appointment required',
      'Provide health reports',
      'Detailed description of eating habits',
      'Cooperate with nutritional assessment'
    ],
    isActive: true,
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-25')
  },
  {
    id: 4,
    title: 'Rehabilitation Therapy Services',
    category: 'Rehabilitation Treatment',
    description: 'Professional rehabilitation therapists provide physical therapy, exercise rehabilitation and other services to help restore body functions.',
    detailedDescription: 'Our rehabilitation therapy service is provided by a professional rehabilitation therapy team, using modern rehabilitation concepts and technologies to help patients restore body functions.\n\nService items include:\n\n• Physical therapy\n• Exercise rehabilitation training\n• Electrotherapy and thermotherapy\n• Massage and manipulation\n• Functional assessment\n• Rehabilitation guidance\n\nWe are equipped with advanced rehabilitation equipment to provide personalized rehabilitation plans for patients with different types of functional disabilities, helping them regain self-care abilities.',
    imageUrl: '/images/rehabilitation.jpg',
    rating: 4.6,
    reviewCount: 43,
    serviceTime: 'Monday to Friday 8:30-17:30',
    location: 'Health Care Center Basement 1st Floor Rehabilitation Department',
    contact: '400-123-4570',
    features: [
      'Professional rehabilitation therapists',
      'Advanced equipment',
      'Personalized plans',
      'Comprehensive assessment',
      'Continuous tracking'
    ],
    requirements: [
      'Doctor referral required',
      'Advance appointment',
      'Wear sports clothing',
      'Cooperate with treatment'
    ],
    isActive: true,
    createdAt: new Date('2024-01-04'),
    updatedAt: new Date('2024-01-30')
  },
  {
    id: 5,
    title: 'Health Education Lectures',
    category: 'Health Education',
    description: 'Regularly organize health knowledge lectures to improve public health awareness and self-care abilities.',
    detailedDescription: 'We regularly organize various health education lectures, inviting professional medical staff and health experts to popularize health knowledge for community residents.\n\nLecture topics include:\n\n• Chronic disease prevention and management\n• Mental health knowledge\n• Nutrition and dietary health\n• Exercise and fitness guidance\n• First aid knowledge training\n• Seasonal disease prevention\n\nAll lectures are free to attend, and we also provide health materials and small gifts, hoping to improve everyone\'s health awareness through education.',
    imageUrl: '/images/health-education.jpg',
    rating: 4.5,
    reviewCount: 128,
    serviceTime: 'Every Saturday 14:00-16:00',
    location: 'Health Care Center 4th Floor Multi-function Hall',
    contact: '400-123-4571',
    features: [
      'Expert lectures',
      'Free participation',
      'Practical knowledge',
      'Interactive communication',
      'Material gifts'
    ],
    requirements: [
      'No appointment needed',
      'Attend on time',
      'Active interaction',
      'Follow order'
    ],
    isActive: true,
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-02-01')
  },
  {
    id: 6,
    title: 'Home Care Services',
    category: 'Nursing Services',
    description: 'Provide professional home care services for elderly and disabled people with mobility difficulties.',
    detailedDescription: 'Our home care service is specially designed for vulnerable groups who have mobility difficulties and cannot visit hospitals for treatment.\n\nServices include:\n\n• Basic care (bathing, dressing, feeding)\n• Medical care (dressing changes, injections, vital signs measurement)\n• Rehabilitation care (functional exercises, massage)\n• Psychological care (companionship, communication)\n• Health monitoring\n• Family guidance\n\nOur nursing team is experienced and holds professional qualifications, able to provide safe, professional, and caring nursing services.',
    imageUrl: '/images/home-care.jpg',
    rating: 4.8,
    reviewCount: 76,
    serviceTime: '24-hour service (appointment required)',
    location: 'Home service',
    contact: '400-123-4572',
    features: [
      'Professional nurses',
      'Home service',
      '24-hour response',
      'Comprehensive care',
      'Family guidance'
    ],
    requirements: [
      'Advance appointment required',
      'Provide medical records',
      'Family cooperation',
      'Prepare nursing supplies'
    ],
    isActive: true,
    createdAt: new Date('2024-01-06'),
    updatedAt: new Date('2024-02-05')
  }
]

export const useServicesStore = defineStore('services', {
  state: () => ({
    services: [...mockServices],
    loading: false,
    error: null,
    searchQuery: '',
    selectedCategory: '',
    sortBy: 'rating', // rating, reviewCount, createdAt
    sortOrder: 'desc' // asc, desc
  }),
  
  getters: {
    // Get all active services
    activeServices: (state) => {
      return state.services.filter(service => service.isActive)
    },
    
    // Get filtered services
    filteredServices: (state) => {
      let filtered = state.services.filter(service => service.isActive)
      
      // Filter by search keywords
      if (state.searchQuery) {
        const query = state.searchQuery.toLowerCase()
        filtered = filtered.filter(service => 
          service.title.toLowerCase().includes(query) ||
          service.description.toLowerCase().includes(query) ||
          service.category.toLowerCase().includes(query)
        )
      }
      
      // Filter by category
      if (state.selectedCategory) {
        filtered = filtered.filter(service => service.category === state.selectedCategory)
      }
      
      // Sort
      filtered.sort((a, b) => {
        let aValue = a[state.sortBy]
        let bValue = b[state.sortBy]
        
        if (state.sortBy === 'createdAt' || state.sortBy === 'updatedAt') {
          aValue = new Date(aValue)
          bValue = new Date(bValue)
        }
        
        if (state.sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1
        } else {
          return aValue < bValue ? 1 : -1
        }
      })
      
      return filtered
    },
    
    // Get all categories
    categories: (state) => {
      const categories = [...new Set(state.services.map(service => service.category))]
      return categories.sort()
    },
    
    // Get service statistics
    serviceStats: (state) => {
      const active = state.services.filter(s => s.isActive)
      return {
        total: active.length,
        totalReviews: active.reduce((sum, s) => sum + s.reviewCount, 0),
        averageRating: active.length > 0 
          ? Math.round((active.reduce((sum, s) => sum + s.rating, 0) / active.length) * 10) / 10
          : 0,
        categories: [...new Set(active.map(s => s.category))].length
      }
    },
    
    // Get popular services (by rating and review count)
    popularServices: (state) => {
      return state.services
        .filter(service => service.isActive)
        .sort((a, b) => {
          const scoreA = a.rating * Math.log(a.reviewCount + 1)
          const scoreB = b.rating * Math.log(b.reviewCount + 1)
          return scoreB - scoreA
        })
        .slice(0, 6)
    },
    
    // Get latest services
    latestServices: (state) => {
      return state.services
        .filter(service => service.isActive)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 6)
    }
  },
  
  actions: {
    // Get single service details
    async getServiceById(id) {
      try {
        this.loading = true
        this.error = null
        
        const service = this.services.find(s => s.id === parseInt(id) && s.isActive)
        if (!service) {
          throw new Error('Service does not exist or is offline')
        }
        
        // Update rating and review count (get latest data from review store)
        const reviewsStore = useReviewsStore()
        const stats = reviewsStore.getReviewStats(service.id)
        
        return {
          ...service,
          rating: stats.average || service.rating,
          reviewCount: stats.total || service.reviewCount
        }
        
      } catch (error) {
        this.error = error.message
        console.error('Failed to get service details:', error)
        throw error
      } finally {
        this.loading = false
      }
    },
    
    // Search services
    searchServices(query) {
      this.searchQuery = sanitizeContent(query.trim())
    },
    
    // Set category filter
    setCategory(category) {
      this.selectedCategory = category
    },
    
    // Set sorting
    setSorting(sortBy, sortOrder = 'desc') {
      this.sortBy = sortBy
      this.sortOrder = sortOrder
    },
    
    // Clear filters
    clearFilters() {
      this.searchQuery = ''
      this.selectedCategory = ''
      this.sortBy = 'rating'
      this.sortOrder = 'desc'
    },
    
    // Add new service (admin function)
    async addService(serviceData) {
      try {
        const authStore = useAuthStore()
        if (!authStore.hasPermission('manage_services')) {
          throw new Error('No permission to add service')
        }
        
        this.loading = true
        this.error = null
        
        // Validate required fields
        const required = ['title', 'category', 'description', 'serviceTime', 'contact']
        for (const field of required) {
          if (!serviceData[field] || !serviceData[field].trim()) {
            throw new Error(`${field} is a required field`)
          }
        }
        
        // Create new service
        const newService = {
          id: Math.max(...this.services.map(s => s.id)) + 1,
          title: sanitizeContent(serviceData.title.trim()),
          category: sanitizeContent(serviceData.category.trim()),
          description: sanitizeContent(serviceData.description.trim()),
          detailedDescription: sanitizeContent(serviceData.detailedDescription || ''),
          imageUrl: serviceData.imageUrl || '/images/default-service.jpg',
          rating: 0,
          reviewCount: 0,
          serviceTime: sanitizeContent(serviceData.serviceTime.trim()),
          location: sanitizeContent(serviceData.location || ''),
          contact: sanitizeContent(serviceData.contact.trim()),
          features: serviceData.features || [],
          requirements: serviceData.requirements || [],
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
        
        this.services.push(newService)
        
        return newService
        
      } catch (error) {
        this.error = error.message
        console.error('Failed to add service:', error)
        throw error
      } finally {
        this.loading = false
      }
    },
    
    // Update service (admin function)
    async updateService(serviceId, updateData) {
      try {
        const authStore = useAuthStore()
        if (!authStore.hasPermission('manage_services')) {
          throw new Error('No permission to modify service')
        }
        
        this.loading = true
        this.error = null
        
        const serviceIndex = this.services.findIndex(s => s.id === serviceId)
        if (serviceIndex === -1) {
          throw new Error('Service does not exist')
        }
        
        // Clean update data
        const cleanData = {}
        for (const [key, value] of Object.entries(updateData)) {
          if (typeof value === 'string') {
            cleanData[key] = sanitizeContent(value.trim())
          } else {
            cleanData[key] = value
          }
        }
        
        // Update service
        this.services[serviceIndex] = {
          ...this.services[serviceIndex],
          ...cleanData,
          updatedAt: new Date()
        }
        
        return this.services[serviceIndex]
        
      } catch (error) {
        this.error = error.message
        console.error('Failed to update service:', error)
        throw error
      } finally {
        this.loading = false
      }
    },
    
    // Delete service (admin function)
    async deleteService(serviceId) {
      try {
        const authStore = useAuthStore()
        if (!authStore.hasPermission('manage_services')) {
          throw new Error('No permission to delete service')
        }
        
        this.loading = true
        this.error = null
        
        const serviceIndex = this.services.findIndex(s => s.id === serviceId)
        if (serviceIndex === -1) {
          throw new Error('服务不存在')
        }
        
        // Soft delete: set to inactive
        this.services[serviceIndex].isActive = false
        this.services[serviceIndex].updatedAt = new Date()
        
        return true
        
      } catch (error) {
        this.error = error.message
        console.error('Failed to delete service:', error)
        throw error
      } finally {
        this.loading = false
      }
    },
    
    // Clear error
    clearError() {
      this.error = null
    },
    
    // Refresh service data
    async refreshServices() {
      try {
        this.loading = true
        this.error = null
        
        // In real applications, this would fetch latest data from API
        // Now just simulating refresh
        await new Promise(resolve => setTimeout(resolve, 500))
        
        console.log('Service data refreshed')
        
      } catch (error) {
        this.error = error.message
        console.error('Failed to refresh service data:', error)
        throw error
      } finally {
        this.loading = false
      }
    }
  }
})