<script>
import app from '@/api/firebase';
import { getFunctions, httpsCallable } from 'firebase/functions';

export default{
    data() {
        return {
            country: {},
            countries: [],
        }
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
    },
    mounted() {
      this.getCountries();
  },
}

</script>

<template>
    <div class="countries-container">
      <h1>List of Available Countries:</h1>
      <div class="countries-list">
        <div class="country-item" v-for="country in countries" :key="country.id">
          {{ country.id }}
        </div>
      </div>
    </div>
  </template>
  
  <style scoped>
  .countries-container {
    display: flex;
    flex-direction: column;
    height: calc(100vh - 300px); /* Adjust based on your layout */
    min-height: 200px;
    color: white;
    padding: 15px;
    background: #222;
    margin-top: 20px;
    width: 100%; /* Ensure full width */
    box-sizing: border-box; /* Include padding in width calculation */
    overflow-x: hidden; /* Prevent horizontal overflow */
  }
  
  .countries-list {
    flex: 1;
    overflow-y: auto; /* Vertical scroll only */
    overflow-x: hidden; /* Hide horizontal overflow */
    margin-top: 10px;
    width: 100%;
  }
  
  .country-item {
    font-size: 1.2rem;
    margin: 5px 0;
    padding: 8px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 5px;
    transition: transform 0.2s;
    word-break: break-word; /* Prevent long words from causing overflow */
    white-space: normal; /* Allow text to wrap */
  }
  
  .country-item:hover {
    transform: scale(1.01);
    background: rgba(255, 255, 255, 0.2);
  }
  </style>