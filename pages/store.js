// pages/store.js

import { useEffect, useState, useRef } from 'react';
import Head from 'next/head';
import { auth, db } from '../firebaseconfig'; 
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, onSnapshot, collection, query as fsQuery, where, getDocs } from 'firebase/firestore';
import { useRouter } from 'next/router';
import { Analytics } from '@vercel/analytics/react';
import Script from 'next/script'; // Import the Script component for Google Analytics
import { subscribeStoreItems, subscribeUserPurchases, redeemItem, getUnlockedLink } from '../lib/store';

// Sample items to display if Firestore is empty
const sampleItems = [
  { 
    id: 'asos-discount', 
    title: '👕👚 20% Off ASOS', 
    description: 'Get 20% off your first order from ASOS!', 
    cost: 10,
    image: 'https://static.wixstatic.com/media/9ce3e5_2f723e743da5432ca8a2dacabc1ca5a6~mv2.png',
    active: true
  },
  { 
    id: 'nordvpn-discount', 
    title: '🔒🌐 73% Off NordVPN', 
    description: '73% off NordVPN + up to 10GB free eSIM data from Saily', 
    cost: 10,
    image: 'https://static.wixstatic.com/media/9ce3e5_81024d4b65444bc1b34168c24ae59fa2~mv2.png',
    active: true
  },
  { 
    id: 'gymshark-discount', 
    title: '🏋🏽🔥 10$ off Gymshark', 
    description: 'Get 10$ off your first order from Gymshark!', 
    cost: 10,
    image: 'https://cdn.gymshark.com/images/branding/gs-icon-text.svg',
    active: true
  },
  { 
    id: 'nike-discount', 
    title: '👟 15% Off Nike', 
    description: 'Save 15% on your next Nike purchase!', 
    cost: 10,
    image: 'https://via.placeholder.com/100x100/000000/FFFFFF?text=NIKE',
    active: true
  },
  { 
    id: 'spotify-discount', 
    title: '🎵 2 Months Free Spotify', 
    description: 'Get 2 months of Spotify Premium for free!', 
    cost: 10,
    image: 'https://via.placeholder.com/100x100/1DB954/FFFFFF?text=SPOTIFY',
    active: true
  },
  { 
    id: 'amazon-discount', 
    title: '📦 $10 Amazon Credit', 
    description: 'Receive $10 credit for your Amazon account!', 
    cost: 10,
    image: 'https://via.placeholder.com/100x100/FF9900/FFFFFF?text=AMAZON',
    active: true
  }
];

