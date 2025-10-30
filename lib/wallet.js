// lib/wallet.js - Blyza Bucks wallet management (single source of truth)

import { 
  doc, 
  getDoc,
  onSnapshot,
  runTransaction, 
  serverTimestamp 
} from "firebase/firestore";
import { db } from '../firebaseconfig.js';

/**
 * Subscribe to real-time Blyza Bucks updates for a user
 * @param {string} uid - User's UID
 * @param {function} callback - Function called with updated amount: (amount: number) => void
 * @returns {function} - Unsubscribe function
 */
export function subscribeBlyzaBucks(uid, callback) {
  if (!uid || typeof callback !== 'function') {
    throw new Error('Invalid uid or callback for Blyza Bucks subscription');
  }
  
  const userRef = doc(db, 'users', uid);
  
  return onSnapshot(userRef, (doc) => {
    const amount = doc.exists() ? (doc.data()?.blyzaBucks || 0) : 0;
    callback(amount);
  }, (error) => {
    console.error('Error in Blyza Bucks subscription:', error);
    callback(0); // Fallback to 0 on error
  });
}

/**
 * Adds Blyza Bucks to user's wallet (single source of truth)
 * @param {string} uid - User's UID
 * @param {number} amount - Amount to add (can be negative for spending)
 * @returns {Promise<number>} - New total amount
 */
export async function addBlyzaBucks(uid, amount) {
  if (!uid || typeof amount !== 'number') {
    throw new Error('Invalid uid or amount for Blyza Bucks transaction');
  }
  
  try {
    let newTotal = 0;
    
    await runTransaction(db, async (transaction) => {
      const userRef = doc(db, 'users', uid);
      const userDoc = await transaction.get(userRef);
      
      if (!userDoc.exists()) {
        // Create user document if it doesn't exist
        newTotal = Math.max(0, amount);
        transaction.set(userRef, {
          uid,
          blyzaBucks: newTotal,
          lastSeen: serverTimestamp()
        }, { merge: true });
      } else {
        const currentAmount = userDoc.data().blyzaBucks || 0;
        newTotal = Math.max(0, currentAmount + amount);
        transaction.update(userRef, {
          blyzaBucks: newTotal,
          lastSeen: serverTimestamp()
        });
      }
    });
    
    console.log(`Updated Blyza Bucks for ${uid}: ${amount > 0 ? '+' : ''}${amount} (New total: ${newTotal})`);
    return newTotal;
  } catch (error) {
    console.error('Error updating Blyza Bucks:', error);
    throw error;
  }
}

/**
 * Gets current Blyza Bucks balance
 * @param {string} uid - User's UID
 * @returns {Promise<number>} - Current balance
 */
export async function getBlyzaBucks(uid) {
  try {
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      return userDoc.data().blyzaBucks || 0;
    }
    return 0;
  } catch (error) {
    console.error('Error getting Blyza Bucks:', error);
    return 0;
  }
}

/**
 * Spends Blyza Bucks (convenience function)
 * @param {string} uid - User's UID
 * @param {number} amount - Amount to spend (positive number)
 * @returns {Promise<number>} - New total amount
 */
export async function spendBlyzaBucks(uid, amount) {
  return await addBlyzaBucks(uid, -Math.abs(amount));
}
