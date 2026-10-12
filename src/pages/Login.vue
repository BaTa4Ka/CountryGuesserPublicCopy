<template>
  <div class="login-container">
    <div class="login-box">
      <h1 class="login-title">Welcome Back</h1>
      <p class="login-subtitle">Please enter your credentials to sign in</p>

      <form @submit.prevent="loginUser" class="login-form">
        <div class="input-group">
          <label for="email" class="input-label">Email</label>
          <input 
            type="email" 
            id="email" 
            v-model="email" 
            placeholder="Enter your email" 
            class="input-field"
            required
            autocomplete="username"
          >
        </div>

        <div class="input-group">
          <label for="password" class="input-label">Password</label>
          <input 
            type="password" 
            id="password" 
            v-model="password" 
            placeholder="Enter your password" 
            class="input-field"
            required
            autocomplete="current-password"
          >
        </div>

        <button type="button" @click="resetPassword" class="forgot-password-link">
          Forgot password?
        </button>

        <button type="submit" class="login-button" :disabled="isLoading">
          Sign In
        </button>

        <p class="signup-link">
          Don't have an account? 
          <router-link to="/signup" class="signup-text">Sign up</router-link>
        </p>
      </form>

      <loading 
        v-model:active="isLoading"
        :can-cancel="false"
        :is-full-page="false"
        color="#4f46e5"
        background-color="#ffffff"
      />

      <transition name="fade">
        <div v-if="message" class="message-box success">
          <i class="icon-check"></i>
          <p>{{ message }}</p>
        </div>
      </transition>

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
import { ref } from "vue";
import { auth } from "../api/firebase";
import { 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail
} from "firebase/auth";
import { useRouter } from "vue-router";
import Loading from 'vue-loading-overlay';
import 'vue-loading-overlay/dist/css/index.css';

export default {
  components: {
    Loading
  },
  setup() {
    const email = ref("");
    const password = ref("");
    const errorMessage = ref("");
    const message = ref("");
    const isLoading = ref(false);
    const router = useRouter();

    const loginUser = async () => {
      if (!email.value || !password.value) return;
      
      isLoading.value = true;
      errorMessage.value = "";
      
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email.value, password.value);
        router.push("/profile/" + userCredential.user.uid);
      } catch (error) {
        errorMessage.value = getFriendlyError(error.code);
      } finally {
        isLoading.value = false;
      }
    };

    const resetPassword = async () => {
      if (!email.value) {
        errorMessage.value = "Please enter your email address first";
        return;
      }
      
      try {
        await sendPasswordResetEmail(auth, email.value);
        message.value = "Password reset link sent to your email";
        setTimeout(() => message.value = "", 5000);
      } catch (error) {
        errorMessage.value = getFriendlyError(error.code);
      }
    };

    const getFriendlyError = (errorCode) => {
      const errors = {
        "auth/invalid-email": "Please enter a valid email address",
        "auth/user-not-found": "No account found with this email",
        "auth/wrong-password": "Incorrect password",
        "auth/too-many-requests": "Too many attempts. Try again later",
        "auth/network-request-failed": "Network error. Check your connection"
      };
      return errors[errorCode] || "An error occurred. Please try again";
    };

    return { 
      email, 
      password, 
      loginUser, 
      resetPassword,
      errorMessage, 
      message,
      isLoading
    };
  },
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 50px);
  padding: 2rem;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.login-box {
  background: white;
  padding: 3rem;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 480px;
  position: relative;
}

.login-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1a1a2e;
  margin-bottom: 0.5rem;
  text-align: center;
}

.login-subtitle {
  color: #6b7280;
  text-align: center;
  margin-bottom: 2rem;
  font-size: 1rem;
}

.login-form {
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
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.forgot-password-link {
  background: none;
  border: none;
  color: #4f46e5;
  font-weight: 500;
  cursor: pointer;
  padding: 0;
  text-align: right;
  font-size: 0.875rem;
}

.forgot-password-link:hover {
  text-decoration: underline;
}

.login-button {
  background-color: #4f46e5;
  color: white;
  border: none;
  padding: 1rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  height: 48px;
}

.login-button:hover:not(:disabled) {
  background-color: #4338ca;
  transform: translateY(-1px);
}

.login-button:disabled {
  background-color: #a5b4fc;
  cursor: not-allowed;
}

.signup-link {
  text-align: center;
  color: #6b7280;
  font-size: 0.875rem;
}

.signup-text {
  color: #4f46e5;
  font-weight: 500;
  text-decoration: none;
}

.signup-text:hover {
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

.message-box.success {
  background-color: #ecfdf5;
  color: #065f46;
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
  .login-box {
    padding: 2rem 1.5rem;
  }
  
  .login-title {
    font-size: 1.5rem;
  }
}
</style>