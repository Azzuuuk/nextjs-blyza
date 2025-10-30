# 🔧 Manual Store Testing Setup

## 🚨 **Why Redeem Button Isn't Working**

The redeem button shows "Redeeming..." but nothing happens because:

1. **No Store Items in Firestore** - The populate script can't write due to security rules
2. **Sample Items Have Wrong Structure** - Sample items use different field names than expected
3. **User Might Not Have Blyza Bucks** - Need to ensure balance exists

## ✅ **Manual Fix Steps**

### 📋 **Step 1: Add Store Items to Firestore**

1. **Go to Firebase Console** → Your Project → Firestore Database
2. **Create Collection** called `storeItems`
3. **Add Documents** with these exact structures:

#### Document ID: `item1`
```json
{
  "title": "👕👚 20% Off ASOS",
  "description": "Get 20% off your first order from ASOS!",
  "cost": 10,
  "active": true,
  "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/ASOS_logo.svg/1280px-ASOS_logo.svg.png"
}
```

#### Document ID: `item2`
```json
{
  "title": "🍔� Free McDonald's",
  "description": "Get a free Big Mac meal!",
  "cost": 15,
  "active": true,
  "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/McDonald%27s_Golden_Arches.svg/1200px-McDonald%27s_Golden_Arches.svg.png"
}
```

### 📋 **Step 2: Add Secret Links Collection**

1. **Create Collection** called `storeItemSecrets`
2. **Add Documents**:

#### Document ID: `item1`
```json
{
  "link": "http://bit.ly/3TylIMH"
}
```

#### Document ID: `item2`
```json
{
  "link": "https://www.mcdonalds.com/us/en-us.html"
}
```

### 📋 **Step 3: Ensure User Has Blyza Bucks**

1. **Go to** Firestore Database → `users` collection
2. **Find your user document** (by your UID)
3. **Add/Update field**: `blyzaBucks: 100` (or any number ≥ 10)

### 📋 **Step 4: Test the Flow**

1. **Visit** `http://localhost:3000/store`
2. **Check Console** for debugging logs (F12 → Console)
3. **Click Redeem** on any item
4. **Watch the console** for detailed logs

## 🔍 **Expected Debug Output**

When you click redeem, you should see:
```
🔄 Starting redemption for item: item1
💰 Current Blyza Bucks: 100
👤 User UID: your-uid-here
📞 Calling redeemItem function...
🔧 redeemItem called with: {uid: "...", itemId: "item1"}
🔄 Starting transaction...
📄 Reading store item: item1
📋 Store item data: {title: "...", cost: 10, ...}
👤 Reading user profile: your-uid
💰 User Blyza Bucks: 100 Item cost: 10
🛒 Checking existing purchase...
✅ Processing transaction. New balance will be: 90
🎉 Transaction completed successfully!
📋 Redemption result: {status: "ok", purchased: true, ...}
```

## 🚨 **Troubleshooting**

### If you see "Store item not found":
- ✅ Check that you created `storeItems` collection (not `store/items`)
- ✅ Check document ID matches exactly (`item1`, `item2`, etc.)
- ✅ Check all required fields exist: `title`, `cost`, `active`, `description`

### If you see "User profile not found":
- ✅ Check your user document exists in `users` collection
- ✅ Check the UID matches your signed-in user

### If you see "Insufficient funds":
- ✅ Add or increase `blyzaBucks` field in your user document

## 🎯 **Quick Test Data (Copy-Paste Ready)**

**For storeItems/item1:**
```
title: 👕👚 20% Off ASOS
description: Get 20% off your first order from ASOS!
cost: 10
active: true
image: https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/ASOS_logo.svg/1280px-ASOS_logo.svg.png
```

**For your user document:**
```
blyzaBucks: 100
```

Once you've added this data manually, the redeem button should work perfectly! 🎮

---

# 🧪 Original Testing Checklist - Store & Wallet System

## Pre-Testing Setup
- [ ] Deploy latest code to staging/production
- [ ] Update Firestore rules from `/firestore-security-rules.txt`
- [ ] Add sample store items to `/storeItems` collection
- [ ] Ensure user has some Blyza Bucks for testing

---

## 💰 Wallet Sync Testing

### Real-time Updates
- [ ] **Profile Modal**: Open profile, verify Blyza Bucks display
- [ ] **Header Display**: Check wallet amount in main navigation
- [ ] **Store Page**: Confirm same balance appears in store
- [ ] **Game Earnings**: Play a game, earn Blyza Bucks, verify instant updates in all locations
- [ ] **Cross-Tab Sync**: Open multiple browser tabs, verify changes sync across tabs

### Data Migration
- [ ] **localStorage Cleanup**: Check browser dev tools → Application → Local Storage (should be empty for `blyzaBucksCount`)
- [ ] **Firestore Data**: Verify wallet document exists in `/wallet/{userId}` collection

---

## 🛒 Store Redemption Testing

### Purchase Flow
- [ ] **Sufficient Funds**: 
  - Select item with price ≤ current balance
  - Click "Redeem" button
  - Verify loading state ("Redeeming...")
  - Confirm success feedback and wallet deduction
  - Check "REDEEMED" badge appears
  - Verify button changes to "View Unlocked"

- [ ] **Insufficient Funds**:
  - Select item with price > current balance  
  - Verify button shows "Insufficient Funds"
  - Confirm button is disabled and grayed out
  - Check click has no effect

- [ ] **Already Redeemed**:
  - For previously redeemed item
  - Verify "REDEEMED" badge is visible
  - Confirm "View Unlocked" button is present
  - Click button and verify secret content opens

