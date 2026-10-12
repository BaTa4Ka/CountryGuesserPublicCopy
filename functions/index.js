/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const { onRequest } = require("firebase-functions/v2/https");
const { onCall } = require("firebase-functions/v2/https");
const { initializeApp } = require('firebase-admin/app');
const { getFirestore, FieldValue, Timestamp } = require('firebase-admin/firestore');
const logger = require("firebase-functions/logger");
const { CloudTasksClient } = require('@google-cloud/tasks');

initializeApp();
const db = getFirestore();

// Get countries from Firestore
exports.getCountries = onCall(async (data, context) => {
  try {
    const snapshot = await db.collection('countries').get();
    logger.info('Countries retrieved request received');
    if (snapshot.empty) {
      return { success: false, message: 'No countries found.' };
    }
    const countries = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    logger.info('Countries retrieved:', { count: countries.length });
    return { success: true, countries };
  } catch (error) {
    logger.error('Error retrieving countries:', { error: error.message });
    return { success: false, message: 'Failed to retrieve countries.', error: error.message };
  }
});

// Get rooms from Firestore
exports.getRooms = onCall(async (data, context) => {
  try {
    const snapshot = await db.collection('rooms').get();
    logger.info('Rooms retrieve request received');
    if (snapshot.empty) {
      return { success: false, message: 'No rooms found.' };
    }
    const rooms = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    logger.info('Rooms retrieved:', { count: rooms.length });
    return { success: true, rooms };
  } catch (error) {
    logger.error('Error retrieving rooms:', { error: error.message });
    return { success: false, message: 'Failed to retrieve rooms.', error: error.message };
  }
});

// Create a new room
exports.createRoom = onCall(async (data, context) => {
  try {
    const { name, leader, players, state } = data.data;
    logger.info('Received a create room request', { name, leader, players, state});

    if (!name || !leader || !players || !state) {
      throw new Error('Missing required data');
    }

    const res = await db.collection('rooms').add({
      name,
      leader,
      players,
      state,
    });

    logger.info('Document added with ID:', res.id);

    await db.collection('users').doc(leader).update({
      currentRoom: res.id,
    });

    return { success: true, message: 'Document added successfully', documentId: res.id };
  } catch (error) {
    logger.error('Error adding document:', error);
    return { success: false, message: 'Failed to add document.', error: error.message };
  }
});

// Get user data
exports.getUser = onCall(async (data, context) => {
  try {
    const user = (await db.collection('users').doc(data.data).get()).data();
    logger.info('User retrieve request received');
    if (!user) {
      return { success: false, message: 'No user found.' };
    } else {
      logger.info('User retrieved with ID:', user.id);
      return { success: true, user };
    }
  } catch (error) {
    return { success: false, message: 'Error retrieving user:', error: error.message };
  }
});

// Get room data
exports.getRoom = onCall(async (data, context) => {
  try {
    const room = (await db.collection('rooms').doc(data.data).get()).data();
    logger.info('Room retrieve request received');
    if (!room) {
      return { success: false, message: 'No room found.' };
    } else {
      logger.info('Room retrieved with ID:', room.id);
      return { success: true, room };
    }
  } catch (error) {
    return { success: false, message: 'Error retrieving room:', error: error.message };
  }
});

// Delete room
exports.deleteRoom = onCall(async (data, context) => {
  try {
    logger.info('Room delete request received');
    const room = db.collection('rooms').doc(data.data);
    if (!room) {
      return { success: false, message: 'No room found.' };
    } else {
      const players = (await room.get()).data().players;
      for (let player in players) {
        await db.collection('users').doc(player).update({
          currentRoom: '',
        });
      }
      room.delete();
      logger.info('Room deleted with ID:', room.id);
      return { success: true };
    }
  } catch (error) {
    return { success: false, message: 'Error deleting room:', error: error.message };
  }
});

// Leave room
exports.leaveRoom = onCall(async (data, context) => {
  try {
    logger.info('Leave room request received');
    const { uid, rid } = data.data;
    const user = db.collection('users').doc(uid);
    const room = db.collection('rooms').doc(rid);

    if (!user || !room) {
      return { success: false, message: 'Room or user not found.' };
    } else {
      if ((await user.get()).data().currentRoom == room.id) {
        await user.update({
          currentRoom: '',
        });
        await room.update({
          [`players.${uid}`]: FieldValue.delete(),
        });
        return { success: true };
      } else {
        return { success: false, message: 'User not in this room' };
      }
    }
  } catch (error) {
    return { success: false, message: 'Error leaving room:', error: error.message };
  }
});

// Join room
exports.joinRoom = onCall(async (data, context) => {
  try {
    logger.info('Join room request received');
    const { uid, rid } = data.data;
    const user = db.collection('users').doc(uid);
    const room = db.collection('rooms').doc(rid);

    if (!user || !room) {
      return { success: false, message: 'Room or user not found.' };
    } else {
      await user.update({
        currentRoom: rid,
      });
      await room.update({
        [`players.${uid}.score`]: 0,
        [`players.${uid}.currentRound`]: 0  
      });
      return { success: true };
    }
  } catch (error) {
    return { success: false, message: 'Error joining room:', error: error.message };
  }
});

