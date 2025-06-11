// pages/store.js

import { useEffect, useState, useRef } from 'react';
import Head from 'next/head';
import { auth } from '/firebaseconfig'; 
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useRouter } from 'next/router';
import { Analytics } from '@vercel/analytics/react';

// Product data with added logoUrl
const products = [
  { id: 1, name: '🍕 50% Off Pizza Hut', description: 'Get half off any large pizza!', discountCode: 'PIZZA50', logoUrl: 'https://upload.wikimedia.org/wikipedia/sco/thumb/d/d2/Pizza_Hut_logo.svg/217px-Pizza_Hut_logo.svg.png'},
  { id: 2, name: '👟 10% Off Nike Shoes', description: 'Valid on all new collections.', discountCode: 'NIKE10', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Logo_NIKE.svg/170px-Logo_NIKE.svg.png'},
  { id: 3, name: '☕ Buy 1 Get 1 Free at Starbucks', description: 'Any drink, any size!', discountCode: 'STARBOGO', logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/d/d3/Starbucks_Corporation_Logo_2011.svg/184px-Starbucks_Corporation_Logo_2011.svg.png'},
  { id: 4, name: '🎮 15% Off Steam Game', description: 'Discount on any game purchase over $20.', discountCode: 'STEAM15', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Steam_icon_logo.svg/240px-Steam_icon_logo.svg.png'},
  { id: 5, name: '🎬 Free Month of Netflix', description: 'Valid for new or returning subscribers.', discountCode: 'NETFLIXFREE', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/190px-Netflix_2015_logo.svg.png'},
  { id: 6, name: '📱 Free 5GB Roaming Data', description: 'Valid for new or returning subscribers.', discountCode: '5FREEE', logoUrl: 'https://1000logos.net/wp-content/uploads/2024/06/Verizon-Logo.png'},
];

// --- BRAND IDENTITY STYLES (from games.html) ---
const blyzaTheme = {
    colors: {
        primary: '#FF8833',
        secondary: '#CB7AE1',
        accent: '#00BFA6',
        yellow: '#FFDF00',
        pink: '#FF00FF',
        red: '#EA2027',
        textLight: '#FDFEFE',
        textDark: '#2C3A47',
        textMedium: '#535c68',
        blackStroke: '#1A1A1A',
        darkerGreyBg: '#4A4A4A',
    },
    fonts: {
        logo: '"Luckiest Guy", cursive',
        heading: '"Bungee", cursive',
        body: '"Quicksand", sans-serif',
    },
    shadows: {
        chunky: `4px 4px 0px #1A1A1A`,
        chunkyYellow: `6px 6px 0px #FFDF00`,
    },
    borders: {
        radius: '12px',
        stroke: `3px solid #1A1A1A`,
    }
};

const retroButtonBaseStyle = {
    fontFamily: blyzaTheme.fonts.heading,
    fontSize: '1rem',
    padding: '0.7em 1.5em',
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
};

const cardStyle = {
    background: 'linear-gradient(145deg, #fdfefe, #e9ecef)',
    borderRadius: blyzaTheme.borders.radius,
    border: blyzaTheme.borders.stroke,
    boxShadow: blyzaTheme.shadows.chunky,
    padding: '1.5em',
    textAlign: 'center',
    cursor: 'pointer',
    position: 'relative',
    color: blyzaTheme.colors.textDark,
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    minHeight: '340px',
    width: '300px',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease',
};

const logoStyle = {
    display: 'block', maxWidth: '60%', maxHeight: '80px', height: 'auto', margin: '0 auto 15px auto',
    objectFit: 'contain',
};

const settingsIconStyle = {
    ...retroButtonBaseStyle,
    position: 'fixed',
    top: '20px',
    left: '20px',
    backgroundColor: blyzaTheme.colors.secondary,
    color: blyzaTheme.colors.textLight,
    borderRadius: '50%',
    width: '55px',
    height: '55px',
    padding: 0,
    zIndex: 100,
};

// --- NEW Dashboard Button Style ---
const dashboardIconStyle = {
    ...retroButtonBaseStyle,
    position: 'fixed',
    top: '20px',
    right: '20px',
    backgroundColor: blyzaTheme.colors.accent,
    color: blyzaTheme.colors.textLight,
    borderRadius: '50%',
    width: '55px',
    height: '55px',
    padding: 0,
    zIndex: 100,
};

export default function StorePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [revealedCodes, setRevealedCodes] = useState({});
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showDashboardModal, setShowDashboardModal] = useState(false); // New state for dashboard
  const [sfxEnabled, setSfxEnabled] = useState(true);
  const [musicVolume, setMusicVolume] = useState(0.2);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const bgMusicRef = useRef(null);
  const interactionSoundRef = useRef(null);
  const purchaseSoundRef = useRef(null);

  const playSound = (audioRef) => {
    if (sfxEnabled && audioRef && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.error("SFX play error:", e));
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) setUser(currentUser);
      else router.push('/login');
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (bgMusicRef.current) {
      bgMusicRef.current.volume = musicVolume;
      if (musicVolume > 0 && bgMusicRef.current.paused) {
        bgMusicRef.current.play().catch(e => console.log("BGM autoplay prevented by browser."));
      } else if (musicVolume === 0) {
        bgMusicRef.current.pause();
      }
    }
  }, [musicVolume]);

  useEffect(() => {
    const playBGMOnInteraction = () => {
      if (bgMusicRef.current && bgMusicRef.current.paused && musicVolume > 0) {
        bgMusicRef.current.play().catch(e => console.log("BGM play on interaction failed."));
      }
    };
    document.body.addEventListener('click', playBGMOnInteraction, { once: true });
    return () => document.body.removeEventListener('click', playBGMOnInteraction);
  }, [musicVolume]);

  const triggerConfetti = () => {
    const confettiCount = 100;
    const colors = [blyzaTheme.colors.primary, blyzaTheme.colors.secondary, blyzaTheme.colors.accent, blyzaTheme.colors.yellow];
    const container = document.body;

    for (let i = 0; i < confettiCount; i++) {
        const confettiPiece = document.createElement('div');
        confettiPiece.style.position = 'fixed';
        confettiPiece.style.left = `${Math.random() * 100}vw`;
        confettiPiece.style.top = `${Math.random() * -50 - 20}px`;
        confettiPiece.style.width = `${Math.random() * 8 + 5}px`;
        confettiPiece.style.height = `${Math.random() * 15 + 10}px`;
        confettiPiece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confettiPiece.style.opacity = '1';
        confettiPiece.style.zIndex = '9999';
        confettiPiece.style.transform = `rotate(${Math.random() * 360}deg)`;
        const animDuration = Math.random() * 3 + 2;
        confettiPiece.style.animation = `fallAndFade_confetti ${animDuration}s linear forwards`;
        confettiPiece.style.animationDelay = `${Math.random() * 0.5}s`;
        container.appendChild(confettiPiece);
        setTimeout(() => {
            confettiPiece.remove();
        }, (animDuration + parseFloat(confettiPiece.style.animationDelay || 0)) * 1000 + 500);
    }
  };

  const handleReveal = (id) => {
    playSound(purchaseSoundRef);
    setRevealedCodes((prev) => ({ ...prev, [id]: true }));
    setFeedbackMessage('Prize Claimed!');
    setShowFeedback(true);
    triggerConfetti();
    setTimeout(() => setShowFeedback(false), 2500);
  };

  const handleLogout = async () => {
    playSound(interactionSoundRef);
    try {
      await signOut(auth); router.push('/login');
    } catch (error) { console.error("Logout failed:", error); }
  };

  const handleBack = () => { 
    playSound(interactionSoundRef); 
    router.push('/'); 
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: `linear-gradient(135deg, ${blyzaTheme.colors.primary} 0%, ${blyzaTheme.colors.secondary} 100%)`, color: blyzaTheme.colors.textLight, fontFamily: blyzaTheme.fonts.body }}>
        <svg width="72" height="72" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <style>{`.spinner_9y7u{animation:spinner_fUkk 2.4s linear infinite;animation-delay:-2.4s; fill: ${blyzaTheme.colors.yellow};} .spinner_DF2s{animation-delay:-1.6s; fill: ${blyzaTheme.colors.pink};} .spinner_q27e{animation-delay:-.8s; fill: ${blyzaTheme.colors.accent};} @keyframes spinner_fUkk{8.33%{x:13px;y:1px}25%{x:13px;y:1px}33.3%{x:13px;y:13px}50%{x:13px;y:13px}58.33%{x:1px;y:13px}75%{x:1px;y:13px}83.33%{x:1px;y:1px}}`}</style>
          <rect className="spinner_9y7u" x="1" y="1" rx="1" width="10" height="10"/>
          <rect className="spinner_9y7u spinner_DF2s" x="1" y="1" rx="1" width="10" height="10"/>
          <rect className="spinner_9y7u spinner_q27e" x="1" y="1" rx="1" width="10" height="10"/>
        </svg>
        <p style={{ marginTop: '20px', fontSize: '1.2rem' }}>Loading Store...</p>
      </div>
    );
  }
  if (!user) return null;

  return (
    <>
      <Head>
        <title>Blyza Store | Game Center</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Bungee&family=Luckiest+Guy&family=Quicksand:wght@300..700&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        <style jsx global>{`
            body { overflow-x: hidden; position: relative; }
            .bg-store-element {
                position: absolute; opacity: 0.08; color: ${blyzaTheme.colors.textLight};
                animation: floatSimple 20s infinite ease-in-out alternate; user-select: none;
            }
            .contact-link {
                color: ${blyzaTheme.colors.textLight};
                text-decoration: none;
                transition: color 0.2s ease;
            }
            .contact-link:hover {
                color: ${blyzaTheme.colors.yellow};
            }
            @keyframes floatSimple {
                0% { transform: translateY(0px) rotate(var(--initial-rotate, 0deg)); }
                50% { transform: translateY(-25px) rotate(calc(var(--initial-rotate, 0deg) + 8deg)); }
                100% { transform: translateY(0px) rotate(calc(var(--initial-rotate, 0deg) - 8deg)); }
            }
            @keyframes fallAndFade_confetti {
                0% { transform: translateY(-20vh) rotate(0deg); opacity: 1; }
                100% { transform: translateY(120vh) rotate(720deg); opacity: 0; }
            }
            @keyframes feedbackPopupAnim {
                0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
                15% { opacity: 1; transform: translate(-50%, -50%) scale(1.05); }
                30% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                85% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
            }
        `}</style>
      </Head>

      <audio ref={bgMusicRef} loop src="https://static.wixstatic.com/mp3/9ce3e5_380adfaea802407b9a4cebc67f12a216.mp3" />
      <audio ref={interactionSoundRef} src="https://static.wixstatic.com/mp3/9ce3e5_fc326aa1760c485dbac083ec55c2bfcb.wav" />
      <audio ref={purchaseSoundRef} src="https://static.wixstatic.com/mp3/9ce3e5_15e6f508ee7f4840a781873003e33347.wav" />

      {/* --- Floating background elements --- */}
      <div style={{ position: 'fixed', top:0, left:0, width:'100%', height:'100%', zIndex:0, pointerEvents: 'none' }}>
        <i className="fas fa-gift bg-store-element" style={{ fontSize: 130, top: '15%', right: '10%', '--initial-rotate': '20deg', animationDuration: '16s' }}></i>
        <i className="fas fa-tags bg-store-element" style={{ fontSize: 150, top: '10%', left: '5%', '--initial-rotate': '-15deg', animationDuration: '22s' }}></i>
        <i className="fas fa-dollar-sign bg-store-element" style={{ fontSize: 120, top: '70%', right: '15%', '--initial-rotate': '5deg', animationDuration: '25s' }}></i>
        <i className="fas fa-star bg-store-element" style={{ fontSize: 130, top: '65%', left: '8%', '--initial-rotate': '10deg', animationDuration: '18s' }}></i>
      </div>
      
      {/* --- Page Buttons --- */}
       <button style={settingsIconStyle} onClick={() => { playSound(interactionSoundRef); setShowSettingsModal(true);}} aria-label="Open Settings">
            <i className="fas fa-cog"></i>
       </button>
       <button style={dashboardIconStyle} onClick={() => { playSound(interactionSoundRef); setShowDashboardModal(true);}} aria-label="Open Dashboard">
            <i className="fas fa-wallet"></i>
       </button>

      {/* --- Modals --- */}
      {showSettingsModal && (
        <div style={{ position: 'fixed', zIndex: 2000, left: 0, top: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: blyzaTheme.fonts.body }}>
          <div style={{ backgroundColor: blyzaTheme.colors.darkerGreyBg, margin: 'auto', padding: '25px', border: blyzaTheme.borders.stroke, borderRadius: blyzaTheme.borders.radius, width: '90%', maxWidth: '450px', boxShadow: `8px 8px 0px rgba(0,0,0,0.4)`, position: 'relative', color: blyzaTheme.colors.textLight }}>
            <span style={{ color: '#aaa', position: 'absolute', top: '10px', right: '15px', fontSize: '28px', fontWeight: 'bold', cursor: 'pointer', transition: 'color 0.2s' }} onClick={() => { playSound(interactionSoundRef); setShowSettingsModal(false); }}>×</span>
            <h2 style={{ fontFamily: blyzaTheme.fonts.logo, color: blyzaTheme.colors.primary, WebkitTextStroke: `1.5px ${blyzaTheme.colors.blackStroke}`, textStroke: `1.5px ${blyzaTheme.colors.blackStroke}`, textAlign: 'center', marginBottom: '25px', fontSize: '2rem' }}>Settings</h2>
            <div style={{ marginBottom: '18px' }}>
              <label htmlFor="bgm-volume" style={{ marginBottom: '10px', fontWeight: 600, display: 'block' }}>Music Volume:</label>
              <input type="range" id="bgm-volume" min="0" max="1" step="0.01" value={musicVolume} onChange={(e) => setMusicVolume(parseFloat(e.target.value))} style={{ width: '100%', cursor: 'pointer' }}/>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label htmlFor="sfx-toggle" style={{ marginBottom: '10px', fontWeight: 600, display: 'block' }}>Sound Effects:</label>
              <button id="sfx-toggle" style={{ ...retroButtonBaseStyle, backgroundColor: sfxEnabled ? blyzaTheme.colors.accent : blyzaTheme.colors.pink, color: blyzaTheme.colors.textLight, width: '100%' }} onClick={() => { setSfxEnabled(!sfxEnabled); playSound(interactionSoundRef); }}>{sfxEnabled ? 'SFX: ON' : 'SFX: OFF'}</button>
            </div>
          </div>
        </div>
      )}

      {showDashboardModal && ( // --- NEW Dashboard Modal ---
        <div style={{ position: 'fixed', zIndex: 2000, left: 0, top: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: blyzaTheme.fonts.body }}>
          <div style={{ backgroundColor: blyzaTheme.colors.darkerGreyBg, margin: 'auto', padding: '25px', border: blyzaTheme.borders.stroke, borderRadius: blyzaTheme.borders.radius, width: '90%', maxWidth: '450px', boxShadow: `8px 8px 0px rgba(0,0,0,0.4)`, position: 'relative', color: blyzaTheme.colors.textLight }}>
            <span style={{ color: '#aaa', position: 'absolute', top: '10px', right: '15px', fontSize: '28px', fontWeight: 'bold', cursor: 'pointer', transition: 'color 0.2s' }} onClick={() => { playSound(interactionSoundRef); setShowDashboardModal(false); }}>×</span>
            <h2 style={{ fontFamily: blyzaTheme.fonts.logo, color: blyzaTheme.colors.accent, WebkitTextStroke: `1.5px ${blyzaTheme.colors.blackStroke}`, textStroke: `1.5px ${blyzaTheme.colors.blackStroke}`, textAlign: 'center', marginBottom: '25px', fontSize: '2rem' }}>Dashboard</h2>
            
            <div style={{ textAlign: 'center', padding: '15px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', marginBottom: '25px' }}>
                <p style={{ margin: 0, fontFamily: blyzaTheme.fonts.heading, fontSize: '1rem', textTransform: 'uppercase' }}>Blyza Bucks</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontFamily: blyzaTheme.fonts.heading, fontSize: '3rem', color: blyzaTheme.colors.yellow, margin: '5px 0' }}>
                    <i className="fas fa-coins" style={{ fontSize: '2.5rem' }}></i>
                    <span>0</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>Feature coming soon!</p>
            </div>
            
            <div style={{ textAlign: 'center' }}>
                <h3 style={{fontFamily: blyzaTheme.fonts.heading, marginBottom: '15px' }}>Need Help?</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', fontSize: '1rem' }}>
                    <a href="mailto:support@blyza.com" className='contact-link'>
                        <i className="fas fa-envelope" style={{ marginRight: '8px' }}></i>
                        support@blyza.com {/* <-- REPLACE THIS */}
                    </a>
                    <a href="https://twitter.com/BlyzaGames" target="_blank" rel="noopener noreferrer" className='contact-link'>
                        <i className="fab fa-twitter" style={{ marginRight: '8px' }}></i>
                        @BlyzaGames {/* <-- REPLACE THIS */}
                    </a>
                </div>
            </div>

          </div>
        </div>
      )}

       {showFeedback && (
            <div style={{
                position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                backgroundColor: blyzaTheme.colors.accent,
                color: blyzaTheme.colors.textLight, padding: '30px 50px', borderRadius: '20px',
                fontSize: '2rem', fontFamily: blyzaTheme.fonts.heading, textAlign: 'center',
                zIndex: 3000, boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
                border: `3px solid ${blyzaTheme.colors.blackStroke}`,
                opacity: 0,
                animation: 'feedbackPopupAnim 2.5s ease-out forwards'
            }}>
                <i className="fas fa-check-circle" style={{ marginRight: '10px' }}></i>
                {feedbackMessage}
            </div>
        )}

      <div style={{ padding: '80px 20px 40px', minHeight: '100vh', background: `linear-gradient(135deg, ${blyzaTheme.colors.primary} 0%, ${blyzaTheme.colors.secondary} 100%)`, fontFamily: blyzaTheme.fonts.body, color: blyzaTheme.colors.textLight, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 2, boxSizing: 'border-box' }}>
        <header style={{ width: '100%', maxWidth: '1100px', textAlign: 'center', marginBottom: '40px', marginTop: '40px' }}>
            <h1 style={{ fontFamily: blyzaTheme.fonts.logo, fontSize: 'clamp(2.8rem, 6vw, 4rem)', color: blyzaTheme.colors.textLight, WebkitTextStroke: `2px ${blyzaTheme.colors.blackStroke}`, textStroke: `2px ${blyzaTheme.colors.blackStroke}`, textShadow: `3px 3px 0px rgba(0,0,0,0.25)`, marginBottom: '0.25em', lineHeight: 1.1 }}>
              Blyza Bonus Store
            </h1>
            <p style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)', color: blyzaTheme.colors.yellow, fontWeight: 500, maxWidth: '550px', margin: '0 auto' }}>
                Awesome rewards, just for playing!
            </p>
        </header>

        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '2.5em', width: '100%', maxWidth: '1200px' }}>
          {products.map((product) => (
            <div key={product.id} 
                style={cardStyle} 
                onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-8px) scale(1.03)'; e.currentTarget.style.boxShadow = blyzaTheme.shadows.chunkyYellow; e.currentTarget.style.borderColor = blyzaTheme.colors.primary; }} 
                onMouseOut={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = blyzaTheme.shadows.chunky; e.currentTarget.style.borderColor = blyzaTheme.colors.blackStroke; }}
            >
              <div>
                 <img src={product.logoUrl} alt={`${product.name} Logo`} style={logoStyle} />
                 <h2 style={{ color: blyzaTheme.colors.textDark, fontSize: '1.5rem', marginBottom: '0.5em', fontFamily: blyzaTheme.fonts.heading, lineHeight: '1.3' }}>
                  {product.name}
                </h2>
                <p style={{ color: blyzaTheme.colors.textMedium, marginBottom: '1em', fontSize: '0.95rem', flexGrow: 1 }}>
                    {product.description}
                </p>
              </div>
              <div style={{ marginTop: 'auto' }}>
                {!revealedCodes[product.id] ? (
                  <button onClick={() => handleReveal(product.id)} style={{ ...retroButtonBaseStyle, backgroundColor: blyzaTheme.colors.primary, color: blyzaTheme.colors.textLight, width: '100%' }}>
                    <i className="fas fa-gift" style={{ marginRight: '8px' }}></i> Claim Prize
                  </button>
                ) : (
                  <div style={{ marginTop: '15px', padding: '12px 15px', borderRadius: '10px', background: `rgba(0, 191, 166, 0.1)`, border: `2px solid ${blyzaTheme.colors.accent}`, textAlign: 'center' }}>
                    <p style={{ fontWeight: 'bold', fontSize: '0.9rem', color: blyzaTheme.colors.accent, margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                       <i className="fas fa-check-circle"></i> DISCOUNT CODE:
                    </p>
                     <span style={{ fontFamily: 'monospace', fontSize: '1.2rem', color: blyzaTheme.colors.textDark, display: 'block', marginTop: '5px', wordBreak: 'break-all' }}>
                          {product.discountCode}
                      </span>
                  </div>
                )}
               </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '15px', marginTop: '50px' }}>
            <button onClick={handleBack} style={{...retroButtonBaseStyle, backgroundColor: blyzaTheme.colors.secondary, color: blyzaTheme.colors.textLight }}>
                <i className="fas fa-arrow-left"></i> Back to Games
            </button>
            <button onClick={handleLogout} style={{...retroButtonBaseStyle, backgroundColor: blyzaTheme.colors.red, color: blyzaTheme.colors.textLight }}>
              <i className="fas fa-sign-out-alt"></i> Logout
            </button>
        </div>

      </div>
      <Analytics />
    </>
  );
}