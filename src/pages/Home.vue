<template>
  <div>
    <div class="background-image"></div>
    <div class="home">
      <div class="content-container">
        <h1 class="title">🌍 WELCOME TO COUNTRY Guesser</h1>
        <h3>Choose any gamemode to Start playing</h3>
        <RouterLink class="mode-link" to="/mp">Play multiplayer mode</RouterLink>
        <RouterLink class="mode-link" to="/wlike">Play Wordle-Like Mode</RouterLink>
        <RouterLink class="mode-link" to="/flagguesser">Play Flague Guesser mode</RouterLink>
        <RouterLink class="mode-link" to="/coordinatesguesser">Play Coordinates Guesser Mode</RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { RouterLink, useRouter } from 'vue-router';
</script>

<style scoped>


/* Adjust background container to remove space between navbar and image */
.home {
  position: relative;
  min-height: calc(100vh - 50px); /* Full viewport height minus the new navbar height */
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 0; /* Ensure content starts right below the navbar */
  width: 100%;
}

/* Styling for the background image with gradient overlay */
.background-image {
  position: fixed;
  width: 100%;
  height: 100%;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.5) 50%, rgba(0, 0, 0, 0.5) 50%), url('/src/assets/earth.webp'); /* Path to your background image */
  background-size: cover; /* Ensure the image covers the whole screen */
  background-position: center center; /* Centers the image */
  z-index: -1; /* Ensures image is below content */
}

/* Container for content */
.content-container {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 80%;
  min-height: calc(100vh - 80px); /* Full viewport height minus the new navbar height */
  color: #f1faee; /* Light text color for visibility */
  text-align: center;
  font-size: 3rem; /* Increased font size for the content */
}

/* Title styling */
.title {
  font-size: 5rem; /* Increased title font size */
  margin-bottom: 20px;
}

/* Button styling */
.start-btn {
  background-color: #E63946;
  color: white;
  border: none;
  padding: 45px 90px; /* Increased padding */
  border-radius: 30px;
  font-size: 3rem; /* Increased button font size */
  cursor: pointer;
  transition: transform 0.3s;
  margin-bottom: 20px;
}

.start-btn:hover {
  transform: scale(1.1);
}

/* Link styling */
.mode-link {
  display: block;
  margin-top: 60px; /* Increased margin */
  color: #F1FAEE;
  text-decoration: underline;
  font-size: 3rem; /* Increased link font size */
  cursor: pointer;
}

.mode-link:hover {
  color: #A8DADC;
}

/* Media queries for responsiveness */
@media (max-width: 768px) {
  .home {
    background-size: contain; /* Adjust for smaller screens */
  }

  .title {
    font-size: 6rem; /* Adjust title font size for smaller screens */
  }

  .start-btn {
    font-size: 2.5rem; /* Adjust button font size for smaller screens */
  }

  .mode-link {
    font-size: 2.8rem; /* Adjust link font size for smaller screens */
  }
}
</style>
