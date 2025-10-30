// lib/stats.js - Game statistics utilities

import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  increment, 
  runTransaction,
  serverTimestamp
} from "firebase/firestore";
import { db } from '../firebaseconfig.js';

/**
 * Increments games played counter exactly once per game open per session
 * @param {string} uid - User's UID
 * @param {string} gameSlug - Game identifier (e.g., "game1", "game2")
 * @returns {Promise<void>}
 */
export async function incrementOnGameOpen(uid, gameSlug, options = {}) {
  if (!uid || !gameSlug) {
    console.warn('Missing uid or gameSlug for game tracking');
    return;
  }
  const { bypassSession = false } = options;
  
  console.log('Attempting to track game open:', gameSlug, 'for user:', uid);
  
  // Session-based debouncing to prevent double-counting (unless bypassed)
  const sessionKey = `blyza:opened:${gameSlug}:${uid}`;
  
  if (!bypassSession && typeof window !== 'undefined' && window.sessionStorage) {
    if (sessionStorage.getItem(sessionKey)) {
      console.log('Game already tracked in this session:', sessionKey);
      // Already tracked this game open in this session
      return;
    }
    console.log('Marking game as tracked for this session:', sessionKey);
    // Mark as tracked for this session
    sessionStorage.setItem(sessionKey, 'true');
  }
  
  try {
    console.log('Starting Firestore transaction for game tracking...');
    
    // Use transaction to safely increment games played
    await runTransaction(db, async (transaction) => {
      const userRef = doc(db, 'users', uid);
      const userDoc = await transaction.get(userRef);
      
      if (!userDoc.exists()) {
        console.log('User document does not exist, creating one...');
        // User document should exist by now, but create basic one if missing
        transaction.set(userRef, {
          uid,
          gamesPlayed: 1,
          blyzaBucks: 5,
          lastSeen: serverTimestamp()
        }, { merge: true });
      } else {
        console.log('User document exists, updating counters...');
        const userData = userDoc.data();
        const currentGamesPlayed = userData.gamesPlayed || 0;
        const currentBlyzaBucks = userData.blyzaBucks || 0;
        
        transaction.update(userRef, {
          gamesPlayed: currentGamesPlayed + 1,
          blyzaBucks: currentBlyzaBucks + 5,
          lastSeen: serverTimestamp()
        });
        
        console.log(`Updated: gamesPlayed ${currentGamesPlayed} → ${currentGamesPlayed + 1}, blyzaBucks ${currentBlyzaBucks} → ${currentBlyzaBucks + 5}`);
      }
    });
    
    console.log(`Successfully tracked game open: ${gameSlug} for user: ${uid}`);
  } catch (error) {
    console.error('Error tracking game open:', error);
    // Clear session storage on error so user can try again
    if (typeof window !== 'undefined' && window.sessionStorage) {
      sessionStorage.removeItem(sessionKey);
    }
    throw error;
  }
}

/**
 * Updates most played games list (existing function integration)
 * @param {string} uid - User's UID
 * @param {string} gameId - Game identifier
 * @returns {Promise<void>}
 */
export async function updateMostPlayedGames(uid, gameId) {
  try {
    await runTransaction(db, async (transaction) => {
      const userRef = doc(db, 'users', uid);
      const userDoc = await transaction.get(userRef);
      
      if (!userDoc.exists()) {
        transaction.set(userRef, {
          uid,
          mostPlayedGames: [gameId],
          lastSeen: serverTimestamp()
        }, { merge: true });
        return;
      }
      
      const userData = userDoc.data();
      let mostPlayedGames = userData.mostPlayedGames || [];
      
      // Remove game if it exists, then add to front
      mostPlayedGames = mostPlayedGames.filter(id => id !== gameId);
      mostPlayedGames.unshift(gameId);
      
      // Keep only top 5 games
      mostPlayedGames = mostPlayedGames.slice(0, 5);
      
      transaction.update(userRef, {
        mostPlayedGames,
        lastSeen: serverTimestamp()
      });
    });
  } catch (error) {
    console.error('Error updating most played games:', error);
  }
}
