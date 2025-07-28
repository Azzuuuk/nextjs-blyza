// pages/login.js

import { useState } from 'react';
import { auth } from '/firebaseconfig'; // Keep your existing path
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { signInWithGooglePopup } from '../lib/authUtils'; // Import the new Google sign-in function

// --- BRAND IDENTITY STYLES (from games.html & store.js) ---
const blyzaTheme = {
    colors: {
        primary: '#FF8833',
        secondary: '#CB7AE1',
        accent: '#00BFA6',
        yellow: '#FFDF00',
        pink: '#FF00FF',
        red: '#EA2027',
        googleBlue: '#4285F4',
        textLight: '#FDFEFE',
        textDark: '#2C3A47',
        textMedium: '#535c68',
        blackStroke: '#1A1A1A',
    },
    fonts: {
        logo: '"Luckiest Guy", cursive',
        heading: '"Bungee", cursive',
        body: '"Quicksand", sans-serif',
    },
    shadows: {
        chunky: `4px 4px 0px #1A1A1A`,
    },
    borders: {
        radius: '12px',
        stroke: `3px solid #1A1A1A`,
    }
};

const retroButtonStyle = {
    fontFamily: blyzaTheme.fonts.heading,
    fontSize: '1rem',
    padding: '0.8em 1.5em',
    border: blyzaTheme.borders.stroke,
    borderRadius: '8px',
    textTransform: 'uppercase',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    transition: 'transform 0.1s ease, box-shadow 0.1s ease',
    letterSpacing: '1px',
    cursor: 'pointer',
    boxShadow: blyzaTheme.shadows.chunky,
    width: '100%',
    maxWidth: '320px',
};

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // --- NEW: Helper function to handle dynamic redirects after login ---
  const getRedirectUrl = () => {
    const { redirect, ...restQuery } = router.query;
    // Default to '/store' if no redirect path is specified in the URL
    const redirectPath = redirect || '/store';
    // Rebuild the query string from any other params (like 'claim')
    const queryParams = new URLSearchParams(restQuery).toString();
    // Combine them for the final redirect URL
    return queryParams ? `${redirectPath}?${queryParams}` : redirectPath;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      // --- MODIFIED: Redirect dynamically based on URL query params ---
      router.push(getRedirectUrl());
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''));
      console.error("Email/Password Auth Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithGooglePopup();
      // --- MODIFIED: Redirect dynamically based on URL query params ---
      router.push(getRedirectUrl());
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''));
      console.error("Google Sign-in Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>{isSignUp ? 'Sign Up' : 'Login'} | Blyza</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Bungee&family=Luckiest+Guy&family=Quicksand:wght@300..700&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        <style jsx global>{`
            body { overflow-x: hidden; position: relative; }
            .bg-auth-element {
                position: absolute; opacity: 0.08; color: ${blyzaTheme.colors.textLight};
                animation: floatSimple 20s infinite ease-in-out alternate; user-select: none;
            }
            @keyframes floatSimple {
                0% { transform: translateY(0px) rotate(var(--initial-rotate, 0deg)); }
                50% { transform: translateY(-25px) rotate(calc(var(--initial-rotate, 0deg) + 8deg)); }
                100% { transform: translateY(0px) rotate(calc(var(--initial-rotate, 0deg) - 8deg)); }
            }
        `}</style>
      </Head>
      
      {/* FIXED STRUCTURE: Background is now separate from the content container */}
      
      {/* --- Floating background elements layer --- */}
      <div style={{ position: 'fixed', top:0, left:0, width:'100%', height:'100%', zIndex:0, pointerEvents: 'none' }}>
          <i className="fas fa-key bg-auth-element" style={{ fontSize: 130, top: '15%', right: '10%', '--initial-rotate': '20deg', animationDuration: '16s' }}></i>
          <i className="fas fa-user-circle bg-auth-element" style={{ fontSize: 150, top: '10%', left: '5%', '--initial-rotate': '-15deg', animationDuration: '22s' }}></i>
          <i className="fas fa-lock bg-auth-element" style={{ fontSize: 120, top: '70%', right: '15%', '--initial-rotate': '5deg', animationDuration: '25s' }}></i>
          <i className="fas fa-ghost bg-auth-element" style={{ fontSize: 130, top: '65%', left: '8%', '--initial-rotate': '10deg', animationDuration: '18s' }}></i>
      </div>

      {/* --- Content layer --- */}
      <div style={{
        fontFamily: blyzaTheme.fonts.body,
        background: `linear-gradient(135deg, ${blyzaTheme.colors.primary} 0%, ${blyzaTheme.colors.secondary} 100%)`,
        color: blyzaTheme.colors.textDark,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
        lineHeight: '1.6',
        position: 'relative',
        zIndex: 1, // Ensure content is above the background
      }}>
        
        {/* Back to Home Button */}
        <button
            onClick={() => router.push('/')}
            aria-label="Back to Home"
            style={{
              ...retroButtonStyle,
              position: 'absolute',
              top: '20px',
              left: '20px',
              backgroundColor: blyzaTheme.colors.secondary,
              color: blyzaTheme.colors.textLight,
              width: 'auto',
              maxWidth: 'none', // Override width constraints for this specific button
              zIndex: 10,
            }}
          >
            <i className="fas fa-home"></i> Back to Games
          </button>

        <div style={{
          maxWidth: '500px',
          width: '100%',
          background: 'linear-gradient(145deg, #fdfefe, #e9ecef)',
          borderRadius: blyzaTheme.borders.radius,
          border: blyzaTheme.borders.stroke,
          boxShadow: blyzaTheme.shadows.chunky,
          padding: '40px',
          textAlign: 'center',
          position: 'relative',
        }}>
          
          <h1 style={{
            fontFamily: blyzaTheme.fonts.logo,
            fontSize: 'clamp(2.8rem, 8vw, 4rem)',
            color: blyzaTheme.colors.textLight,
            WebkitTextStroke: `2px ${blyzaTheme.colors.blackStroke}`,
            textStroke: `2px ${blyzaTheme.colors.blackStroke}`,
            textShadow: `3px 3px 0px rgba(0,0,0,0.25)`,
            marginBottom: '30px',
            lineHeight: 1.1
          }}>
            {isSignUp ? 'Create Account' : 'Welcome Back!'}
          </h1>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                required
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '15px 20px',
                  borderRadius: '8px',
                  border: blyzaTheme.borders.stroke,
                  fontSize: '1rem',
                  background: blyzaTheme.colors.textLight,
                  color: blyzaTheme.colors.textDark,
                  fontFamily: blyzaTheme.fonts.body,
                  fontWeight: 600,
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '30px' }}>
              <input
                type="password"
                placeholder="Password"
                value={password}
                required
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '15px 20px',
                  borderRadius: '8px',
                  border: blyzaTheme.borders.stroke,
                  fontSize: '1rem',
                  background: blyzaTheme.colors.textLight,
                  color: blyzaTheme.colors.textDark,
                  fontFamily: blyzaTheme.fonts.body,
                  fontWeight: 600,
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {error && (
              <div style={{
                color: blyzaTheme.colors.textLight,
                marginBottom: '20px',
                padding: '10px 15px',
                background: blyzaTheme.colors.red,
                borderRadius: '8px',
                border: blyzaTheme.borders.stroke,
                fontWeight: 'bold',
                fontFamily: blyzaTheme.fonts.body,
              }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
                ...retroButtonStyle,
                background: blyzaTheme.colors.primary,
                color: blyzaTheme.colors.textLight,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Login')} <i className={`fas ${isSignUp ? 'fa-user-plus' : 'fa-sign-in-alt'}`} style={{ marginLeft: '8px' }}></i>
            </button>
          </form>

          <div style={{
            display: 'flex', alignItems: 'center', margin: '30px 0',
            fontFamily: blyzaTheme.fonts.heading, color: blyzaTheme.colors.textMedium
          }}>
            <hr style={{ flexGrow: 1, border: 'none', borderTop: `2px solid ${blyzaTheme.colors.textMedium}`, opacity: 0.5 }} />
            <span style={{ margin: '0 15px' }}>OR</span>
            <hr style={{ flexGrow: 1, border: 'none', borderTop: `2px solid ${blyzaTheme.colors.textMedium}`, opacity: 0.5 }} />
          </div>

          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            style={{
              ...retroButtonStyle,
              background: blyzaTheme.colors.googleBlue,
              color: blyzaTheme.colors.textLight,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            <i className="fab fa-google" style={{ marginRight: '10px' }}></i>
            {loading ? 'Signing in...' : 'Continue with Google'}
          </button>

          <div style={{ marginTop: '30px', color: blyzaTheme.colors.textMedium, fontWeight: 600 }}>
            {isSignUp ? 'Already have an account?' : 'Need an account?'}{' '}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              style={{
                color: blyzaTheme.colors.secondary,
                background: 'none',
                border: 'none',
                fontSize: '1rem',
                cursor: 'pointer',
                fontWeight: '700',
                fontFamily: blyzaTheme.fonts.body,
                textDecoration: 'underline',
                padding: '0 5px'
              }}
            >
              {isSignUp ? 'Login here' : 'Sign up now'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}