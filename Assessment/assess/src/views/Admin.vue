<template>
  <div class="admin-panel">
    <h1 class="page-title">Admin Panel</h1>
    <p class="page-description">Manage health services and user information here.</p>

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

export default {
  name: 'Admin',
  setup() {
    const services = ref([])
    const users = ref([])
    const showAddServiceModal = ref(false)

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

    return { services, users, showAddServiceModal, editService, deleteService, editUser, deleteUser };
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
</style>