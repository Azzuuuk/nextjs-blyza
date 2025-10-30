// lib/user.js - User management utilities

import { 
  doc, 
  getDoc, 
  setDoc, 
  serverTimestamp, 
  runTransaction,
  collection 
} from "firebase/firestore";
import { db } from '../firebaseconfig.js';

/**
 * Ensures user document exists with default values
 * @param {string} uid - User's Firebase Auth UID
 * @param {Object} defaults - Additional default fields to merge
 * @returns {Promise<void>}
 */
export async function ensureUserDoc(uid, defaults = {}) {
  try {
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      // Create new user document with defaults
      const defaultUserData = {
        uid,
        username: "",
        profilePicture: "",
        blyzaBucks: 0,
        gamesPlayed: 0,
        badges: [],
        mostPlayedGames: [],
        achievements: [],
        lastSeen: serverTimestamp(),
        createdAt: serverTimestamp(),
        ...defaults
      };
      
      await setDoc(userRef, defaultUserData, { merge: true });
      console.log('Created new user document for:', uid);
    } else {
      // Update lastSeen for existing users
      await setDoc(userRef, { 
        lastSeen: serverTimestamp(),
        ...defaults 
      }, { merge: true });
    }
  } catch (error) {
    console.error('Error ensuring user document:', error);
    throw error;
  }
}

/**
 * Checks if user has a username, redirects to username setup if not
 * @param {string} uid - User's UID
 * @param {Function} router - Next.js router instance
 * @returns {Promise<boolean>} - Returns true if user has username, false if redirected
 */
export async function requireUsernameOrRedirect(uid, router) {
  try {
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      // Should not happen if ensureUserDoc was called first
      await ensureUserDoc(uid);
      router.push('/choose-username');
      return false;
    }
    
    const userData = userDoc.data();
    if (!userData.username || userData.username.trim() === '') {
      router.push('/choose-username');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error checking username requirement:', error);
    // On error, assume they need username setup
    router.push('/choose-username');
    return false;
  }
}

/**
 * Claims a username for a user using a transaction to ensure uniqueness
 * @param {string} uid - User's UID
 * @param {string} username - Desired username (will be lowercased)
 * @returns {Promise<void>}
 */
export async function claimUsername(uid, username) {
  const lowercasedUsername = username.toLowerCase().trim();
  
  if (!lowercasedUsername || lowercasedUsername.length < 3) {
    throw new Error('Username must be at least 3 characters long');
  }
  
  if (lowercasedUsername.length > 20) {
    throw new Error('Username must be less than 20 characters');
  }
  
  if (!/^[a-z0-9_-]+$/.test(lowercasedUsername)) {
    throw new Error('Username can only contain lowercase letters, numbers, underscores, and hyphens');
  }
  
  try {
    await runTransaction(db, async (transaction) => {
      // Check if username is already taken
      const usernameRef = doc(db, 'usernames', lowercasedUsername);
      const usernameDoc = await transaction.get(usernameRef);
      
      if (usernameDoc.exists()) {
        const existingUid = usernameDoc.data().uid;
        if (existingUid !== uid) {
          throw new Error('Username is already taken');
        }
        // Username is already claimed by this user, just update the user doc
      } else {
        // Reserve the username
        transaction.set(usernameRef, { 
          uid, 
          claimedAt: serverTimestamp() 
        });
      }
      
      // Update user document with the username
      const userRef = doc(db, 'users', uid);
      transaction.set(userRef, { 
        username: lowercasedUsername,
        lastSeen: serverTimestamp()
      }, { merge: true });
    });
    
    console.log('Successfully claimed username:', lowercasedUsername, 'for user:', uid);
  } catch (error) {
    console.error('Error claiming username:', error);
    throw error;
  }
}

/**
 * Gets user profile data
 * @param {string} uid - User's UID
 * @returns {Promise<Object|null>} User profile data or null if not found
 */
export async function getUserProfile(uid) {
  try {
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
}
