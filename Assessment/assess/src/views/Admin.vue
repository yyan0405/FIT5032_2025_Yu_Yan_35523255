<template>
  <div class="admin-panel">
    <h1 class="page-title">Admin Panel</h1>
    <p class="page-description">Manage health services and user information here.</p>

    <!-- Data Export Section -->
    <div class="management-section">
      <h2>Data Export</h2>
      <p class="section-description">Export health services and user data in CSV or PDF format.</p>
      
      <div class="export-tabs">
        <button 
          :class="['tab-btn', { active: activeExportTab === 'services' }]"
          @click="activeExportTab = 'services'"
        >
          Export Services Data
        </button>
        <button 
          :class="['tab-btn', { active: activeExportTab === 'users' }]"
          @click="activeExportTab = 'users'"
        >
          Export Users Data
        </button>
      </div>
      
      <div v-if="activeExportTab === 'services'" class="export-content">
        <DataExport
          title="Health Services Export"
          description="Export health services data including service details, categories, and status information."
          :data="services"
          :available-fields="serviceFields"
          default-filename="health-services"
          @export-success="onExportSuccess"
          @export-error="onExportError"
        />
      </div>
      
      <div v-if="activeExportTab === 'users'" class="export-content">
        <DataExport
          title="Users Export"
          description="Export user data including usernames, roles, and account information."
          :data="users"
          :available-fields="userFields"
          default-filename="users-data"
          @export-success="onExportSuccess"
          @export-error="onExportError"
        />
      </div>
    </div>

    <!-- Health Services Management -->
    <div class="management-section">
      <h2>Health Services Management</h2>
      <button @click="showAddServiceModal = true" class="add-btn">Add New Service</button>
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Service Name</th>
            <th>Category</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="service in services" :key="service.id">
            <td>{{ service.id }}</td>
            <td>{{ service.title }}</td>
            <td>{{ service.category }}</td>
            <td>{{ service.status }}</td>
            <td>
              <button @click="editService(service)" class="edit-btn">Edit</button>
              <button @click="deleteService(service.id)" class="delete-btn">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- User Management -->
    <div class="management-section">
      <h2>User Management</h2>
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td>{{ user.id }}</td>
            <td>{{ user.username }}</td>
            <td>{{ user.role }}</td>
            <td>
              <button @click="editUser(user)" class="edit-btn">Edit</button>
              <button @click="deleteUser(user.id)" class="delete-btn">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>



  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import DataExport from '@/components/DataExport.vue'

export default {
  name: 'Admin',
  components: {
    DataExport
  },
  setup() {
    const services = ref([])
    const users = ref([])
    const showAddServiceModal = ref(false)
    const activeExportTab = ref('services')
    
    // Define available fields for export
    const serviceFields = ref([
      { key: 'id', label: 'Service ID' },
      { key: 'title', label: 'Service Name' },
      { key: 'category', label: 'Category' },
      { key: 'status', label: 'Status' }
    ])
    
    const userFields = ref([
      { key: 'id', label: 'User ID' },
      { key: 'username', label: 'Username' },
      { key: 'role', label: 'Role' }
    ])


    // Simulate data loading
    onMounted(() => {
      services.value = [
        { id: 1, title: 'Mental Health Counseling', category: 'Mental Health', status: 'Active' },
        { id: 2, title: 'Community Health Education', category: 'Health Education', status: 'Active' },
        { id: 3, title: 'Elderly Care Support', category: 'Elderly Care', status: 'Active' },
      ];
      users.value = [
        { id: 1, username: 'admin', role: 'admin' },
        { id: 2, username: 'volunteer1', role: 'volunteer' },
        { id: 3, username: 'user1', role: 'user' },
      ];
    });

    const editService = (service) => alert(`Edit service: ${service.title}`);
    const deleteService = (id) => alert(`Delete service ID: ${id}`);
    const editUser = (user) => alert(`Edit user: ${user.username}`);
    const deleteUser = (id) => alert(`Delete user ID: ${id}`);
    
    // Export event handlers
    const onExportSuccess = (data) => {
      console.log('Export successful:', data)
      alert(`${data.format.toUpperCase()} export completed successfully! ${data.recordCount} records exported.`)
    }
    
    const onExportError = (error) => {
      console.error('Export error:', error)
      alert(`Export failed: ${error.error}`)
    }

    return { 
      services, users, showAddServiceModal, activeExportTab,
      serviceFields, userFields,
      editService, deleteService, editUser, deleteUser,
      onExportSuccess, onExportError
    };
  }
}
</script>

