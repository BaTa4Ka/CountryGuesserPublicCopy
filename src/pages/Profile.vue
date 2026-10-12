<script>
import { getAuth, onAuthStateChanged, signOut, deleteUser } from "firebase/auth";
import { getFirestore, doc, deleteDoc, updateDoc, getDoc } from "firebase/firestore";
import { ref, watch } from "vue";
import app from "../api/firebase";
import { useRouter } from "vue-router";
import Upload from "./Upload.vue";

const auth = getAuth(app);
const db = getFirestore();
const currentUser = ref(null);

onAuthStateChanged(auth, async (user) => {
  if (user) {
    console.log("User ID (UID):", user.uid);
    console.log("Username (displayName):", user.displayName);
    currentUser.value = user;
  } else {
    console.log("No user signed in");
    currentUser.value = null;
  }
});

export default {
  components: {
    Upload
  },
  props: {
    uid: {
      type: String,
      required: false,
    },
  },
  data() {
    return {
      currentUser: currentUser,
      user: null,
      isPublic: false,
      showConfirmDelete: false,
      showUploadModal: false,
      message: "",
      errorMessage: "",
    };
  },
  methods: {
    handleAvatarUpdate(newAvatarUrl) {
      if (this.user) {
        this.user.avatar = newAvatarUrl;
      }
    },
    logout() {
      signOut(auth)
        .then(() => {
          console.log("User signed out successfully.");
          this.$router.push("/");
        })
        .catch((error) => {
          console.error("Error signing out:", error);
        });
    },
    async getUser() {
      try {
        const userRef = doc(db, "users", this.uid);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
          console.warn("User document does not exist in Firestore.");
          return;
        }

        this.user = userDoc.data();
        this.isPublic = this.user.public ?? false;
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    },
    confirmDeleteAccount() {
      this.showConfirmDelete = true;
    },
    async deleteAccount() {
      if (!auth.currentUser) return;
      try {
        await deleteDoc(doc(db, "users", auth.currentUser.uid));
        await deleteUser(auth.currentUser);
        this.message = "Your account has been deleted.";
        this.showConfirmDelete = false;
        this.$router.push("/");
      } catch (error) {
        this.errorMessage = error.message;
      }
    },
    async togglePublic() {
      if (!this.user || !this.uid) return;
      try {
        const userRef = doc(db, "users", this.uid);
        const newStatus = !this.isPublic;
        await updateDoc(userRef, { public: newStatus });

        this.isPublic = newStatus;
        console.log("Profile visibility updated:", newStatus);
      } catch (error) {
        this.errorMessage = "Error updating profile visibility.";
        console.error("Error:", error);
      }
    },
  },
  async mounted() {
    if (!this.uid) {
      if (this.currentUser) {
        this.$router.push("/profile/" + this.currentUser.uid);
      } else {
        this.$router.push("/login");
      }
    }
    await this.getUser();
  },
  watch: {
    uid(newUid) {
      if (newUid) {
        this.getUser();
      } else {
        this.user = null;
      }
    },
  },
};
</script>

<template>
  <div class="profile-container">
    <div class="profile-card">
      <div v-if="uid == null" class="guest-view">
        <h1 class="welcome-title">Welcome to Our Community</h1>
        <p class="welcome-message">Join us to connect with others and access all features</p>
        <div class="auth-buttons">
          <RouterLink to="/login"><button class="btn btn-primary">Login</button></RouterLink>
          <RouterLink to="/signup"><button class="btn btn-secondary">Sign Up</button></RouterLink>
        </div>
      </div>
      
      <div v-else class="user-view">
        <div v-if="user" class="user-content">
          <div class="profile-header">
            <div v-if="user.avatar" class="avatar-container">
              <img :src="user.avatar" class="avatar-img">
            </div>
            <div class="profile-info">
              <h1 class="username">{{ user.username }}</h1>
              <p class="user-id">User ID: {{ uid }}</p>
            </div>
          </div>

          <div v-if="user.public || (user && currentUser && user.username == currentUser.displayName)" class="profile-details">
            <div class="detail-item">
              <span class="detail-label">Email:</span>
              <span class="detail-value">{{ user.email }}</span>
            </div>

            <div v-if="user && currentUser && user.username == currentUser.displayName" class="profile-actions">
              <div class="toggle-group">
                <span class="toggle-label">Profile Visibility:</span>
                <label class="toggle-switch">
                  <input type="checkbox" :checked="isPublic" @change="togglePublic" />
                  <span class="slider"></span>
                  <span class="toggle-text">{{ isPublic ? 'Public' : 'Private' }}</span>
                </label>
              </div>

              <div class="action-buttons">
                <button @click="showUploadModal = true" class="btn btn-icon">
                  Change Avatar
                </button>
                <button @click="logout" class="btn btn-outline">
                  <i class="icon-logout"></i> Logout
                </button>
                <button @click="confirmDeleteAccount" class="btn btn-danger">
                  <i class="icon-delete"></i> Delete Account
                </button>
              </div>
            </div>
          </div>
          
          <div v-else class="private-profile">
            <div class="private-notice">
              <i class="icon-lock"></i>
              <h2>This profile is private</h2>
              <p>The user has chosen to keep their profile information private</p>
            </div>
          </div>
        </div>
        
        <div v-else class="error-view">
          <div class="error-notice">
            <i class="icon-error"></i>
            <p>Failed to load user data</p>
          </div>
        </div>
      </div>

      <Upload 
      :isOpen="showUploadModal"
      @close="showUploadModal = false"
      @upload-complete="handleAvatarUpdate"
    />
      <!-- Delete Confirmation Modal -->
      <div v-if="showConfirmDelete" class="modal-overlay">
        <div class="modal-content">
          <h3>Confirm Account Deletion</h3>
          <p>Are you sure you want to permanently delete your account? This action cannot be undone.</p>
          <div class="modal-actions">
            <button @click="deleteAccount" class="btn btn-danger">Yes, Delete Permanently</button>
            <button @click="showConfirmDelete = false" class="btn btn-cancel">Cancel</button>
          </div>
        </div>
      </div>

      <div v-if="message" class="alert alert-success">{{ message }}</div>
      <div v-if="errorMessage" class="alert alert-error">{{ errorMessage }}</div>
    </div>
  </div>
