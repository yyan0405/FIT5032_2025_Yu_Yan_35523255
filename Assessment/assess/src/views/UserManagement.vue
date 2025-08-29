<template>
  <div class="user-management">
    <div class="container mx-auto px-4 py-8">
      <!-- Page Title -->
      <div class="page-header">
        <h1 class="page-title">User Management</h1>
        <p class="page-description">Manage all user information in the system</p>
      </div>

      <!-- Action Buttons Area -->
      <div class="action-bar">
        <button @click="addUser" class="btn btn-primary">
          <span class="btn-icon">➕</span>
          Add User
        </button>
        <button @click="refreshUsers" class="btn btn-secondary">
          <span class="btn-icon">🔄</span>
          Refresh Data
        </button>
        <button @click="exportUsers" class="btn btn-outline">
          <span class="btn-icon">📥</span>
          Export Data
        </button>
      </div>

      <!-- Data Table -->
      <DataTable
        :data="users"
        :columns="userColumns"
        :loading="loading"
        title="User List"
        search-placeholder="Search by name, email or role..."
        no-data-text="No user data available"
        :default-page-size="10"
        default-sort-column="createdAt"
        default-sort-direction="desc"
        @row-click="handleRowClick"
        @refresh="refreshUsers"
      >
        <!-- Custom Avatar Column -->
        <template #column-avatar="{ row }">
          <div class="user-avatar">
            <img v-if="row.avatar" :src="row.avatar" :alt="row.name" class="avatar-img" />
            <div v-else class="avatar-placeholder">
              {{ getInitials(row.name) }}
            </div>
          </div>
        </template>

        <!-- Custom Status Column -->
        <template #column-status="{ row }">
          <span class="status-badge" :class="getStatusClass(row.status)">
            {{ getStatusText(row.status) }}
          </span>
        </template>

        <!-- Custom Role Column -->
        <template #column-role="{ row }">
          <span class="role-badge" :class="getRoleClass(row.role)">
            {{ getRoleText(row.role) }}
          </span>
        </template>

        <!-- Custom Actions Column -->
        <template #column-actions="{ row }">
          <div class="action-buttons">
            <button @click.stop="editUser(row)" class="action-btn edit-btn" title="Edit">
              ✏️
            </button>
            <button @click.stop="viewUser(row)" class="action-btn view-btn" title="View">
              👁️
            </button>
            <button 
              @click.stop="toggleUserStatus(row)" 
              class="action-btn"
              :class="row.status === 'active' ? 'disable-btn' : 'enable-btn'"
              :title="row.status === 'active' ? 'Disable' : 'Enable'"
            >
              {{ row.status === 'active' ? '🚫' : '✅' }}
            </button>
            <button @click.stop="deleteUser(row)" class="action-btn delete-btn" title="Delete">
              🗑️
            </button>
          </div>
        </template>
      </DataTable>
    </div>

    <!-- User Details Modal -->
    <div v-if="showUserModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ modalMode === 'add' ? 'Add User' : modalMode === 'edit' ? 'Edit User' : 'User Details' }}</h3>
          <button @click="closeModal" class="close-btn">×</button>
        </div>
        
        <div class="modal-body">
          <div v-if="modalMode === 'view'" class="user-details">
            <div class="detail-row">
              <label>Avatar:</label>
              <div class="user-avatar large">
                <img v-if="selectedUser.avatar" :src="selectedUser.avatar" :alt="selectedUser.name" class="avatar-img" />
                <div v-else class="avatar-placeholder">
                  {{ getInitials(selectedUser.name) }}
                </div>
              </div>
            </div>
            <div class="detail-row">
              <label>Name:</label>
              <span>{{ selectedUser.name }}</span>
            </div>
            <div class="detail-row">
              <label>Email:</label>
              <span>{{ selectedUser.email }}</span>
            </div>
            <div class="detail-row">
              <label>Role:</label>
              <span class="role-badge" :class="getRoleClass(selectedUser.role)">
                {{ getRoleText(selectedUser.role) }}
              </span>
            </div>
            <div class="detail-row">
              <label>Status:</label>
              <span class="status-badge" :class="getStatusClass(selectedUser.status)">
                {{ getStatusText(selectedUser.status) }}
              </span>
            </div>
            <div class="detail-row">
              <label>Registration Time:</label>
              <span>{{ formatDate(selectedUser.createdAt) }}</span>
            </div>
            <div class="detail-row">
              <label>Last Login:</label>
              <span>{{ selectedUser.lastLogin ? formatDate(selectedUser.lastLogin) : 'Never logged in' }}</span>
            </div>
          </div>
          
          <form v-else @submit.prevent="saveUser" class="user-form">
            <div class="form-group">
              <label for="userName">Name *</label>
              <input
                id="userName"
                v-model="userForm.name"
                type="text"
                required
                class="form-input"
                placeholder="Enter user name"
              />
            </div>
            
            <div class="form-group">
              <label for="userEmail">Email *</label>
              <input
                id="userEmail"
                v-model="userForm.email"
                type="email"
                required
                class="form-input"
                placeholder="Enter email address"
              />
            </div>
            
            <div class="form-group">
              <label for="userRole">Role *</label>
              <select id="userRole" v-model="userForm.role" required class="form-select">
                <option value="">Select role</option>
                <option value="admin">Admin</option>
                <option value="volunteer">Volunteer</option>
                <option value="user">User</option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="userStatus">Status</label>
              <select id="userStatus" v-model="userForm.status" class="form-select">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
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
import { ref, reactive, onMounted } from 'vue'
import DataTable from '../components/DataTable.vue'

