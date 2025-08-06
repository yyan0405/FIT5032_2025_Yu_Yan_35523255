<template>
  <div class="container">
    <div class="header">
      <h1>WEATHER APP</h1>
      <div class="search-bar">
        <input
          type="text"
          v-model="city"
          placeholder="Enter city name"
          class="search-input"
        />
        <button @click="searchByCity" class="search-button">
          Search
        </button>
        <br>
        <br>
        Please implement "Search Weather by City".
      </div>
    </div>
    
    <!--The <main> tag in HTML is used to specify the main content of a document
    More info about main, check https://www.w3schools.com/tags/tag_main.asp-->
    <main>
      <!--If there are no data returned, then skip rendering the information-->
      <div v-if="weatherData">
        <!--Display the weather data attribute returned from API
        Example of API data: https://openweathermap.org/current-->
        <h2>
          {{ weatherData.name }}, {{ weatherData.sys.country }}
        </h2>
        <div>
          <!--The image source of of the weather icon will be coming from a function called iconUrl
          which will be shared in script later-->
          <img :src="iconUrl" alt="Weather Icon" />
          <p>{{ temperature }} °C</p>
        </div>
        <!-- weather[0] means the current weather, the way we need to obtain data depends on how
        the API JSON data looks-->
        <span>{{ weatherData.weather[0].description }}</span>
      </div>
    </main>
  </div>
</template>

<script>
// The info section in 10.1.1 provided detailed information about this package
import axios from "axios";

const apikey = "33948d8997691e8da375d96161ddabad"; // Follow 10.1.2 to obtain your API key

export default {
  name: "App",
  data() {
    return {
      city: "",
      weatherData: null,
      hourlyForecast: [],
      dailyForecast: []
    }
  },
  //computed is a property that is used to define a property that
  //is dependent on other data properties.
  //If we using a more easy to understand words to understand the concept:
  //the derived value such as temperature automatically update when the relevant value change.
  computed: {
    //there are multiple way to obtain the data in celsius format.
    //Calculation by yourself like below after data is retrieved or via API parameters
    
    //Example of adding additional units requirement, if you choose this, remember to change section 3.1
    //https://api.openweathermap.org/data/2.5/weather?lat=XXX&lon=XXX.1&appid={API key}&units=metric
    
    temperature() {
      return this.weatherData
        ? Math.floor(this.weatherData.main.temp - 273)
        : null;
    },
    
    //Get the current weather icon using the API link
    iconUrl() {
      return this.weatherData
        ? `http://api.openweathermap.org/img/w/${this.weatherData.weather[0].icon}.png`
        : null;
    }
  },
  
  //There are two steps involved in this.
  //step 1: identify current location
  //step 2: after identify, get the weather data straight based on the current location.
  mounted() {
    this.fetchCurrentLocationWeather();
  },
  
  methods: {
    //Async in a easy to understand way means the method will run in backend thread,
    //and it won't occupy the main thread so the user experience is still smooth
    async fetchCurrentLocationWeather() {
      //The navigator.geolocation object is part of the Web API provided by modern web browsers
      //Please note this function is not belongs to Vue or openweather.
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          const { latitude, longitude } = position.coords;
          //API link to obtain the current weather based on the current location browser identified
          const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apikey}`;
          //await means wait for the fetchWeatherData method to complete before proceeding
          await this.fetchWeatherData(url);
        });
      }
    },
    
    async fetchWeatherData(url) {
      try {
        const response = await axios.get(url);
        //Returned data from API is stored as JSON file in weatherData
        this.weatherData = response.data;
      } catch (error) {
        console.error("Error fetching weather data:", error);
      }
    },
    
    async searchByCity() {
      console.log('Searching weather for:', this.city);
      if (this.city.trim()) {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${this.city}&appid=${apikey}`;
        await this.fetchWeatherData(url);
      }
    }
  }
}
</script>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  text-align: center;
  margin-bottom: 30px;
}

h1 {
  color: #2c3e50;
  font-size: 2.5rem;
  margin-bottom: 30px;
}

.search-bar {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.search-input {
  padding: 12px 16px;
  font-size: 16px;
  border: 2px solid #ddd;
  border-radius: 8px;
  width: 300px;
  max-width: 100%;
  outline: none;
  transition: border-color 0.3s;
}

.search-input:focus {
  border-color: #007bff;
}

.search-button {
  padding: 12px 24px;
  font-size: 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.search-button:hover {
  background-color: #0056b3;
}

.search-button:active {
  transform: translateY(1px);
}

main {
  margin-top: 30px;
  text-align: center;
}

main h2 {
  color: #2c3e50;
  font-size: 1.8rem;
  margin-bottom: 20px;
}

main div {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 15px;
}

main img {
  width: 100px;
  height: 100px;
  margin-bottom: 10px;
}

main p {
  font-size: 2rem;
  font-weight: bold;
  color: #007bff;
  margin: 0;
}

main span {
  font-size: 1.2rem;
  color: #666;
  text-transform: capitalize;
}
</style>