</template>

<style scoped>
/* Base Styles */
.profile-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 50px);
  padding: 2rem;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  color: #ffffff;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.profile-card {
  width: 100%;
  max-width: 800px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  padding: 2rem;
  transition: all 0.3s ease;
}

/* Guest View */
.guest-view {
  text-align: center;
  padding: 2rem;
}

.welcome-title {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #e94560;
}

.welcome-message {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.auth-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

/* User View */
.user-view {
  width: 100%;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.avatar-container {
  position: relative;
}

.avatar-img {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 50%;
  border: 4px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.profile-info {
  flex: 1;
}

.username {
  font-size: 2rem;
  margin: 0;
  color: #e94560;
}

.user-id {
  font-size: 0.9rem;
  opacity: 0.7;
  margin: 0.5rem 0 0;
}

/* Profile Details */
.profile-details {
  padding: 1.5rem 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.detail-item {
  display: flex;
  margin-bottom: 1rem;
}

.detail-label {
  font-weight: 600;
  width: 100px;
  opacity: 0.8;
}

.detail-value {
  flex: 1;
}

/* Toggle Switch */
.toggle-group {
  display: flex;
  align-items: center;
  margin: 1.5rem 0;
}

.toggle-label {
  margin-right: 1rem;
  font-weight: 600;
}

.toggle-switch {
  position: relative;
  display: inline-flex;
  align-items: center;
  cursor: pointer;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: relative;
  width: 50px;
  height: 24px;
  background-color: #ccc;
  transition: .4s;
  border-radius: 24px;
  margin-right: 0.5rem;
}

.slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #4CAF50;
}

input:checked + .slider:before {
  transform: translateX(26px);
}

.toggle-text {
  font-size: 0.9rem;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
  margin-top: 2rem;
}

/* Private Profile View */
.private-profile {
  text-align: center;
  padding: 3rem 0;
}

.private-notice {
  max-width: 400px;
  margin: 0 auto;
}

.private-notice i {
  font-size: 3rem;
  color: #e94560;
  margin-bottom: 1rem;
  display: block;
}

.private-notice h2 {
  margin-bottom: 0.5rem;
}

.private-notice p {
  opacity: 0.8;
}

/* Error View */
.error-view {
  text-align: center;
  padding: 3rem 0;
}

.error-notice i {
  font-size: 3rem;
  color: #e94560;
  margin-bottom: 1rem;
  display: block;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: #1a1a2e;
  padding: 2rem;
  border-radius: 12px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.modal-content h3 {
  margin-top: 0;
  color: #e94560;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  justify-content: flex-end;
}

/* Button Styles */
.btn {
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  background: #e94560;
  color: white;
}

.btn-primary:hover {
  background: #d23354;
  transform: translateY(-2px);
}

.btn-secondary {
  background: #0f3460;
  color: white;
}

.btn-secondary:hover {
  background: #0d2a4a;
  transform: translateY(-2px);
}

.btn-outline {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
}

.btn-outline:hover {
  background: rgba(255, 255, 255, 0.1);
}

.btn-danger {
  background: #d23354;
  color: white;
}

.btn-danger:hover {
  background: #b51d3e;
}

.btn-cancel {
  background: transparent;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.btn-cancel:hover {
  background: rgba(255, 255, 255, 0.1);
}

.btn-icon i {
  font-size: 1rem;
}

/* Alerts */
.alert {
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
}

.alert-success {
  background: rgba(46, 213, 115, 0.2);
  border: 1px solid #2ed573;
  color: #2ed573;
}

.alert-error {
  background: rgba(255, 71, 87, 0.2);
  border: 1px solid #ff4757;
  color: #ff4757;
}

/* Responsive */
@media (max-width: 768px) {
  .profile-header {
    flex-direction: column;
    text-align: center;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .profile-card {
    padding: 1.5rem;
  }
  
  .modal-actions {
    flex-direction: column;
  }
}
</style>