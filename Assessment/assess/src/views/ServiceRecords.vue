<template>
  <div class="service-records">
    <div class="container mx-auto px-4 py-8">
      <!-- Page Title -->
      <div class="page-header">
        <h1 class="page-title">Service Records Management</h1>
        <p class="page-description">Manage and track all volunteer service records</p>
      </div>

      <!-- Statistics Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">📊</div>
          <div class="stat-content">
            <div class="stat-number">{{ totalRecords }}</div>
            <div class="stat-label">Total Records</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">⏱️</div>
          <div class="stat-content">
            <div class="stat-number">{{ totalHours }}</div>
            <div class="stat-label">Total Hours</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">✅</div>
          <div class="stat-content">
            <div class="stat-number">{{ completedRecords }}</div>
            <div class="stat-label">Completed</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">⏳</div>
          <div class="stat-content">
            <div class="stat-number">{{ pendingRecords }}</div>
            <div class="stat-label">In Progress</div>
          </div>
        </div>
      </div>

      <!-- Action Buttons Area -->
      <div class="action-bar">
        <button @click="addRecord" class="btn btn-primary">
          <span class="btn-icon">➕</span>
          Add Record
        </button>
        <button @click="refreshRecords" class="btn btn-secondary">
          <span class="btn-icon">🔄</span>
          Refresh Data
        </button>
        <button @click="exportRecords" class="btn btn-outline">
          <span class="btn-icon">📥</span>
          Export Data
        </button>
        <div class="filter-group">
          <select v-model="statusFilter" @change="applyFilters" class="filter-select">
            <option value="">All Status</option>
            <option value="pending">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select v-model="categoryFilter" @change="applyFilters" class="filter-select">
            <option value="">All Categories</option>
            <option value="education">Education Support</option>
            <option value="healthcare">Healthcare</option>
            <option value="environment">Environment</option>
            <option value="community">Community Service</option>
            <option value="elderly">Elderly Care</option>
          </select>
        </div>
      </div>

      <!-- Data Table -->
      <DataTable
        :data="filteredRecords"
        :columns="recordColumns"
        :loading="loading"
        title="Service Records List"
        search-placeholder="Search by service name, volunteer or location..."
        no-data-text="No service records available"
        :default-page-size="10"
        default-sort-column="createdAt"
        default-sort-direction="desc"
        @row-click="handleRowClick"
        @refresh="refreshRecords"
      >
        <!-- Custom Status Column -->
        <template #column-status="{ row }">
          <span class="status-badge" :class="getStatusClass(row.status)">
            {{ getStatusText(row.status) }}
          </span>
        </template>

        <!-- Custom Category Column -->
        <template #column-category="{ row }">
          <span class="category-badge" :class="getCategoryClass(row.category)">
            {{ getCategoryText(row.category) }}
          </span>
        </template>

        <!-- Custom Priority Column -->
        <template #column-priority="{ row }">
          <span class="priority-badge" :class="getPriorityClass(row.priority)">
            {{ getPriorityText(row.priority) }}
          </span>
        </template>

        <!-- Custom Progress Column -->
        <template #column-progress="{ row }">
          <div class="progress-container">
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                :style="{ width: row.progress + '%' }"
                :class="getProgressClass(row.progress)"
              ></div>
            </div>
            <span class="progress-text">{{ row.progress }}%</span>
          </div>
        </template>

        <!-- Custom Actions Column -->
        <template #column-actions="{ row }">
          <div class="action-buttons">
            <button @click.stop="editRecord(row)" class="action-btn edit-btn" title="Edit">
               ✏️
             </button>
             <button @click.stop="viewRecord(row)" class="action-btn view-btn" title="View">
               👁️
             </button>
             <button 
               v-if="row.status !== 'completed'"
               @click.stop="completeRecord(row)" 
               class="action-btn complete-btn" 
               title="Mark Complete"
             >
               ✅
             </button>
             <button 
               v-if="row.status === 'pending'"
               @click.stop="cancelRecord(row)" 
               class="action-btn cancel-btn" 
               title="Cancel"
             >
               ❌
             </button>
             <button @click.stop="deleteRecord(row)" class="action-btn delete-btn" title="Delete">
               🗑️
             </button>
          </div>
        </template>
      </DataTable>
    </div>

    <!-- Service Record Details Modal -->
    <div v-if="showRecordModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ modalMode === 'add' ? 'Add Service Record' : modalMode === 'edit' ? 'Edit Service Record' : 'Service Record Details' }}</h3>
          <button @click="closeModal" class="close-btn">×</button>
        </div>
        
        <div class="modal-body">
          <div v-if="modalMode === 'view'" class="record-details">
            <div class="detail-section">
              <h4>Basic Information</h4>
              <div class="detail-grid">
                <div class="detail-row">
                  <label>Service Name:</label>
                  <span>{{ selectedRecord.serviceName }}</span>
                </div>
                <div class="detail-row">
                  <label>Volunteer:</label>
                  <span>{{ selectedRecord.volunteerName }}</span>
                </div>
                <div class="detail-row">
                  <label>Category:</label>
                  <span class="category-badge" :class="getCategoryClass(selectedRecord.category)">
                    {{ getCategoryText(selectedRecord.category) }}
                  </span>
                </div>
                <div class="detail-row">
                  <label>Status:</label>
                  <span class="status-badge" :class="getStatusClass(selectedRecord.status)">
                    {{ getStatusText(selectedRecord.status) }}
                  </span>
                </div>
                <div class="detail-row">
                  <label>Priority:</label>
                  <span class="priority-badge" :class="getPriorityClass(selectedRecord.priority)">
                    {{ getPriorityText(selectedRecord.priority) }}
                  </span>
                </div>
                <div class="detail-row">
                  <label>Progress:</label>
                  <div class="progress-container">
                    <div class="progress-bar">
                      <div 
                        class="progress-fill" 
                        :style="{ width: selectedRecord.progress + '%' }"
                        :class="getProgressClass(selectedRecord.progress)"
                      ></div>
                    </div>
                    <span class="progress-text">{{ selectedRecord.progress }}%</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="detail-section">
              <h4>Time Information</h4>
              <div class="detail-grid">
                <div class="detail-row">
                  <label>Start Time:</label>
                  <span>{{ formatDateTime(selectedRecord.startTime) }}</span>
                </div>
                <div class="detail-row">
                  <label>End Time:</label>
                  <span>{{ selectedRecord.endTime ? formatDateTime(selectedRecord.endTime) : 'Not Set' }}</span>
                </div>
                <div class="detail-row">
                  <label>Duration:</label>
                  <span>{{ selectedRecord.duration }} hours</span>
                </div>
                <div class="detail-row">
                  <label>Created At:</label>
                  <span>{{ formatDateTime(selectedRecord.createdAt) }}</span>
                </div>
              </div>
            </div>
            
            <div class="detail-section">
              <h4>Other Information</h4>
              <div class="detail-grid">
                <div class="detail-row">
                  <label>Location:</label>
                  <span>{{ selectedRecord.location }}</span>
                </div>
                <div class="detail-row">
                  <label>Contact Phone:</label>
                  <span>{{ selectedRecord.contactPhone }}</span>
                </div>
                <div class="detail-row full-width">
                  <label>Description:</label>
                  <p class="description-text">{{ selectedRecord.description }}</p>
                </div>
                <div v-if="selectedRecord.notes" class="detail-row full-width">
                  <label>Notes:</label>
                  <p class="notes-text">{{ selectedRecord.notes }}</p>
                </div>
              </div>
            </div>
          </div>
          
          <form v-else @submit.prevent="saveRecord" class="record-form">
            <div class="form-grid">
              <div class="form-group">
                <label for="serviceName">Service Name *</label>
                <input
                  id="serviceName"
                  v-model="recordForm.serviceName"
                  type="text"
                  required
                  class="form-input"
                  placeholder="Enter service name"
                />
              </div>
              
              <div class="form-group">
                <label for="volunteerName">Volunteer *</label>
                <input
                  id="volunteerName"
                  v-model="recordForm.volunteerName"
                  type="text"
                  required
                  class="form-input"
                  placeholder="Enter volunteer name"
                />
              </div>
              
              <div class="form-group">
                <label for="category">Category *</label>
                <select id="category" v-model="recordForm.category" required class="form-select">
                  <option value="">Select category</option>
                  <option value="education">Education Support</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="environment">Environment</option>
                  <option value="community">Community Service</option>
                  <option value="elderly">Elderly Care</option>
                </select>
              </div>
              
              <div class="form-group">
                <label for="priority">Priority</label>
                <select id="priority" v-model="recordForm.priority" class="form-select">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              
              <div class="form-group">
                <label for="startTime">Start Time *</label>
                <input
                  id="startTime"
                  v-model="recordForm.startTime"
                  type="datetime-local"
                  required
                  class="form-input"
                />
              </div>
              
              <div class="form-group">
                <label for="endTime">End Time</label>
                <input
                  id="endTime"
                  v-model="recordForm.endTime"
                  type="datetime-local"
                  class="form-input"
                />
              </div>
              
              <div class="form-group">
                <label for="duration">Duration (hours) *</label>
                <input
                  id="duration"
                  v-model.number="recordForm.duration"
                  type="number"
                  min="0.5"
                  step="0.5"
                  required
                  class="form-input"
                  placeholder="Enter service duration"
                />
              </div>
              
              <div class="form-group">
                <label for="location">Location *</label>
                <input
                  id="location"
                  v-model="recordForm.location"
                  type="text"
                  required
                  class="form-input"
                  placeholder="Enter service location"
                />
              </div>
              
              <div class="form-group">
                <label for="contactPhone">Contact Phone</label>
                <input
                  id="contactPhone"
                  v-model="recordForm.contactPhone"
                  type="tel"
                  class="form-input"
                  placeholder="Enter contact phone"
                />
              </div>
              
              <div class="form-group">
                <label for="progress">Progress (%)</label>
                <input
                  id="progress"
                  v-model.number="recordForm.progress"
                  type="number"
                  min="0"
                  max="100"
                  class="form-input"
                  placeholder="0-100"
                />
              </div>
            </div>
            
            <div class="form-group full-width">
              <label for="description">Description</label>
              <textarea
                id="description"
                v-model="recordForm.description"
                class="form-textarea"
                rows="4"
                placeholder="Describe service content and requirements"
              ></textarea>
            </div>
            
            <div class="form-group full-width">
              <label for="notes">Notes</label>
              <textarea
                id="notes"
                v-model="recordForm.notes"
                class="form-textarea"
                rows="3"
                placeholder="Additional notes"
              ></textarea>
            </div>
            
            <div class="form-actions">
              <button type="button" @click="closeModal" class="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" class="btn btn-primary">
                {{ modalMode === 'add' ? 'Add' : 'Save' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import DataTable from '../components/DataTable.vue'

export default {
  name: 'ServiceRecords',
  components: {
    DataTable
  },
  setup() {
    // Reactive data
    const records = ref([])
    const filteredRecords = ref([])
    const loading = ref(false)
    const showRecordModal = ref(false)
    const modalMode = ref('view') // 'view', 'add', 'edit'
    const selectedRecord = ref({})
    const statusFilter = ref('')
    const categoryFilter = ref('')
    
    const recordForm = reactive({
      serviceName: '',
      volunteerName: '',
      category: '',
      priority: 'medium',
      startTime: '',
      endTime: '',
      duration: 1,
      location: '',
      contactPhone: '',
      progress: 0,
      description: '',
      notes: ''
    })

    // Table column configuration
    const recordColumns = [
      {
        key: 'serviceName',
        title: 'Service Name',
        sortable: true,
        searchable: true
      },
      {
        key: 'volunteerName',
        title: 'Volunteer',
        sortable: true,
        searchable: true
      },
      {
        key: 'category',
        title: 'Category',
        sortable: true,
        searchable: true
      },
      {
        key: 'status',
        title: 'Status',
        sortable: true,
        searchable: true
      },
      {
        key: 'priority',
        title: 'Priority',
        sortable: true,
        searchable: false
      },
      {
        key: 'progress',
        title: 'Progress',
        sortable: true,
        searchable: false
      },
      {
        key: 'duration',
        title: 'Duration(h)',
        sortable: true,
        searchable: false
      },
      {
        key: 'location',
        title: 'Location',
        sortable: true,
        searchable: true
      },
      {
        key: 'startTime',
        title: 'Start Time',
        sortable: true,
        searchable: false,
        formatter: (value) => formatDateTime(value)
      },
      {
        key: 'actions',
        title: 'Actions',
        sortable: false,
        searchable: false
      }
    ]

    // Computed properties
    const totalRecords = computed(() => records.value.length)
    const totalHours = computed(() => records.value.reduce((sum, record) => sum + record.duration, 0))
    const completedRecords = computed(() => records.value.filter(r => r.status === 'completed').length)
    const pendingRecords = computed(() => records.value.filter(r => r.status === 'pending').length)

    // Mock service records data
    const generateMockRecords = () => {
      const serviceNames = [
        'Community Cleanup', 'Elderly Companion Service', 'Children Education Tutoring', 'Environmental Awareness', 'Health Consultation',
        'Library Volunteer Service', 'Food Bank Distribution', 'Tree Planting Activity', 'Disability Support', 'Mental Health Seminar',
        'Traffic Safety Campaign', 'Cultural Arts Performance', 'Technology Education', 'Legal Aid Consultation', 'Emergency Response Training'
      ]
      
      const volunteerNames = [
        'John Smith', 'Emma Johnson', 'Michael Brown', 'Sarah Davis', 'David Wilson', 'Lisa Anderson', 'James Taylor', 'Mary Martinez',
        'Robert Garcia', 'Jennifer Rodriguez', 'William Lewis', 'Elizabeth Walker', 'Christopher Hall', 'Jessica Allen', 'Daniel Young', 'Ashley King'
      ]
      
      const categories = ['education', 'healthcare', 'environment', 'community', 'elderly']
      const statuses = ['pending', 'completed', 'cancelled']
      const priorities = ['low', 'medium', 'high', 'urgent']
      const locations = [
        'Community Center', 'City Library', 'Park Square', 'School Playground', 'Hospital Lobby',
        'Nursing Home', 'Kindergarten', 'District Office', 'Cultural Center', 'Sports Center'
      ]
      
      return Array.from({ length: 80 }, (_, index) => {
        const startTime = new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000)
        const duration = Math.floor(Math.random() * 8) + 1
        const endTime = new Date(startTime.getTime() + duration * 60 * 60 * 1000)
        const status = statuses[Math.floor(Math.random() * statuses.length)]
        const progress = status === 'completed' ? 100 : 
                        status === 'cancelled' ? 0 : 
                        Math.floor(Math.random() * 90) + 10
        
        return {
          id: index + 1,
          serviceName: serviceNames[index % serviceNames.length],
          volunteerName: volunteerNames[index % volunteerNames.length],
          category: categories[Math.floor(Math.random() * categories.length)],
          status,
          priority: priorities[Math.floor(Math.random() * priorities.length)],
          startTime: startTime.toISOString(),
          endTime: status === 'completed' ? endTime.toISOString() : null,
          duration,
          location: locations[Math.floor(Math.random() * locations.length)],
          contactPhone: `138${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
          progress,
          description: `This is a detailed description of ${serviceNames[index % serviceNames.length]}, including service content, requirements and precautions.`,
          notes: Math.random() > 0.7 ? 'Items requiring special attention' : '',
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
        }
      })
    }

    // Methods
    const loadRecords = async () => {
      loading.value = true
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        records.value = generateMockRecords()
        applyFilters()
      } catch (error) {
        console.error('Failed to load service records:', error)
      } finally {
        loading.value = false
      }
    }

    const refreshRecords = () => {
      loadRecords()
    }

    const applyFilters = () => {
      let filtered = [...records.value]
      
      if (statusFilter.value) {
        filtered = filtered.filter(record => record.status === statusFilter.value)
      }
      
      if (categoryFilter.value) {
        filtered = filtered.filter(record => record.category === categoryFilter.value)
      }
      
      filteredRecords.value = filtered
    }

    const getStatusClass = (status) => {
      const classes = {
        pending: 'status-pending',
        completed: 'status-completed',
        cancelled: 'status-cancelled'
      }
      return classes[status] || ''
    }

    const getStatusText = (status) => {
      const texts = {
        pending: 'In Progress',
        completed: 'Completed',
        cancelled: 'Cancelled'
      }
      return texts[status] || status
    }

    const getCategoryClass = (category) => {
      const classes = {
        education: 'category-education',
        healthcare: 'category-healthcare',
        environment: 'category-environment',
        community: 'category-community',
        elderly: 'category-elderly'
      }
      return classes[category] || ''
    }

    const getCategoryText = (category) => {
      const texts = {
        education: 'Education Support',
        healthcare: 'Healthcare',
        environment: 'Environment',
        community: 'Community Service',
        elderly: 'Elderly Care'
      }
      return texts[category] || category
    }

    const getPriorityClass = (priority) => {
      const classes = {
        low: 'priority-low',
        medium: 'priority-medium',
        high: 'priority-high',
        urgent: 'priority-urgent'
      }
      return classes[priority] || ''
    }

    const getPriorityText = (priority) => {
      const texts = {
        low: 'Low',
        medium: 'Medium',
        high: 'High',
        urgent: 'Urgent'
      }
      return texts[priority] || priority
    }

    const getProgressClass = (progress) => {
      if (progress >= 80) return 'progress-high'
      if (progress >= 50) return 'progress-medium'
      return 'progress-low'
    }

    const formatDateTime = (dateString) => {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const handleRowClick = ({ row }) => {
      viewRecord(row)
    }

    const addRecord = () => {
      modalMode.value = 'add'
      Object.assign(recordForm, {
        serviceName: '',
        volunteerName: '',
        category: '',
        priority: 'medium',
        startTime: '',
        endTime: '',
        duration: 1,
        location: '',
        contactPhone: '',
        progress: 0,
        description: '',
        notes: ''
      })
      showRecordModal.value = true
    }

    const editRecord = (record) => {
      modalMode.value = 'edit'
      selectedRecord.value = record
      Object.assign(recordForm, {
        serviceName: record.serviceName,
        volunteerName: record.volunteerName,
        category: record.category,
        priority: record.priority,
        startTime: record.startTime ? record.startTime.slice(0, 16) : '',
        endTime: record.endTime ? record.endTime.slice(0, 16) : '',
        duration: record.duration,
        location: record.location,
        contactPhone: record.contactPhone,
        progress: record.progress,
        description: record.description,
        notes: record.notes
      })
      showRecordModal.value = true
    }

    const viewRecord = (record) => {
      modalMode.value = 'view'
      selectedRecord.value = record
      showRecordModal.value = true
    }

    const completeRecord = (record) => {
      if (confirm(`Are you sure you want to mark service "${record.serviceName}" as completed?`)) {
        record.status = 'completed'
        record.progress = 100
        record.endTime = new Date().toISOString()
        applyFilters()
        alert('Service marked as completed')
      }
    }

    const cancelRecord = (record) => {
      if (confirm(`Are you sure you want to cancel service "${record.serviceName}"?`)) {
        record.status = 'cancelled'
        record.progress = 0
        applyFilters()
        alert('Service cancelled')
      }
    }

    const deleteRecord = (record) => {
      if (confirm(`Are you sure you want to delete service record "${record.serviceName}"?`)) {
        const index = records.value.findIndex(r => r.id === record.id)
        if (index > -1) {
          records.value.splice(index, 1)
          applyFilters()
          alert('Service record deleted successfully')
        }
      }
    }

    const saveRecord = () => {
      if (modalMode.value === 'add') {
        const newRecord = {
          id: Math.max(...records.value.map(r => r.id)) + 1,
          ...recordForm,
          status: 'pending',
          createdAt: new Date().toISOString()
        }
        records.value.unshift(newRecord)
        alert('Service record added successfully')
      } else if (modalMode.value === 'edit') {
        Object.assign(selectedRecord.value, recordForm)
        alert('Service record updated successfully')
      }
      applyFilters()
      closeModal()
    }

    const closeModal = () => {
      showRecordModal.value = false
      selectedRecord.value = {}
    }

    const exportRecords = () => {
      const headers = [
        'ID', 'Service Name', 'Volunteer', 'Category', 'Status', 'Priority', 'Progress(%)', 
        'Duration(h)', 'Location', 'Contact Phone', 'Start Time', 'End Time', 'Created At'
      ]
      const rows = filteredRecords.value.map(record => [
        record.id,
        record.serviceName,
        record.volunteerName,
        getCategoryText(record.category),
        getStatusText(record.status),
        getPriorityText(record.priority),
        record.progress,
        record.duration,
        record.location,
        record.contactPhone,
        formatDateTime(record.startTime),
        record.endTime ? formatDateTime(record.endTime) : '',
        formatDateTime(record.createdAt)
      ])
      
      const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n')
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', 'service-records.csv')
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    }

    // Lifecycle
    onMounted(() => {
      loadRecords()
    })

    return {
      records,
      filteredRecords,
      loading,
      recordColumns,
      showRecordModal,
      modalMode,
      selectedRecord,
      recordForm,
      statusFilter,
      categoryFilter,
      totalRecords,
      totalHours,
      completedRecords,
      pendingRecords,
      refreshRecords,
      applyFilters,
      getStatusClass,
      getStatusText,
      getCategoryClass,
      getCategoryText,
      getPriorityClass,
      getPriorityText,
      getProgressClass,
      formatDateTime,
      handleRowClick,
      addRecord,
      editRecord,
      viewRecord,
      completeRecord,
      cancelRecord,
      deleteRecord,
      saveRecord,
      closeModal,
      exportRecords
    }
  }
}
</script>

<style scoped>
.service-records {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.container {
  max-width: 1400px;
}

/* Page header */
.page-header {
  text-align: center;
  margin-bottom: 30px;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 10px;
}

.page-description {
  font-size: 1.1rem;
  color: #6c757d;
  margin: 0;
}

/* Statistics cards */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 16px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  font-size: 2.5rem;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #42b983, #369870);
  border-radius: 12px;
  color: white;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 0.9rem;
  color: #6c757d;
  font-weight: 500;
}

/* Action bar */
.action-bar {
  display: flex;
  gap: 15px;
  margin-bottom: 25px;
  flex-wrap: wrap;
  align-items: center;
}

.filter-group {
  display: flex;
  gap: 10px;
  margin-left: auto;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  min-width: 120px;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
}

.btn-primary {
  background: #42b983;
  color: white;
}

.btn-primary:hover {
  background: #369870;
  transform: translateY(-1px);
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
}

.btn-outline {
  background: transparent;
  color: #42b983;
  border: 2px solid #42b983;
}

.btn-outline:hover {
  background: #42b983;
  color: white;
}

.btn-icon {
  font-size: 16px;
}

/* Status badges */
.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
}

.status-pending {
  background: #fff3cd;
  color: #856404;
}

.status-completed {
  background: #d4edda;
  color: #155724;
}

.status-cancelled {
  background: #f8d7da;
  color: #721c24;
}

/* Category badges */
.category-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.category-education {
  background: #e7f3ff;
  color: #0056b3;
}

.category-healthcare {
  background: #fff2e7;
  color: #d63384;
}

.category-environment {
  background: #e8f5e8;
  color: #28a745;
}

.category-community {
  background: #f3e5f5;
  color: #6f42c1;
}

.category-elderly {
  background: #ffeaa7;
  color: #b8860b;
}

/* Priority badges */
.priority-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.priority-low {
  background: #e2e3e5;
  color: #495057;
}

.priority-medium {
  background: #fff3cd;
  color: #856404;
}

.priority-high {
  background: #ffeaa7;
  color: #e17055;
}

.priority-urgent {
  background: #f8d7da;
  color: #721c24;
}

/* Progress bar */
.progress-container {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  transition: width 0.3s ease;
  border-radius: 4px;
}

.progress-low {
  background: #dc3545;
}

.progress-medium {
  background: #ffc107;
}

.progress-high {
  background: #28a745;
}

.progress-text {
  font-size: 12px;
  font-weight: 500;
  color: #6c757d;
  min-width: 35px;
}

/* Action buttons */
.action-buttons {
  display: flex;
  gap: 6px;
}

.action-btn {
  padding: 6px 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
  background: #f8f9fa;
}

.action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.edit-btn:hover {
  background: #fff3cd;
}

.view-btn:hover {
  background: #d1ecf1;
}

.complete-btn:hover {
  background: #d4edda;
}

.cancel-btn:hover {
  background: #f8d7da;
}

.delete-btn:hover {
  background: #f5c6cb;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  max-width: 800px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #dee2e6;
}

.modal-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.5rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6c757d;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: #f8f9fa;
  color: #495057;
}

.modal-body {
  padding: 20px;
}

/* Record details */
.record-details {
  display: grid;
  gap: 30px;
}

.detail-section h4 {
  margin: 0 0 15px 0;
  color: #2c3e50;
  font-size: 1.2rem;
  border-bottom: 2px solid #42b983;
  padding-bottom: 8px;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 15px;
}

.detail-row {
  display: grid;
  grid-template-columns: 120px 1fr;
  align-items: center;
  gap: 15px;
}

.detail-row.full-width {
  grid-column: 1 / -1;
  grid-template-columns: 120px 1fr;
}

.detail-row label {
  font-weight: 600;
  color: #495057;
}

.description-text,
.notes-text {
  margin: 0;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 6px;
  line-height: 1.5;
}

/* Record form */
.record-form {
  display: grid;
  gap: 20px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.form-group {
  display: grid;
  gap: 8px;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  font-weight: 500;
  color: #495057;
}

.form-input,
.form-select,
.form-textarea {
  padding: 10px 12px;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.3s ease;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  border-color: #42b983;
  box-shadow: 0 0 0 2px rgba(66, 185, 131, 0.2);
}

.form-textarea {
  resize: vertical;
  font-family: inherit;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 10px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .page-title {
    font-size: 2rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .action-bar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-group {
    margin-left: 0;
    justify-content: center;
  }
  
  .detail-grid {
    grid-template-columns: 1fr;
  }
  
  .detail-row {
    grid-template-columns: 1fr;
    gap: 5px;
  }
  
  .detail-row label {
    font-size: 14px;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .modal-content {
    width: 95%;
    margin: 20px;
  }
}
</style>