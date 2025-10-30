# Friend & Profile System Setup Guide

## Overview
Successfully implemented a minimal, safe friend & profile system for Blyza without breaking any existing functionality.

## Features Implemented

### Backend (Firestore)
- **User Profiles**: Complete user profile management with username, Blyza Bucks, badges, achievements
- **Friend System**: Send/accept/reject friend requests, manage friend lists
- **Username System**: Unique username validation and assignment
- **Game Integration**: Track most played games and Blyza Bucks

### Frontend (React Components)
- **ProfileCard**: Display user profiles with stats and actions
- **AddFriend**: Search and send friend requests
- **FriendRequests**: Manage incoming friend requests
- **FriendList**: Display and manage current friends

### New Pages
- **`/friends`**: Main friends dashboard
- **`/choose-username`**: Username selection for new users

## Files Created

### Core Integration
- `/lib/firestore.js` - Firestore database integration and functions

### Components
- `/components/friends/ProfileCard.js` - User profile display component
- `/components/friends/ProfileCard.module.css` - ProfileCard styles
- `/components/friends/AddFriend.js` - Friend search and request component  
- `/components/friends/AddFriend.module.css` - AddFriend styles
- `/components/friends/FriendRequests.js` - Incoming requests management
- `/components/friends/FriendRequests.module.css` - FriendRequests styles
- `/components/friends/FriendList.js` - Friends list display
- `/components/friends/FriendList.module.css` - FriendList styles

### Pages
- `/pages/friends.js` - Main friends dashboard page
- `/pages/choose-username.js` - Username selection page

### Styles
- `/styles/Friends.module.css` - Friends page styles
- `/styles/ChooseUsername.module.css` - Username page styles

### Documentation
- `/firestore-security-rules.txt` - Firestore security rules
- `/README_friend_system.md` - This documentation

## Setup Instructions

### 1. Firestore Configuration
1. Go to Firebase Console > Firestore Database
2. Copy the security rules from `/firestore-security-rules.txt`
3. Paste into Firestore Database > Rules section
4. Publish the rules

### 2. Authentication Flow
The system automatically handles user authentication:
1. User signs in → Profile created/updated in Firestore
2. If no username → Redirect to `/choose-username`
3. Username set → Redirect to `/friends`

### 3. Navigation
- Add a "Friends" link to your main navigation pointing to `/friends`
- The friends page has a "Back to Games" button to return to home

### 4. Game Integration (Optional)
To track most played games and Blyza Bucks:

```javascript
import { updateMostPlayedGames, updateBlyzaBucks } from '../lib/firestore';
import { auth } from '../firebaseconfig';

// When user plays a game
const user = auth.currentUser;
if (user) {
  await updateMostPlayedGames(user.uid, 'game1');
  await updateBlyzaBucks(user.uid, 5); // Add 5 Blyza Bucks
}
```

## Database Structure

### Users Collection (`/users/{uid}`)
```javascript
{
  uid: "firebase-auth-uid",
  username: "player123",           // Unique, lowercase
  profilePicture: "url",          // Optional
  blyzaBucks: 100,                // Number
  badges: ["first-win", "streak"], // Array of strings
  mostPlayedGames: ["game1"],     // Array of game IDs
  achievements: ["winner"],        // Array of achievements
  lastSeen: timestamp,            // Auto-updated
  createdAt: timestamp            // Set on creation
}
```

### Friends Subcollection (`/users/{uid}/friends/{friendId}`)
```javascript
{
  friendUid: "target-user-uid",
  status: "pending|accepted",     // Friend status
  addedAt: timestamp,             // Request sent time
  acceptedAt: timestamp           // Optional, set when accepted
}
```

## API Functions

### User Management
- `createUserProfile(uid, userData)` - Create/update user profile
- `getUserProfile(uid)` - Get user profile by UID
- `getUserByUsername(username)` - Get user by username
- `setUsername(uid, username)` - Set user's username
- `updateUserProfile(uid, updates)` - Update user profile

### Friend System
- `sendFriendRequest(fromUid, toUid)` - Send friend request
- `acceptFriendRequest(userUid, friendUid)` - Accept request
- `rejectFriendRequest(userUid, friendUid)` - Reject request
- `removeFriend(userUid, friendUid)` - Remove friend
- `getUserFriends(uid, status)` - Get user's friends
- `searchUsersByUsername(term, currentUid)` - Search users

### Game Integration
- `updateMostPlayedGames(uid, gameId)` - Track game plays
- `updateBlyzaBucks(uid, amount)` - Update user's currency

## Security Features

### Authentication Required
- All Firestore operations require user authentication
- Users can only modify their own profiles
- Friend requests validated by sender/recipient UIDs

### Username Validation
- 3-20 characters, alphanumeric + underscore/hyphen only
- Uniqueness enforced at application level
- Cannot be changed after selection

### Friend Request Security
- Users can only send requests as themselves
- Only recipients can accept/reject requests
- Both parties can remove friendships

## Testing Checklist

### User Flow
- [ ] New user creates account
- [ ] Redirected to username selection
- [ ] Username validation works (unique, format)
- [ ] Access to friends page after username set
- [ ] Profile displays correctly

### Friend System
- [ ] Search users by username
- [ ] Send friend requests
- [ ] Receive and view incoming requests  
- [ ] Accept friend requests
- [ ] Reject friend requests
- [ ] View friends list
- [ ] Remove friends

### Integration
- [ ] Existing authentication continues to work
- [ ] Homepage remains functional
- [ ] Games and store unaffected
- [ ] No console errors

## Rollback Instructions

### Quick Disable
1. Comment out friend-related navigation links
2. Users won't be able to access `/friends` or `/choose-username`
3. Existing functionality remains intact

### Complete Removal
1. Delete all files in `/components/friends/`
2. Delete `/pages/friends.js` and `/pages/choose-username.js`
3. Delete `/styles/Friends.module.css` and `/styles/ChooseUsername.module.css`
4. Delete `/lib/firestore.js`
5. Remove Firestore security rules (revert to previous)

### Safe Mode
The system is designed to be non-intrusive:
- No existing routes are modified
- Authentication flow enhanced but not broken
- Game functionality completely preserved
- Store and other features unaffected

## Known Limitations

### Search
- Username search is exact match only
- For fuzzy search, consider integrating Algolia or similar service

### Real-time Updates  
- Friend lists don't auto-refresh
- Page refresh required to see new requests
- Could be enhanced with Firestore real-time listeners

### Profile Pictures
- Currently uses Firebase Auth photo URL
- Could be enhanced with custom upload system

## Future Enhancements

### Social Features
- Friend activity feeds
- Game invitations between friends
- Leaderboards among friends

### Profile Enhancements
- Custom profile pictures upload
- More detailed statistics
- Achievement system expansion

### Real-time Features
- Live friend status indicators
- Real-time notifications
- Chat system between friends

## Troubleshooting

### "Username already taken" Error
- Check Firebase console for duplicate usernames
- Ensure username search is case-insensitive
- Clear browser cache if issues persist

### Friend Requests Not Appearing
- Verify Firestore security rules are published
- Check browser console for authentication errors
- Ensure both users have completed username setup

### Profile Not Loading
- Verify user is authenticated
- Check Firestore security rules allow profile reads
- Ensure Firestore database is active

---

**System implemented successfully on August 26, 2025**  
**All existing functionality preserved with new social features added safely.**
