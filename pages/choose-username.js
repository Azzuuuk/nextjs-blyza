// pages/choose-username.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebaseconfig';
import { getUserProfile, claimUsername } from '../lib/user';
import styles from '../styles/ChooseUsername.module.css';

export default function ChooseUsername() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [username, setUsernameInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Check if user already has a username
        const profile = await getUserProfile(user.uid);
        if (profile?.username) {
          // User already has username, redirect to homepage
          router.push('/');
          return;
        }
        setUser(user);
      } else {
        // Not authenticated, redirect to login
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    // Remove real-time availability checking to prevent race conditions
    // Username uniqueness will be checked during claim attempt
    setAvailable(null);
  }, [username]);

  const validateUsername = (username) => {
    if (username.length < 3) {
      return 'Username must be at least 3 characters long';
    }
    if (username.length > 20) {
      return 'Username must be less than 20 characters';
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      return 'Username can only contain letters, numbers, underscores, and hyphens';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || loading) return;

    const validation = validateUsername(username);
    if (validation) {
      setError(validation);
      return;
    }

    setLoading(true);
    setError('');

    try {
      await claimUsername(user.uid, username);
      // Username claimed successfully, redirect to homepage
      router.push('/');
    } catch (error) {
      console.error('Error claiming username:', error);
      setError(error.message || 'Failed to claim username');
    } finally {
      setLoading(false);
    }
  };

  const getAvailabilityIcon = () => {
    // Remove availability checking since we handle it during claim
    return null;
  };

  if (!user) {
    return (
      <div className={styles.loading}>
        <i className="fas fa-spinner fa-spin"></i>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Choose Username - Blyza</title>
        <meta name="description" content="Choose your unique Blyza username" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Bungee&family=Luckiest+Guy&family=Quicksand:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </Head>

      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.formCard}>
            <div className={styles.header}>
              <img 
                className={styles.logo} 
                src="https://static.wixstatic.com/shapes/9ce3e5_4f0149a89dd841859da02f59247b5b6b.svg" 
                alt="Blyza Mascot" 
              />
              <h1>Choose Your Username</h1>
              <p>Pick a unique username that your friends can find you by</p>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.inputGroup}>
                <label htmlFor="username">Username</label>
                <div className={styles.inputContainer}>
                  <span className={styles.prefix}>@</span>
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsernameInput(e.target.value.toLowerCase().trim())}
                    placeholder="your_username"
                    className={styles.input}
                    required
                    maxLength={20}
                  />
                  <div className={styles.availabilityIcon}>
                    {getAvailabilityIcon()}
                  </div>
                </div>
                
                {username.length >= 3 && validateUsername(username) && (
                  <div className={styles.error}>
                    {validateUsername(username)}
                  </div>
                )}
              </div>

              {error && (
                <div className={styles.error}>
                  <i className="fas fa-exclamation-triangle"></i>
                  {error}
                </div>
              )}

              <div className={styles.rules}>
                <h4>Username Rules:</h4>
                <ul>
                  <li>3-20 characters long</li>
                  <li>Letters, numbers, underscores (_), and hyphens (-) only</li>
                  <li>Must be unique</li>
                  <li>Cannot be changed later</li>
                </ul>
              </div>

              <button
                type="submit"
                className={styles.submitBtn}
                disabled={loading || !username || validateUsername(username)}
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Setting Username...
                  </>
                ) : (
                  <>
                    <i className="fas fa-check"></i>
                    Confirm Username
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
