import { useState } from 'react';
import { auth } from '../firebaseConfig';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      router.push('/store');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <Head>
        <title>{isSignUp ? 'Sign Up' : 'Login'} | Guess The Price</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
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
                  e.target.borderColor = '#CB7AE1';
                  e.target.boxShadow = '0 0 10px rgba(203, 122, 225, 0.2)';
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
                  e.target.borderColor = '#CB7AE1';
                  e.target.boxShadow = '0 0 10px rgba(203, 122, 225, 0.2)';
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

            <button type="submit" style={{
              background: 'linear-gradient(135deg, #FF8833 0%, #ff7711 100%)',
              color: '#F2F2F2',
              border: 'none',
              padding: '15px 30px',
              fontSize: '1.1rem',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.3s ease',
              boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)',
              margin: '10px 5px',
              fontFamily: '"Quicksand", sans-serif',
              width: '100%',
              maxWidth: '300px'
            }}
              onMouseOver={(e) => {
                e.target.background = 'linear-gradient(135deg, #ff7711 0%, #FF8833 100%)';
                e.target.transform = 'translateY(-3px)';
                e.target.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.3)';
              }}
              onMouseOut={(e) => {
                e.target.background = 'linear-gradient(135deg, #FF8833 0%, #ff7711 100%)';
                e.target.transform = 'translateY(0)';
                e.target.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.2)';
              }}
            >
              {isSignUp ? 'Create Account' : 'Login'} <i className={`fas ${isSignUp ? 'fa-user-plus' : 'fa-sign-in-alt'}`} style={{ marginLeft: '8px' }}></i>
            </button>
          </form>

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
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => e.target.color = '#FF8833'}
              onMouseOut={(e) => e.target.color = '#CB7AE1'}
            >
              {isSignUp ? 'Login instead' : 'Sign up now'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
