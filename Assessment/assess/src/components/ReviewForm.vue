<template>
  <form @submit.prevent="submitReview" class="review-form">
    <div class="form-group">
      <label for="rating">Rating:</label>
      <select id="rating" v-model.number="rating" required>
        <option disabled value="">Please select a rating</option>
        <option>1</option>
        <option>2</option>
        <option>3</option>
        <option>4</option>
        <option>5</option>
      </select>
    </div>
    <div class="form-group">
      <label for="reviewText">Review:</label>
      <textarea id="reviewText" v-model="reviewText" required></textarea>
    </div>
    <button type="submit" class="submit-btn">Submit Review</button>
  </form>
</template>

<script>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'

export default {
  name: 'ReviewForm',
  props: {
    movieId: {
      type: [Number, String],
      required: true
    }
  },
  emits: ['review-submitted'],
  setup(props, { emit }) {
    const authStore = useAuthStore()
    const rating = ref(null)
    const reviewText = ref('')

    const submitReview = () => {
      if (!rating.value || !reviewText.value) {
        alert('Please fill in rating and review.')
        return
      }

      const newReview = {
        movieId: props.movieId,
        rating: rating.value,
        text: reviewText.value,
        author: authStore.currentUser?.username || 'Anonymous User'
      }

      emit('review-submitted', newReview)

      // Reset form
      rating.value = null
      reviewText.value = ''
    }

    return {
      rating,
      reviewText,
      submitReview
    }
  }
}
</script>

<style scoped>
.review-form {
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  margin-top: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-sizing: border-box;
}

.submit-btn {
  background-color: #42b983;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.submit-btn:hover {
  background-color: #369f77;
}
</style>