<script>
import Answer from '@/components/Answer.vue';
import AvailableCountries from './AvailableCountries.vue';

export default {
  props: {
    correctCountry: {
      type: String,
      required: true
    }
  },
  components: {
    Answer,
    AvailableCountries
  },
  data() {
    return {
      correctLetters: [],
      correctPlacedLetters: [],
      symbolsAns: [],
      correct: false,
      inputGuess: '',
      attempt: 0,
      showSuccess: false,
      succesMessage: ''
    };
  },
  methods: {
    processInput(input) {
      this.attempt++
      const symbolsInp = input.toUpperCase().split("");
      let iAns = 0;
      
      for (let symbolAns of this.symbolsAns) {
        if (symbolAns === symbolsInp[iAns]) {
            this.correctPlacedLetters[iAns] = symbolAns;
        } 
        for (let symbolInp of symbolsInp) {
          if (symbolAns === symbolInp) {
            if (!this.correctLetters.includes(symbolInp)) {
                this.correctLetters.push(symbolInp);
            }
          }
        }
        iAns++;
      }
      
      if (input.trim().toLowerCase() == this.correctCountry.trim().toLowerCase()) {
        this.correct = true;
        this.succesMessage = ('Correct that was ' + this.correctCountry + ' you guessed it in ' + this.attempt + ' attempts!')
        this.showSuccess = true;
        this.$emit('correct', Math.round(100/this.attempt));
        
        // Hide success message after 3 seconds
        setTimeout(() => {
          this.showSuccess = false;
        }, 3000);
      }
    },
    restart() {
      this.attempt = 0
      this.correctPlacedLetters = [];
      this.correctLetters = [];
      this.symbolsAns = this.correctCountry.toUpperCase().split("");
      for (let i = 0; i < this.correctCountry.length; i++) {
        this.correctPlacedLetters.push('_');
      }
      this.correct = false;
    }
  },
  mounted() {
    this.restart();
  },
  watch: {
    correctCountry: function(val) {
      this.restart()
    }
  }
};
</script>

<template>
  <div class="game-container">
    <div class="content-wrapper">
      <h1 class="title">Wordle Like</h1>
      
      <transition name="fade">
        <div v-if="showSuccess" class="success-message">
          <span class="trophy-icon">🏆</span> {{ succesMessage }}
        </div>
      </transition>
      
      <Answer @input="processInput" :answer="correctCountry" />
      
      <div class="attempt-counter">
        Attempt: {{ attempt }}
      </div>

      <div class="clues-container">
        <div class="clue-section">
          <h3>Correct Positions</h3>
          <div class="letter-grid">
            <span 
              v-for="(symbol, index) in correctPlacedLetters" 
              :key="index" 
              class="letter-tile"
              :class="{ 'correct-position': symbol !== '_' }"
            >
              {{ symbol }}
            </span>
          </div>
        </div>

        <div class="clue-section">
          <h3>Correct Letters</h3>
          <div class="letter-bank">
            <span 
              v-for="(symbol, index) in correctLetters" 
              :key="index" 
              class="letter-tile correct-letter"
            >
              {{ symbol }}
            </span>
          </div>
        </div>
      </div>
    </div>
    
    <AvailableCountries class="countries-list" />
  </div>
</template>

<style scoped>
.game-container {
  width: 100%;
  min-height: calc(100vh - 50px);
  padding: 2rem;
  background: linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), 
              url('src/assets/block.webp') no-repeat center center;
  background-size: cover;
  color: white;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.content-wrapper {
  max-width: 800px;
  width: 100%;
  background: rgba(0, 0, 0, 0.7);
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.title {
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
  color: #4fc3f7;
  text-align: center;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.success-message {
  background: rgba(76, 175, 80, 0.9);
  color: white;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  font-weight: bold;
  text-align: center;
  animation: pulse 1.5s infinite;
}

.trophy-icon {
  margin-right: 0.5rem;
  font-size: 1.2em;
}

.attempt-counter {
  text-align: center;
  margin: 1rem 0;
  font-size: 1.1rem;
  color: #bdbdbd;
}

.clues-container {
  margin-top: 2rem;
  background: rgba(255, 255, 255, 0.1);
  padding: 1.5rem;
  border-radius: 12px;
}

.clue-section {
  margin-bottom: 1.5rem;
}

.clue-section h3 {
  color: #81c784;
  margin-bottom: 0.8rem;
  font-size: 1.2rem;
}

.letter-grid {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
}

.letter-bank {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.letter-tile {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  font-size: 1.4rem;
  font-weight: bold;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.letter-tile.correct-position {
  background: #4caf50;
  transform: scale(1.1);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.letter-tile.correct-letter {
  background: #ffc107;
  color: #212121;
}

.countries-list {
  margin-top: 2rem;
  width: 100%;
  max-width: 800px;
}

/* Animations */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

@media (max-width: 768px) {
  .content-wrapper {
    padding: 1.5rem;
  }
  
  .title {
    font-size: 2rem;
  }
  
  .letter-tile {
    width: 36px;
    height: 36px;
    font-size: 1.2rem;
  }
}
</style>