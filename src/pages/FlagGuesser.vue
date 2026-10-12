<script>
import Flags from '../components/Flags.vue';
import app from '@/api/firebase';
import { getFunctions, httpsCallable } from 'firebase/functions';

export default {
  components: {
    Flags,
  },
  data() {
    return {
      countries: [],
      correct: false,
      round: 0, 
      playerScore: 0,
      correctCountry: '' 
    };
  },
  methods: {
    async getCountries() {
      let loader = this.$loading.show({ opacity: 0.9 });
      const functions = getFunctions(app);
      const getCountryArray = httpsCallable(functions, 'getCountries');
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
      await this.getRandomCountry()
      this.playerScore += score;
      this.round++
    }
  },
  mounted() {
      this.getRandomCountry();
  },
};
</script>

<template>
  <div class="game-progress">
      <div>Round: {{ (round + 1) }}</div>
      <div>Score: {{ playerScore }}</div>
  </div>
  <Flags
      ref="flags"
      :correctCountry="correctCountry"
      @guess="nextRound"
    />

</template>

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
