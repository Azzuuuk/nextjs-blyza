import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { auth, db } from '../firebaseconfig';
import { getUserProfile } from '../lib/user';
import { doc, onSnapshot } from 'firebase/firestore';
import AddFriend from './friends/AddFriend';
import FriendRequests from './friends/FriendRequests';
import FriendList from './friends/FriendList';
import ProfileCard from './friends/ProfileCard';
import styles from './ProfileModal.module.css';

export default function ProfileModal({ isOpen, onClose }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [unsubscribe, setUnsubscribe] = useState(null);

  useEffect(() => {
    if (isOpen && auth.currentUser) {
      setupRealtimeSubscription();
    } else {
      // Clean up subscription when modal closes
      if (unsubscribe) {
        unsubscribe();
        setUnsubscribe(null);
      }
      setUserProfile(null);
      setUser(null);
    }

    // Cleanup on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [isOpen]);

  const setupRealtimeSubscription = () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    setLoading(true);
    setUser(currentUser);

    // Clean up existing subscription
    if (unsubscribe) {
      unsubscribe();
    }

    // Set up real-time subscription to user document
    const userRef = doc(db, 'users', currentUser.uid);
    console.log('ProfileModal: Setting up subscription for user:', currentUser.uid);
    const unsubscribeFunc = onSnapshot(userRef, 
      (doc) => {
        if (doc.exists()) {
          const userData = { id: doc.id, ...doc.data() };
          console.log('ProfileModal: Profile data updated:', userData);
          setUserProfile(userData);
        } else {
          console.log('ProfileModal: No user document found, creating one...');
          // User document doesn't exist, try to create it
          import('../lib/user').then(({ ensureUserDoc }) => {
            ensureUserDoc(currentUser.uid).catch(error => {
              console.error('Failed to create user document:', error);
            });
          });
          setUserProfile(null);
        }
        setLoading(false);
      },
      (error) => {
        console.error('ProfileModal: Error in profile subscription:', error);
        setLoading(false);
      }
    );

    setUnsubscribe(() => unsubscribeFunc);
  };

  const loadUserData = async () => {
    try {
      setLoading(true);
      const currentUser = auth.currentUser;
      if (currentUser) {
        setUser(currentUser);
        const profile = await getUserProfile(currentUser.uid);
        setUserProfile(profile);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Refresh profile data when modal is opened
  const refreshProfile = async () => {
    if (auth.currentUser) {
      try {
        // Re-setup the real-time subscription to get fresh data
        setupRealtimeSubscription();
      } catch (error) {
        console.error('Error refreshing profile:', error);
      }
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleUsernameClick = () => {
    onClose(); // Close the modal first
    router.push('/choose-username');
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={handleBackdropClick}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>
            <i className="fas fa-user"></i>
            Profile
          </h2>
          <button 
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close Profile Modal"
          >
            ×
          </button>
        </div>

        <div className={styles.modalBody}>
          {loading ? (
            <div className={styles.loading}>
              <i className="fas fa-spinner fa-spin"></i>
              <p>Loading profile...</p>
            </div>
          ) : (
            <>
              <div className={styles.tabNavigation}>
                <button 
                  className={`${styles.tabButton} ${activeTab === 'profile' ? styles.active : ''}`}
                  onClick={() => setActiveTab('profile')}
                >
                  <i className="fas fa-user"></i>
                  Profile
                </button>
                <button 
                  className={`${styles.tabButton} ${activeTab === 'friends' ? styles.active : ''}`}
                  onClick={() => setActiveTab('friends')}
                >
                  <i className="fas fa-users"></i>
                  Friends
                </button>
              </div>

              <div className={styles.tabContent}>
                {activeTab === 'profile' && (
                  <div className={styles.profileTab}>
                    {userProfile && (
                      <ProfileCard 
                        user={userProfile}
                        authUser={user}
                        isCurrentUser={true}
                        showActions={false}
                        onUsernameClick={!userProfile.username ? handleUsernameClick : null}
                      />
                    )}
                    
                    <div className={styles.statsSection}>
                      <div className={styles.statsHeader}>
                        <h3><i className="fas fa-trophy"></i> Stats & Achievements</h3>
                        <button 
                          className={styles.refreshButton} 
                          onClick={refreshProfile}
                          aria-label="Refresh Profile Data"
                        >
                          <i className="fas fa-sync-alt"></i>
                        </button>
                      </div>
                      
                      <div className={styles.statsGrid}>
                        <div className={styles.statCard}>
                          <div className={styles.statIcon}>
                            <i className="fas fa-coins"></i>
                          </div>
                          <div className={styles.statInfo}>
                            <span className={styles.statLabel}>Blyza Bucks</span>
                            <span className={styles.statValue}>
                              {userProfile?.blyzaBucks?.toLocaleString() || '0'}
                            </span>
                          </div>
                        </div>

                        <div className={styles.statCard}>
                          <div className={styles.statIcon}>
                            <i className="fas fa-gamepad"></i>
                          </div>
                          <div className={styles.statInfo}>
                            <span className={styles.statLabel}>Games Played</span>
                            <span className={styles.statValue}>
                              {userProfile?.gamesPlayed || '0'}
                            </span>
                          </div>
                        </div>

                        <div className={styles.statCard}>
                          <div className={styles.statIcon}>
                            <i className="fas fa-award"></i>
                          </div>
                          <div className={styles.statInfo}>
                            <span className={styles.statLabel}>Badges</span>
                            <span className={styles.statValue}>
                              Coming soon
                            </span>
                          </div>
                        </div>
                      </div>

                      {userProfile?.mostPlayedGames && userProfile.mostPlayedGames.length > 0 && (
                        <div className={styles.favoriteGames}>
                          <h4><i className="fas fa-heart"></i> Favorite Games</h4>
                          <ul className={styles.gamesList}>
                            {userProfile.mostPlayedGames.slice(0, 5).map((gameId, index) => (
                              <li key={gameId} className={styles.gameItem}>
                                <i className="fas fa-gamepad"></i>
                                Game {gameId}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {userProfile?.achievements && userProfile.achievements.length > 0 && (
                        <div className={styles.achievements}>
                          <h4><i className="fas fa-trophy"></i> Achievements</h4>
                          <div className={styles.achievementsList}>
                            {userProfile.achievements.map((achievement, index) => (
                              <span key={achievement} className={styles.achievementBadge}>
                                <i className="fas fa-star"></i>
                                {achievement}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {userProfile?.badges && userProfile.badges.length > 0 && (
                        <div className={styles.badges}>
                          <h4><i className="fas fa-award"></i> Badges</h4>
                          <div className={styles.badgesList}>
                            {userProfile.badges.map((badge, index) => (
                              <span key={badge} className={styles.badge}>
                                <i className="fas fa-medal"></i>
                                {badge}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'friends' && (
                  <div className={styles.friendsTab}>
                    <div className={styles.friendsSection}>
                      <AddFriend currentUser={userProfile} />
                    </div>
                    
                    <div className={styles.friendsSection}>
                      <FriendRequests currentUser={userProfile} />
                    </div>
                    
                    <div className={styles.friendsSection}>
                      <FriendList currentUser={userProfile} />
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
