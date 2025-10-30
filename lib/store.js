// lib/store.js - Store items, purchases, and redemption logic

import { 
  collection,
  doc, 
  getDoc,
  onSnapshot,
  query,
  where,
  runTransaction, 
  serverTimestamp 
} from "firebase/firestore";
import { db } from '../firebaseconfig.js';

/**
 * Subscribe to store items catalog
 * @param {function} callback - Called with array of store items
 * @returns {function} - Unsubscribe function
 */
export function subscribeStoreItems(callback, options = {}) {
  if (typeof callback !== 'function') {
    throw new Error('Invalid callback for store items subscription');
  }
  const { includeAll = false } = options;
  
  const itemsRef = collection(db, 'storeItems');
  const q = includeAll ? itemsRef : query(itemsRef, where('active', '==', true));
  
  return onSnapshot(q, (snapshot) => {
    console.log('Store items snapshot received:', snapshot.size, 'items');
    const items = snapshot.docs.map(doc => {
      const data = { id: doc.id, ...doc.data() };
      console.log('Store item:', data);
      return data;
    });
    callback(items);
  }, (error) => {
    console.error('Error in store items subscription:', error);
    callback([]);
  });
}

/**
 * Subscribe to user's unlocked purchases
 * @param {string} uid - User's UID
 * @param {function} callback - Called with object { [itemId]: true }
 * @returns {function} - Unsubscribe function
 */
export function subscribeUserPurchases(uid, callback) {
  if (!uid || typeof callback !== 'function') {
    throw new Error('Invalid uid or callback for user purchases subscription');
  }
  
  const purchasesRef = collection(db, 'users', uid, 'purchases');
  
  return onSnapshot(purchasesRef, (snapshot) => {
    const purchases = snapshot.docs
      .filter(doc => doc.data().unlocked === true)
      .map(doc => ({
        itemId: doc.id,
        ...doc.data()
      }));
    callback(purchases);
  }, (error) => {
    console.error('Error in user purchases subscription:', error);
    callback([]);
  });
}

/**
 * Redeem a store item with Blyza Bucks
 * @param {string} uid - User's UID
 * @param {string} itemId - Store item ID
 * @returns {Promise<Object>} - { status, purchased?, message? }
 */
export async function redeemItem(uid, itemId) {
  console.log('🔧 redeemItem called with:', { uid, itemId });
  
  if (!uid || !itemId) {
    console.warn('❌ Invalid parameters:', { uid, itemId });
    return { status: 'notFound', message: 'Invalid user or item ID' };
  }
  
  try {
    const result = await runTransaction(db, async (transaction) => {
      console.log('🔄 Starting transaction...');
      
      // 1. Read store item
      const itemRef = doc(db, 'storeItems', itemId);
      console.log('📄 Reading store item:', itemId);
      const itemDoc = await transaction.get(itemRef);
      
      if (!itemDoc.exists()) {
        console.warn('❌ Store item not found:', itemId);
        return { status: 'notFound', message: 'Store item not found' };
      }
      
      const itemData = itemDoc.data();
      console.log('📋 Store item data:', itemData);
      
      // Coerce cost to a number to support string values in Firestore; fallback to 10 if invalid
      let itemCost = typeof itemData.cost === 'number' ? itemData.cost : parseFloat(itemData.cost);
      if (!isFinite(itemCost)) {
        console.warn('⚠️ Invalid or missing cost on item; defaulting to 10. Fix Firestore data. Item:', itemId, itemData);
        itemCost = 10;
      }
      if (!itemData.active) {
        console.warn('❌ Item is not active:', itemId);
        return { status: 'notFound', message: 'Item is not available' };
      }
      
      // 2. Read user profile for Blyza Bucks
      const userRef = doc(db, 'users', uid);
      console.log('👤 Reading user profile:', uid);
      const userDoc = await transaction.get(userRef);
      
      if (!userDoc.exists()) {
        console.warn('❌ User profile not found:', uid);
        return { status: 'notFound', message: 'User profile not found' };
      }
      
  const userData = userDoc.data();
  const currentBucks = Number(userData.blyzaBucks) || 0;
  console.log('💰 User Blyza Bucks:', currentBucks, 'Item cost:', itemCost);
      
      // 3. Check if already purchased
      const purchaseRef = doc(db, 'users', uid, 'purchases', itemId);
      console.log('🛒 Checking existing purchase...');
      const purchaseDoc = await transaction.get(purchaseRef);
      
      if (purchaseDoc.exists() && purchaseDoc.data().unlocked === true) {
        console.warn('❌ Item already unlocked');
        return { status: 'alreadyUnlocked', message: 'Item already unlocked' };
      }
      
      // 4. Check sufficient funds
    if (currentBucks < itemCost) {
        console.warn('❌ Insufficient funds:', currentBucks, '<', itemData.cost);
        return { 
          status: 'insufficient', 
      message: `Need ${itemCost} Blyza Bucks, you have ${currentBucks}` 
        };
      }
      
      // 5. Perform transaction
  const newBalance = currentBucks - itemCost;
      console.log('✅ Processing transaction. New balance will be:', newBalance);
      
      // Update user balance
      transaction.update(userRef, {
        blyzaBucks: newBalance,
        lastSeen: serverTimestamp()
      });
      
      // Create purchase record
      transaction.set(purchaseRef, {
        unlocked: true,
        unlockedAt: serverTimestamp(),
  costPaid: itemCost,
        itemName: itemData.title || itemData.name || itemId
      });
      
      console.log('🎉 Transaction completed successfully!');
      return { 
        status: 'ok', 
        purchased: true, 
        newBalance,
  message: `Successfully unlocked ${itemData.title}! New balance: ${newBalance} Blyza Bucks`
      };
    });
    
    console.log(`Redemption result for ${uid}/${itemId}:`, result);
    return result;
    
  } catch (error) {
    console.error('Error redeeming item:', error);
    if (error && error.code === 'permission-denied') {
      return {
        status: 'forbidden',
        message: 'Permission denied by Firestore rules. Please ensure you are signed in and have access.'
      };
    }
    return { 
      status: 'error', 
      message: 'Failed to redeem item. Please try again.' 
    };
  }
}

/**
 * Get unlocked item's secret link
 * @param {string} uid - User's UID
 * @param {string} itemId - Store item ID
 * @returns {Promise<string|null>} - Secret link or null
 */
export async function getUnlockedLink(uid, itemId) {
  if (!uid || !itemId) {
    return null;
  }
  
  try {
    // First verify user has unlocked this item
    const purchaseRef = doc(db, 'users', uid, 'purchases', itemId);
    const purchaseDoc = await getDoc(purchaseRef);
    
    if (!purchaseDoc.exists() || purchaseDoc.data().unlocked !== true) {
      console.warn('User has not unlocked this item:', uid, itemId);
      return null;
    }
    
    // Get the secret link
    const secretRef = doc(db, 'storeItemSecrets', itemId);
    const secretDoc = await getDoc(secretRef);
    
    if (!secretDoc.exists()) {
      console.error('Secret not found for item:', itemId);
      return null;
    }
    
    return secretDoc.data().link || null;
    
  } catch (error) {
    console.error('Error getting unlocked link:', error);
    return null;
  }
}
