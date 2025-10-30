// components/friends/FriendList.js
import { useState, useEffect } from 'react';
import { getUserFriends, removeFriend } from '../../lib/firestore';
import ProfileCard from './ProfileCard';
import styles from './FriendList.module.css';

export default function FriendList({ currentUser, onFriendsUpdated }) {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFriends();
  }, [currentUser]);

  const loadFriends = async () => {
    if (!currentUser?.uid) return;
    
    try {
      const friendsList = await getUserFriends(currentUser.uid, 'accepted');
      setFriends(friendsList);
    } catch (error) {
      console.error('Error loading friends:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFriend = async (friendUid) => {
    if (!confirm('Are you sure you want to remove this friend?')) {
      return;
    }

    try {
      const success = await removeFriend(currentUser.uid, friendUid);
      if (success) {
        // Remove from friends list
        setFriends(prev => prev.filter(friend => friend.friendUid !== friendUid));
        if (onFriendsUpdated) {
          onFriendsUpdated();
        }
      }
    } catch (error) {
      console.error('Error removing friend:', error);
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <i className="fas fa-spinner fa-spin"></i>
        <p>Loading friends...</p>
      </div>
    );
  }

  return (
    <div className={styles.friendList}>
      <h3>
        <i className="fas fa-users"></i>
        My Friends
        {friends.length > 0 && (
          <span className={styles.count}>({friends.length})</span>
        )}
      </h3>

      {friends.length === 0 ? (
        <div className={styles.emptyState}>
          <i className="fas fa-user-friends"></i>
          <p>No friends yet</p>
          <small>Add some friends to see them here!</small>
        </div>
      ) : (
        <div className={styles.friendsGrid}>
          {friends.map(friend => (
            <ProfileCard
              key={friend.id}
              user={friend.profile}
              showActions={true}
              onRemoveFriend={handleRemoveFriend}
              friendStatus="accepted"
            />
          ))}
        </div>
      )}
    </div>
  );
}
