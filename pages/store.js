import { useEffect, useState, useRef } from 'react';
import Head from 'next/head';
import { auth } from '/firebaseconfig'; 
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useRouter } from 'next/router';

// Product data with added logoUrl
const products = [
  { id: 1, name: '🍕 50% Off Pizza Hut', description: 'Get half off any large pizza!', discountCode: 'PIZZA50', logoUrl: 'https://upload.wikimedia.org/wikipedia/sco/thumb/d/d2/Pizza_Hut_logo.svg/217px-Pizza_Hut_logo.svg.png'},
  { id: 2, name: '👟 10% Off Nike Shoes', description: 'Valid on all new collections.', discountCode: 'NIKE10', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Logo_NIKE.svg/170px-Logo_NIKE.svg.png'},
  { id: 3, name: '☕ Buy 1 Get 1 Free at Starbucks', description: 'Any drink, any size!', discountCode: 'STARBOGO', logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/d/d3/Starbucks_Corporation_Logo_2011.svg/184px-Starbucks_Corporation_Logo_2011.svg.png'},
  { id: 4, name: '🎮 15% Off Steam Game', description: 'Discount on any game purchase over $20.', discountCode: 'STEAM15', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Steam_icon_logo.svg/240px-Steam_icon_logo.svg.png'},
  { id: 5, name: '🎬 Free Month of Netflix', description: 'Valid for new or returning subscribers.', discountCode: 'NETFLIXFREE', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/190px-Netflix_2015_logo.svg.png'},
  { id: 6, name: '📱 Free 5GB Roaming Data', description: 'Valid for new or returning subscribers.', discountCode: '5FREEE', logoUrl: 'https://1000logos.net/wp-content/uploads/2024/06/Verizon-Logo.png'},
];

const blyzaColors = {
    primary: '#FF8833', secondary: '#CB7AE1', light: '#F2F2F2',
    success: '#00BFA6', danger: '#ff4b2b', dark: '#1a1c20',
    darker: '#0f1012', info: '#4ECDC4',
};

const buttonBaseStyle = {
    color: blyzaColors.light, border: 'none', padding: '15px 30px', fontSize: '1.1rem',
    borderRadius: '12px', cursor: 'pointer', fontWeight: '600', transition: 'all 0.3s ease',
    boxShadow: '0 5px 15px rgba(0,0,0,0.2)', fontFamily: '"Quicksand", sans-serif',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
};
const primaryButtonStyle = { ...buttonBaseStyle, background: `linear-gradient(135deg, ${blyzaColors.primary} 0%, #ff7711 100%)`};
const dangerButtonStyle = { ...buttonBaseStyle, background: `linear-gradient(135deg, ${blyzaColors.danger} 0%, #ff416c 100%)`};
const secondaryButtonStyle = { ...buttonBaseStyle, background: `linear-gradient(135deg, ${blyzaColors.secondary} 0%, #b85cd6 100%)`};

const cardStyle = {
    background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', borderRadius: '20px', padding: '25px',
    width: '300px', boxShadow: '0 10px 25px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)', transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '320px'
};
const logoStyle = {
    display: 'block', maxWidth: '60%', maxHeight: '80px', height: 'auto', margin: '0 auto 15px auto',
    objectFit: 'contain', filter: 'brightness(0) invert(1)'
};
const iconButtonStyle = {
    position: 'fixed', top: '20px', right: '20px', background: 'rgba(255,255,255,0.1)', color: blyzaColors.light,
    border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%', width: '45px', height: '45px',
    fontSize: '1.2rem', cursor: 'pointer', transition: 'all 0.3s ease', display: 'flex',
    justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: 0, margin: 0,
    boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
};

export default function StorePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [revealedCodes, setRevealedCodes] = useState({});
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [sfxEnabled, setSfxEnabled] = useState(true);
  const [musicVolume, setMusicVolume] = useState(0.2);
  const [showFeedback, setShowFeedback] = useState(false); // Corrected: Added setShowFeedback
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const bgMusicRef = useRef(null);
  const interactionSoundRef = useRef(null);
  const purchaseSoundRef = useRef(null);

  const playSound = (audioRef, volume = 0.7) => {
    if (sfxEnabled && audioRef && audioRef.current) { // Added audioRef check
      audioRef.current.currentTime = 0;
      audioRef.current.volume = volume;
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
    if (bgMusicRef.current) { // Check if ref is set
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
      if (bgMusicRef.current && bgMusicRef.current.paused && musicVolume > 0) { // Check ref
        bgMusicRef.current.play().catch(e => console.log("BGM play on interaction failed."));
      }
    };
    document.body.addEventListener('click', playBGMOnInteraction, { once: true });
    return () => document.body.removeEventListener('click', playBGMOnInteraction);
  }, [musicVolume]); // musicVolume dependency is important here

  const triggerConfetti = () => {
    const confettiCount = 100;
    const colors = [blyzaColors.primary, blyzaColors.secondary, blyzaColors.success, blyzaColors.light];
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
        confettiPiece.style.animation = `fallAndFade_confetti ${animDuration}s linear forwards`; // Use global animation
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
    setFeedbackMessage('Discount Redeemed!');
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

  const handleBack = () => { playSound(interactionSoundRef); router.back(); };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: `linear-gradient(135deg, ${blyzaColors.dark} 0%, ${blyzaColors.darker} 100%)`, color: blyzaColors.light, fontFamily: "'Quicksand', sans-serif" }}>
        <svg width="72" height="72" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          {/* SVG Style using defined Blyza colors - no need for var() here if defined in Head */}
          <style>{`.spinner_9y7u{animation:spinner_fUkk 2.4s linear infinite;animation-delay:-2.4s; fill: ${blyzaColors.primary};} .spinner_DF2s{animation-delay:-1.6s; fill: ${blyzaColors.secondary};} .spinner_q27e{animation-delay:-.8s; fill: ${blyzaColors.success};} @keyframes spinner_fUkk{8.33%{x:13px;y:1px}25%{x:13px;y:1px}33.3%{x:13px;y:13px}50%{x:13px;y:13px}58.33%{x:1px;y:13px}75%{x:1px;y:13px}83.33%{x:1px;y:1px}}`}</style>
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
        <title>Bonus Store | Blyza</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Bungee&family=Luckiest+Guy&family=Quicksand:wght@300..700&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        <style jsx global>{`
            :root { /* Ensure CSS variables are available */
                --primary: ${blyzaColors.primary};
                --secondary: ${blyzaColors.secondary};
                --success: ${blyzaColors.success};
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

       <button style={iconButtonStyle} onClick={() => { playSound(interactionSoundRef); setShowSettingsModal(true);}} aria-label="Open Settings">
            <i className="fas fa-cog"></i>
       </button>

      {showSettingsModal && (
        <div style={{ position: 'fixed', zIndex: 2000, left: 0, top: 0, width: '100%', height: '100%', overflow: 'auto', backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: "'Quicksand', sans-serif" }}>
          <div style={{ backgroundColor: blyzaColors.darker, margin: 'auto', padding: '30px', border: `1px solid rgba(255,255,255,0.2)`, borderRadius: '15px', width: '90%', maxWidth: '500px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', position: 'relative', color: blyzaColors.light }}>
            <span style={{ color: '#aaa', position: 'absolute', top: '15px', right: '20px', fontSize: '28px', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => { playSound(interactionSoundRef); setShowSettingsModal(false); }}>×</span>
            <h2 style={{ fontFamily: '"Bungee", cursive', color: blyzaColors.primary, textAlign: 'center', marginBottom: '25px' }}>Settings</h2>
            <div style={{ marginBottom: '20px' }}>
              <label htmlFor="bgm-volume" style={{ marginBottom: '8px', fontWeight: 600, display: 'block' }}>BGM Volume:</label>
              <input type="range" id="bgm-volume" min="0" max="1" step="0.01" value={musicVolume} onChange={(e) => setMusicVolume(parseFloat(e.target.value))} style={{ width: '100%', cursor: 'pointer' }}/>
            </div>
            <div>
              <label htmlFor="sfx-toggle" style={{ marginBottom: '8px', fontWeight: 600, display: 'block' }}>SFX:</label>
              <button id="sfx-toggle" style={{ ...secondaryButtonStyle, width: '100%' }} onClick={() => { setSfxEnabled(!sfxEnabled); playSound(interactionSoundRef); }}>{sfxEnabled ? 'SFX: ON' : 'SFX: OFF'}</button>
            </div>
          </div>
        </div>
      )}

       {showFeedback && (
            <div style={{
                position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', // Initial transform for animation
                backgroundColor: `rgba(0, 191, 166, 0.95)`, // --success with alpha
                color: blyzaColors.light, padding: '30px 50px', borderRadius: '20px',
                fontSize: '2.2rem', fontFamily: '"Bungee", cursive', textAlign: 'center',
                zIndex: 3000, boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
                border: `2px solid ${blyzaColors.success}`,
                opacity: 0, // Start hidden for animation
                animation: 'feedbackPopupAnim 2.5s ease-out forwards'
            }}>
                <i className="fas fa-check-circle" style={{ marginRight: '10px' }}></i>
                {feedbackMessage}
            </div>
        )}

      <div style={{ padding: '40px 20px', minHeight: '100vh', background: `linear-gradient(135deg, ${blyzaColors.dark} 0%, ${blyzaColors.darker} 100%)`, fontFamily: "'Quicksand', sans-serif", color: blyzaColors.light, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: '100%', maxWidth: '1100px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' }}>
          <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
            <img src="https://static.wixstatic.com/shapes/9ce3e5_4f0149a89dd841859da02f59247b5b6b.svg" alt="Blyza Logo" style={{ height: '50px', filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.2))' }} />
            <h1 style={{ fontFamily: '"Luckiest Guy", cursive', fontSize: 'clamp(2rem, 5vw, 3rem)', color: blyzaColors.light, textShadow: '0 12px 16px rgba(0,0,0,0.3), 0 24px 34px rgba(0,0,0,0.2)', letterSpacing: '1px', margin: 0 }}>
              Blyza Store! 🛒
            </h1>
          </div>
          <div style={{ display: 'flex', gap: '15px' }}>
            <button onClick={handleBack} style={secondaryButtonStyle} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-3px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                <i className="fas fa-arrow-left" style={{ marginRight: '8px' }}></i> Back
            </button>
            <button onClick={handleLogout} style={dangerButtonStyle} onMouseOver={e => { e.currentTarget.style.background = 'linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)'; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.3)';}} onMouseOut={e => { e.currentTarget.style.background = 'linear-gradient(135deg, #ff4b2b 0%, #ff416c 100%)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.2)';}}>
              <i className="fas fa-sign-out-alt" style={{ marginRight: '8px' }}></i> Logout
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '30px', width: '100%', maxWidth: '1200px' }}>
          {products.map((product) => (
            <div key={product.id} style={cardStyle} onMouseOver={e => { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.boxShadow = '0 15px 35px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.1)';}} onMouseOut={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = cardStyle.boxShadow;}}>
              <div>
                 <img src={product.logoUrl} alt={`${product.name} Logo`} style={logoStyle} />
                 <h2 style={{ color: blyzaColors.primary, fontSize: '1.6rem', marginBottom: '10px', fontFamily: '"Bungee", cursive', lineHeight: '1.3' }}>
                  {product.name}
                </h2>
                <p style={{ color: 'rgba(242,242,242,0.85)', marginBottom: '20px', fontSize: '1rem' }}>
                    {product.description}
                </p>
              </div>
              <div style={{ marginTop: 'auto' }}>
                {!revealedCodes[product.id] ? (
                  <button onClick={() => handleReveal(product.id)} style={{ ...primaryButtonStyle, width: '100%' }} onMouseOver={e => { e.currentTarget.style.background = `linear-gradient(135deg, #ff7711 0%, ${blyzaColors.primary} 100%)`; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.3)';}} onMouseOut={e => { e.currentTarget.style.background = `linear-gradient(135deg, ${blyzaColors.primary} 0%, #ff7711 100%)`; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.2)';}}>
                    <i className="fas fa-gift" style={{ marginRight: '8px' }}></i> Claim Prize
                  </button>
                ) : (
                  <div style={{ marginTop: '15px', padding: '12px 15px', borderRadius: '10px', background: 'rgba(0,191,166,0.1)', border: '1px solid rgba(0,191,166,0.3)', textAlign: 'center' }}>
                    <p style={{ fontWeight: 'bold', fontSize: '1rem', color: blyzaColors.success, margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                       <i className="fas fa-check-circle"></i> Discount Code:
                    </p>
                     <span style={{ fontFamily: 'monospace', fontSize: '1.2rem', color: blyzaColors.light, display: 'block', marginTop: '5px', wordBreak: 'break-all' }}>
                          {product.discountCode}
                      </span>
                  </div>
                )}
               </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}