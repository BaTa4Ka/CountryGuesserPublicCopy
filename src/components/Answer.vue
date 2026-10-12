<script>
export default {
    props: {
        answer: {
            type: String,
            required: true
        }
    },
    data() {
        return {
            input: "",
            attempts: 0,
            message: "Let's go!",
            correct: false,
            gueses: []
        }
    },
    methods: {
        checkGuess() {  
            this.$emit('input', this.input);
            this.attempts++
            const trimmedInput = this.input.trim().toLowerCase();

            if (trimmedInput === this.answer.toLowerCase()) {
                this.message = `✅ Correct! It took you ${this.attempts} ${this.attempts === 1 ? 'try' : 'tries'}.`
                this.correct = true
                this.$refs.inp.style.color = "#4CAF50" // Green
                this.$refs.msg.style.color = "#4CAF50" // Green
            } else {
                this.gueses[(this.attempts - 1)] = this.input
                this.message = "❌ Try again!"
                this.input = ""
                this.$refs.msg.style.color = "#FF9800" // Orange
            }
        }
    }, 
    watch: {
        answer() {
            this.input = ""
            this.attempts = 0
            this.message = "Let's go!"
            this.correct = false
            this.gueses = []
            this.$refs.inp.style.color = "#E0E0E0" // Light gray
            this.$refs.msg.style.color = "#FFFFFF" // White
        }
    }
}
</script>

<template>  
    <h3 ref="msg" class="message">{{ message }}</h3>
    <div class="answer-container">
        <div class="guess-box">
            <div v-for="(gues, index) in gueses" :key="index" class="guess-item">
                {{ gues }}
            </div>
        </div>     
        <input 
            v-model="input" 
            type="text" 
            placeholder="Input your guess" 
            @keypress.enter="checkGuess()" 
            :disabled="correct" 
            ref="inp"
            class="guess-input"
        >
    </div>
</template>

<style scoped>
    .message {
        margin-bottom: 10px;
        min-height: 24px;
        text-align: center;
    }

    .answer-container {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .guess-box {
        border: 1px solid #444;
        padding: 10px;
        height: 200px;
        width: auto;
        overflow-y: auto;
        background-color: rgba(30, 30, 30, 0.8);
        border-radius: 4px;
    }

    .guess-item {
        padding: 4px 0;
        color: #E0E0E0;
    }

    .guess-input {
        width: 300px;
        height: 40px;
        padding: 8px 12px;
        background-color: #1E1E1E;
        border: 1px solid #444;
        border-radius: 4px;
        color: #E0E0E0;
        font-size: 16px;
        align-self: center;
    }

    .guess-input:focus {
        outline: none;
        border-color: #BB86FC;
        box-shadow: 0 0 0 2px rgba(187, 134, 252, 0.2);
    }

    .guess-input:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }
</style>