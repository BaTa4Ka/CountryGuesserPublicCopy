<template>
  <div class="modal-overlay" v-if="isOpen" @click.self="closeModal">
    <div class="modal-content">
      <button class="close-button" @click="closeModal">&times;</button>
      <h2>Upload Profile Image</h2>
      
      <div class="upload-container">
        <label class="file-input-label">
          <input type="file" accept="image/png, image/jpeg" @change="handleFileSelect" />
          Choose Image
        </label>
        
        <button 
          @click="handleUpload" 
          class="upload-button"
          :disabled="!selectedFile || isLoading"
        >
          Upload Image
        </button>
      </div>

      <div v-if="previewUrl" class="preview-container">
        <h3>Preview:</h3>
        <img :src="previewUrl" alt="Preview" class="preview-image" />
      </div>

      <div v-if="uploadMessage" class="message" :class="{ success: uploadMessage.includes('✅'), error: uploadMessage.includes('❌') }">
        {{ uploadMessage }}
      </div>

      <loading 
        v-model:active="isLoading"
        :can-cancel="false"
        :is-full-page="false"
        color="#4caf50"
        background-color="#ffffff"
        loader="spinner"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import app from '../api/firebase';
import { getAuth } from 'firebase/auth';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFunctions, httpsCallable } from 'firebase/functions';
import Loading from 'vue-loading-overlay';
import 'vue-loading-overlay/dist/css/index.css';

const props = defineProps({
  isOpen: Boolean
});

const emit = defineEmits(['close', 'upload-complete']);

const selectedFile = ref(null);
const previewUrl = ref('');
const uploadMessage = ref('');
const isLoading = ref(false);

const handleFileSelect = (event) => {
  // Clean up previous object URL if exists
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value);
  }
  
  selectedFile.value = event.target.files[0];
  uploadMessage.value = '';
  
  // Create preview
  if (selectedFile.value) {
    previewUrl.value = URL.createObjectURL(selectedFile.value);
  }
};

const closeModal = () => {
  emit('close');
  resetForm();
};

const resetForm = () => {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value);
  }
  selectedFile.value = null;
  previewUrl.value = '';
  uploadMessage.value = '';
  isLoading.value = false;
};

const handleUpload = async () => {
  if (!selectedFile.value) return;

  isLoading.value = true;
  uploadMessage.value = '';
  
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    const storage = getStorage(app);
    // Include user ID in path for better organization
    const fileRef = storageRef(storage, `avatars/${user.uid}/${Date.now()}_${selectedFile.value.name}`);
    const snapshot = await uploadBytes(fileRef, selectedFile.value);
    const downloadURL = await getDownloadURL(snapshot.ref);

    const functions = getFunctions(app);
    const updateUser = httpsCallable(functions, 'updateAvatar');
    await updateUser({ uid: user.uid, avatarUrl: downloadURL });

    uploadMessage.value = "✅ Picture uploaded successfully!";
    emit('upload-complete', downloadURL);
    
    // Auto-close after success 
    setTimeout(() => {
      closeModal();
    }, 1500);
  } catch (error) {
    console.error("Upload error:", error);
    uploadMessage.value = `❌ Error: ${error.message}`;
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  color: #333;
}

.close-button {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  transition: color 0.2s;
}

.close-button:hover {
  color: #333;
}

.upload-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin: 1.5rem 0;
}

.file-input-label {
  display: inline-block;
  padding: 10px 16px;
  background: #f5f5f5;
  border-radius: 4px;
  cursor: pointer;
  text-align: center;
  transition: all 0.2s;
  border: 1px solid #ddd;
}

.file-input-label:hover {
  background: #e9e9e9;
}

.file-input-label input[type="file"] {
  display: none;
}

.upload-button {
  padding: 10px 16px;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.2s;
}

.upload-button:hover:not(:disabled) {
  background: #3d8b40;
}

.upload-button:disabled {
  background: #cccccc;
  cursor: not-allowed;
}

.preview-container {
  margin: 1.5rem 0;
  text-align: center;
}

.preview-image {
  max-width: 100%;
  max-height: 200px;
  border-radius: 4px;
  margin-top: 0.5rem;
  border: 1px solid #eee;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.message {
  padding: 0.75rem;
  border-radius: 4px;
  margin-top: 1rem;
  font-weight: 500;
}

.message.success {
  background: #e8f5e9;
  color: #2e7d32;
  border: 1px solid #c8e6c9;
}

.message.error {
  background: #ffebee;
  color: #c62828;
  border: 1px solid #ffcdd2;
}
</style>