<style scoped>
.admin-panel {
  padding: 20px;
  max-width: 1000px;
  margin: 20px auto;
}

.page-title {
  font-size: 2.5em;
  color: #2c3e50;
  margin-bottom: 10px;
}

.page-description {
  font-size: 1.1em;
  color: #555;
  margin-bottom: 30px;
}

.management-section {
  background-color: #fff;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 30px;
}

.management-section h2 {
  font-size: 1.8em;
  color: #34495e;
  margin-bottom: 20px;
  border-bottom: 2px solid #eee;
  padding-bottom: 10px;
}

.add-btn {
  background-color: #42b983;
  color: white;
  padding: 10px 18px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1em;
  margin-bottom: 20px;
  transition: background-color 0.3s ease;
}

.add-btn:hover {
  background-color: #369f77;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.data-table th, .data-table td {
  border: 1px solid #ddd;
  padding: 12px;
  text-align: left;
}

.data-table th {
  background-color: #f7f7f7;
  color: #333;
  font-weight: bold;
}

.data-table tr:nth-child(even) {
  background-color: #fdfdfd;
}

.edit-btn, .delete-btn {
  padding: 8px 12px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-right: 8px;
  color: white;
  font-size: 0.9em;
}

.edit-btn {
  background-color: #3498db;
}

.edit-btn:hover {
  background-color: #2980b9;
}

.delete-btn {
  background-color: #e74c3c;
}

.delete-btn:hover {
  background-color: #c0392b;
}

/* Cloud Functions Styles */
.function-controls {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.function-btn {
  background-color: #8b5cf6;
  color: white;
  padding: 12px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1em;
  transition: background-color 0.3s ease;
}

.function-btn:hover {
  background-color: #7c3aed;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-content h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #2c3e50;
  font-size: 1.5em;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #555;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1em;
  box-sizing: border-box;
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 25px;
}

.submit-btn {
  background-color: #42b983;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1em;
  transition: background-color 0.3s ease;
}

.submit-btn:hover:not(:disabled) {
  background-color: #369f77;
}

.submit-btn:disabled {
  background-color: #95a5a6;
  cursor: not-allowed;
}

.cancel-btn {
  background-color: #95a5a6;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1em;
  transition: background-color 0.3s ease;
}

.cancel-btn:hover {
  background-color: #7f8c8d;
}

/* Export Section Styles */
.section-description {
  color: #666;
  margin-bottom: 20px;
  font-size: 1em;
  line-height: 1.5;
}

.export-tabs {
  display: flex;
  gap: 0;
  margin-bottom: 24px;
  border-bottom: 2px solid #e0e0e0;
}

.tab-btn {
  padding: 12px 24px;
  border: none;
  background: transparent;
  color: #666;
  cursor: pointer;
  font-size: 1em;
  font-weight: 500;
  border-bottom: 3px solid transparent;
  transition: all 0.3s ease;
  position: relative;
}

.tab-btn:hover {
  color: #007bff;
  background: #f8f9fa;
}

.tab-btn.active {
  color: #007bff;
  border-bottom-color: #007bff;
  background: #f8f9fa;
}

.export-content {
  padding: 20px 0;
}

/* Responsive Design for Export Section */
@media (max-width: 768px) {
  .export-tabs {
    flex-direction: column;
  }
  
  .tab-btn {
    text-align: left;
    border-bottom: 1px solid #e0e0e0;
    border-left: 3px solid transparent;
  }
  
  .tab-btn.active {
    border-left-color: #007bff;
    border-bottom-color: #e0e0e0;
  }
}
</style>