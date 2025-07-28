<template>
  <div class="movie-card" @click="goToMovieDetail">
    <img :src="movie.imageUrl" :alt="movie.title" class="movie-image" />
    <div class="movie-info">
      <h3 class="movie-title">{{ movie.title }}</h3>
      <p class="movie-genre">{{ movie.genre }}</p>
      <div class="movie-rating">
        <span>⭐ {{ movie.rating.toFixed(1) }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { useRouter } from 'vue-router'

export default {
  name: 'MovieCard',
  props: {
    movie: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    const router = useRouter()

    const goToMovieDetail = () => {
      router.push({ name: 'MovieDetail', params: { id: props.movie.id } })
    }

    return {
      goToMovieDetail
    }
  }
}
</script>

<style scoped>
.movie-card {
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 280px;
}

.movie-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.movie-image {
  width: 100%;
  height: 380px;
  object-fit: cover;
}

.movie-info {
  padding: 20px;
  text-align: left;
  flex-grow: 1;
}

.movie-title {
  font-size: 1.4em;
  color: #2c3e50;
  margin: 0 0 10px 0;
}

.movie-genre {
  font-size: 1em;
  color: #7f8c8d;
  margin: 0 0 15px 0;
}

.movie-rating {
  font-size: 1.1em;
  font-weight: bold;
  color: #f39c12;
}
</style>