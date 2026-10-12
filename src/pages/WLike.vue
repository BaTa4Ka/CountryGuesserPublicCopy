<script>
import WLikeRound from '@/components/WLikeRound.vue';
import app from '@/api/firebase';
import { getFunctions, httpsCallable } from 'firebase/functions';

export default {
    components: {
        WLikeRound
    },
   data() {
    return {
        round: 0, 
        playerScore: 0,
        countries: [],  
        correctCountry: '' 
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
        
        async getRandomCountry() {
            if(this.countries.length == 0) {
                await this.getCountries()
            }
            this.country = this.countries[Math.floor(Math.random() * this.countries.length)];
            this.correctCountry = this.country.id;
        },

        handleRoundCompletion(score) {
            this.playerScore += score; // Add points for correct guess
            this.nextRound();
        },

        nextRound() {
            // Increase round number and reset the game for the next round
            this.round++;
            this.getRandomCountry();
        },


    },
    mounted() {
        this.getRandomCountry()
    }
};
</script>


<template>
    <div class="game-progress">
        <div>Round: {{ round + 1 }}</div>
        <div>Score: {{ playerScore }}</div>
    </div>
    <WLikeRound @correct="handleRoundCompletion" :correctCountry="correctCountry" />
    <WorldMap />
</template>

<style>
.game-progress {
    margin-top: 20px;
    padding: 10px;
    background: #232526;
    color: white;
    text-align: center;
    font-size: 1.5rem;
}

.container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    width: 100vw;
    height: calc(100vh - 50px);
    background-color: #ffffff;
    color: white;
    font-family: Arial, sans-serif;
}

.title {
    font-size: 3rem;
    margin-bottom: 20px;
    color: #ffcc00;
    width: 100%; /* Makes the title span the full width */
}

.clues {
    margin: 20px 0;
    padding: 15px;
    background: #333;
    border-radius: 8px;
    box-shadow: 0px 4px 12px rgba(255, 255, 255, 0.2);
    width: 100%; /* Ensures it spans the full width */
}

.clue-section {
    margin-bottom: 25px;
    width: 100%; /* Ensures each section takes full width */
}

.letter-box {
    display: flex;
    justify-content: center;
    gap: 500px;
    flex-wrap: wrap;
    width: 100%; /* Ensures letter-box spans full width */
}

.symbol {
    display: inline-block;
    width: 40px;
    height: 40px;
    line-height: 40px;
    font-size: 1.5rem;
    font-weight: bold;
    text-align: center;
    border-radius: 8px;
    background: #555;
    color: white;
}

.correct-placed {
    background: #28a745;
}

.correct {
    background: #ffc107;
}

</style>