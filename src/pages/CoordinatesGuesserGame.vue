<template>
  <div class="game-progress">
        <div>Round: {{ (round + 1) }}</div>
        <div>Score: {{ playerScore }}</div>
  </div>
  <div v-if="correctCountry">
    <CordsRound @correct="nextRound" :correctCountry="correctCountry" />
  </div>
</template>

<script>
import app from '@/api/firebase';
import { getFunctions, httpsCallable } from 'firebase/functions';
import CordsRound from '@/components/CordsRound.vue';

export default {
  data() {
    return {
      correctCountry: null,  // Changed to null to make v-if work correctly
      countries: [],  
      functions: getFunctions(app),
      round: 0,
      playerScore: 0
    };
  },
  components: {
    CordsRound
  },
  methods: {
    async getCountries() {
          let loader = this.$loading.show({ opacity: 0.9 });
          const getCountryArray = httpsCallable(this.functions, 'getCountries');
          const result = await getCountryArray();
          this.countries = result.data.countries;
          loader.hide();
      },
      
      async getRandomCountry() {
          if(this.countries.length == 0) {
              await this.getCountries()
          }
          this.country = this.countries[Math.floor(Math.random() * this.countries.length)];
          this.correctCountry = this.country.id;
      },
    async nextRound(score) {
      await this.getRandomCountry(); // Ensure country is fetched before next round
      this.round++;
      this.playerScore += score;
    }
  },
  created() {
    this.getRandomCountry()
  }
};
</script>

<style scoped>
.game-progress {
    margin-top: 20px;
    padding: 10px;
    background: #232526;
    color: white;
    text-align: center;
    font-size: 1.5rem;
}
</style>
