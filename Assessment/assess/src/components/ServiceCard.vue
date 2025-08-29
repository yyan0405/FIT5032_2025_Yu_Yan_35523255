<template>
  <div class="service-card">
    <div class="service-image">
      <img :src="service.imageUrl" :alt="service.title" />
    </div>
    <div class="service-content">
      <h3 class="service-title">{{ service.title }}</h3>
      <p class="service-category">{{ service.category }}</p>
      <p class="service-description">{{ service.description }}</p>
      <div class="service-rating">
        <span class="stars">{{ getStars(service.rating) }}</span>
        <span class="rating-value">{{ service.rating }}/5</span>
      </div>
      <router-link :to="`/service/${service.id}`" class="view-details-btn">
        View Details
      </router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ServiceCard',
  props: {
    service: {
      type: Object,
      required: true
    }
  },
  methods: {
    getStars(rating) {
      const fullStars = Math.floor(rating)
      const hasHalfStar = rating % 1 !== 0
      let stars = '★'.repeat(fullStars)
      if (hasHalfStar) {
        stars += '☆'
      }
      return stars + '☆'.repeat(5 - Math.ceil(rating))
    }
  }
}
</script>

<style scoped>
.service-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  max-width: 350px;
  margin: 0 auto;
}

.service-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.2);
}

.service-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.service-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.service-content {
  padding: 20px;
}

.service-title {
  font-size: 1.4em;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 8px;
}

.service-category {
  color: #42b983;
  font-weight: 600;
  margin-bottom: 10px;
  font-size: 0.9em;
}

.service-description {
  color: #666;
  line-height: 1.5;
  margin-bottom: 15px;
  font-size: 0.95em;
}

.service-rating {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 15px;
}

.stars {
  color: #ffd700;
  font-size: 1.1em;
}

.rating-value {
  color: #666;
  font-size: 0.9em;
}

.view-details-btn {
  display: inline-block;
  background-color: #42b983;
  color: white;
  padding: 10px 20px;
  text-decoration: none;
  border-radius: 6px;
  font-weight: 600;
  transition: background-color 0.3s ease;
  text-align: center;
  width: 100%;
  box-sizing: border-box;
}

.view-details-btn:hover {
  background-color: #369870;
}

/* Responsive Design */
@media (max-width: 768px) {
  .service-card {
    max-width: 100%;
  }
  
  .service-content {
    padding: 15px;
  }
  
  .service-title {
    font-size: 1.2em;
  }
}
</style>