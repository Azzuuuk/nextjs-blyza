// components/friends/AddFriend.js
import { useState } from 'react';
import { searchUsersByUsername, sendFriendRequest, getFriendStatus } from '../../lib/firestore';
import ProfileCard from './ProfileCard';
import styles from './AddFriend.module.css';

export default function AddFriend({ currentUser, onFriendRequestSent }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [friendStatuses, setFriendStatuses] = useState({});

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim() || searchTerm.length < 2) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const results = await searchUsersByUsername(searchTerm, currentUser.uid);
      setSearchResults(results);
      
      // Check friend status for each result
      const statuses = {};
      for (const user of results) {
        const status = await getFriendStatus(currentUser.uid, user.uid);
        if (status) {
          statuses[user.uid] = status.status;
        }
      }
      setFriendStatuses(statuses);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFriend = async (targetUid) => {
    try {
      const success = await sendFriendRequest(currentUser.uid, targetUid);
      if (success) {
        // Update local status
        setFriendStatuses(prev => ({
          ...prev,
          [targetUid]: 'pending'
        }));
        
        if (onFriendRequestSent) {
          onFriendRequestSent();
        }
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
    }
  };

  return (
    <div className={styles.addFriend}>
      <h3>
        <i className="fas fa-user-plus"></i>
        Add Friends
      </h3>
      
      <form onSubmit={handleSearch} className={styles.searchForm}>
        <div className={styles.searchBar}>
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Search by username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <button type="submit" className={styles.searchBtn} disabled={loading}>
          {loading ? (
            <>
              <i className="fas fa-spinner fa-spin"></i>
              Searching...
            </>
          ) : (
            <>
              <i className="fas fa-search"></i>
              Search
            </>
          )}
        </button>
      </form>

      {searchResults.length === 0 && searchTerm.length >= 2 && !loading && (
        <div className={styles.noResults}>
          <i className="fas fa-search"></i>
          <p>No users found with username "{searchTerm}"</p>
          <small>Try a different username or check spelling</small>
        </div>
      )}

      {searchResults.length > 0 && (
        <div className={styles.searchResults}>
          <h4>Search Results</h4>
          <div className={styles.resultsList}>
            {searchResults.map(user => (
              <ProfileCard
                key={user.uid}
                user={user}
                showActions={true}
                onAddFriend={handleAddFriend}
                friendStatus={friendStatuses[user.uid] || null}
              />
            ))}
          </div>
        </div>
      )}

      <div className={styles.tips}>
        <h4>
          <i className="fas fa-lightbulb"></i>
          Tips
        </h4>
        <ul>
          <li>Search for friends by their exact username</li>
          <li>Usernames are case-insensitive</li>
          <li>You can't send multiple requests to the same person</li>
          <li>Ask your friends for their Blyza username!</li>
        </ul>
      </div>
    </div>
  );
}