### Error Scenarios
- [ ] **Network Failure**: Disable internet, attempt redemption, verify error message
- [ ] **Race Conditions**: Rapidly click redeem button multiple times, verify only one purchase
- [ ] **Session Timeout**: Let auth expire, attempt redemption, verify proper error handling

---

## 🎮 Game Category Testing

### Tab Navigation
- [ ] **Local Play Tab**: Click tab, verify games 1-18 appear
- [ ] **Online Play Tab**: Click tab, verify "Coming Soon" cards appear
- [ ] **Solo Play Tab**: Click tab, verify "Coming Soon" cards appear
- [ ] **Active State**: Verify active tab has proper visual highlighting

### Subcategory Filtering (Local Play only)
- [ ] **All Games**: Default state shows all 18 games
- [ ] **Action Filter**: Click Action, verify games 1, 4, 7, 10, 13, 16 appear
- [ ] **Puzzle Filter**: Click Puzzle, verify games 2, 5, 8, 11, 14, 17 appear  
- [ ] **Strategy Filter**: Click Strategy, verify games 3, 6, 9, 12, 15, 18 appear
- [ ] **Sports Filter**: Click Sports, verify coming soon message appears
- [ ] **Filter Reset**: Click "All Games" to return to full view

### Responsive Design
- [ ] **Mobile View**: Test on mobile device or narrow browser window
- [ ] **Tablet View**: Test on tablet or medium-width screen
- [ ] **Desktop View**: Test on desktop with full-width layout
- [ ] **Touch Navigation**: Verify tab/filter buttons work with touch input

---

## 🔒 Security & Data Testing

### Purchase Verification
- [ ] **Firestore Data**: Check `/purchases/{userId}/items/{itemId}` document exists after redemption
- [ ] **Secret Links**: Verify `/secretLinks/{itemId}` requires purchase to access
- [ ] **User Isolation**: Confirm users can only see their own purchases

### Authentication
- [ ] **Signed Out**: Verify store requires login
- [ ] **Invalid Session**: Test with expired/invalid auth token
- [ ] **Cross-User**: Verify user A cannot see user B's purchases

---

## 🚨 Error Handling Testing

### Network Conditions
- [ ] **Offline Mode**: Test app behavior without internet connection
- [ ] **Slow Connection**: Test with throttled network speed
- [ ] **Intermittent Connection**: Test with connection dropping during operations

### Edge Cases
- [ ] **Empty Store**: Test with no items in store catalog
- [ ] **Zero Balance**: Test store behavior with 0 Blyza Bucks
- [ ] **Concurrent Users**: Test wallet updates with multiple users earning simultaneously

---

## ✅ Success Criteria

### Wallet System
- ✅ All Blyza Bucks counters show identical values in real-time
- ✅ Earnings from games instantly reflect across all components
- ✅ No localStorage remnants from old system

### Store System  
- ✅ Redemptions are atomic (wallet deduction + purchase creation)
- ✅ UI properly reflects all purchase states (available/redeemed/insufficient)
- ✅ Secret content only accessible to verified purchasers
- ✅ Error states provide clear, actionable feedback

### Game Categories
- ✅ Tab navigation works smoothly on all devices
- ✅ Subcategory filtering shows correct games
- ✅ Coming soon content displays appropriately
- ✅ Visual design is consistent and responsive

### Security
- ✅ Firestore rules prevent unauthorized data access
- ✅ Transactions are atomic and prevent double-spending
- ✅ User data remains private and isolated

---

## 🐛 Common Issues & Solutions

### Wallet Not Syncing
- **Check**: Firestore rules are deployed correctly
- **Verify**: User is properly authenticated  
- **Solution**: Refresh browser to reinitialize subscriptions

### Redemption Fails
- **Check**: User has sufficient balance in Firestore (not localStorage)
- **Verify**: Store item exists in `/storeItems` collection
- **Solution**: Clear browser cache and retry

### Categories Not Filtering
- **Check**: `gameCategories.js` mapping is correct
- **Verify**: Game IDs match between homepage and category mapping
- **Solution**: Verify subcategory strings match exactly

### Mobile Layout Issues
- **Check**: CSS modules are loading correctly
- **Verify**: Viewport meta tag is present
- **Solution**: Test with browser dev tools mobile emulation

---

## 📊 Testing Report Template

```
## Test Results - [Date]

### Environment
- Browser: [Chrome/Firefox/Safari/Mobile]
- Device: [Desktop/Tablet/Mobile]
- Network: [WiFi/Cellular/Throttled]

### Wallet Sync: [✅ PASS / ❌ FAIL]
- Real-time updates: [✅/❌]
- Cross-component consistency: [✅/❌]
- Migration cleanup: [✅/❌]

### Store Redemption: [✅ PASS / ❌ FAIL]
- Sufficient funds flow: [✅/❌]
- Insufficient funds handling: [✅/❌]
- Redeemed state display: [✅/❌]
- Error handling: [✅/❌]

### Game Categories: [✅ PASS / ❌ FAIL]
- Tab navigation: [✅/❌]
- Subcategory filtering: [✅/❌]
- Responsive design: [✅/❌]

### Security: [✅ PASS / ❌ FAIL]
- Purchase verification: [✅/❌]
- Data isolation: [✅/❌]
- Auth requirements: [✅/❌]

### Issues Found:
[List any bugs or unexpected behavior]

### Overall Status: [✅ READY FOR PRODUCTION / ❌ NEEDS FIXES]
```

---

**Testing Duration**: Plan 30-45 minutes for comprehensive testing  
**Priority Areas**: Wallet sync, store redemption, mobile responsiveness  
**Critical Bugs**: Any issue preventing redemption or causing data loss should block deployment
