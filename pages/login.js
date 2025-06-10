// pages/login.js

import { useState } from 'react';
import { auth } from '/firebaseconfig'; // Keep your existing path
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { signInWithGooglePopup } from '../lib/authUtils'; // Import the new Google sign-in function

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // Add loading state

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true); // Set loading true
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      router.push('/store');
    } catch (err) {
      setError(err.message);
      console.error("Email/Password Auth Error:", err.message);
    } finally {
      setLoading(false); // Set loading false
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true); // Set loading true
    try {
      await signInWithGooglePopup();
      router.push('/store');
    } catch (err) {
      setError(err.message); // Display error message from authUtils
      console.error("Google Sign-in Error:", err.message);
    } finally {
      setLoading(false); // Set loading false
    }
  };

  return (
    <>
      <Head>
        <title>{isSignUp ? 'Sign Up' : 'Login'} | Guess The Price</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Bungee&family=Luckiest+Guy&family=Quicksand:wght@300..700&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </Head>
      
      <div style={{
        fontFamily: "'Quicksand', sans-serif",
        background: 'linear-gradient(135deg, #1a1c20 0%, #0f1012 100%)',
        color: '#F2F2F2',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
        lineHeight: '1.6'
      }}>
        <div style={{
          maxWidth: '500px',
          width: '100%',
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          padding: '40px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>

          {/* Back to Home Button */}
          <button
            onClick={() => router.push('/')}
            aria-label="Back to Home"
            style={{
              position: 'absolute',
              top: '20px',
              left: '20px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#F2F2F2',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              zIndex: 10,
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <i className="fas fa-home"></i>
          </button>
          
          <h1 style={{
            fontFamily: '"Bungee", cursive',
            fontSize: '3rem',
            marginBottom: '30px',
            color: '#F2F2F2',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.3), 0 8px 16px rgba(0, 0, 0, 0.2)',
            letterSpacing: '1px'
          }}>
            {isSignUp ? 'Sign Up' : 'Login'}
          </h1>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                required
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  maxWidth: '300px',
                  padding: '15px 20px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  fontSize: '1.1rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: '#F2F2F2',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#CB7AE1';
                  e.currentTarget.style.boxShadow = '0 0 10px rgba(203, 122, 225, 0.2)';
                }}
                onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.boxShadow = 'none';
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
                  maxWidth: '300px',
                  padding: '15px 20px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  fontSize: '1.1rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: '#F2F2F2',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#CB7AE1';
                  e.currentTarget.style.boxShadow = '0 0 10px rgba(203, 122, 225, 0.2)';
                }}
                onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>

            {error && (
              <div style={{
                color: '#ff4b2b',
                marginBottom: '20px',
                padding: '10px',
                background: 'rgba(255, 75, 43, 0.1)',
                borderRadius: '8px',
                border: '1px solid rgba(255, 75, 43, 0.3)'
              }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              background: 'linear-gradient(135deg, #FF8833 0%, #ff7711 100%)',
              color: '#F2F2F2',
              border: 'none',
              padding: '15px 30px',
              fontSize: '1.1rem',
              borderRadius: '12px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              transition: 'all 0.3s ease',
              boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)',
              margin: '10px auto', /* Changed from '10px 5px' to '10px auto' */
              fontFamily: '"Quicksand", sans-serif',
              width: '100%',
              maxWidth: '300px',
              opacity: loading ? 0.7 : 1,
            }}
              onMouseOver={(e) => {
                if (!loading) {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #ff7711 0%, #FF8833 100%)';
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.3)';
                }
              }}
              onMouseOut={(e) => {
                if (!loading) {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #FF8833 0%, #ff7711 100%)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.2)';
                }
              }}
            >
              {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Login')} <i className={`fas ${isSignUp ? 'fa-user-plus' : 'fa-sign-in-alt'}`} style={{ marginLeft: '8px' }}></i>
            </button>
          </form>

          {/* Divider with "OR" */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '30px 0',
            color: 'rgba(242, 242, 242, 0.5)',
            fontSize: '1rem',
            fontWeight: 'bold',
          }}>
            <hr style={{
              flexGrow: 1,
              border: 'none',
              borderTop: '1px solid rgba(242, 242, 242, 0.2)',
              margin: '0 15px',
            }} />
            OR
            <hr style={{
              flexGrow: 1,
              border: 'none',
              borderTop: '1px solid rgba(242, 242, 242, 0.2)',
              margin: '0 15px',
            }} />
          </div>

          {/* Google Sign-in Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            style={{
              background: '#4285F4', // Google brand color
              color: '#F2F2F2',
              border: 'none',
              padding: '15px 30px',
              fontSize: '1.1rem',
              borderRadius: '12px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              transition: 'all 0.3s ease',
              boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)',
              margin: '10px auto', /* Changed from '10px 5px' to '10px auto' */
              fontFamily: '"Quicksand", sans-serif',
              width: '100%',
              maxWidth: '300px',
              opacity: loading ? 0.7 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseOver={(e) => {
              if (!loading) {
                e.currentTarget.style.background = '#357ae8';
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.3)';
              }
            }}
            onMouseOut={(e) => {
              if (!loading) {
                e.currentTarget.style.background = '#4285F4';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.2)';
              }
            }}
          >
            <i className="fab fa-google" style={{ marginRight: '10px' }}></i>
            {loading ? 'Signing in...' : 'Sign in with Google'}
          </button>

          <div style={{ marginTop: '30px', color: 'rgba(242, 242, 242, 0.7)' }}>
            {isSignUp ? 'Already have an account?' : 'Need an account?'}{' '}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              style={{
                color: '#CB7AE1',
                background: 'none',
                border: 'none',
                fontSize: '1rem',
                cursor: 'pointer',
                fontWeight: '600',
                textDecoration: 'underline',
                transition: 'all 0.3s ease',
                padding: '0'
              }}
              onMouseOver={(e) => e.currentTarget.style.color = '#FF8833'}
              onMouseOut={(e) => e.currentTarget.style.color = '#CB7AE1'}
            >
              {isSignUp ? 'Login instead' : 'Sign up now'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}