// Product data with added brandInfo for the new modal
const products = [
  { 
    id: 1, 
    name: '👕👚 20% Off ASOS', 
    description: 'Get 20% off your first order from ASOS!', 
    discountCode: 'http://bit.ly/3TylIMH', 
    logoUrl: 'https://static.wixstatic.com/media/9ce3e5_2f723e743da5432ca8a2dacabc1ca5a6~mv2.png',
    brandInfo: {
        name: 'ASOS',
        website: 'https://www.asos.com/',
        description: 'ASOS is a global online fashion and beauty powerhouse targeting fashion-forward 20-somethings. It curates products from over 850 popular brands while also producing its own extensive range of in-house labels like ASOS DESIGN. The brand is particularly renowned for its commitment to inclusivity, offering a wide array of sizes through its ASOS Curve, Tall, Petite, and Maternity lines, making it a digital destination for discovering the latest trends at an accessible price point.',
        imageUrl: 'https://static.wixstatic.com/media/9ce3e5_2f723e743da5432ca8a2dacabc1ca5a6~mv2.png'
    }
  },
  { 
    id: 2, 
    name: '🔒🌐 73% Off NordVPN', 
    description: '73% off NordVPN + up to 10GB free eSIM data from Saily', 
    discountCode: 'https://bit.ly/448iWmg', 
    logoUrl: 'https://static.wixstatic.com/media/9ce3e5_81024d4b65444bc1b34168c24ae59fa2~mv2.png',
    brandInfo: {
        name: 'NordVPN',
        website: 'https://nordvpn.com/',
        description: 'NordVPN is a top-tier virtual private network (VPN) service designed for robust security and high-speed performance. It secures users online activity by routing their internet traffic through an encrypted tunnel, making it safe to use public Wi-Fi and protecting personal data from hackers and trackers. With a massive network of servers worldwide, NordVPN also allows users to bypass geo-restrictions granting access to global streaming content while maintaining a strict no-logs policy to ensure complete user privacy.', 
        imageUrl: 'https://static.wixstatic.com/media/9ce3e5_81024d4b65444bc1b34168c24ae59fa2~mv2.png'
    }
  },
  { 
    id: 3, 
    name: '🏋🏽🔥 10$ off Gymshark', 
    description: 'Get 10$ off your first order from Gymshark!', 
    discountCode: 'https://bit.ly/44bNuDL', 
    logoUrl: 'https://cdn.gymshark.com/images/branding/gs-icon-text.svg',
    brandInfo: {
        name: 'Gymshark', 
        website: 'https://www.gymshark.com/',
        description: 'Gymshark is a UK-based fitness apparel brand that has become a global phenomenon, particularly among young gym-goers and the "conditioning" community. The company revolutionized fitness marketing by shunning traditional advertising in favor of building a massive, loyal following through social media and a dedicated team of "Gymshark Athletes." Known for its form-fitting, high-performance apparel like its iconic seamless leggings, the brand creates clothing designed to enhance physique and support intense training, embodying the culture of modern fitness and dedication to personal progress.',
        imageUrl: 'https://cdn.gymshark.com/images/branding/gs-icon-text.svg'
    }
  },
  { 
    id: 4, 
    name: '🎥💻 18$ Off D5 Render', 
    description: 'Get 18$ off your yearly subscription from D5 Render!', 
    discountCode: 'https://bit.ly/4jZDrra', 
    logoUrl: 'https://static.wixstatic.com/media/9ce3e5_6f6d99d4f4074a1d87d4a8fda9415b59~mv2.webp',
    brandInfo: {
        name: 'D5 Render',
        website: 'https://www.d5render.com/',
        description: 'D5 Render is a powerful, real-time rendering software that leverages cutting-edge ray tracing technology, primarily accelerated by NVIDIAs RTX graphics cards. It is specifically designed for professionals in architecture, interior design, and landscape visualization, offering an intuitive workflow to transform 3D models into photorealistic images, videos, and virtual reality experiences. Unlike traditional renderers, D5 bridges the gap between ultra-fast speed and high-fidelity quality, allowing designers to see their creative decisions reflected in a life-like environment instantly.',
        imageUrl: 'https://static.wixstatic.com/media/9ce3e5_6f6d99d4f4074a1d87d4a8fda9415b59~mv2.webp'
    }
  },
  { 
    id: 5, 
    name: '💸📱 Free rewards with WISE!', 
    description: 'Get a Wise card or your first International transfer, up to 500 EUR for FREE!', 
    discountCode: 'https://bit.ly/4kTdcnL', 
    logoUrl: 'https://static.wixstatic.com/media/9ce3e5_91d4369c4555495b82d49f2a400657ea~mv2.png',
    brandInfo: {
        name: 'WISE',
        website: 'https://wise.com/',
        description: 'Wise, formerly known as TransferWise, is a fintech company that revolutionized international money transfers. It was founded to challenge the hidden fees and poor exchange rates offered by traditional banks, operating on a principle of complete transparency. Wise core innovation is using the real mid-market exchange rate—the one you see on Google—for all transactions and charging a small, upfront fee. Beyond simple transfers, Wise has expanded into a comprehensive international banking alternative, offering a multi-currency account to hold and exchange dozens of currencies and a debit card for spending abroad without hidden charges.',
        imageUrl: 'https://static.wixstatic.com/media/9ce3e5_91d4369c4555495b82d49f2a400657ea~mv2.png'
    }
  },
  { 
    id: 6, 
    name: '🛍️🛒 100€ off Temu!', 
    description: 'Get a 100€ coupon bundle for Temu!', 
    discountCode: 'https://bit.ly/3GbkMLd', 
    logoUrl: 'https://static.wixstatic.com/media/9ce3e5_07bad846661c4db18f6d069a56154e96~mv2.png',
    brandInfo: {
        name: 'Temu',
        website: 'https://www.temu.com/',
        description: 'Temu is a rapidly growing online marketplace, owned by Chinese e-commerce giant PDD Holdings, that has gone viral for its slogan "Shop like a Billionaire." The platforms main appeal is its astonishingly low prices on an enormous catalog of consumer goods, ranging from fashion and home decor to electronics and tools. It achieves this by connecting Western consumers directly with manufacturers and suppliers, cutting out middlemen. Temu is also known for its highly gamified shopping experience, using frequent flash sales, countdown timers, and referral bonuses to drive user engagement and rapid sales.',
        imageUrl: 'https://static.wixstatic.com/media/9ce3e5_07bad846661c4db18f6d069a56154e96~mv2.png'
    }
  },
];

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

