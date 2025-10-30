// components/friends/ProfileCard.js
import { useState } from 'react';
import styles from './ProfileCard.module.css';

export default function ProfileCard({ 
  user, 
  authUser = null,
  isCurrentUser = false, 
  showActions = false,
  onAddFriend = null,
  onRemoveFriend = null,
  friendStatus = null,
  onUsernameClick = null
}) {
  const [loading, setLoading] = useState(false);

  const handleAddFriend = async () => {
    if (!onAddFriend || loading) return;
    setLoading(true);
    try {
      await onAddFriend(user.uid);
    } catch (error) {
      console.error('Error adding friend:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFriend = async () => {
    if (!onRemoveFriend || loading) return;
    setLoading(true);
    try {
      await onRemoveFriend(user.uid);
    } catch (error) {
      console.error('Error removing friend:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = () => {
    switch (friendStatus) {
      case 'pending': return 'Request Sent';
      case 'accepted': return 'Friends';
      default: return null;
    }
  };

  const formatLastSeen = (timestamp) => {
    if (!timestamp) return 'Never';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className={`${styles.profileCard} ${isCurrentUser ? styles.currentUser : ''}`}>
      <div className={styles.profileHeader}>
        <div className={styles.avatarContainer}>
          {(user.profilePicture || (isCurrentUser && authUser?.photoURL)) ? (
            <img 
              src={user.profilePicture || authUser?.photoURL} 
              alt={`${user.username || 'User'}'s avatar`}
              className={styles.avatar}
            />
          ) : (
            <div className={styles.avatarPlaceholder}>
              <i className="fas fa-user"></i>
            </div>
          )}
          {friendStatus === 'accepted' && (
            <div className={styles.onlineIndicator} title={`Last seen: ${formatLastSeen(user.lastSeen)}`}>
              <i className="fas fa-circle"></i>
            </div>
          )}
        </div>
        
        <div className={styles.profileInfo}>
          <h3 className={styles.username}>
            {user.username ? (
              <>
                @{user.username}
                {isCurrentUser && <span className={styles.youLabel}>(You)</span>}
              </>
            ) : (
              <span 
                className={`${styles.emptyUsername} ${onUsernameClick ? styles.clickable : ''}`}
                onClick={onUsernameClick}
                style={{ cursor: onUsernameClick ? 'pointer' : 'default' }}
              >
                Click to set username
                {isCurrentUser && <span className={styles.youLabel}>(You)</span>}
              </span>
            )}
          </h3>
          
          <div className={styles.stats}>
            <div className={styles.stat}>
              <i className="fas fa-coins"></i>
              <span>{user.blyzaBucks?.toLocaleString() || 0} Bucks</span>
            </div>
            {user.badges && user.badges.length > 0 && (
              <div className={styles.stat}>
                <i className="fas fa-medal"></i>
                <span>{user.badges.length} Badges</span>
              </div>
            )}
          </div>
        </div>

        {showActions && !isCurrentUser && (
          <div className={styles.actions}>
            {getStatusText() && (
              <span className={`${styles.statusText} ${styles[friendStatus]}`}>
                {getStatusText()}
              </span>
            )}
            
            {friendStatus === null && (
              <button 
                className={styles.addBtn}
                onClick={handleAddFriend}
                disabled={loading}
              >
                <i className="fas fa-user-plus"></i>
                {loading ? 'Sending...' : 'Add Friend'}
              </button>
            )}
            
            {friendStatus === 'accepted' && onRemoveFriend && (
              <button 
                className={styles.removeBtn}
                onClick={handleRemoveFriend}
                disabled={loading}
              >
                <i className="fas fa-user-times"></i>
                {loading ? 'Removing...' : 'Remove'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Badges Section */}
      {user.badges && user.badges.length > 0 && (
        <div className={styles.badgesSection}>
          <h4>Badges</h4>
          <div className={styles.badges}>
            {user.badges.map((badge, index) => (
              <span key={index} className={styles.badge}>
                {badge}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Most Played Games */}
      {user.mostPlayedGames && user.mostPlayedGames.length > 0 && (
        <div className={styles.gamesSection}>
          <h4>Most Played</h4>
          <div className={styles.games}>
            {user.mostPlayedGames.slice(0, 3).map((game, index) => (
              <span key={index} className={styles.game}>
                Game {game}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Achievements */}
      {user.achievements && user.achievements.length > 0 && (
        <div className={styles.achievementsSection}>
          <h4>Recent Achievements</h4>
          <div className={styles.achievements}>
            {user.achievements.slice(0, 2).map((achievement, index) => (
              <span key={index} className={styles.achievement}>
                <i className="fas fa-trophy"></i>
                {achievement}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
