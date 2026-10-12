<script>
import app from '@/api/firebase';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, onSnapshot } from "firebase/firestore";
import { ref } from "vue";

const auth = getAuth(app);
const firestore = getFirestore(app);
const currentUser = ref(null);

onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser.value = user;
  } else {
    console.log("No user signed in");
    currentUser.value = null;
  }
});

export default {
  data() {
    return {
      rooms: [],
      user: null,
      currentUser: currentUser,
      functions: getFunctions(app),
    };
  },
  methods: {
    setupRoomsListener() {
      const roomsRef = collection(firestore, "rooms");
      onSnapshot(roomsRef, (snapshot) => {
        this.rooms = [];
        snapshot.forEach((doc) => {
          if(doc.data().state == 'waiting')
          this.rooms.push({ id: doc.id, ...doc.data() });
        });
      });
    },

    async getUser(uid) {
      const getUserData = httpsCallable(this.functions, 'getUser');
      const result = await getUserData(uid);
      this.user = result.data.user;
    },

    async getRoom(id) {
      const getRoomData = httpsCallable(this.functions, 'getRoom');
      const result = await getRoomData(id);
      return result.data.room;
    },

    async joinRoom(id) {
      if (currentUser.value != null) {
        try {
          let loader = this.$loading.show({ opacity: 0.9 });
          
          await this.getUser(currentUser.value.uid);
          let cr = this.user.currentRoom;

          if (cr != "" && await this.getRoom(cr) && cr != id) {
            loader.hide();
            alert("You are already in a room");
            this.$router.push("/room/" + cr);
            return;
          }

          if (await this.getRoom(id)) {
            const joinRoom = httpsCallable(this.functions, 'joinRoom');
            await joinRoom({
              uid: currentUser.value.uid,
              rid: id,
            });
            await this.getRoom(id);
            loader.hide();
            this.$router.push("/room/" + id);
          } else {
            loader.hide();
            alert("Something went wrong, please update the page");
          }
        } catch (error) {
          loader.hide();
          console.error("Error joining room:", error);
          alert("An error occurred while joining the room");
        }
      }
    },

    async deleteRoom(id) {
      if (!confirm("Are you sure you want to delete this room?")) return;
      
      const deleteRoomFunc = httpsCallable(this.functions, 'deleteRoom');
      await deleteRoomFunc({ rid: id });

      alert("Room deleted!");
      this.$router.push("/");
    }
  },
  mounted() {
    this.setupRoomsListener();
    if (currentUser.value) {
      this.getUser(currentUser.value.uid);
    }
  },
  watch: {
    currentUser() {
      this.getUser(currentUser.value.uid);
    }
  }
};
</script>
<!--ok -->
<template>
  <div class="full-width-container">
    <div class="content-wrapper">
      <h1 class="title">Multiplayer Room Selection</h1>
      
      <div v-if="currentUser">
        <div v-if="user">
          <div v-if="user.currentRoom !== ''" class="room-alert">
            <RouterLink :to="'/room/' + user.currentRoom">
              You are already in a room, click to return to it
            </RouterLink>
          </div>
          <div v-else>
            <RouterLink to="createroom" class="button">Create Room!</RouterLink>
            <div v-if="rooms.length > 0" class="rooms-list">
              <div v-for="room in rooms" :key="room.id" class="room-item">
                <button @click="joinRoom(room.id)" class="room-button">
                  {{ room.name }} Room
                </button>
              </div>
            </div>
            <p v-else class="no-rooms">
              There's no rooms available at the moment, please create one or wait until someone else does.
            </p>
          </div>
        </div>
      </div>
      
      <p v-else class="login-message">
        In order to play in multiplayer, you need to 
        <router-link to="/login">login</router-link>
      </p>
    </div>
  </div>
</template>

<style scoped>
.full-width-container {
  width: 100vw;
  height: calc(100vh - 50px);
  margin: 0;
  padding: 0;
  background: url('src/assets/game1.webp') no-repeat center center;
  background-size: cover;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  color: white;
  text-align: center;
}

.content-wrapper {
  background: rgba(0, 0, 0, 0.7);
  padding: 20px;
  border-radius: 10px;
  width: 90%;
  max-width: 600px;
}

.room-alert, .login-message {
  background: #ffcc00;
  padding: 15px;
  border-radius: 8px;
  font-size: 1.2rem;
  color: black;
  font-weight: bold;
  text-align: center;
}

.button, .room-button {
  background-color: #007bff;
  color: white;
  padding: 12px 20px;
  font-size: 1rem;
  border-radius: 8px;
  cursor: pointer;
  text-decoration: none;
  transition: background-color 0.3s ease;
  border: none;
  display: inline-block;
  margin-top: 15px;
}

.button:hover, .room-button:hover {
  background-color: #414141;
}

.rooms-list {
  margin-top: 20px;
  padding: 15px;
  background: #222;
  border-radius: 8px;
  width: 100%;
  text-align: center;
  align-self: center;
}

.room-item {
  margin-bottom: 15px;
}

.no-rooms {
  margin-top: 20px;
  font-size: 1rem;
  color: #ffcc00;
}
</style>
