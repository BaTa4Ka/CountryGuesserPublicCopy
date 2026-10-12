<script>
import app from '@/api/firebase';
import { getFunctions, httpsCallable } from 'firebase/functions';
import WorldMap from '@/components/WorldMap.vue';

export default {
    props: {
        correctCountry:{
            type: String,
            required: true
        },
    },
  data() {
    return {
        userGuess: '',
        guesses: [],
        feedback: '',
        functions: getFunctions(app),
        correct: false,
        attempt: 0,
        correctLat: 0,
        correctLon: 0,
        isLoading: false
    };
  },
  components: {
    WorldMap
  },
  methods: {
    haversine(lat1, lon1, lat2, lon2) {
      const R = 6371; // Earth's radius in km
      const dLat = (lat2 - lat1) * (Math.PI / 180);
      const dLon = (lon2 - lon1) * (Math.PI / 180);
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    },
    calculateDirection(lat1, lon1, lat2, lon2) {
      // Calculate direction from guess (lat1,lon1) to correct answer (lat2,lon2)
      const dLon = (lon2 - lon1) * (Math.PI / 180);
      const y = Math.sin(dLon) * Math.cos(lat2 * (Math.PI / 180));
      const x = Math.cos(lat1 * (Math.PI / 180)) * Math.sin(lat2 * (Math.PI / 180)) -
                Math.sin(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.cos(dLon);
      return Math.atan2(y, x) * (180 / Math.PI);
    },
    async checkGuess() {
      try{
        if (!this.userGuess) return;
        this.isLoading = true;
        
        if (this.userGuess === this.correctCountry) {
            this.attempt++
            this.feedback = `✅ Correct! You guessed ${this.correctCountry} in ${this.attempt} ${this.attempt === 1 ? 'try' : 'tries'}`;
            this.correct = true
            this.$emit('correct', Math.round(100/this.attempt))
            return
        }
        const userCountry = await this.getCountry(this.userGuess.trim())

        if (userCountry) {
          this.attempt++
          const userLat = userCountry.latlng[0];
          const userLon = userCountry.latlng[1];

          const distance = this.haversine(userLat, userLon, this.correctLat, this.correctLon);
          // Direction FROM guess TO correct answer
          const direction = this.calculateDirection(userLat, userLon, this.correctLat, this.correctLon);

          this.guesses.unshift({
            country: this.userGuess,
            distance: distance.toFixed(2),
            direction: direction.toFixed(2),
            directionDeg: direction
          });

          this.feedback = `📍 ${this.userGuess} is ${distance.toFixed(0)} km away`;
          this.userGuess = '';
          
        } else {
          this.feedback = '❌ Country not found. Try again!';
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        this.feedback = "⚠️ An error occurred while checking the guess.";
      } finally {
        this.isLoading = false;
      }
    },
    async getCountry(id) {
        const getCountryData = httpsCallable(this.functions, 'getCountry');
        const result = await getCountryData(id);
        return result.data.country
    },
  },
  async mounted() {
    const country = await this.getCountry(this.correctCountry)
    if (country) {
        this.correctLat = country.latlng[0]
        this.correctLon = country.latlng[1]
    }
  },
    watch: {
    correctCountry: async function(val) {
        this.userGuess = ''
        this.guesses = []
        this.feedback = ''
        this.correct = false
        this.attempt = 0
        const country = await this.getCountry(val)
        if (country) {
            this.correctLat = country.latlng[0]
            this.correctLon = country.latlng[1]
        }
    }
    }
};
</script>
<template>
  <div class="coordinates-guesser dark-theme">
    <div class="game-header">
      <h1>🌍 Coordinates Guesser</h1>
      <p class="game-subtitle">Guess the country based on its coordinates</p>
    </div>
    
    <div class="input-container">
      <input 
        v-model="userGuess" 
        type="text" 
        placeholder="Enter country name..." 
        @keyup.enter="checkGuess" 
        :disabled="correct || isLoading"
        class="guess-input"
      >
      <button 
        @click="checkGuess" 
        :disabled="!userGuess || correct || isLoading"
        class="guess-button"
      >
        {{ isLoading ? 'Checking...' : 'Guess' }}
      </button>
    </div>

    <div v-if="feedback" class="feedback" :class="{ 'success': correct, 'error': feedback.includes('not found') }">
      {{ feedback }}
    </div>

    <div class="guesses-container">
      <div class="guess-row header">
        <span>Country</span>
        <span>Distance (km)</span>
        <span>Direction to Answer</span>
      </div>
      <div class="guesses-list">
        <div v-for="(guess, index) in guesses" :key="index" class="guess-row">
          <span>{{ guess.country }}</span>
          <span>{{ guess.distance }}</span>
          <span class="direction-indicator" :style="{ transform: `rotate(${guess.directionDeg}deg)` }">↑</span>
        </div>
      </div>
    </div>

    <div v-if="correct" class="success-message">
      Well done! You scored {{ Math.round(100/attempt) }} points
    </div>
  </div>
  <WorldMap />
</template>

<style scoped>
.dark-theme {
  background-color: #121212;
  color: #e0e0e0;
}

.coordinates-guesser {
  width: 100%;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.game-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.game-header h1 {
  font-size: 1.8rem;
  color: #bb86fc; /* Purple accent */
  margin-bottom: 0.5rem;
}

.game-subtitle {
  color: #a0a0a0;
  font-size: 0.95rem;
}

.input-container {
  display: flex;
  gap: 10px;
  margin-bottom: 1rem;
}

.guess-input {
  flex: 1;
  padding: 10px 15px;
  border: 2px solid #333;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s;
  background-color: #1e1e1e;
  color: #e0e0e0;
}

.guess-input:focus {
  outline: none;
  border-color: #bb86fc;
  box-shadow: 0 0 0 3px rgba(187, 134, 252, 0.1);
}

.guess-button {
  padding: 0 20px;
  background-color: #bb86fc;
  color: #121212;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.guess-button:hover:not(:disabled) {
  background-color: #9a67ea;
}

.guess-button:disabled {
  background-color: #333;
  color: #666;
  cursor: not-allowed;
}

.guesses-container {
  margin-top: 1.5rem;
  border: 1px solid #333;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.guess-row {
  display: flex;
  padding: 12px 15px;
  align-items: center;
  background-color: #1e1e1e;
}

.guess-row.header {
  background-color: #333;
  font-weight: 600;
  color: #e0e0e0;
}

.guess-row.header span {
  color: #a0a0a0;
  font-size: 0.9rem;
}

.guess-row span {
  flex: 1;
  text-align: center;
}

.direction-indicator {
  display: inline-block;
  font-size: 1.2rem;
  color: #ff7597; /* Pink accent */
}

.feedback {
  padding: 10px;
  border-radius: 6px;
  margin: 1rem 0;
  text-align: center;
  font-weight: 500;
}

.feedback.success {
  background-color: rgba(56, 142, 60, 0.3);
  color: #69f0ae;
}

.feedback.error {
  background-color: rgba(255, 61, 0, 0.3);
  color: #ff8a65;
}

.success-message {
  margin-top: 1.5rem;
  padding: 15px;
  background-color: rgba(56, 142, 60, 0.2);
  border: 1px solid #69f0ae;
  border-radius: 8px;
  color: #69f0ae;
  text-align: center;
  font-weight: 500;
}

.guesses-list {
  max-height: 300px;
  overflow-y: auto;
}

/* Custom scrollbar */
.guesses-list::-webkit-scrollbar {
  width: 8px;
}

.guesses-list::-webkit-scrollbar-track {
  background: #333;
}

.guesses-list::-webkit-scrollbar-thumb {
  background: #555;
  border-radius: 4px;
}

.guesses-list::-webkit-scrollbar-thumb:hover {
  background: #777;
}
</style>