const infoButtonStyle = {
    position: 'absolute',
    top: '15px',
    right: '15px',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: 'rgba(44, 58, 71, 0.7)',
    color: 'white',
    border: '2px solid white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    zIndex: 5,
    transition: 'all 0.2s ease',
};

export default function StorePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [revealedCodes, setRevealedCodes] = useState({});
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showDashboardModal, setShowDashboardModal] = useState(false);
  const [sfxEnabled, setSfxEnabled] = useState(true);
  const [musicVolume, setMusicVolume] = useState(0.2);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [showBrandInfoModal, setShowBrandInfoModal] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [blyzaBucks, setBlyzaBucks] = useState(0); // <-- NEW: State for Blyza Bucks
  
  // NEW: Store redemption state
  const [storeItems, setStoreItems] = useState([]);
  const [userPurchases, setUserPurchases] = useState([]);
  const [redeeming, setRedeeming] = useState(null); // itemId being redeemed

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
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // NEW: useEffect to subscribe to real-time Blyza Bucks from user profile
  useEffect(() => {
    if (!user) {
      setBlyzaBucks(0);
      return;
    }

    // Subscribe to user profile for Blyza Bucks
    const unsubscribeUser = onSnapshot(doc(db, 'users', user.uid), (doc) => {
      if (doc.exists()) {
        const userData = doc.data();
        setBlyzaBucks(userData.blyzaBucks || 0);
      }
    });

    return () => {
      unsubscribeUser();
    };
  }, [user]);

  // NEW: Subscribe to store items catalog
  useEffect(() => {
    const unsubscribeItems = subscribeStoreItems((items) => {
      setStoreItems(items);
    }, { includeAll: !!user });

    return () => {
      unsubscribeItems();
    };
  }, [user]);

  // NEW: Subscribe to user purchases
  useEffect(() => {
    if (!user) {
      setUserPurchases([]);
      return;
    }

    const unsubscribePurchases = subscribeUserPurchases(user.uid, (purchases) => {
      setUserPurchases(purchases);
    });

    return () => {
      unsubscribePurchases();
    };
  }, [user]);


  useEffect(() => {
    if (!router.isReady || !user) return;

    const { claim } = router.query;
    if (claim && !revealedCodes[claim]) {
      handleReveal(claim);
      
      const { pathname, query } = router;
      delete query.claim;
      router.replace({ pathname, query }, undefined, { shallow: true });
    }
  }, [router.isReady, user, revealedCodes, router.query]);


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
    setRevealedCodes((prev) => ({ ...prev, [String(id)]: true }));
    setFeedbackMessage('Prize Claimed!');
    setShowFeedback(true);
    triggerConfetti();
    setTimeout(() => setShowFeedback(false), 2500);
  };
  
  // NEW: Handle store item redemption
  const handleRedeemItem = async (item) => {
    if (!user || redeeming === item.id) return;

    const itemId = item.id;
    console.log('🔄 Starting redemption for item:', itemId, 'title:', item.title || item.name);
    console.log('💰 Current Blyza Bucks:', blyzaBucks);
    console.log('👤 User UID:', user.uid);

    setRedeeming(itemId);
    playSound(interactionSoundRef);

    try {
      console.log('📞 Calling redeemItem function...');
      const result = await redeemItem(user.uid, itemId);
      console.log('📋 Redemption result:', result);
      
      if (result.status === 'ok') {
        setFeedbackMessage(result.message);
        playSound(purchaseSoundRef);
        triggerConfetti();
      } else if (result.status === 'notFound') {
        // Retry by matching against Firestore-loaded items by title/name if IDs differ from sample
        const targetTitle = (item.title || item.name || '').trim();
        const candidate = storeItems.find(si => (si.title || si.name || '').trim() === targetTitle);
        if (candidate && candidate.id !== itemId) {
          console.warn('🔁 Retrying redemption with Firestore ID:', candidate.id, 'for title:', targetTitle);
          const retry = await redeemItem(user.uid, candidate.id);
          console.log('📋 Redemption retry result:', retry);
          if (retry.status === 'ok') {
            setFeedbackMessage(retry.message);
            playSound(purchaseSoundRef);
            triggerConfetti();
          } else {
            setFeedbackMessage(retry.message || 'Item not available.');
            console.warn('❌ Redemption retry failed:', retry);
          }
        } else if (!candidate) {
          // As a last resort, look up Firestore by title to find the real ID
          try {
            console.warn('🔎 No local Firestore match; querying Firestore by title:', targetTitle);
            const q = fsQuery(collection(db, 'storeItems'), where('title', '==', targetTitle));
            const snap = await getDocs(q);
            if (!snap.empty) {
              const realId = snap.docs[0].id;
              console.warn('🔁 Retrying redemption with Firestore ID from lookup:', realId);
              const retry2 = await redeemItem(user.uid, realId);
              console.log('📋 Redemption retry2 result:', retry2);
              if (retry2.status === 'ok') {
                setFeedbackMessage(retry2.message);
                playSound(purchaseSoundRef);
                triggerConfetti();
              } else {
                setFeedbackMessage(retry2.message || 'Item not available.');
                console.warn('❌ Redemption retry2 failed:', retry2);
              }
            } else {
              setFeedbackMessage('Item not available.');
              console.warn('❌ No Firestore item found by title');
            }
          } catch (e) {
            console.error('💥 Firestore title lookup failed:', e);
            setFeedbackMessage('Unable to locate item. Please try again.');
          }
        } else {
          setFeedbackMessage(result.message || 'Item not available.');
          console.warn('❌ Redemption failed (no Firestore match by title):', result);
        }
      } else {
        setFeedbackMessage(result.message);
        console.warn('❌ Redemption failed:', result);
      }
      
      setShowFeedback(true);
      setTimeout(() => setShowFeedback(false), 3000);
      
    } catch (error) {
      console.error('💥 Redemption error:', error);
      setFeedbackMessage('Failed to redeem item. Please try again.');
      setShowFeedback(true);
      setTimeout(() => setShowFeedback(false), 3000);
    } finally {
      setRedeeming(null);
    }
  };

  // NEW: Handle viewing unlocked content
  const handleViewUnlocked = async (itemId) => {
    if (!user) return;

    playSound(interactionSoundRef);

    const ensureAbsoluteUrl = (raw) => {
      if (!raw) return null;
      const url = String(raw).trim();
      if (/^https?:\/\//i.test(url)) return url;
      // Prepend https:// if protocol is missing
      return `https://${url.replace(/^\/+/, '')}`;
    };

    try {
      const link = await getUnlockedLink(user.uid, itemId);
      const absolute = ensureAbsoluteUrl(link);
      if (absolute) {
        window.open(absolute, '_blank', 'noopener,noreferrer');
      } else {
        setFeedbackMessage('Unable to access content. Please try again.');
        setShowFeedback(true);
        setTimeout(() => setShowFeedback(false), 2500);
      }
    } catch (error) {
      console.error('Error viewing unlocked content:', error);
      setFeedbackMessage('Error accessing content. Please try again.');
      setShowFeedback(true);
      setTimeout(() => setShowFeedback(false), 2500);
    }
  };

  const handleClaimClick = (product) => {
    if (revealedCodes[product.id]) return;

    if (user) {
      handleReveal(product.id);
    } else {
      playSound(interactionSoundRef);
      router.push(`/login?redirect=/store&claim=${product.id}`);
    }
  };

  const handleShowBrandInfo = (e, brandInfo) => {
    e.stopPropagation(); 
    playSound(interactionSoundRef);
    setSelectedBrand(brandInfo);
    setShowBrandInfoModal(true);
  };

  const handleCopyCode = async (code, id) => {
    playSound(interactionSoundRef);
    if (!navigator.clipboard) {
        console.error("Clipboard API not available.");
        return;
    }
    try {
        await navigator.clipboard.writeText(code);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
        console.error('Failed to copy code: ', err);
    }
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

  return (
    <>
      <Script 
        src="https://www.googletagmanager.com/gtag/js?id=G-N5PBKM0DNQ" 
        strategy="afterInteractive" 
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-N5PBKM0DNQ');
        `}
      </Script>

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
            .contact-link, .brand-website-link {
                color: ${blyzaTheme.colors.textLight};
                text-decoration: none;
                transition: color 0.2s ease;
            }
            .contact-link:hover, .brand-website-link:hover {
                color: ${blyzaTheme.colors.yellow};
                text-decoration: underline;
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

      <div style={{ position: 'fixed', top:0, left:0, width:'100%', height:'100%', zIndex:0, pointerEvents: 'none' }}>
        <i className="fas fa-gift bg-store-element" style={{ fontSize: 130, top: '15%', right: '10%', '--initial-rotate': '20deg', animationDuration: '16s' }}></i>
        <i className="fas fa-tags bg-store-element" style={{ fontSize: 150, top: '10%', left: '5%', '--initial-rotate': '-15deg', animationDuration: '22s' }}></i>
        <i className="fas fa-dollar-sign bg-store-element" style={{ fontSize: 120, top: '70%', right: '15%', '--initial-rotate': '5deg', animationDuration: '25s' }}></i>
        <i className="fas fa-star bg-store-element" style={{ fontSize: 130, top: '65%', left: '8%', '--initial-rotate': '10deg', animationDuration: '18s' }}></i>
      </div>
      
       <button style={settingsIconStyle} onClick={() => { playSound(interactionSoundRef); setShowSettingsModal(true);}} aria-label="Open Settings">
            <i className="fas fa-cog"></i>
       </button>
       {user && (
            <button style={dashboardIconStyle} onClick={() => { playSound(interactionSoundRef); setShowDashboardModal(true);}} aria-label="Open Dashboard">
                <i className="fas fa-wallet"></i>
            </button>
       )}

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

      {showDashboardModal && (
        <div style={{ position: 'fixed', zIndex: 2000, left: 0, top: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: blyzaTheme.fonts.body }}>
          <div style={{ backgroundColor: blyzaTheme.colors.darkerGreyBg, margin: 'auto', padding: '25px', border: blyzaTheme.borders.stroke, borderRadius: blyzaTheme.borders.radius, width: '90%', maxWidth: '450px', boxShadow: `8px 8px 0px rgba(0,0,0,0.4)`, position: 'relative', color: blyzaTheme.colors.textLight }}>
            <span style={{ color: '#aaa', position: 'absolute', top: '10px', right: '15px', fontSize: '28px', fontWeight: 'bold', cursor: 'pointer', transition: 'color 0.2s' }} onClick={() => { playSound(interactionSoundRef); setShowDashboardModal(false); }}>×</span>
            <h2 style={{ fontFamily: blyzaTheme.fonts.logo, color: blyzaTheme.colors.accent, WebkitTextStroke: `1.5px ${blyzaTheme.colors.blackStroke}`, textStroke: `1.5px ${blyzaTheme.colors.blackStroke}`, textAlign: 'center', marginBottom: '25px', fontSize: '2rem' }}>Dashboard</h2>
            <div style={{ textAlign: 'center', padding: '15px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', marginBottom: '25px' }}>
                <p style={{ margin: 0, fontFamily: blyzaTheme.fonts.heading, fontSize: '1rem', textTransform: 'uppercase' }}>Blyza Bucks</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontFamily: blyzaTheme.fonts.heading, fontSize: '3rem', color: blyzaTheme.colors.yellow, margin: '5px 0' }}>
                    <i className="fas fa-coins" style={{ fontSize: '2.5rem' }}></i>
                    {/* UPDATED: Display Blyza Bucks from state */}
                    <span>{blyzaBucks.toLocaleString()}</span>
                </div>      
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>Earn more by playing games!</p>
            </div>
            <div style={{ textAlign: 'center' }}>
                <h3 style={{fontFamily: blyzaTheme.fonts.heading, marginBottom: '15px' }}>Need Help?</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', fontSize: '1rem' }}>
                    <a href="mailto: azaan@joinblyza.com" className='contact-link'>
                        <i className="fas fa-envelope" style={{ marginRight: '8px' }}></i>
                        azaan@joinblyza.com
                    </a>
                    <a href="https://instagram.com/playblyza" target="_blank" rel="noopener noreferrer" className='contact-link'>
                        <i className="fab fa-instagram" style={{ marginRight: '8px' }}></i>
                        @PlayBlyza
                    </a>
                </div>
            </div>
          </div>
        </div>
      )}

      {showBrandInfoModal && selectedBrand && (
        <div style={{ position: 'fixed', zIndex: 2000, left: 0, top: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: blyzaTheme.fonts.body }}>
          <div style={{ backgroundColor: blyzaTheme.colors.darkerGreyBg, margin: 'auto', padding: '25px', border: blyzaTheme.borders.stroke, borderRadius: blyzaTheme.borders.radius, width: '90%', maxWidth: '450px', boxShadow: `8px 8px 0px rgba(0,0,0,0.4)`, position: 'relative', color: blyzaTheme.colors.textLight }}>
            <span style={{ color: '#aaa', position: 'absolute', top: '10px', right: '15px', fontSize: '28px', fontWeight: 'bold', cursor: 'pointer', transition: 'color 0.2s' }} onClick={() => { playSound(interactionSoundRef); setShowBrandInfoModal(false); setSelectedBrand(null); }}>×</span>
            <img src={selectedBrand.imageUrl} alt={`${selectedBrand.name} logo`} style={{ display: 'block', width: 'auto', maxHeight: '100px', margin: '10px auto 25px auto', borderRadius: '8px' }} />
            <h2 style={{ fontFamily: blyzaTheme.fonts.logo, color: blyzaTheme.colors.primary, WebkitTextStroke: `1.5px ${blyzaTheme.colors.blackStroke}`, textStroke: `1.5px ${blyzaTheme.colors.blackStroke}`, textAlign: 'center', marginBottom: '15px', fontSize: '2rem' }}>{selectedBrand.name}</h2>
            <p style={{ textAlign: 'center', marginBottom: '25px', lineHeight: '1.6' }}>{selectedBrand.description}</p>
            <a href={selectedBrand.website} target="_blank" rel="noopener noreferrer" style={{ ...retroButtonBaseStyle, display: 'flex', width: '80%', margin: '0 auto', backgroundColor: blyzaTheme.colors.yellow, color: blyzaTheme.colors.textDark, boxShadow: blyzaTheme.shadows.chunky }}>
                <i className="fas fa-globe"></i> Visit Website
            </a>
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
            <h1 style={{ fontFamily: blyzaTheme.fonts.logo, fontSize: 'clamp(2.8rem, 6vw, 4rem)', color: blyzaTheme.colors.textLight, WebkitTextStroke: `3.5px ${blyzaTheme.colors.blackStroke}`, textStroke: `2px ${blyzaTheme.colors.blackStroke}`, textShadow: `3px 3px 0px rgba(0,0,0,0.25)`, marginBottom: '0.25em', lineHeight: 1.1 }}>
              Blyza Store 🛍 
            </h1>
            <p style={{ fontSize: 'clamp(2rem, 3vw, 1.2rem)', color: blyzaTheme.colors.yellow, fontWeight: 2000, maxWidth: '550px', margin: '0 auto', textShadow: '0 0 8px rgba(4, 4, 4, 0.7)', }}>
                Awesome rewards, just for playing!
            </p>
        </header>

        {/* Blyza Bucks Balance Display */}
        {user && (
          <div style={{ 
            textAlign: 'center', 
            marginBottom: '30px',
            padding: '20px',
            background: 'linear-gradient(135deg, rgba(0, 191, 166, 0.1), rgba(255, 193, 7, 0.1))',
            borderRadius: '15px',
            border: `2px solid ${blyzaTheme.colors.accent}`,
            maxWidth: '400px',
            margin: '0 auto 30px auto'
          }}>
            <h3 style={{ color: blyzaTheme.colors.textLight, marginBottom: '10px', fontFamily: blyzaTheme.fonts.heading }}>
              Your Blyza Bucks
            </h3>
            <div style={{ 
              fontSize: '2.5rem', 
              fontWeight: 'bold', 
              color: blyzaTheme.colors.yellow,
              fontFamily: blyzaTheme.fonts.heading,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}>
              <i className="fas fa-coins"></i>
              {blyzaBucks.toLocaleString()}
            </div>
          </div>
        )}

        {/* Sign-in message for unauthenticated users */}
        {!user && (
          <div style={{ 
            textAlign: 'center', 
            marginBottom: '30px',
            padding: '30px',
            background: 'rgba(255, 193, 7, 0.1)',
            borderRadius: '15px',
            border: `2px solid ${blyzaTheme.colors.yellow}`,
            maxWidth: '500px',
            margin: '0 auto 30px auto'
          }}>
            <h3 style={{ color: blyzaTheme.colors.yellow, marginBottom: '10px', fontFamily: blyzaTheme.fonts.heading }}>
              Please sign in to view and redeem rewards.
            </h3>
            <button 
              onClick={() => router.push('/login?redirect=/store')}
              style={{
                ...retroButtonBaseStyle,
                backgroundColor: blyzaTheme.colors.primary,
                color: blyzaTheme.colors.textLight
              }}
            >
              <i className="fas fa-sign-in-alt" style={{ marginRight: '8px' }}></i>
              Sign In / Create Account
            </button>
          </div>
        )}

        {/* Choose which items to render: for logged-in users, never fall back to samples */}
        {user && storeItems.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            marginBottom: '30px',
            padding: '20px',
            background: 'rgba(0,0,0,0.05)',
            borderRadius: '12px',
            border: `2px solid ${blyzaTheme.colors.blackStroke}`,
            color: blyzaTheme.colors.textDark
          }}>
            No items available right now.
          </div>
        )}

        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '2.5em', width: '100%', maxWidth: '1200px' }}>
          {(user ? storeItems : (storeItems.length > 0 ? storeItems : sampleItems)).map((item) => {
            const isRedeemed = userPurchases.some(p => p.itemId === item.id);
            const canAfford = blyzaBucks >= (item.cost || 10);
            const isRedeeming = redeeming === item.id;
            
            return (
              <div key={item.id} 
                  style={cardStyle} 
                  onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-8px) scale(1.03)'; e.currentTarget.style.boxShadow = blyzaTheme.shadows.chunkyYellow; e.currentTarget.style.borderColor = blyzaTheme.colors.primary; }} 
                  onMouseOut={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = blyzaTheme.shadows.chunky; e.currentTarget.style.borderColor = blyzaTheme.colors.blackStroke; }}
                  onClick={!user ? undefined : (isRedeemed ? () => handleViewUnlocked(item.id) : (canAfford && !isRedeeming ? () => handleRedeemItem(item) : undefined))}
              >
                {isRedeemed && user && (
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: blyzaTheme.colors.accent,
                    color: blyzaTheme.colors.textDark,
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '0.7rem',
                    fontWeight: 'bold',
                    zIndex: 10
                  }}>
                    UNLOCKED
                  </div>
                )}
                
                <div>
                   <img src={item.image || item.logoUrl || 'https://via.placeholder.com/100x100?text=Item'} alt={`${item.title || item.name} Logo`} style={logoStyle} />
                   <h2 style={{ color: blyzaTheme.colors.textDark, fontSize: '1.5rem', marginBottom: '0.5em', fontFamily: blyzaTheme.fonts.heading, lineHeight: '1.3' }}>
                    {item.title || item.name}
                  </h2>
                  <p style={{ color: blyzaTheme.colors.textMedium, marginBottom: '1em', fontSize: '0.95rem', flexGrow: 1 }}>
                      {item.description}
                  </p>
                </div>
                <div style={{ marginTop: 'auto' }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    marginBottom: '10px',
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                    color: blyzaTheme.colors.yellow
                  }}>
                    <i className="fas fa-coins" style={{ marginRight: '6px' }}></i>
                    {item.cost || 10} Blyza Bucks
                  </div>
                  {!user ? (
                    <button 
                      onClick={(e) => { e.stopPropagation(); router.push(`/login?redirect=/store`); }}
                      style={{ 
                        ...retroButtonBaseStyle, 
                        backgroundColor: blyzaTheme.colors.greyBg, 
                        color: blyzaTheme.colors.textMedium, 
                        width: '100%',
                        cursor: 'pointer'
                      }}
                    >
                      <i className="fas fa-lock" style={{ marginRight: '8px' }}></i> 
                      Sign In to Redeem
                    </button>
                  ) : isRedeemed ? (
                    <button style={{ 
                      ...retroButtonBaseStyle, 
                      backgroundColor: blyzaTheme.colors.accent, 
                      color: blyzaTheme.colors.textDark, 
                      width: '100%' 
                    }}>
                      <i className="fas fa-eye" style={{ marginRight: '8px' }}></i> 
                      View
                    </button>
                  ) : (
                    <button style={{ 
                      ...retroButtonBaseStyle, 
                      backgroundColor: canAfford ? blyzaTheme.colors.primary : blyzaTheme.colors.greyBg, 
                      color: canAfford ? blyzaTheme.colors.textLight : blyzaTheme.colors.textMedium, 
                      width: '100%',
                      cursor: canAfford ? 'pointer' : 'not-allowed',
                      opacity: canAfford ? 1 : 0.6,
                      pointerEvents: canAfford ? 'auto' : 'none'
                    }}>
                      <i className="fas fa-gift" style={{ marginRight: '8px' }}></i> 
                      {isRedeeming ? 'Redeeming...' : canAfford ? 'Redeem' : 'Insufficient Funds'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: '15px', marginTop: '50px' }}>
            <button onClick={handleBack} style={{...retroButtonBaseStyle, backgroundColor: blyzaTheme.colors.secondary, color: blyzaTheme.colors.textLight }}>
                <i className="fas fa-arrow-left"></i> Back to Games
            </button>
            {user && (
                <button onClick={handleLogout} style={{...retroButtonBaseStyle, backgroundColor: blyzaTheme.colors.red, color: blyzaTheme.colors.textLight }}>
                <i className="fas fa-sign-out-alt"></i> Logout
                </button>
            )}
        </div>

      </div>
      <Analytics />
    </>
  );
}