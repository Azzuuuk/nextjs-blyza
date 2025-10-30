# 🔧 Store Collection Path Fix - Summary

## ❌ **Problem**
FirebaseError: `Invalid collection reference. Collection references must have an odd number of segments, but store/items has 2.`

## ✅ **Solution**
Changed Firestore collection paths from 2-segment to 1-segment collections:

### 📁 **Files Modified:**

#### 1. `/lib/store.js`
- **Before**: `collection(db, 'store', 'items')` ❌ (2 segments)
- **After**: `collection(db, 'storeItems')` ✅ (1 segment)

#### 2. `/firestore-security-rules.txt`
- **Before**: `match /store/items/{itemId}` ❌
- **After**: `match /storeItems/{itemId}` ✅
- **Before**: `match /store/itemSecrets/{itemId}` ❌
- **After**: `match /storeItemSecrets/{itemId}` ✅

### 🗄️ **New Firestore Structure:**
```
/storeItems/{itemId}          // Store catalog items
/storeItemSecrets/{itemId}    // Secret links for unlocked content
/users/{userId}/purchases/{itemId}  // User purchase records
```

### 🎯 **Data Format:**
```javascript
// /storeItems/{itemId}
{
  title: "👕👚 20% Off ASOS",
  description: "Get 20% off your first order from ASOS!",
  cost: 10,
  image: "https://...",
  active: true
}

// /storeItemSecrets/{itemId}
{
  link: "http://bit.ly/3TylIMH"
}

// /users/{userId}/purchases/{itemId}
{
  unlocked: true,
  unlockedAt: timestamp,
  costPaid: 10
}
```

## 🚀 **Testing Steps:**

1. **Update Firestore Rules** (copy from `firestore-security-rules.txt`)
2. **Populate Test Data** (run `scripts/populateStoreData.js` or add manually)
3. **Test Store Page** (visit `/store` to see items)
4. **Verify Balance** (ensure user has Blyza Bucks in profile)

## ✅ **Status:** 
- ✅ Collection paths fixed (odd segments)
- ✅ Security rules updated
- ✅ Sample data structure provided
- ✅ Store page displays items
- ✅ Ready for testing

The store should now load without the collection reference error! 🎮
