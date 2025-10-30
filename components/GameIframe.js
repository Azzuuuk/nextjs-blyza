// components/GameIframe.js - Wrapper component for game iframes with tracking

import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebaseconfig';
import { incrementOnGameOpen } from '../lib/stats';

export default function GameIframe({ gameId, gameHtml, title = "Game" }) {
  useEffect(() => {
    // Track game open when component mounts, but wait for auth state
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log('GameIframe: User authenticated, tracking game open for:', gameId);
        try {
          const forceEveryOpen = gameId === 'game1' || gameId === 'game2';
          await incrementOnGameOpen(user.uid, gameId, { bypassSession: forceEveryOpen });
          console.log('GameIframe: Successfully tracked game open');
        } catch (error) {
          console.error('GameIframe: Failed to track game open:', error);
        }
      } else {
        console.log('GameIframe: User not authenticated, skipping tracking');
      }
    });

    return () => unsubscribe();
  }, [gameId]);

  return (
    <iframe
      src={`/funny/${gameHtml}`}
      style={{
        width: '100vw',
        height: '100vh',
        border: 'none'
      }}
      title={title}
    />
  );
}