export default {
  name: 'UserManagement',
  components: {
    DataTable
  },
  setup() {
    // Reactive data
    const users = ref([])
    const loading = ref(false)
    const showUserModal = ref(false)
    const modalMode = ref('view') // 'view', 'add', 'edit'
    const selectedUser = ref({})
    const userForm = reactive({
      name: '',
      email: '',
      role: '',
      status: 'active'
    })

    // Table column configuration
    const userColumns = [
      {
        key: 'avatar',
        title: 'Avatar',
        sortable: false,
        searchable: false
      },
      {
        key: 'name',
        title: 'Name',
        sortable: true,
        searchable: true
      },
      {
        key: 'email',
        title: 'Email',
        sortable: true,
        searchable: true
      },
      {
        key: 'role',
        title: 'Role',
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
        key: 'createdAt',
        title: 'Registration Time',
        sortable: true,
        searchable: false,
        formatter: (value) => formatDate(value)
      },
      {
        key: 'lastLogin',
        title: 'Last Login',
        sortable: true,
        searchable: false,
        formatter: (value) => value ? formatDate(value) : 'Never logged in'
      },
      {
        key: 'actions',
        title: 'Actions',
        sortable: false,
        searchable: false
      }
    ]

    // Mock user data
    const generateMockUsers = () => {
      const roles = ['admin', 'volunteer', 'user']
      const statuses = ['active', 'inactive', 'suspended']
      const names = [
        'John Smith', 'Jane Doe', 'Mike Johnson', 'Sarah Wilson', 'David Brown', 'Emily Davis', 'Chris Miller', 'Lisa Garcia',
        'Robert Martinez', 'Jennifer Rodriguez', 'Michael Anderson', 'Jessica Taylor', 'William Thomas', 'Ashley Jackson', 'James White', 'Amanda Harris'
      ]
      
      return Array.from({ length: 50 }, (_, index) => ({
        id: index + 1,
        name: names[index % names.length] + (index > 15 ? Math.floor(index / 16) : ''),
        email: `user${index + 1}@example.com`,
        role: roles[Math.floor(Math.random() * roles.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        avatar: Math.random() > 0.7 ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${index}` : null,
        createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        lastLogin: Math.random() > 0.3 ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() : null
      }))
    }

    // Methods
    const loadUsers = async () => {
      loading.value = true
      try {
        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        users.value = generateMockUsers()
      } catch (error) {
        console.error('Failed to load user data:', error)
      } finally {
        loading.value = false
      }
    }

    const refreshUsers = () => {
      loadUsers()
    }

    const getInitials = (name) => {
      return name ? name.charAt(0).toUpperCase() : '?'
    }

    const getStatusClass = (status) => {
      const classes = {
        active: 'status-active',
        inactive: 'status-inactive',
        suspended: 'status-suspended'
      }
      return classes[status] || ''
    }

    const getStatusText = (status) => {
      const texts = {
        active: 'Active',
        inactive: 'Inactive',
        suspended: 'Suspended'
      }
      return texts[status] || status
    }

    const getRoleClass = (role) => {
      const classes = {
        admin: 'role-admin',
        volunteer: 'role-volunteer',
        user: 'role-user'
      }
      return classes[role] || ''
    }

    const getRoleText = (role) => {
      const texts = {
        admin: 'Admin',
        volunteer: 'Volunteer',
        user: 'User'
      }
      return texts[role] || role
    }

    const formatDate = (dateString) => {
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
      viewUser(row)
    }

    const addUser = () => {
      modalMode.value = 'add'
      Object.assign(userForm, {
        name: '',
        email: '',
        role: '',
        status: 'active'
      })
      showUserModal.value = true
    }

    const editUser = (user) => {
      modalMode.value = 'edit'
      selectedUser.value = user
      Object.assign(userForm, {
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      })
      showUserModal.value = true
    }

    const viewUser = (user) => {
      modalMode.value = 'view'
      selectedUser.value = user
      showUserModal.value = true
    }

    const deleteUser = (user) => {
      if (confirm(`Are you sure you want to delete user "${user.name}"?`)) {
        const index = users.value.findIndex(u => u.id === user.id)
        if (index > -1) {
          users.value.splice(index, 1)
          alert('User deleted successfully')
        }
      }
    }

    const toggleUserStatus = (user) => {
      const newStatus = user.status === 'active' ? 'suspended' : 'active'
      const action = newStatus === 'active' ? 'enable' : 'disable'
      
      if (confirm(`Are you sure you want to ${action} user "${user.name}"?`)) {
        user.status = newStatus
        alert(`User ${action}d successfully`)
      }
    }

    const saveUser = () => {
      if (modalMode.value === 'add') {
        const newUser = {
          id: Math.max(...users.value.map(u => u.id)) + 1,
          ...userForm,
          avatar: null,
          createdAt: new Date().toISOString(),
          lastLogin: null
        }
        users.value.unshift(newUser)
        alert('User added successfully')
      } else if (modalMode.value === 'edit') {
        Object.assign(selectedUser.value, userForm)
        alert('User information updated successfully')
      }
      closeModal()
    }

    const closeModal = () => {
      showUserModal.value = false
      selectedUser.value = {}
    }

    const exportUsers = () => {
      const headers = ['ID', 'Name', 'Email', 'Role', 'Status', 'Registration Time', 'Last Login']
      const rows = users.value.map(user => [
        user.id,
        user.name,
        user.email,
        getRoleText(user.role),
        getStatusText(user.status),
        formatDate(user.createdAt),
        user.lastLogin ? formatDate(user.lastLogin) : 'Never logged in'
      ])
      
      const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n')
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', 'users.csv')
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    }

    // Lifecycle
    onMounted(() => {
      loadUsers()
    })

    return {
      users,
      loading,
      userColumns,
      showUserModal,
      modalMode,
      selectedUser,
      userForm,
      refreshUsers,
      getInitials,
      getStatusClass,
      getStatusText,
      getRoleClass,
      getRoleText,
      formatDate,
      handleRowClick,
      addUser,
      editUser,
      viewUser,
      deleteUser,
      toggleUserStatus,
      saveUser,
      closeModal,
      exportUsers
    }
  }
}
</script>

<style scoped>
.user-management {
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

/* Action bar */
.action-bar {
  display: flex;
  gap: 15px;
  margin-bottom: 25px;
  flex-wrap: wrap;
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

/* User avatar */
.user-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
}

.user-avatar.large {
  width: 80px;
  height: 80px;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #42b983, #369870);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 16px;
}

.user-avatar.large .avatar-placeholder {
  font-size: 32px;
}

/* Status badges */
.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
}

.status-active {
  background: #d4edda;
  color: #155724;
}

.status-inactive {
  background: #f8d7da;
  color: #721c24;
}

.status-suspended {
  background: #fff3cd;
  color: #856404;
}

/* Role badges */
.role-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.role-admin {
  background: #e7f3ff;
  color: #0056b3;
}

.role-volunteer {
  background: #fff2e7;
  color: #d63384;
}

.role-user {
  background: #f8f9fa;
  color: #6c757d;
}

/* Action buttons */
.action-buttons {
  display: flex;
  gap: 8px;
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

.enable-btn:hover {
  background: #d4edda;
}

.disable-btn:hover {
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
  max-width: 600px;
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

/* User details */
.user-details {
  display: grid;
  gap: 20px;
}

.detail-row {
  display: grid;
  grid-template-columns: 120px 1fr;
  align-items: center;
  gap: 15px;
}

.detail-row label {
  font-weight: 600;
  color: #495057;
}

/* User form */
.user-form {
  display: grid;
  gap: 20px;
}

.form-group {
  display: grid;
  gap: 8px;
}

.form-group label {
  font-weight: 500;
  color: #495057;
}

.form-input,
.form-select {
  padding: 10px 12px;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.3s ease;
}

.form-input:focus,
.form-select:focus {
  border-color: #42b983;
  box-shadow: 0 0 0 2px rgba(66, 185, 131, 0.2);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 10px;
}

/* Responsive design */
@media (max-width: 768px) {
  .page-title {
    font-size: 2rem;
  }
  
  .action-bar {
    justify-content: center;
  }
  
  .detail-row {
    grid-template-columns: 1fr;
    gap: 5px;
  }
  
  .detail-row label {
    font-size: 14px;
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