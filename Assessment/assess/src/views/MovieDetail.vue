<template>
  <div class="movie-detail-container">
    <div v-if="loading" class="loading-spinner"></div>
    <div v-if="error" class="error-message">{{ error }}</div>

    <div v-if="movie" class="movie-content">
      <div class="movie-header">
        <img :src="movie.imageUrl" :alt="movie.title" class="movie-poster" />
        <div class="movie-info">
          <h1 class="movie-title">{{ movie.title }}</h1>
          <p class="movie-meta">Genre: {{ movie.genre }}</p>
          <p class="movie-meta">Average Rating: 
            <span class="rating-score">{{ averageRating.toFixed(1) }}</span> / 5
            ({{ reviews.length }} reviews)
          </p>
          <p class="movie-description">{{ movie.description }}</p>
        </div>
      </div>

      <div class="review-section">
        <h2>User Reviews</h2>
        <ReviewForm :movieId="movie.id" @review-submitted="addReview" />
        <div v-if="reviews.length === 0" class="no-reviews">
          No reviews yet, be the first to share your thoughts!
        </div>
        <div v-else class="review-list">
          <div v-for="review in reviews" :key="review.id" class="review-item">
            <p class="review-author"><strong>{{ review.author }}</strong> Rating: {{ review.rating }} / 5</p>
            <p class="review-text">{{ review.text }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import ReviewForm from '../components/ReviewForm.vue'

export default {
  name: 'MovieDetail',
  components: {
    ReviewForm
  },
  setup() {
    const route = useRoute()
    const movie = ref(null)
    const reviews = ref([])
    const loading = ref(true)
    const error = ref('')

    const fetchMovieDetail = async () => {
      try {
        loading.value = true
        // Simulate fetching movie details and reviews from API
        await new Promise(resolve => setTimeout(resolve, 1000))
        const movieId = route.params.id
        // Mock movie data
        const dummyMovie = {
          id: movieId,
          title: `Movie ${movieId}`,
          genre: 'Sci-Fi',
          rating: 4.5,
          imageUrl: `https://via.placeholder.com/300x450.png?text=Movie+${movieId}`,
          description: `This is the detailed description of Movie ${movieId}. It is a sci-fi masterpiece about the future world, full of thrilling scenes and profound philosophical thinking.`
        }
        // Mock review data
        const dummyReviews = [
          { id: 1, movieId: movieId, author: 'User A', rating: 5, text: 'This movie is amazing, highly recommended!' },
          { id: 2, movieId: movieId, author: 'User B', rating: 4, text: 'The plot is very engaging and the special effects are great.' }
        ]

        movie.value = dummyMovie
        reviews.value = dummyReviews
      } catch (err) {
        error.value = 'Unable to load movie details, please try again later.'
      } finally {
        loading.value = false
      }
    }

    const addReview = (newReview) => {
      reviews.value.push({ 
        id: reviews.value.length + 1, 
        author: newReview.author, 
        rating: newReview.rating, 
        text: newReview.text 
      })
    }

    const averageRating = computed(() => {
      if (reviews.value.length === 0) return 0
      const totalRating = reviews.value.reduce((sum, review) => sum + review.rating, 0)
      return totalRating / reviews.value.length
    })

    onMounted(fetchMovieDetail)

    return {
      movie,
      reviews,
      loading,
      error,
      addReview,
      averageRating
    }
  }
}
</script>

<style scoped>
.movie-detail-container {
  padding: 20px;
  max-width: 900px;
  margin: 20px auto;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.loading-spinner,
.error-message {
  text-align: center;
  padding: 50px;
}

.movie-content {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.movie-header {
  display: flex;
  gap: 30px;
  align-items: flex-start;
}

.movie-poster {
  width: 250px;
  height: 375px;
  border-radius: 8px;
  object-fit: cover;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.movie-info {
  flex-grow: 1;
}

.movie-title {
  font-size: 2.5em;
  color: #2c3e50;
  margin-bottom: 10px;
}

.movie-meta {
  font-size: 1.1em;
  color: #555;
  margin-bottom: 8px;
}

.rating-score {
  font-weight: bold;
  color: #42b983;
}

.movie-description {
  font-size: 1em;
  color: #666;
  line-height: 1.6;
  margin-top: 20px;
}

.review-section {
  margin-top: 30px;
  border-top: 1px solid #eee;
  padding-top: 30px;
}

.review-section h2 {
  font-size: 2em;
  color: #2c3e50;
  margin-bottom: 20px;
}

.no-reviews {
  text-align: center;
  color: #777;
  padding: 20px;
  border: 1px dashed #ccc;
  border-radius: 8px;
  margin-top: 20px;
}

.review-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.review-item {
  background-color: #f9f9f9;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #eee;
}

.review-author {
  font-weight: bold;
  color: #34495e;
  margin-bottom: 5px;
}

.review-text {
  color: #666;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .movie-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .movie-poster {
    margin-bottom: 20px;
  }
}