exports.start = onCall(async (data, context) => {
  try {
    logger.info('Start request received');
    const rid = data.data;
    const roomRef = db.collection('rooms').doc(rid);
    const roomDoc = await roomRef.get();

    if (!roomDoc.exists) {
      return { success: false, message: 'Room not found.' };
    }

    // Fetch all countries and extract their IDs
    const countriesSnapshot = await db.collection('countries').get();
    const allCountries = countriesSnapshot.docs.map(doc => doc.id); // Only get IDs

    // Shuffle and select 12 random IDs
    const shuffled = allCountries.sort(() => Math.random() - 0.5);
    const randomAnswers = shuffled.slice(0, 12);

    const gameEndTime = new Date(Date.now() + 10 * 60 * 1000); // Current time + 10 mins

    // Build update object
    const updateData = {
      state: 'playing',
      answers: randomAnswers,
      gameEndTime: Timestamp.fromDate(gameEndTime) 
    };

    await roomRef.update(updateData);

    // Create Cloud Task
    const client = new CloudTasksClient();
    const project = process.env.GCLOUD_PROJECT;
    const location = process.env.TASKS_LOCATION;
    const queue = process.env.TASKS_QUEUE;
    if (!location || !queue) {
      throw new Error('TASKS_LOCATION and TASKS_QUEUE must be configured');
    }
    const url = `https://${location}-${project}.cloudfunctions.net/endGame`; // HTTPS function URL

    const payload = {
      rid,
      expectedEndTime: gameEndTime.toISOString()
    };

    const task = {
      httpRequest: {
        httpMethod: 'POST',
        url,
        headers: { 'Content-Type': 'application/json' },
        body: Buffer.from(JSON.stringify(payload)).toString('base64'),
        oidcToken: {
          serviceAccountEmail: `cloud-tasks-invoker@${project}.iam.gserviceaccount.com`,
          audience: url
        }
      },
      scheduleTime: { seconds: Math.floor(gameEndTime.getTime() / 1000) }
    };

    const [response] = await client.createTask({
      parent: client.queuePath(project, location, queue),
      task
    });

    logger.info(`Created task ${response.name} for room ${rid}`);

    return { success: true };
  } catch (error) {
    return { success: false, message: 'Error starting: ' + error.message };
  }
});

exports.endGame = onRequest(async (req, res) => {
  try {
    const { rid, expectedEndTime } = req.body;

    if (!rid || !expectedEndTime) {
      return res.status(400).send('Missing room ID or end time');
    }

    const expectedTimestamp = new Date(expectedEndTime);
    const roomRef = db.collection('rooms').doc(rid);
    const roomDoc = await roomRef.get();

    if (!roomDoc.exists) {
      return res.status(404).send('Room not found');
    }

    const roomData = roomDoc.data();
    const gameEndTime = roomData.gameEndTime?.toDate?.();

    if (!gameEndTime) {
      return res.status(400).send('Room is missing gameEndTime');
    }

    if (Math.abs(gameEndTime.getTime() - expectedTimestamp.getTime()) > 1000) {
      return res.status(409).send('Game end time mismatch. Skipping update.');
    }

    if (roomData.state == 'playing') {
      await roomRef.update({ state: 'results' });
      return res.status(200).send('Game ended');
    }

    return res.status(200).send('Game already ended');
  } catch (error) {
    console.error('Error ending game:', error);
    return res.status(500).send('Internal error');
  }
});

exports.recordScore = onCall(async (data, context) => {
  try {
    logger.info('Record score request received');
    const { uid, rid, score } = data.data;
    const room = db.collection('rooms').doc(rid);

    if (!room) {
      return { success: false, message: 'Room not found.' };
    }
    await room.update({
      [`players.${uid}.score`]: FieldValue.increment(score),
      [`players.${uid}.currentRound`]: FieldValue.increment(1)
    });

    const players = (await room.get()).data().players
  
    // Check if all players have currentRound >= 12
    const allPlayersFinished = Object.values(players).every(
      player => player.currentRound >= 12
    );

    if (allPlayersFinished) {
      await room.update({
        state: 'results'
      });
    }
    return { success: true };
  } catch (error) {
    return { success: false, message: 'Error recording score:', error: error.message };
  }
})

exports.getCountry = onCall(async (data, context) => {
  try {
    const country = (await db.collection('countries').doc(data.data).get()).data();
    logger.info('Country retrieve request received');
    if (!country) {
      return { success: false, message: 'No country found.' };
    } else {
      logger.info('User retrieved with ID:', country.id);
      return { success: true, country };
    }
  } catch (error) {
    return { success: false, message: 'Error retrieving country:', error: error.message };
  }
});

exports.updateAvatar = onCall(async (data, context) => {
  try {
    logger.info('Update avatar request received');
    const { uid, avatarUrl } = data.data;
    const user = db.collection('users').doc(uid);

    if (!user) {
      return { success: false, message: 'User not found.' };
    } else {
      await user.update({
        avatar: avatarUrl,
      });
      return { success: true };
    }
  } catch (error) {
    return { success: false, message: 'Error updating avatar:', error: error.message };
  }
});
