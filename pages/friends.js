// pages/friends.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebaseconfig';
import { getUserProfile, handleAuthStateChange } from '../lib/firestore';
import ProfileCard from '../components/friends/ProfileCard';
import AddFriend from '../components/friends/AddFriend';
import FriendRequests from '../components/friends/FriendRequests';
import FriendList from '../components/friends/FriendList';
import styles from '../styles/Friends.module.css';

export default function Friends() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('friends');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Handle auth state change (create/update profile)
          await handleAuthStateChange(user);
          
          // Get user profile
          const profile = await getUserProfile(user.uid);
          
          if (!profile?.username) {
            // User doesn't have username, redirect to choose-username
            router.push('/choose-username');
            return;
          }
          
          setUser(user);
          setUserProfile(profile);
        } catch (error) {
          console.error('Error loading user profile:', error);
        }
      } else {
        // Not authenticated, redirect to login
        router.push('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleDataUpdate = () => {
    // Trigger refresh of friend-related components
    setRefreshTrigger(prev => prev + 1);
  };

  const goToHomePage = () => {
    router.push('/');
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <i className="fas fa-spinner fa-spin"></i>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user || !userProfile) {
    return null; // Will redirect
  }

  return (
    <>
      <Head>
        <title>Friends - Blyza</title>
        <meta name="description" content="Connect with friends on Blyza" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Bungee&family=Luckiest+Guy&family=Quicksand:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </Head>

      <div className={styles.page}>
        {/* Header */}
        <header className={styles.header}>
          <button className={styles.homeBtn} onClick={goToHomePage}>
            <i className="fas fa-home"></i>
            Back to Games
          </button>
          
          <div className={styles.headerContent}>
            <img 
              className={styles.logo} 
              src="https://static.wixstatic.com/shapes/9ce3e5_4f0149a89dd841859da02f59247b5b6b.svg" 
              alt="Blyza Mascot" 
            />
            <h1>Friends & Profile</h1>
          </div>

          <div className={styles.userInfo}>
            <span>Welcome, @{userProfile.username}!</span>
          </div>
        </header>

        <div className={styles.container}>
          {/* User Profile Section */}
          <section className={styles.profileSection}>
            <h2>Your Profile</h2>
            <ProfileCard user={userProfile} isCurrentUser={true} />
          </section>

          {/* Navigation Tabs */}
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${activeTab === 'friends' ? styles.active : ''}`}
              onClick={() => setActiveTab('friends')}
            >
              <i className="fas fa-users"></i>
              My Friends
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'requests' ? styles.active : ''}`}
              onClick={() => setActiveTab('requests')}
            >
              <i className="fas fa-user-clock"></i>
              Friend Requests
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'add' ? styles.active : ''}`}
              onClick={() => setActiveTab('add')}
            >
              <i className="fas fa-user-plus"></i>
              Add Friends
            </button>
          </div>

          {/* Tab Content */}
          <div className={styles.tabContent}>
            {activeTab === 'friends' && (
              <FriendList 
                key={`friends-${refreshTrigger}`}
                currentUser={userProfile} 
                onFriendsUpdated={handleDataUpdate} 
              />
            )}
            
            {activeTab === 'requests' && (
              <FriendRequests 
                key={`requests-${refreshTrigger}`}
                currentUser={userProfile} 
                onRequestsUpdated={handleDataUpdate} 
              />
            )}
            
            {activeTab === 'add' && (
              <AddFriend 
                currentUser={userProfile} 
                onFriendRequestSent={handleDataUpdate} 
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
