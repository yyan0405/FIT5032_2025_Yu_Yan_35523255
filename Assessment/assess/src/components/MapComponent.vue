<template>
  <div class="map-container">
    <!-- Map Control Panel -->
    <div class="map-controls">
      <div class="search-panel">
        <h3>🗺️ Map Navigation</h3>
        
        <!-- Landmark Search -->
        <div class="search-section">
          <h4>🏛️ Search Landmarks</h4>
          <div class="search-input-group">
            <input 
              v-model="searchQuery" 
              @keyup.enter="searchLandmarks"
              placeholder="Enter location name or keywords..."
              class="search-input"
            />
            <button @click="searchLandmarks" class="search-btn" :disabled="searchLoading">
              {{ searchLoading ? 'Searching...' : 'Search' }}
            </button>
          </div>
          
          <!-- Search Results -->
          <div v-if="searchResults.length > 0" class="search-results">
            <div 
              v-for="result in searchResults" 
              :key="result.place_id"
              @click="selectLocation(result)"
              class="search-result-item"
            >
              <strong>{{ result.display_name.split(',')[0] }}</strong>
              <small>{{ result.display_name }}</small>
            </div>
          </div>
        </div>

        <!-- Navigation Feature -->
        <div class="navigation-section">
          <h4>🧭 Route Navigation</h4>
          <div class="route-inputs">
            <input 
              v-model="startPoint" 
              placeholder="Starting address"
              class="route-input"
            />
            <input 
              v-model="endPoint" 
              placeholder="Destination address"
              class="route-input"
            />
            <button @click="calculateRoute" class="route-btn" :disabled="routeLoading">
              {{ routeLoading ? 'Calculating...' : 'Plan Route' }}
            </button>
            <button v-if="currentRoute" @click="clearRoute" class="clear-btn">
              Clear Route
            </button>
          </div>
        </div>

        <!-- Travel Information -->
        <div v-if="travelInfo" class="travel-info">
          <h4>ℹ️ Travel Information</h4>
          <div class="info-item">
            <span class="info-label">Distance:</span>
            <span class="info-value">{{ travelInfo.distance }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Estimated Time:</span>
            <span class="info-value">{{ travelInfo.duration }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Travel Mode:</span>
            <span class="info-value">{{ travelInfo.mode }}</span>
          </div>
        </div>

        <!-- Popular Landmarks -->
        <div class="landmarks-section">
          <h4>🏛️ Popular Attractions</h4>
          <div class="landmark-buttons">
            <button 
              v-for="landmark in famousLandmarks" 
              :key="landmark.name"
              @click="goToLandmark(landmark)"
              class="landmark-btn"
            >
              {{ landmark.name }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Map Container -->
    <div id="map" class="map-display"></div>
  </div>
</template>

<script>
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
})

export default {
  name: 'MapComponent',
  data() {
    return {
      map: null,
      searchQuery: '',
      searchResults: [],
      searchLoading: false,
      startPoint: '',
      endPoint: '',
      routeLoading: false,
      currentRoute: null,
      travelInfo: null,
      markers: [],
      famousLandmarks: [
        { name: 'Sydney Opera House', lat: -33.8568, lng: 151.2153, info: 'World-famous performing arts center' },
        { name: 'Sydney Harbour Bridge', lat: -33.8523, lng: 151.2108, info: 'Iconic Sydney landmark' },
        { name: 'Royal Botanic Gardens Melbourne', lat: -37.8304, lng: 144.9803, info: 'One of Australia\'s most beautiful botanical gardens' },
        { name: 'Great Ocean Road', lat: -38.6857, lng: 143.1189, info: 'One of the world\'s most scenic coastal drives' },
        { name: 'Uluru', lat: -25.3444, lng: 131.0369, info: 'Australia\'s spiritual symbol' },
        { name: 'Great Barrier Reef', lat: -18.2871, lng: 147.6992, info: 'World\'s largest coral reef system' }
      ]
    }
  },
  mounted() {
    this.initMap()
  },
  beforeUnmount() {
    if (this.map) {
      this.map.remove()
    }
  },
  methods: {
    initMap() {
      // Initialize map, default view of Australia
      this.map = L.map('map').setView([-25.2744, 133.7751], 5)
      
      // Add OpenStreetMap layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(this.map)

      // Add preset landmark markers
      this.addLandmarkMarkers()
    },

    addLandmarkMarkers() {
      this.famousLandmarks.forEach(landmark => {
        const marker = L.marker([landmark.lat, landmark.lng])
          .addTo(this.map)
          .bindPopup(`
            <div class="landmark-popup">
              <h4>${landmark.name}</h4>
              <p>${landmark.info}</p>
              <button onclick="this.parentElement.parentElement._source.openDetails('${landmark.name}')">View Details</button>
            </div>
          `)
        
        this.markers.push(marker)
      })
    },

    async searchLandmarks() {
      if (!this.searchQuery.trim()) return
      
      this.searchLoading = true
      this.searchResults = []
      
      try {
        // Use Nominatim API to search locations
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(this.searchQuery)}&limit=5&countrycodes=au`
        )
        const data = await response.json()
        
        this.searchResults = data.map(item => ({
          place_id: item.place_id,
          display_name: item.display_name,
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          type: item.type,
          importance: item.importance
        }))
        
      } catch (error) {
        console.error('Search failed:', error)
        alert('Search failed, please try again later')
      } finally {
        this.searchLoading = false
      }
    },

    selectLocation(location) {
      // Move map to selected location
      this.map.setView([location.lat, location.lng], 15)
      
      // Add marker
      const marker = L.marker([location.lat, location.lng])
        .addTo(this.map)
        .bindPopup(`
          <div class="search-popup">
            <h4>${location.display_name.split(',')[0]}</h4>
            <p>${location.display_name}</p>
            <small>Type: ${location.type || 'Unknown'}</small>
          </div>
        `)
        .openPopup()
      
      this.markers.push(marker)
      this.searchResults = []
      this.searchQuery = ''
    },

    async calculateRoute() {
      if (!this.startPoint.trim() || !this.endPoint.trim()) {
        alert('Please enter starting point and destination')
        return
      }
      
      this.routeLoading = true
      
      try {
        // Get coordinates for start and end points
        const startCoords = await this.geocodeAddress(this.startPoint)
        const endCoords = await this.geocodeAddress(this.endPoint)
        
        if (!startCoords || !endCoords) {
          alert('Unable to find specified addresses, please check your input')
          return
        }
        
        // Use OSRM API to calculate route
        const routeResponse = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${startCoords.lng},${startCoords.lat};${endCoords.lng},${endCoords.lat}?overview=full&geometries=geojson`
        )
        const routeData = await routeResponse.json()
        
        if (routeData.routes && routeData.routes.length > 0) {
          this.displayRoute(routeData.routes[0], startCoords, endCoords)
        } else {
          alert('Unable to calculate route')
        }
        
      } catch (error) {
        console.error('Route calculation failed:', error)
        alert('Route calculation failed, please try again later')
      } finally {
        this.routeLoading = false
      }
    },

    async geocodeAddress(address) {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&countrycodes=au`
        )
        const data = await response.json()
        
        if (data.length > 0) {
          return {
            lat: parseFloat(data[0].lat),
            lng: parseFloat(data[0].lon)
          }
        }
        return null
      } catch (error) {
        console.error('Address geocoding failed:', error)
        return null
      }
    },

    displayRoute(route, startCoords, endCoords) {
      // Clear previous route
      this.clearRoute()
      
      // Add route to map
      const routeCoordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]])
      
      this.currentRoute = L.polyline(routeCoordinates, {
        color: '#3388ff',
        weight: 5,
        opacity: 0.7
      }).addTo(this.map)
      
      // Add start and end point markers
      const startMarker = L.marker([startCoords.lat, startCoords.lng], {
        icon: L.icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        })
      }).addTo(this.map).bindPopup('Start: ' + this.startPoint)
      
      const endMarker = L.marker([endCoords.lat, endCoords.lng], {
        icon: L.icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        })
      }).addTo(this.map).bindPopup('End: ' + this.endPoint)
      
      this.markers.push(startMarker, endMarker)
      
      // Adjust map view to show entire route
      this.map.fitBounds(this.currentRoute.getBounds(), { padding: [20, 20] })
      
      // Display travel information
      this.travelInfo = {
        distance: (route.distance / 1000).toFixed(1) + ' km',
        duration: Math.round(route.duration / 60) + ' minutes',
        mode: 'Driving'
      }
    },

    clearRoute() {
      if (this.currentRoute) {
        this.map.removeLayer(this.currentRoute)
        this.currentRoute = null
      }
      
      // Clear route-related markers
      this.markers.forEach(marker => {
        this.map.removeLayer(marker)
      })
      this.markers = []
      
      // Re-add landmark markers
      this.addLandmarkMarkers()
      
      this.travelInfo = null
      this.startPoint = ''
      this.endPoint = ''
    },

    goToLandmark(landmark) {
      this.map.setView([landmark.lat, landmark.lng], 12)
      
      // Find corresponding marker and open popup
      const marker = this.markers.find(m => {
        const pos = m.getLatLng()
        return Math.abs(pos.lat - landmark.lat) < 0.001 && Math.abs(pos.lng - landmark.lng) < 0.001
      })
      
      if (marker) {
        marker.openPopup()
      }
    }
  }
}
</script>

<style scoped>
.map-container {
  display: flex;
  height: 600px;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
}

.map-controls {
  width: 350px;
  background: #f8f9fa;
  border-right: 1px solid #ddd;
  overflow-y: auto;
}

.search-panel {
  padding: 20px;
}

.search-panel h3 {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 18px;
}

.search-section, .navigation-section, .travel-info, .landmarks-section {
  margin-bottom: 25px;
  padding: 15px;
  background: white;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.search-section h4, .navigation-section h4, .travel-info h4, .landmarks-section h4 {
  margin: 0 0 15px 0;
  color: #555;
  font-size: 14px;
  font-weight: 600;
}

.search-input-group {
  display: flex;
  gap: 8px;
  margin-bottom: 15px;
}

.search-input, .route-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.search-input:focus, .route-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
}

.search-btn, .route-btn, .clear-btn, .landmark-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.search-btn, .route-btn {
  background: #007bff;
  color: white;
}

.search-btn:hover, .route-btn:hover {
  background: #0056b3;
}

.search-btn:disabled, .route-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.clear-btn {
  background: #dc3545;
  color: white;
  margin-top: 8px;
}

.clear-btn:hover {
  background: #c82333;
}

.search-results {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.search-result-item {
  padding: 10px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: background-color 0.2s;
}

.search-result-item:hover {
  background: #f8f9fa;
}

.search-result-item:last-child {
  border-bottom: none;
}

.search-result-item strong {
  display: block;
  color: #333;
  margin-bottom: 4px;
}

.search-result-item small {
  color: #666;
  font-size: 12px;
}

.route-inputs {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
}

.info-label {
  font-weight: 600;
  color: #555;
}

.info-value {
  color: #333;
}

.landmark-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.landmark-btn {
  background: #28a745;
  color: white;
  font-size: 12px;
  padding: 6px 12px;
}

.landmark-btn:hover {
  background: #218838;
}

.map-display {
  flex: 1;
  position: relative;
}

#map {
  width: 100%;
  height: 100%;
}

/* Popup styles */
:deep(.leaflet-popup-content) {
  margin: 8px 12px;
}

:deep(.landmark-popup h4) {
  margin: 0 0 8px 0;
  color: #333;
}

:deep(.landmark-popup p) {
  margin: 0 0 10px 0;
  color: #666;
  font-size: 14px;
}

:deep(.landmark-popup button) {
  background: #007bff;
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 3px;
  cursor: pointer;
  font-size: 12px;
}

:deep(.search-popup h4) {
  margin: 0 0 8px 0;
  color: #333;
}

:deep(.search-popup p) {
  margin: 0 0 5px 0;
  color: #666;
  font-size: 13px;
}

:deep(.search-popup small) {
  color: #999;
  font-size: 11px;
}
</style>