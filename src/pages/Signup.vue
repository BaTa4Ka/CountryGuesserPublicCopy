<template>
  <div class="signup-container">
    <div class="signup-box">
      <h1 class="signup-title">Create Your Account</h1>
      <p class="signup-subtitle">Join our community today</p>

      <form @submit.prevent="registerUser" class="signup-form">
        <div class="input-group">
          <label for="username" class="input-label">Username</label>
          <input
            type="text"
            id="username"
            v-model="username"
            placeholder="Choose your username"
            class="input-field"
            required
            autocomplete="username"
            minlength="3"
            maxlength="20"
          >
          <div class="input-hint">3-20 characters, letters and numbers only</div>
        </div>

        <div class="input-group">
          <label for="email" class="input-label">Email</label>
          <input
            type="email"
            id="email"
            v-model="email"
            placeholder="Enter your email"
            class="input-field"
            required
            autocomplete="email"
          >
        </div>

        <div class="input-group">
          <label for="password" class="input-label">Password</label>
          <input
            type="password"
            id="password"
            v-model="password"
            placeholder="Create a password"
            class="input-field"
            required
            autocomplete="new-password"
            minlength="6"
          >
          <div class="password-strength" :class="passwordStrengthClass">
            Password strength: {{ passwordStrength }}
          </div>
        </div>

        <button type="submit" class="signup-button" :disabled="isLoading">
          <span v-if="!isLoading">Sign Up</span>
          <loading v-else :active="true" :is-full-page="false" color="#ffffff" />
        </button>

        <div class="login-redirect">
          Already have an account? <router-link to="/login" class="login-link">Log in</router-link>
        </div>
      </form>

      <transition name="fade">
        <div v-if="errorMessage" class="message-box error">
          <i class="icon-error"></i>
          <p>{{ errorMessage }}</p>
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
import { ref, computed } from "vue";
import { auth, db } from "../api/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { useRouter } from "vue-router";
import Loading from 'vue-loading-overlay';
import 'vue-loading-overlay/dist/css/index.css';

export default {
  components: {
    Loading
  },
  setup() {
    const username = ref("");
    const email = ref("");
    const password = ref("");
    const errorMessage = ref("");
    const isLoading = ref(false);
    const router = useRouter();

    const passwordStrength = computed(() => {
      if (!password.value) return "None";
      if (password.value.length < 4) return "Weak";
      if (password.value.length < 8) return "Medium";
      if (password.value.length < 12) return "Good";
      return "Strong";
    });

    const passwordStrengthClass = computed(() => {
      return {
        weak: passwordStrength.value === "Weak",
        medium: passwordStrength.value === "Medium",
        good: passwordStrength.value === "Good",
        strong: passwordStrength.value === "Strong"
      };
    });

    const registerUser = async () => {
      if (!username.value || !email.value || !password.value) return;
      
      isLoading.value = true;
      errorMessage.value = "";

      try {
        // Validate username format
        if (!/^[a-zA-Z0-9]{3,20}$/.test(username.value)) {
          throw new Error("Username must be 3-20 characters (letters and numbers only)");
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value);
        const user = userCredential.user;

        await updateProfile(user, { displayName: username.value });

        await setDoc(doc(db, "users", user.uid), {
          avatar: import.meta.env.VITE_DEFAULT_AVATAR_URL,
          username: username.value,
          email: email.value,
          flaguegueses: 0,
          wlikeGueses: 0,
          currentRoom: "",
          public: true,
          createdAt: new Date().toISOString()
        });

        router.push("/profile/" + user.uid);
      } catch (error) {
        errorMessage.value = getFriendlyError(error.code || error.message);
      } finally {
        isLoading.value = false;
      }
    };

    const getFriendlyError = (error) => {
      const errors = {
        "auth/email-already-in-use": "This email is already registered",
        "auth/invalid-email": "Please enter a valid email address",
        "auth/weak-password": "Password should be at least 6 characters",
        "Username must be 3-20 characters (letters and numbers only)": "Invalid username format"
      };
      return errors[error] || "An error occurred. Please try again";
    };

    return { 
      username, 
      email, 
      password, 
      registerUser, 
      errorMessage,
      isLoading,
      passwordStrength,
      passwordStrengthClass
    };
  },
};
</script>

<style scoped>
.signup-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 50px);
  padding: 2rem;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.signup-box {
  background: white;
  padding: 3rem;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 480px;
  color: #1a1a2e;
}

.signup-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  text-align: center;
}

.signup-subtitle {
  color: #6b7280;
  text-align: center;
  margin-bottom: 2rem;
  font-size: 1rem;
}

.signup-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.input-field {
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s;
}

.input-field:focus {
  outline: none;
  border-color: #6a0dad;
  box-shadow: 0 0 0 3px rgba(106, 13, 173, 0.1);
}

.input-hint {
  font-size: 0.75rem;
  color: #6b7280;
}

.password-strength {
  font-size: 0.75rem;
  padding: 0.25rem 0;
}

.password-strength.weak {
  color: #ef4444;
}

.password-strength.medium {
  color: #f59e0b;
}

.password-strength.good {
  color: #10b981;
}

.password-strength.strong {
  color: #3b82f6;
}

.signup-button {
  background-color: #6a0dad;
  color: white;
  border: none;
  padding: 1rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.signup-button:hover:not(:disabled) {
  background-color: #4b097a;
  transform: translateY(-1px);
}

.signup-button:disabled {
  background-color: #a78bfa;
  cursor: not-allowed;
}

.login-redirect {
  text-align: center;
  color: #6b7280;
  font-size: 0.875rem;
  margin-top: 1rem;
}

.login-link {
  color: #6a0dad;
  font-weight: 500;
  text-decoration: none;
}

.login-link:hover {
  text-decoration: underline;
}

.message-box {
  padding: 1rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 1.5rem;
  font-size: 0.875rem;
}

.message-box.error {
  background-color: #fef2f2;
  color: #b91c1c;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 640px) {
  .signup-box {
    padding: 2rem 1.5rem;
  }
  
  .signup-title {
    font-size: 1.5rem;
  }
}
</style>