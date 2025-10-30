// lib/firestore.js - Firestore integration for friend & profile system

import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc,
  deleteDoc,
  serverTimestamp,
  writeBatch
} from "firebase/firestore";
import { auth, db } from '../firebaseconfig.js';

// Collections
export const COLLECTIONS = {
  USERS: 'users',
  FRIENDS: 'friends'
};

/**
 * User Profile Management
 */

/**
 * Create or update user profile in Firestore
 * @param {string} uid - User's Firebase Auth UID
 * @param {Object} userData - User data to create/update
 * @returns {Promise<void>}
 */
export async function createUserProfile(uid, userData = {}) {
  try {
    const userRef = doc(db, COLLECTIONS.USERS, uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      // Create new user profile with defaults
      const defaultProfile = {
        uid,
        username: null, // Will be set in choose-username flow
        profilePicture: null,
        blyzaBucks: 0,
        badges: [],
        mostPlayedGames: [],
        achievements: [],
        lastSeen: serverTimestamp(),
        createdAt: serverTimestamp(),
        ...userData
      };
      
      await setDoc(userRef, defaultProfile);
      console.log('User profile created:', uid);
    } else {
      // Update lastSeen for existing user
      await updateDoc(userRef, {
        lastSeen: serverTimestamp()
      });
      console.log('User profile updated:', uid);
    }
  } catch (error) {
    console.error('Error creating/updating user profile:', error);
    throw error;
  }
}

/**
 * Get user profile by UID
 * @param {string} uid - User's Firebase Auth UID
 * @returns {Promise<Object|null>} User profile data or null
 */
