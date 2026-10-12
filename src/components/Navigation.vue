<script>
import { ref } from "vue";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import app from "../api/firebase";

const auth = getAuth(app);
const currentUser = ref(null);

onAuthStateChanged(auth, (user) => {
  currentUser.value = user;
});

export default {
  setup() {
    return { currentUser };
  },
};
</script>

<template>
  <nav class="navbar">
    <div class="nav-links">
      <RouterLink class="nav-link" to="/">Home</RouterLink>
      <RouterLink class="nav-link" to="/about">About</RouterLink>
      <RouterLink 
        class="nav-link" 
        :to="'/profile/' + currentUser?.uid" 
        v-if="currentUser && currentUser.displayName"
      >
        {{ currentUser.displayName }}
      </RouterLink>
      <RouterLink class="nav-link" to="/login" v-else>
        Login
      </RouterLink>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  width: 100%;
  background: #121212;
  color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  height: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.nav-links {
  width: 100%;
  max-width: 800px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 0 20px;
}

.nav-link {
  color: white;
  text-decoration: none;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.2s ease;
  padding: 8px 12px;
  border-radius: 4px;
  flex: 1;
  text-align: center;
}

.nav-link:hover {
  color: #4cc9f0;
  background: rgba(255, 255, 255, 0.05);
}

@media (max-width: 600px) {
  .nav-links {
    padding: 0 10px;
  }
  
  .nav-link {
    font-size: 0.9rem;
    padding: 6px 8px;
  }
}
</style>