<template>
  <div class="admin-panel">
    <h1 class="page-title">Admin Panel</h1>
    <p class="page-description">Manage movies and user information here.</p>

    <!-- Movie Management -->
    <div class="management-section">
      <h2>Movie Management</h2>
      <button @click="showAddMovieModal = true" class="add-btn">Add New Movie</button>
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Genre</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="movie in movies" :key="movie.id">
            <td>{{ movie.id }}</td>
            <td>{{ movie.title }}</td>
            <td>{{ movie.genre }}</td>
            <td>
              <button @click="editMovie(movie)" class="edit-btn">Edit</button>
              <button @click="deleteMovie(movie.id)" class="delete-btn">Delete</button>
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
    const movies = ref([])
    const users = ref([])

    // Simulate data loading
    onMounted(() => {
      movies.value = [
        { id: 1, title: 'Movie A', genre: 'Sci-Fi' },
        { id: 2, title: 'Movie B', genre: 'Comedy' },
      ];
      users.value = [
        { id: 1, username: 'admin', role: 'admin' },
        { id: 2, username: 'user', role: 'user' },
      ];
    });

    const editMovie = (movie) => alert(`Edit movie: ${movie.title}`);
    const deleteMovie = (id) => alert(`Delete movie ID: ${id}`);
    const editUser = (user) => alert(`Edit user: ${user.username}`);
    const deleteUser = (id) => alert(`Delete user ID: ${id}`);

    return { movies, users, editMovie, deleteMovie, editUser, deleteUser };
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