export async function getUserProfile(uid) {
  try {
    const userRef = doc(db, COLLECTIONS.USERS, uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return { id: userSnap.id, ...userSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
}

/**
 * Get user profile by username
 * @param {string} username - Username to search for
 * @returns {Promise<Object|null>} User profile data or null
 */
export async function getUserByUsername(username) {
  try {
    const usersRef = collection(db, COLLECTIONS.USERS);
    const q = query(usersRef, where("username", "==", username.toLowerCase()));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      return { id: userDoc.id, ...userDoc.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting user by username:', error);
    throw error;
  }
}

/**
 * Check if username is available
 * @param {string} username - Username to check
 * @returns {Promise<boolean>} True if available, false if taken
 */
export async function isUsernameAvailable(username) {
  try {
    const user = await getUserByUsername(username);
    return user === null;
  } catch (error) {
    console.error('Error checking username availability:', error);
    throw error;
  }
}

/**
 * Set username for user (only if they don't have one)
 * @param {string} uid - User's Firebase Auth UID
 * @param {string} username - Desired username
 * @returns {Promise<boolean>} True if successful, false if username taken
 */
export async function setUsername(uid, username) {
  try {
    const normalizedUsername = username.toLowerCase().trim();
    
    // Check if username is available
    const isAvailable = await isUsernameAvailable(normalizedUsername);
    if (!isAvailable) {
      return false;
    }
    
    // Update user profile with username
    const userRef = doc(db, COLLECTIONS.USERS, uid);
    await updateDoc(userRef, {
      username: normalizedUsername,
      lastSeen: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('Error setting username:', error);
    throw error;
  }
}

/**
 * Update user profile
 * @param {string} uid - User's Firebase Auth UID
 * @param {Object} updates - Fields to update
 * @returns {Promise<void>}
 */
export async function updateUserProfile(uid, updates) {
  try {
    const userRef = doc(db, COLLECTIONS.USERS, uid);
    await updateDoc(userRef, {
      ...updates,
      lastSeen: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}

/**
 * Friend System Management
 */

/**
 * Send friend request
 * @param {string} fromUid - Sender's UID
 * @param {string} toUid - Recipient's UID
 * @returns {Promise<boolean>} True if successful, false if request already exists
 */
export async function sendFriendRequest(fromUid, toUid) {
  try {
    if (fromUid === toUid) {
      throw new Error("Cannot send friend request to yourself");
    }
    
    // Check if friend request or friendship already exists
    const existingRequest = await getFriendStatus(fromUid, toUid);
    if (existingRequest) {
      return false; // Request already exists
    }
    
    // Create friend request in recipient's friends subcollection
    const friendsRef = collection(db, COLLECTIONS.USERS, toUid, COLLECTIONS.FRIENDS);
    await addDoc(friendsRef, {
      friendUid: fromUid,
      status: 'pending',
      addedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('Error sending friend request:', error);
    throw error;
  }
}

/**
 * Get friend status between two users
 * @param {string} uid1 - First user's UID
 * @param {string} uid2 - Second user's UID
 * @returns {Promise<Object|null>} Friend document or null
 */
export async function getFriendStatus(uid1, uid2) {
  try {
    // Check both directions
    const requests = await Promise.all([
      getFriendDocument(uid1, uid2),
      getFriendDocument(uid2, uid1)
    ]);
    
    return requests.find(req => req !== null) || null;
  } catch (error) {
    console.error('Error getting friend status:', error);
    throw error;
  }
}

/**
 * Get friend document from user's friends subcollection
 * @param {string} userUid - User whose friends collection to check
 * @param {string} friendUid - Friend UID to look for
 * @returns {Promise<Object|null>} Friend document or null
 */
async function getFriendDocument(userUid, friendUid) {
  try {
    const friendsRef = collection(db, COLLECTIONS.USERS, userUid, COLLECTIONS.FRIENDS);
    const q = query(friendsRef, where("friendUid", "==", friendUid));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const friendDoc = querySnapshot.docs[0];
      return { id: friendDoc.id, ...friendDoc.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting friend document:', error);
    throw error;
  }
}

/**
 * Accept friend request
 * @param {string} userUid - User accepting the request
 * @param {string} friendUid - User who sent the request
 * @returns {Promise<boolean>} True if successful
 */
export async function acceptFriendRequest(userUid, friendUid) {
  try {
    const batch = writeBatch(db);
    
    // Update the existing request to accepted
    const friendDoc = await getFriendDocument(userUid, friendUid);
    if (!friendDoc || friendDoc.status !== 'pending') {
      return false;
    }
    
    // Update existing request to accepted
    const existingRequestRef = doc(db, COLLECTIONS.USERS, userUid, COLLECTIONS.FRIENDS, friendDoc.id);
    batch.update(existingRequestRef, {
      status: 'accepted',
      acceptedAt: serverTimestamp()
    });
    
    // Create reciprocal friend document
    const reciprocalRef = collection(db, COLLECTIONS.USERS, friendUid, COLLECTIONS.FRIENDS);
    const newFriendRef = doc(reciprocalRef); // Generate new doc reference
    batch.set(newFriendRef, {
      friendUid: userUid,
      status: 'accepted',
      addedAt: serverTimestamp(),
      acceptedAt: serverTimestamp()
    });
    
    await batch.commit();
    return true;
  } catch (error) {
    console.error('Error accepting friend request:', error);
    throw error;
  }
}

/**
 * Reject friend request
 * @param {string} userUid - User rejecting the request
 * @param {string} friendUid - User who sent the request
 * @returns {Promise<boolean>} True if successful
 */
export async function rejectFriendRequest(userUid, friendUid) {
  try {
    const friendDoc = await getFriendDocument(userUid, friendUid);
    if (!friendDoc || friendDoc.status !== 'pending') {
      return false;
    }
    
    // Delete the friend request
    const requestRef = doc(db, COLLECTIONS.USERS, userUid, COLLECTIONS.FRIENDS, friendDoc.id);
    await deleteDoc(requestRef);
    
    return true;
  } catch (error) {
    console.error('Error rejecting friend request:', error);
    throw error;
  }
}

/**
 * Remove friend (unfriend)
 * @param {string} userUid - User removing the friend
 * @param {string} friendUid - Friend to remove
 * @returns {Promise<boolean>} True if successful
 */
export async function removeFriend(userUid, friendUid) {
  try {
    const batch = writeBatch(db);
    
    // Remove friend from both users' friend lists
    const userFriendDoc = await getFriendDocument(userUid, friendUid);
    const friendFriendDoc = await getFriendDocument(friendUid, userUid);
    
    if (userFriendDoc) {
      const userFriendRef = doc(db, COLLECTIONS.USERS, userUid, COLLECTIONS.FRIENDS, userFriendDoc.id);
      batch.delete(userFriendRef);
    }
    
    if (friendFriendDoc) {
      const friendFriendRef = doc(db, COLLECTIONS.USERS, friendUid, COLLECTIONS.FRIENDS, friendFriendDoc.id);
      batch.delete(friendFriendRef);
    }
    
    await batch.commit();
    return true;
  } catch (error) {
    console.error('Error removing friend:', error);
    throw error;
  }
}

/**
 * Get user's friends list
 * @param {string} uid - User's UID
 * @param {string} status - Friend status to filter by ('pending', 'accepted', or null for all)
 * @returns {Promise<Array>} Array of friend objects with profile data
 */
export async function getUserFriends(uid, status = 'accepted') {
  try {
    const friendsRef = collection(db, COLLECTIONS.USERS, uid, COLLECTIONS.FRIENDS);
    let q = friendsRef;
    
    if (status) {
      q = query(friendsRef, where("status", "==", status));
    }
    
    const querySnapshot = await getDocs(q);
    const friends = [];
    
    for (const doc of querySnapshot.docs) {
      const friendData = doc.data();
      // Get friend's profile data
      const friendProfile = await getUserProfile(friendData.friendUid);
      if (friendProfile) {
        friends.push({
          id: doc.id,
          ...friendData,
          profile: friendProfile
        });
      }
    }
    
    return friends;
  } catch (error) {
    console.error('Error getting user friends:', error);
    throw error;
  }
}

/**
 * Get pending friend requests (incoming)
 * @param {string} uid - User's UID
 * @returns {Promise<Array>} Array of pending friend requests with sender profile data
 */
export async function getPendingFriendRequests(uid) {
  return await getUserFriends(uid, 'pending');
}

/**
 * Search users by username (for adding friends)
 * @param {string} searchTerm - Username search term
 * @param {string} currentUserUid - Current user's UID (to exclude from results)
 * @returns {Promise<Array>} Array of matching user profiles
 */
export async function searchUsersByUsername(searchTerm, currentUserUid) {
  try {
    if (!searchTerm || searchTerm.length < 2) {
      return [];
    }
    
    const usersRef = collection(db, COLLECTIONS.USERS);
    // Note: Firestore doesn't support case-insensitive search or LIKE queries
    // This is a basic exact match search. For better search, consider using Algolia or similar
    const q = query(
      usersRef, 
      where("username", ">=", searchTerm.toLowerCase()),
      where("username", "<=", searchTerm.toLowerCase() + '\uf8ff')
    );
    
    const querySnapshot = await getDocs(q);
    const users = [];
    
    querySnapshot.docs.forEach(doc => {
      const userData = doc.data();
      // Exclude current user and users without usernames
      if (userData.uid !== currentUserUid && userData.username) {
        users.push({ id: doc.id, ...userData });
      }
    });
    
    return users;
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
}

/**
 * Utility function to handle user authentication state changes
 * Should be called when user signs in/out
 */
export async function handleAuthStateChange(user) {
  if (user) {
    // User signed in - create/update profile
    await createUserProfile(user.uid, {
      email: user.email,
      displayName: user.displayName,
      profilePicture: user.photoURL
    });
  }
  // Note: We don't update lastSeen on sign out to preserve last activity time
}

/**
 * Game integration functions
 */

/**
 * Update user's most played games
 * @param {string} uid - User's UID
 * @param {string} gameId - Game identifier
 * @returns {Promise<void>}
 */
export async function updateMostPlayedGames(uid, gameId) {
  try {
    const userProfile = await getUserProfile(uid);
    if (!userProfile) return;
    
    let mostPlayedGames = userProfile.mostPlayedGames || [];
    
    // Remove game if it exists, then add to front
    mostPlayedGames = mostPlayedGames.filter(id => id !== gameId);
    mostPlayedGames.unshift(gameId);
    
    // Keep only top 5 games
    mostPlayedGames = mostPlayedGames.slice(0, 5);
    
    await updateUserProfile(uid, { mostPlayedGames });
  } catch (error) {
    console.error('Error updating most played games:', error);
  }
}

/**
 * Update user's Blyza Bucks
 * @param {string} uid - User's UID
 * @param {number} amount - Amount to add (can be negative)
 * @returns {Promise<void>}
 */
export async function updateBlyzaBucks(uid, amount) {
  try {
    const userProfile = await getUserProfile(uid);
    if (!userProfile) return;
    
    const newAmount = Math.max(0, (userProfile.blyzaBucks || 0) + amount);
    await updateUserProfile(uid, { blyzaBucks: newAmount });
  } catch (error) {
    console.error('Error updating Blyza Bucks:', error);
  }
}

/**
 * Increment user's games played counter
 * @param {string} uid - User's UID
 * @returns {Promise<void>}
 */
export async function incrementGamesPlayed(uid) {
  try {
    const userProfile = await getUserProfile(uid);
    if (!userProfile) return;
    
    const newCount = (userProfile.gamesPlayed || 0) + 1;
    await updateUserProfile(uid, { gamesPlayed: newCount });
  } catch (error) {
    console.error('Error incrementing games played:', error);
  }
}

// Track which games have been incremented in this session to prevent rapid increments
const gameIncrementTracker = new Set();

/**
 * Increment games played and Blyza Bucks when user opens a game (throttled per session)
 * @param {string} uid - User's UID
 * @param {string} gameId - Game identifier
 * @returns {Promise<void>}
 */
export async function trackGameOpen(uid, gameId) {
  const trackingKey = `${uid}-${gameId}`;
  
  // Only increment once per game per session
  if (gameIncrementTracker.has(trackingKey)) {
    return;
  }
  
  try {
    // Mark this game as tracked for this session
    gameIncrementTracker.add(trackingKey);
    
    // Increment games played counter
    await incrementGamesPlayed(uid);
    
    // Update most played games
    await updateMostPlayedGames(uid, gameId);
    
    // Award Blyza Bucks for playing (5 per game)
    await updateBlyzaBucks(uid, 5);
    
    console.log(`Tracked game open: ${gameId} for user ${uid}`);
  } catch (error) {
    console.error('Error tracking game open:', error);
    // Remove from tracker if there was an error, so they can try again
    gameIncrementTracker.delete(trackingKey);
  }
}
