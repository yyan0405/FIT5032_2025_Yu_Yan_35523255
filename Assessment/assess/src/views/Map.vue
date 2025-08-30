<template>
  <div class="map-page">
    <div class="page-header">
      <h1>🗺️ Map Navigation</h1>
      <p class="page-description">
        Explore Australia's famous landmarks, plan your travel routes, and get detailed travel information.
      </p>
    </div>
    
    <div class="map-wrapper">
      <MapComponent />
    </div>
    
    <div class="map-features">
      <div class="feature-grid">
        <div class="feature-card">
          <div class="feature-icon">🏛️</div>
          <h3>Landmark Search</h3>
          <p>Search for famous attractions and historical sites across Australia, discover hidden treasures.</p>
        </div>
        
        <div class="feature-card">
          <div class="feature-icon">🧭</div>
          <h3>Route Navigation</h3>
          <p>Intelligently plan optimal routes between locations with detailed navigation guidance.</p>
        </div>
        
        <div class="feature-card">
          <div class="feature-icon">ℹ️</div>
          <h3>Travel Information</h3>
          <p>Get detailed travel information including distance, time, and transportation modes.</p>
        </div>
        
        <div class="feature-card">
          <div class="feature-icon">📍</div>
          <h3>Popular Attractions</h3>
          <p>Quick access to Australia's iconic landmarks like Sydney Opera House and Great Barrier Reef.</p>
        </div>
      </div>
    </div>
    
    <div class="usage-tips">
      <h2>Usage Guide</h2>
      <div class="tips-grid">
        <div class="tip-item">
          <span class="tip-number">1</span>
          <div class="tip-content">
            <h4>Search Locations</h4>
            <p>Enter location names or keywords in the search box, click on search results to view positions on the map.</p>
          </div>
        </div>
        
        <div class="tip-item">
          <span class="tip-number">2</span>
          <div class="tip-content">
            <h4>Plan Routes</h4>
            <p>Enter starting and destination addresses, the system will automatically calculate the best route and display it on the map.</p>
          </div>
        </div>
        
        <div class="tip-item">
          <span class="tip-number">3</span>
          <div class="tip-content">
            <h4>View Attractions</h4>
            <p>Click on popular attraction buttons to quickly jump to famous tourist destinations in Australia.</p>
          </div>
        </div>
        
        <div class="tip-item">
          <span class="tip-number">4</span>
          <div class="tip-content">
            <h4>Get Information</h4>
            <p>After planning routes, view detailed travel information including distance, time, and transportation modes.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import MapComponent from '../components/MapComponent.vue'

export default {
  name: 'Map',
  components: {
    MapComponent
  },
  mounted() {
    // Set page title
    document.title = 'Map Navigation - Community Service Platform'
  }
}
</script>

<style scoped>
.map-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
  color: white;
}

.page-header h1 {
  font-size: 2.5rem;
  margin-bottom: 10px;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.page-description {
  font-size: 1.1rem;
  opacity: 0.9;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

.map-wrapper {
  max-width: 1200px;
  margin: 0 auto 40px auto;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  overflow: hidden;
}

.map-features {
  max-width: 1200px;
  margin: 0 auto 40px auto;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.feature-card {
  background: rgba(255, 255, 255, 0.95);
  padding: 25px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.15);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 15px;
}

.feature-card h3 {
  color: #333;
  margin-bottom: 10px;
  font-size: 1.3rem;
}

.feature-card p {
  color: #666;
  line-height: 1.6;
  font-size: 0.95rem;
}

.usage-tips {
  max-width: 1200px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.95);
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.usage-tips h2 {
  text-align: center;
  color: #333;
  margin-bottom: 30px;
  font-size: 2rem;
}

.tips-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 25px;
}

.tip-item {
  display: flex;
  align-items: flex-start;
  gap: 15px;
}

.tip-number {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.tip-content h4 {
  color: #333;
  margin-bottom: 8px;
  font-size: 1.1rem;
}

.tip-content p {
  color: #666;
  line-height: 1.6;
  font-size: 0.95rem;
}

/* Responsive design */
@media (max-width: 768px) {
  .map-page {
    padding: 15px;
  }
  
  .page-header h1 {
    font-size: 2rem;
  }
  
  .page-description {
    font-size: 1rem;
  }
  
  .feature-grid {
    grid-template-columns: 1fr;
  }
  
  .tips-grid {
    grid-template-columns: 1fr;
  }
  
  .usage-tips {
    padding: 25px;
  }
  
  .usage-tips h2 {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .page-header h1 {
    font-size: 1.8rem;
  }
  
  .feature-card {
    padding: 20px;
  }
  
  .feature-icon {
    font-size: 2.5rem;
  }
  
  .usage-tips {
    padding: 20px;
  }
}
</style>