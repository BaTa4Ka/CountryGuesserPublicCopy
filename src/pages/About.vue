<template>
  <div>
    <!-- About Section -->
    <div class="about">
      <main class="fade-in">
        <section class="mission">
          <h2>About Country Guesser</h2>
          <p>
            Country Guesser is a geography-based game designed to test and enhance players' knowledge of world countries. Developed as part of a college software engineering project, the game offers a rich and interactive experience that combines education with entertainment. Built using Vue.js and Firebase, Country Guesser provides a seamless and engaging way to explore global geography through various challenging game modes.
          </p>
        </section>

        <section class="game-features">
          
          <h2>Game Modes</h2>
          <p>
            Country Guesser offers multiple exciting game modes to test your geographical knowledge in different ways:
          </p>
          <ul>
            <li><strong>Multiplayer Mode:</strong> Compete with friends or players worldwide in real-time geography challenges.</li>
            <li><strong>Word Mode:</strong> Guess the country’s name using hints provided in a clue box.</li>
            <li><strong>Flag Mode:</strong> Identify countries based on their flags.</li>
            <li><strong>Coordinates Mode:</strong> Use latitude and longitude data to pinpoint the correct country.</li>
          </ul>
        </section>


        <section class="development-details">
          <h2>Development and Technology Stack</h2>
          <p>
            Country Guesser was developed as part of a collaborative software engineering project. The game utilizes:
          </p>
          <ul>
            <li><strong>Frontend:</strong> Vue.js for creating dynamic and responsive components.</li>
            <li><strong>Backend:</strong> Firebase functions for handling server-side logic.</li>
            <li><strong>Database:</strong> Firestore for efficient storage and retrieval of geographical data.</li>
            <li><strong>Development Environment:</strong> Built and tested in Visual Studio with a structured modular approach.</li>
          </ul>
        </section>

        <section class="future-plans">
          <h2>Future Enhancements</h2>
          <p>
            The project is continuously evolving, with plans for:
          </p>
          <ul>
            <li><strong>Enhanced UI/UX:</strong> Improving game visuals and interactivity.</li>
            <li><strong>New Game Modes:</strong> Expanding to include additional trivia-based challenges.</li>
            <li><strong>User Tracking:</strong> Implementing features to analyze user guesses and provide performance insights.</li>
          </ul>
        </section>
      </main>
    </div>
  </div>
</template>

<script>
export default {
  name: "AboutPage",
};
</script>


<style scoped>

/* Background for the first section (mission) - Blue background */
.about .mission {
  background: linear-gradient(to top, rgba(0, 0, 0, 0.5) 50%, rgba(0, 0, 0, 0.5) 50%), url('src/assets/lightmap.webp');
  background-size: cover; 
  color: white;
  padding: 40px 80px;
  margin: 0;
  box-sizing: border-box;
}

/* Background for all sections below (white background) */
.about .game-features,
.about .team,
.about .achievements,
.about .future-vision,
.about .thanks {
  background: rgb(6, 10, 13); /* Black background */
  color: white; /* Text color to white for contrast */
  padding: 20px 80px;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
  margin: 0;
  box-sizing: border-box;
}

/* For all sections that have a black background */
.mission,
.game-features,
.team,
.achievements,
.future-vision,
.thanks {
  width: 100%;
  max-width: 100vw;
  padding: 20px;
  background: rgb(118, 60, 60);
  color: white; /* Text color */
  margin-top: 0;
  box-sizing: border-box;
}

.development-details {
  background: rgb(6, 10, 13); /* Match other sections */
  color: white; /* Ensure text is visible */
  padding: 20px 80px;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
  margin: 0;
  box-sizing: border-box;
}

.future-plans{
  background: rgb(6, 10, 13); /* Match other sections */
  color: white; /* Ensure text is visible */
  padding: 20px 80px;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
  margin: 0;
  box-sizing: border-box;
}

h1 {
  font-size: 3rem;
  margin-bottom: 20px;
  color: #ffcc00;
  text-transform: uppercase;
  letter-spacing: 2px;
}

/* Section Headings */
h2 {
  font-size: 2rem;
  margin-top: 30px;
  color: #ffcc00;
  text-transform: uppercase;
}

/* Paragraph Styling */
p {
  font-size: 1.2rem;
  margin-bottom: 20px;
  line-height: 1.6;
}

ul {
  font-size: 2rem;
  max-width: 95%;
  list-style-type: none;
  padding: 0;
  text-align:left;
  margin: 0 auto;
}

li {
  font-size: 2rem;
  margin: 10px 0;
  padding: 12px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 8px;
  transition: transform 0.2s ease-in-out;
  display: flex;
  flex-direction: column;
}

li:hover {
  transform: scale(1.02);
  background: rgba(255, 255, 255, 0.2);
}

li strong {
  color: #ffcc00;
}

/* Fade-in Animation */
.fade-in {
  opacity: 0;
  animation: fadeIn 1s ease-in forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive Styles */
@media (max-width: 768px) {
  h1 {
    font-size: 2.5rem;
  }

  h2 {
    font-size: 1.5rem;
  }

  p {
    font-size: 1rem;
    
  }

  .btn {
    font-size: 1rem;
    padding: 10px 20px;
  }
}

/* Section Styling for Each Individual Section */
.mission,
.game-features,
.team,
.achievements,
.future-vision,
.thanks {
  margin-top: 40px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.3);
  width: 100%;
  margin-bottom: 40px;
}

.mission p, .game-features p, .team p, .achievements p, .future-vision p, .thanks p {
  font-size: 2rem;
  margin-bottom: 20px;
}

.game-features ul, .team ul, .achievements ul, .future-vision ul {
  font-size: 1.1rem;
}

.game-features ul li, .team ul li, .achievements ul li, .future-vision ul li {
  margin: 8px 0;
  padding: 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  transition: transform 0.2s ease-in-out;
}

.game-features ul li:hover, .team ul li:hover, .achievements ul li:hover, .future-vision ul li:hover {
  transform: scale(1.02);
  background: rgba(255, 255, 255, 0.2);
}

/* Adding some additional styling for team members */
.team ul li {
  font-size: 1rem;
  background: rgba(255, 255, 255, 0.15);
  padding: 15px;
  border-radius: 8px;
}

.team ul li strong {
  color: #ffcc00;
}
</style>