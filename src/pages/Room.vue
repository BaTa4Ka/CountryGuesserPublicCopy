<script>
import app from '@/api/firebase'
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, onSnapshot } from "firebase/firestore";
import WLikeRound from '@/components/WLikeRound.vue';
import CordsRound from '@/components/CordsRound.vue';
import Flags from '@/components/Flags.vue';

const auth = getAuth(app);
const firestore = getFirestore(app);

export default {
  components: {
    WLikeRound,
    CordsRound,
    Flags
  },
  props: {
    rid: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      room: {},
      players: [],
      scores: [],
      currentUser: {},
      user: {},
      functions: getFunctions(app),
      leaderUsername: null,
      timer: null,
      remainingTime: 0, // in seconds
      formattedTime: '10:00' // initial time
    };
  },
  methods: {
    setupRoomListener() {
      const roomRef = doc(firestore, "rooms", this.rid);
      onSnapshot(roomRef, (doc) => {
        if (doc.exists()) {
          this.room = doc.data();
          if (this.leaderUsername == null) {
            this.setLeader();
          }
          if (this.room.state == 'waiting') {
            this.setPlayers();
          }
          if (this.room.state == 'playing') {
            this.startTimer(this.room.gameEndTime);
          }
          if (this.room.state == 'results') {
            this.setPlayers();
            this.setScores();
            this.stopTimer();
          }
        } else {
          console.log("Room no longer exists");
          this.room = null;
        }
      });
    },
    async getPlayerData(uid) {
      const getUserData = httpsCallable(this.functions, 'getUser');
      const result = await getUserData(uid);
      return {
        uid,
        username: result.data.user.username,
        avatar: result.data.user.avatar || '@/assets/default-avatar.png'
      };
    },
    async getUser() {
      const getUserData = httpsCallable(this.functions, 'getUser');
      const result = await getUserData(this.currentUser.uid);
      this.user = result.data.user;
      return true;
    },
    async leaveRoom() {
      let loader = this.$loading.show({ opacity: 0.9 });
      const leaveRoom = httpsCallable(this.functions, 'leaveRoom');
      await leaveRoom({ uid: this.currentUser.uid, rid: this.rid });
      loader.hide();
      this.$router.push("/mp");
    },
    async deleteRoom() {
      let loader = this.$loading.show({ opacity: 0.9 });
      const deleteRoom = httpsCallable(this.functions, 'deleteRoom');
      await deleteRoom(this.rid);
      loader.hide();
      this.$router.push("/mp");
    },
    async setLeader() {
      const leaderData = await this.getPlayerData(this.room.leader);
      this.leaderUsername = leaderData.username;
    },
    async setPlayers() {
      this.players = [];
      for (const playerId in this.room.players) {
        this.players.push(await this.getPlayerData(playerId));
      }
    },
    async setScores() {
      this.scores = [];
      for (const player in this.room.players) {
        this.scores.push(this.room.players[player].score);
      }
    },
    async start() {
      let loader = this.$loading.show({ opacity: 0.9 });
      const start = httpsCallable(this.functions, 'start');
      await start(this.rid);
      loader.hide();
    },
    async recordScore(score) {
      let loader = this.$loading.show({ opacity: 0.9 });
      const recordScore = httpsCallable(this.functions, 'recordScore');
      await recordScore({ uid: this.currentUser.uid, rid: this.rid, score: score });
      loader.hide();
    },
    openProfile(uid) {
      window.open(`/profile/${uid}`, '_blank');
    },
    startTimer(endTimestamp) {
    if (this.timer) {
      clearInterval(this.timer)
    }
    
    this.timer = setInterval(() => {
      const now = new Date();
      const endTime = endTimestamp.toDate();
      const remainingMs = endTime - now;
      
      if (remainingMs <= 0) {
        clearInterval(this.timer);
        this.remainingTime = 0;
        this.formattedTime = '00:00';
        return;
      }
      
      this.remainingTime = Math.floor(remainingMs / 1000);
      this.formatTime();
    }, 1000);
  },
  
  formatTime() {
    const mins = Math.floor(this.remainingTime / 60);
    const secs = this.remainingTime % 60;
    this.formattedTime = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  },
  
  stopTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
  },
  mounted() {
    this.setupRoomListener();

    onAuthStateChanged(auth, (user) => {
      if (user) {
        this.currentUser = user;
        this.getUser();
      } else {
        console.log("No user signed in");
        this.currentUser = null;
      }
    });
  },
  computed: {
    leaderboard() {
      const combined = this.players.map((player, index) => ({
        ...player,
        score: this.scores[index],
      }));

      combined.sort((a, b) => b.score - a.score);

      return combined;
    },
  },
  beforeUnmount() {
    this.stopTimer();
  },
};
</script>

