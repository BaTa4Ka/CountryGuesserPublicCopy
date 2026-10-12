<script>
import app from '@/api/firebase';
import { getFunctions, httpsCallable } from 'firebase/functions';

export default {
  props: {
    correctCountry: {
      type: String,
      required: true
    },
  },
  data() {
    return {
      userGuess: '',
      answered: false,
      message: '',
      flagUrl: '',
      functions: getFunctions(app),
      attempt: 0
    };
  },
  methods: {
    async getCountry(id) {
      const getCountryData = httpsCallable(this.functions, 'getCountry');
      const result = await getCountryData(id);
      return result.data.country;
    },
    checkGuess() {
      if (!this.userGuess || this.userGuess.trim() === '') {
        console.log("Guess mustn't be empty");
        return;
      }

      this.attempt++;

      if (this.userGuess.trim().toLowerCase() === this.correctCountry.trim().toLowerCase()) {
        this.answered = true;
        this.message = "✅ Correct! That's " + this.correctCountry;
        setTimeout(() => this.continue(10), 500);
      } else {
        this.answered = true;
        this.message = "❌ Incorrect! It's " + this.correctCountry;
        setTimeout(() => this.continue(0), 2000);
      }
    },
    async updateFlag() {
      const country = await this.getCountry(this.correctCountry);
      if (country) {
        this.flagUrl = country.flags.png;
      }
      this.userGuess = '';
      this.message = '';
      this.answered = false;
    },
    async continue(score) {
      this.$emit('guess', score);
    }
  },
  async mounted() {
    await this.updateFlag();
  },
  watch: {
    async correctCountry(newVal) {
      await this.updateFlag();
    }
  },
};
</script>

<template>
  <div class="game-container">
    <div class="flag-container">
      <img :src="flagUrl" alt="Flag" class="flag-image" />

      <input 
        v-model="userGuess" 
        @keyup.enter="checkGuess" 
        type="text" 
        placeholder="Enter country name..." 
        :disabled="answered" 
        class="guess-input"
      />

      <button 
        @click="checkGuess" 
        :disabled="answered || !userGuess" 
        class="submit-button"
      >
        Submit
      </button>

      <div v-if="message" class="message">
        <p>{{ message }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.game-container {
  background: linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), 
              url('src/assets/background.png') no-repeat center center;
  background-size: cover;
  width: 100%;
  height: calc(100vh - 50px);
  color: #f1faee;
}

.flag-container {
  text-align: center;
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
  background: rgba(30, 30, 30, 0.8);
  border-radius: 10px;
}

.flag-image {
  width: 100%;
  max-width: 300px;
  height: auto;
  aspect-ratio: 3/2;
  object-fit: cover;
  border-radius: 5px;
  border: 2px solid #444;
}

.guess-input {
  padding: 12px;
  font-size: 1rem;
  width: 100%;
  max-width: 300px;
  margin: 20px 0;
  background: #1e1e1e;
  border: 1px solid #444;
  border-radius: 5px;
  color: white;
}

.submit-button {
  padding: 12px 24px;
  font-size: 1rem;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.submit-button:hover:not(:disabled) {
  background-color: #45a049;
}

.submit-button:disabled {
  background-color: #555;
  cursor: not-allowed;
}

.message {
  margin-top: 20px;
  padding: 10px;
  border-radius: 5px;
  font-size: 1.1rem;
}

.message p {
  margin: 0;
}
</style>