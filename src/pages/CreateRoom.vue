
  <script>
  import app from '@/api/firebase';
  import { getFunctions, httpsCallable } from 'firebase/functions';
  import { getAuth, onAuthStateChanged } from "firebase/auth";
  import { ref } from "vue";
  
  const auth = getAuth(app);
  const currentUser = ref(null);
  
  onAuthStateChanged(auth, (user) => {
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
    data() {
      return {
        name: '',
        currentUser: currentUser,
        functions: getFunctions(app)
      };
    },
    methods: {
      async CreateRoom() {
        let loader = this.$loading.show({ opacity: 0.9 });
        if (this.name === '') {
          alert("Name is empty");
        } else {
          if (currentUser.value?.uid) {
            const getUser = httpsCallable(this.functions, 'getUser');
            const user = await getUser(currentUser.value.uid);
            const cr = user.data.user.currentRoom;
            if (cr !== "") {
              alert("You are already in a room");
              this.$router.push("/room/" + cr);
              return;
            }
          }
          let room = {
            name: this.name,
            leader: currentUser.value.uid,
            players: {
              [currentUser.value.uid]: {
                score: 0,
                currentRound: 0
              }
            },
            state: "waiting"
          };
          const createNewRoom = httpsCallable(this.functions, 'createRoom');
          let result = await createNewRoom(room);
          console.log(result);
          if (result.data.success) {
            this.$router.push("/room/" + result.data.documentId);
          }
        }
        loader.hide();
      }
    }
  };
  </script>
  
  <template>
    <div class="full-width-container">
      <div class="content-wrapper">
        <div v-if="currentUser" class="room-container">
          <input class="room-input" placeholder="Room name" v-model="name" />
          <button class="button" @click="CreateRoom">Create Room!</button>
        </div>
  
        <div v-else class="login-message">
          Login first
        </div>
      </div>
    </div>
  </template>
  
  <style scoped>
  .full-width-container {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100vw;
    height: calc(100vh - 50px);
    background: url('src/assets/game1.webp') no-repeat center center;
    background-size: cover;
    color: white;
    font-family: Arial, sans-serif;
  }
  
  .content-wrapper {
    width: 100%;
    max-width: 600px;
    padding: 20px;
    background: rgba(0, 0, 0, 0.7); /* Semi-transparent background */
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  
  .navbar {
    width: 100%;
    padding: 10px;
    background: rgba(0, 0, 0, 0.7);
    text-align: center;
  }
  
  .room-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 15px;
    padding: 20px;
  }
  
  .room-input {
    padding: 10px;
    font-size: 1.2rem;
    border: 1px solid #ccc;
    border-radius: 5px;
    width: 100%;
    max-width: 300px;
  }
  
  .button {
    background-color: #007bff;
    color: white;
    padding: 12px 20px;
    font-size: 1.5rem;
    border-radius: 8px;
    cursor: pointer;
    border: none;
    transition: background-color 0.3s ease;
  }
  
  .button:hover {
    background-color: #414141;
  }
  
  .login-message {
    font-size: 2rem;
    font-weight: bold;
    background: rgba(255, 0, 0, 0.7);
    padding: 15px;
    border-radius: 10px;
  }
  </style>
  