<template>
  <div v-if="room" class="room-container">
    <div class="room-card">
      <div class="room-header">
        <h1 class="room-title">{{ room.name }} Room</h1>
        <div v-if="currentUser" class="room-actions">
          <div v-if="currentUser.uid == room.leader">
            <button v-if="room.state == 'waiting'" @click="start()" class="btn btn-primary">
              <i class="icon-start"></i> Start Game
            </button>
            <button v-if="room.state != 'playing'" @click="deleteRoom()" class="btn btn-danger">
              <i class="icon-delete"></i> Delete Room
            </button>
          </div>
          <div v-else-if="user?.currentRoom == rid">
            <button v-if="room.state != 'playing'" @click="leaveRoom()" class="btn btn-outline">
              <i class="icon-exit"></i> Leave Room
            </button>
          </div>
        </div>
      </div>

      <div class="room-content">
        <!-- Waiting State -->
        <div v-if="room.state == 'waiting'" class="waiting-state">
          <div class="state-header">
            <h2><i class="icon-users"></i> Waiting for Players</h2>
            <p class="waiting-text">Host <strong>{{ leaderUsername }}</strong> will start the game</p>
          </div>
          
          <div class="players-section">
            <h3 class="section-title">Players in Room</h3>
            <div class="players-grid">
              <div v-for="player in players" :key="player.uid" 
                   @click="openProfile(player.uid)" 
                   class="player-card">
                <img :src="player.avatar || '@/assets/default-avatar.png'" class="player-avatar" />
                <span class="player-name">{{ player.username }}</span>
                <span v-if="player.uid === room.leader" class="host-badge">Host</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Playing State -->
        <div v-if="room.state == 'playing'" class="playing-state">
          <div class="game-header">
            <div class="game-stats">
              <div class="stat-item">
                <i class="icon-timer"></i>
                <span>{{ formattedTime }}</span>
              </div>
              <div class="stat-item" v-if="room.players[currentUser.uid]?.currentRound < 12">
                <i class="icon-round"></i>
                <span>Round {{ room.players[currentUser.uid]?.currentRound + 1 }}/12</span>
              </div>
              <div class="stat-item">
                <i class="icon-score"></i>
                <span>{{ room.players[currentUser.uid]?.score || 0 }} Points</span>
              </div>
            </div>
          </div>

          <div class="game-content">
            <WLikeRound v-if="room.players[currentUser.uid]?.currentRound === 0" 
                       @correct="recordScore" 
                       :correctCountry="room.answers[0]" />
            
            <CordsRound v-else-if="room.players[currentUser.uid]?.currentRound === 1" 
                       @correct="recordScore" 
                       :correctCountry="room.answers[1]" />
            
            <Flags v-else-if="room.players[currentUser.uid]?.currentRound > 1 && 
                            room.players[currentUser.uid]?.currentRound < 12" 
                  @guess="recordScore" 
                  :correctCountry="room.answers[room.players[currentUser.uid]?.currentRound]" />
            
            <div v-else class="game-complete">
              <h2><i class="icon-trophy"></i> Game Complete!</h2>
              <p>Waiting for other players to finish...</p>
            </div>
          </div>
        </div>

        <!-- Results State -->
        <div v-if="room.state == 'results'" class="results-state">
          <div class="results-header">
            <h2><i class="icon-trophy"></i> Final Results</h2>
          </div>
          
          <div class="leaderboard">
            <div v-for="(entry, index) in leaderboard" :key="entry.uid" 
                @click="openProfile(entry.uid)"
                class="leaderboard-item" 
                :class="{'first-place': index === 0, 'second-place': index === 1, 'third-place': index === 2}">
              <div class="leaderboard-rank">
                <span class="rank-number">{{ index + 1 }}</span>
                <img :src="entry.avatar || '@/assets/default-avatar.png'" class="player-avatar" />
              </div>
              <div class="leaderboard-info">
                <span class="player-name">{{ entry.username }}</span>
                <span v-if="entry.uid === room.leader" class="host-badge">Host</span>
              </div>
              <div class="leaderboard-score">
                <span class="score-value">{{ entry.score }}</span>
                <span class="score-label">points</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="error-state">
    <div class="error-card">
      <i class="icon-error"></i>
      <h2>Room Not Found</h2>
      <p>This room doesn't exist or may have been deleted</p>
      <router-link to="/mp" class="btn btn-primary">
        <i class="icon-arrow-left"></i> Back to Multiplayer
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.room-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 50px);
  padding: 2rem;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  font-family: 'Inter', sans-serif;
}

