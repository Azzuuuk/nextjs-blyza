// pages/debug.js - Debug page for testing game tracking and user data

import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebaseconfig';
import { getUserProfile, ensureUserDoc } from '../lib/user';
import { incrementOnGameOpen } from '../lib/stats';

export default function DebugPage() {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [testResults, setTestResults] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        try {
          // Ensure user document exists
          await ensureUserDoc(user.uid);
          
          // Get user profile
          const profile = await getUserProfile(user.uid);
          setUserProfile(profile);
          
          addTestResult('✅ User authenticated and profile loaded');
        } catch (error) {
          addTestResult('❌ Error loading user profile: ' + error.message);
        }
      } else {
        setUserProfile(null);
        addTestResult('❌ User not authenticated');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addTestResult = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setTestResults(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const testUsernameCreation = async () => {
    if (!user) {
      addTestResult('❌ Cannot test username creation - user not authenticated');
      return;
    }

    try {
      addTestResult('🧪 Testing username creation...');
      
      // Test direct document creation
      const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
      const { db } = await import('../lib/firestore');
      
      const testUsername = 'testuser' + Date.now();
      
      // Test username document creation
      const usernameRef = doc(db, 'usernames', testUsername);
      await setDoc(usernameRef, {
        uid: user.uid,
        claimedAt: serverTimestamp()
      });
      
      addTestResult('✅ Username document created successfully');
      
      // Test user document update
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        username: testUsername,
        lastSeen: serverTimestamp()
      }, { merge: true });
      
      addTestResult('✅ User document updated successfully');
      addTestResult(`✅ Test username "${testUsername}" created successfully`);
      
    } catch (error) {
      addTestResult('❌ Username creation test failed: ' + error.message);
      console.error('Username creation error:', error);
    }
  };

  const testGameTracking = async () => {
    if (!user) {
      addTestResult('❌ Cannot test game tracking - user not authenticated');
      return;
    }

    try {
      addTestResult('🧪 Testing game tracking...');
      await incrementOnGameOpen(user.uid, 'debug-test-game');
      
      // Refresh user profile
      const updatedProfile = await getUserProfile(user.uid);
      setUserProfile(updatedProfile);
      
      addTestResult('✅ Game tracking test completed');
    } catch (error) {
      addTestResult('❌ Game tracking test failed: ' + error.message);
    }
  };

  const clearSessionStorage = () => {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      sessionStorage.clear();
      addTestResult('✅ Session storage cleared');
    }
  };

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading...</div>;
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Debug Page</h1>
      
      <h2>Authentication Status</h2>
      <p>User: {user ? `${user.uid} (${user.email})` : 'Not authenticated'}</p>
      
      <h2>User Profile Data</h2>
      <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
        {userProfile ? JSON.stringify(userProfile, null, 2) : 'No profile data'}
      </pre>
      
      <h2>Test Actions</h2>
      <button onClick={testGameTracking} style={{ margin: '5px', padding: '10px' }}>
        Test Game Tracking
      </button>
      <button onClick={testUsernameCreation} style={{ margin: '5px', padding: '10px', backgroundColor: '#ff9800' }}>
        Test Username Creation
      </button>
      <button onClick={clearSessionStorage} style={{ margin: '5px', padding: '10px' }}>
        Clear Session Storage
      </button>
      <button onClick={() => window.location.reload()} style={{ margin: '5px', padding: '10px' }}>
        Reload Page
      </button>
      
      <h2>Test Results</h2>
      <div style={{ background: '#f0f0f0', padding: '10px', borderRadius: '4px', height: '200px', overflow: 'auto' }}>
        {testResults.map((result, index) => (
          <div key={index}>{result}</div>
        ))}
      </div>
    </div>
  );
}
