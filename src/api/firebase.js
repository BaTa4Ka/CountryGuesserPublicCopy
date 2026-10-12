import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, updateDoc, increment } from "firebase/firestore";  

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// export async function updateUserStats(userId, mode, guesses, won) {
//     if (!userId) return;

//     try {
//         const userRef = doc(db, "users", userId);
//         const userSnap = await getDoc(userRef);

//         if (!userSnap.exists()) {
//             console.warn("User document does not exist. Creating new document.");
//             await setDoc(userRef, {
//                 stats: {
//                     totalGuesses: guesses,
//                     totalAttempts: 1,
//                     [`${mode}Guesses`]: guesses,
//                     multiplayerWins: won ? 1 : 0,
//                     daysActive: 1, // Starts counting days
//                 },
//             });
//             return;
//         }

//         // Update statistics in Firestore
//         await updateDoc(userRef, {
//             [`stats.totalGuesses`]: increment(guesses),
//             [`stats.totalAttempts`]: increment(1),
//             [`stats.${mode}Guesses`]: increment(guesses),
//             [`stats.multiplayerWins`]: won ? increment(1) : increment(0),
//         });

//         console.log(`🔥 Stats updated for user: ${userId}`);
//     } catch (error) {
//         console.error("🚨 Error updating user statistics:", error);
//     }
// }

export { auth, db };
export default app;