.room-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  width: 100%;
  overflow: hidden;
  color: white;
}

.room-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  background: rgba(0, 0, 0, 0.2);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.room-title {
  font-size: 1.8rem;
  margin: 0;
  color: #e94560;
}

.room-actions {
  display: flex;
  gap: 1rem;
}

.room-content {
  padding: 2rem;
}

/* Waiting State */
.waiting-state {
  text-align: center;
}

.state-header {
  margin-bottom: 2rem;
}

.waiting-text {
  font-size: 1.1rem;
  color: #a8a8a8;
}

.players-section {
  margin-top: 2rem;
}

.section-title {
  font-size: 1.3rem;
  margin-bottom: 1.5rem;
  color: #f1c40f;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.players-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1rem;
}

.player-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.8rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.player-card:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-3px);
}

.player-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #4f46e5;
}

.player-name {
  font-weight: 500;
  font-size: 1rem;
}

.host-badge {
  position: absolute;
  top: 0;
  right: 0;
  background: #4f46e5;
  color: white;
  font-size: 0.7rem;
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
}

/* Playing State */
.game-header {
  margin-bottom: 2rem;
}

.game-stats {
  display: flex;
  gap: 2rem;
  justify-content: center;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(0, 0, 0, 0.3);
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  font-size: 1.1rem;
}

.game-content {
  min-height: 400px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.game-complete {
  text-align: center;
  padding: 2rem;
}

/* Results State */
.results-header {
  text-align: center;
  margin-bottom: 2rem;
}

.leaderboard {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.leaderboard-item {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.leaderboard-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.leaderboard-rank {
  display: flex;
  align-items: center;
  gap: 1rem;
  min-width: 80px;
}

.rank-number {
  font-size: 1.3rem;
  font-weight: bold;
  width: 30px;
  text-align: center;
}

.leaderboard-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  position: relative;
  padding-right: 40px;
}

.leaderboard-score {
  background: rgba(0, 0, 0, 0.3);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.score-value {
  font-size: 1.2rem;
  font-weight: bold;
}

.score-label {
  font-size: 0.7rem;
  opacity: 0.8;
}

/* Podium Positions */
.first-place {
  border-left: 4px solid #f1c40f;
}

.first-place .rank-number {
  color: #f1c40f;
}

.second-place {
  border-left: 4px solid #a8a8a8;
}

.second-place .rank-number {
  color: #a8a8a8;
}

.third-place {
  border-left: 4px solid #cd7f32;
}

.third-place .rank-number {
  color: #cd7f32;
}

/* Error State */
.error-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 2rem;
}

.error-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 3rem;
  text-align: center;
  max-width: 500px;
  color: white;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #4f46e5;
  color: white;
  border: none;
}

.btn-primary:hover {
  background: #4338ca;
}

.btn-danger {
  background: #e94560;
  color: white;
  border: none;
}

.btn-danger:hover {
  background: #d23354;
}

.btn-outline {
  background: transparent;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.btn-outline:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* Icons */
.icon-start::before { content: "▶"; }
.icon-delete::before { content: "✕"; }
.icon-exit::before { content: "←"; }
.icon-users::before { content: "👥"; }
.icon-round::before { content: "🎮"; }
.icon-score::before { content: "⭐"; }
.icon-trophy::before { content: "🏆"; }
.icon-timer::before { content: "⏰";}
.icon-error::before { 
  content: "!";
  display: inline-block;
  width: 60px;
  height: 60px;
  background: #e94560;
  border-radius: 50%;
  line-height: 60px;
  font-size: 2rem;
  margin-bottom: 1rem;
}
.icon-arrow-left::before { content: "←"; }

@media (max-width: 768px) {
  .room-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .players-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  }
  
  .game-stats {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>