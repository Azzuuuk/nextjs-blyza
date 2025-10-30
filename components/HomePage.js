import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { auth, db } from '../firebaseconfig';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { SUBCATEGORIES, filterGamesBySubcategory } from '../data/gameCategories';
import styles from './HomePage.module.css';
import ProfileModal from './ProfileModal';

export default function HomePage() {
  const router = useRouter();
  
  // User and authentication state
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  
  // Game state
  const [gameConfig, setGameConfig] = useState({ sfxEnabled: true, musicVolume: 0.3 });
  const [playCounts, setPlayCounts] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  
  // New tab system state
  const [activeTab, setActiveTab] = useState('Local Play');
  const [activeSubcategory, setActiveSubcategory] = useState('all');
  
  // Modal states
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [bucksOpen, setBucksOpen] = useState(false);
  const [welcomeOpen, setWelcomeOpen] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);

  // Audio refs (using refs to persist across renders)
  const audioRefs = {
    background: null,
    categorySelect: null,
    itemSelect: null
  };

  // Game data
  const gameCards = [
    {
      id: 1,
      category: "Social & Deception",
      icon: "fas fa-tag",
      title: "Guess the Price",
      description: "Price detective? Shopping guru? Test your instincts in Guess the Price – How close can you get?",
      teams: "1-4 Teams",
      time: "5-10 min",
      href: "/games/game1"
    },
    {
      id: 3,
      category: "Brain Busters",
      icon: "fas fa-robot",
      title: "Real or AI",
      description: "Human masterpiece or AI creation? Test your perception in this reality-blurring game where nothing is quite as it seems!",
      teams: "1-4 Teams",
      time: "3-5 min",
      href: "/games/game3"
    },
    {
      id: 2,
      category: "Social & Deception",
      icon: "fas fa-user-secret",
      title: "Find The Imposter",
      description: "Deception meets deduction! Get a question, give your answer, and try to blend in... or sniff out the one who doesn't quite fit.",
      teams: "3-10 Players",
      time: "10-15 min",
      href: "/games/game2"
    },
    {
      id: 4,
      category: "Brain Busters",
      icon: "fas fa-brain",
      title: "Point Pursuit",
      description: "Ready for a brainy adventure? Dive into 5 exciting trivia categories, scale 5 levels of mind-bending questions, and pursue those points!",
      teams: "2-4 Teams",
      time: "15-25 min",
      href: "/games/game4"
    },
    {
      id: 5,
      category: "Social & Deception",
      icon: "fas fa-box-open",
      title: "Box of Lies",
      description: "Deception or truth? Master the art of the perfect poker face as you bluff, trick, and laugh your way to victory!",
      teams: "2 Teams",
      time: "5-15 min",
      href: "/games/game5"
    },
    {
      id: 6,
      category: "Social & Deception",
      icon: "fas fa-comments",
      title: "Paranoia",
      description: "Trust no one as secrets and suspicions turn friends into nervous wrecks!",
      teams: "3-12 Players",
      time: "10-20 min",
      href: "/games/game6"
    },
    {
      id: 7,
      category: "Quickfire",
      icon: "fas fa-play",
      title: "What Happens Next?",
      description: "Place your bets on unexpected twists. Will your prediction match the chaotic reality?",
      teams: "1-4 Teams",
      time: "5-15 min",
      href: "/games/game7"
    },
    {
      id: 8,
      category: "Social & Deception",
      icon: "fas fa-heart-circle-exclamation",
      title: "Siblings or Dating",
      description: "Guess if the pair are family or… something more. Its trickier than you think!",
      teams: "1-4 Teams",
      time: "3-5 min",
      href: "/games/game8"
    },
    {
      id: 9,
      category: "Quickfire",
      icon: "fas fa-stopwatch",
      title: "5 Seconds Frenzy",
      description: "Quick! Name 3 ____ before the timer runs out. Sounds easy? Wait till the pressure kicks in!",
      teams: "2 Teams",
      time: "3-5 min",
      href: "/games/game9"
    },
    {
      id: 10,
      category: "Quickfire",
      icon: "fas fa-folder-tree",
      title: "Categories Showdown",
      description: "One topic, endless answers — until your mind goes blank!",
      teams: "2 Teams",
      time: "5-10 min",
      href: "/games/game10"
    },
    {
      id: 11,
      category: "Quickfire",
      icon: "fas fa-dumbbell",
      title: "Categories Showdown - IRL",
      description: "Run, point, jump, shout! Each round comes with a physical challenge.",
      teams: "2 Teams",
      time: "5-10 min",
      href: "/games/game11"
    },
    {
      id: 12,
      category: "Brain Busters",
      icon: "fas fa-arrow-down-a-z",
      title: "Word Wars",
      description: "One word to guess, two captains battling it out. Say less, win more!",
      teams: "2 Teams",
      time: "5-10 min",
      href: "/games/game12"
    },
    {
      id: 13,
      category: "Brain Busters",
      icon: "fas fa-lock",
      title: "Password Pursuit",
      description: "Two captains, two teams, and a whole lot of head-scratching - clue cleverly!",
      teams: "2 Teams",
      time: "5-10 min",
      href: "/games/game13"
    },
    {
      id: 14,
      category: "Quickfire",
      icon: "fas fa-circle-nodes",
      title: "Connect the Dots",
      description: "Two letters. One word. Fastest brains win!",
      teams: "2 Teams",
      time: "5-10 min",
      href: "/games/game14"
    },
    {
      id: 15,
      category: "Quickfire",
      icon: "fas fa-spell-check",
      title: "Gen Z-dle",
      description: "It's giving... word. You either get it or you don't, bestie. 💅",
      teams: "1-4 Players",
      time: "2-3 min",
      href: "/games/game15"
    },
    {
      id: 16,
      category: "Brain Busters",
      icon: "fas fa-earth-americas",
      title: "Where in the World?",
      description: "Journey around the globe without leaving your seat! Decipher the clues and guess the location.",
      teams: "1-4 Teams",
      time: "3-5 min",
      href: "/games/game16"
    },
    {
      id: 17,
      category: "Brain Busters",
      icon: "fas fa-flag",
      title: "Guess the Flag",
      description: "Test your flag knowledge! Can you recognize these colorful banners?",
      teams: "1-2 Teams",
      time: "2-3 min",
      href: "/games/game17"
    },
    {
      id: 18,
      category: "Brain Busters",
      icon: "fas fa-face-grin-squint-tears",
      title: "Moji Mania",
      description: "What story do these emojis tell? Put your interpretation skills to the test!",
      teams: "1-4 Teams",
      time: "2-3 min",
      href: "/games/game18"
    }
  ];

  // Tab system data
  const tabs = ["Local Play", "Online Play", "Solo Play"];
  const subcategories = [
    { id: "all", name: "All" },
    { id: "brain_busters", name: SUBCATEGORIES.brain_busters },
    { id: "social_interception", name: SUBCATEGORIES.social_interception },
    { id: "quick_fire", name: SUBCATEGORIES.quick_fire }
  ];

  // Audio functions
  const playSound = (audioElement) => {
    if (gameConfig.sfxEnabled && audioElement) {
      audioElement.currentTime = 0;
      audioElement.play().catch(e => {});
    }
  };

  // Local storage functions
  const loadPlayCounts = () => {
    const storedCounts = localStorage.getItem('blyzaGamePlays');
    if (storedCounts) setPlayCounts(JSON.parse(storedCounts));
  };

  const savePlayCounts = (newCounts) => {
    localStorage.setItem('blyzaGamePlays', JSON.stringify(newCounts));
    setPlayCounts(newCounts);
  };

  const loadSettings = () => {
    const savedVolume = localStorage.getItem('musicVolume');
    const savedSfxEnabled = localStorage.getItem('sfxEnabled');
    const newConfig = { ...gameConfig };
    
    if (savedVolume !== null) newConfig.musicVolume = parseFloat(savedVolume);
    if (savedSfxEnabled !== null) newConfig.sfxEnabled = savedSfxEnabled === 'true';
    
    setGameConfig(newConfig);
    return newConfig;
  };

  // Handle game navigation with sound
  const handleGameClick = (gameHref) => {
    playSound(audioRefs.itemSelect);
    
    // Update play counts and bucks
    const newCounts = { ...playCounts };
    newCounts[gameHref] = (newCounts[gameHref] || 0) + 1;
    savePlayCounts(newCounts);
    
    // Navigate after sound
    setTimeout(() => {
      window.location.href = gameHref;
    }, 400);
  };

  // Handle surprise me
  const handleSurpriseMe = () => {
    let visibleGames = [];
    
    if (activeTab === 'Local Play') {
      visibleGames = filterGamesBySubcategory(gameCards, activeSubcategory);
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        visibleGames = visibleGames.filter(game => 
          game.title.toLowerCase().includes(searchLower) || 
          game.description.toLowerCase().includes(searchLower)
        );
      }
    }

    if (visibleGames.length > 0) {
      const randomGame = visibleGames[Math.floor(Math.random() * visibleGames.length)];
      handleGameClick(randomGame.href);
    }
  };

  // Filtered games for display
  const filteredGames = activeTab === 'Local Play' ? (() => {
    let games = filterGamesBySubcategory(gameCards, activeSubcategory);
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      games = games.filter(game => 
        game.title.toLowerCase().includes(searchLower) || 
        game.description.toLowerCase().includes(searchLower)
      );
    }
    return games;
  })() : [];

  // Online Play: explicitly surface multiplayer-ready games
  const onlineGameIds = new Set([1, 2]); // 1: Guess the Price, 2: Find The Imposter
  const onlineGames = gameCards.filter(g => onlineGameIds.has(g.id));

  // Category tag mapping
  const getCategoryTag = (category) => {
    switch (category) {
      case "Social & Deception": return "Social";
      case "Brain Busters": return "Brainy";
      case "Quickfire": return "Quickfire";
      default: return "Social";
    }
  };

  // Get category class for tag styling
  const getCategoryClass = (category) => {
    switch (category) {
      case "Social & Deception": return styles.categoryTagSocial;
      case "Brain Busters": return styles.categoryTagBrainy;
      case "Quickfire": return styles.categoryTagQuickfire;
      default: return styles.categoryTagSocial;
    }
  };

  // Favorites modal content
  const getFavoriteGames = () => {
    const sortedGames = Object.entries(playCounts).sort(([, a], [, b]) => b - a);
    return sortedGames.map(([gameHref, count]) => {
      const game = gameCards.find(g => g.href === gameHref);
      return { 
        title: game ? game.title : 'Unknown Game', 
        count,
        href: gameHref 
      };
    });
  };

  // Effects
  useEffect(() => {
    // Authentication and user profile subscription
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      
      if (user) {
        // Set up real-time subscription to user profile
        const userRef = doc(db, 'users', user.uid);
        const unsubscribeProfile = onSnapshot(userRef, (doc) => {
          if (doc.exists()) {
            setUserProfile({ id: doc.id, ...doc.data() });
          } else {
            setUserProfile(null);
          }
        });
        
        return () => unsubscribeProfile();
      } else {
        setUserProfile(null);
      }
    });
    
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Initialize audio elements
    audioRefs.background = document.getElementById('background-music');
    audioRefs.categorySelect = document.getElementById('category-select-sound');
    audioRefs.itemSelect = document.getElementById('item-select-sound');

    // Clear old Blyza Bucks cache (migration cleanup)
    localStorage.removeItem('blyzaBucksCount');

    // Load saved data
    loadPlayCounts();
    const config = loadSettings();

    // Set background music volume
    if (audioRefs.background) {
      audioRefs.background.volume = config.musicVolume;
    }

    // Check if welcome modal should show
    const consentAccepted = localStorage.getItem('blyzaConsentAccepted');
    if (!consentAccepted) {
      setWelcomeOpen(true);
    }

    // Setup background music autoplay on first interaction
    const handleFirstInteraction = () => {
      if (audioRefs.background && audioRefs.background.paused) {
        audioRefs.background.play().catch(e => {});
      }
    };
    
    document.body.addEventListener('click', handleFirstInteraction, { once: true });

    return () => {
      document.body.removeEventListener('click', handleFirstInteraction);
    };
  }, []);

  // Update background music volume when config changes
  useEffect(() => {
    if (audioRefs.background) {
      audioRefs.background.volume = gameConfig.musicVolume;
    }
  }, [gameConfig.musicVolume]);

  return (
    <>
      <Head>
        <title>Blyza - Powered by Fun, Driven by Rewards!</title>
        <meta name="description" content="The party games platform that pays you back — with EXCLUSIVE OFFERS, PRIZES, and non-stop FUN!" />
        <meta name="keywords" content="party games , Blyza , team building games, group games, online games with friends, fun games, browser games, find imposter, imposter games" />
        <meta property="og:title" content="Blyza - Powered by Fun, Driven by Rewards!" />
        <meta property="og:description" content="The party games platform that pays you back — with EXCLUSIVE OFFERS, PRIZES, and non-stop FUN!" />
        <meta property="og:url" content="https://www.playblyza.com" />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="icon" href="/favicon.ico" />
        
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Bungee&family=Luckiest+Guy&family=Quicksand:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-N5PBKM0DNQ"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-N5PBKM0DNQ');
            `,
          }}
        />
      </Head>

      <div className={styles.page}>
        {/* Floating background elements */}
        <div className={styles.heroBackgroundElements}>
          <div className={`${styles.bgGameElement} ${styles.gameController1}`}>
            <i className="fas fa-gamepad"></i>
          </div>
          <div className={`${styles.bgGameElement} ${styles.gameJoystick1}`}>
            <div className={styles.joystickBase}></div>
            <div className={styles.joystickStick}></div>
            <div className={styles.joystickTop}></div>
          </div>
          <div className={`${styles.bgGameElement} ${styles.gameOverText1}`}>
            PLAY<br />NOW
          </div>
          <div className={`${styles.bgGameElement} ${styles.gameArcade1}`}>
            <i className="fas fa-ghost"></i>
          </div>
        </div>

        <main>
          {/* Floating buttons */}
          <div className={styles.storeBtnContainer}>
            <button 
              className={`${styles.storeBtn} ${styles.btnRetroFloating}`}
              onClick={() => handleGameClick('/store')}
            >
              <i className="fas fa-store"></i> Store
            </button>
          </div>

          <div className={styles.topLeftButtonsContainer}>
            <button 
              className={`${styles.settingsBtn} ${styles.btnRetroFloating}`}
              onClick={() => {
                playSound(audioRefs.categorySelect);
                setSettingsOpen(true);
              }}
              aria-label="Open Settings"
            >
              <i className="fas fa-cog"></i>
            </button>
            <button 
              className={`${styles.favoritesBtn} ${styles.btnRetroFloating}`}
              onClick={() => {
                playSound(audioRefs.categorySelect);
                if (auth.currentUser) {
                  setProfileOpen(true);
                } else {
                  router.push('/login');
                }
              }}
              aria-label="Open Profile"
            >
              <i className="fas fa-user"></i>
            </button>
            <button 
              className={`${styles.bucksBtn} ${styles.btnRetroFloating}`}
              onClick={() => {
                playSound(audioRefs.categorySelect);
                setBucksOpen(true);
              }}
              aria-label="Open Blyza Bucks"
            >
              <i className="fas fa-coins"></i>
              <span className={styles.blyzaBucksCount}>{userProfile?.blyzaBucks?.toLocaleString() || 0}</span>
            </button>
          </div>

          {/* Page header */}
          <div className={styles.pageHeader}>
            <img 
              className={styles.brandLogoProminent} 
              src="https://static.wixstatic.com/shapes/9ce3e5_4f0149a89dd841859da02f59247b5b6b.svg" 
              alt="Blyza Mascot" 
            />
            <h1>Blyza Game Center</h1>
            <p className={styles.subtitle}>Choose your challenge! Jump into our library of fun & funky games.</p>
          </div>

          {/* Container */}
          <div className={styles.container}>
            {/* Search */}
            <div className={styles.searchContainer}>
              <div className={styles.searchBar}>
                <i className="fas fa-search search-icon"></i>
                <input 
                  type="text" 
                  className={styles.searchInput}
                  placeholder="Search for a game..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button 
                className={styles.surpriseMeBtn}
                onClick={handleSurpriseMe}
              >
                <i className="fas fa-dice"></i> Surprise Me!
              </button>
            </div>

            {/* Top-level tabs */}
            <div className={styles.tabFilter}>
              {tabs.map(tab => (
                <button
                  key={tab}
                  className={`${styles.tabBtn} ${activeTab === tab ? styles.active : ''}`}
                  onClick={() => {
                    playSound(audioRefs.categorySelect);
                    setActiveTab(tab);
                    setActiveSubcategory('all'); // Reset subcategory when switching tabs
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Secondary filter for Local Play */}
            {activeTab === 'Local Play' && (
              <div className={styles.subcategoryFilter}>
                {subcategories.map(subcategory => (
                  <button
                    key={subcategory.id}
                    className={`${styles.subcategoryBtn} ${activeSubcategory === subcategory.id ? styles.active : ''}`}
                    onClick={() => {
                      playSound(audioRefs.categorySelect);
                      setActiveSubcategory(subcategory.id);
                    }}
                  >
                    {subcategory.name}
                  </button>
                ))}
              </div>
            )}

            {/* Games grid */}
            <div className={styles.gamesGrid}>
              {activeTab === 'Local Play' ? (
                filteredGames.map((game, index) => (
                  <div 
                    key={game.id}
                    className={`${styles.gameCardItem} ${styles[`delay${index % 3}`]}`}
                    data-category={game.category}
                    onClick={() => handleGameClick(game.href)}
                  >
                    <div className={styles.gameCardContent}>
                      <span className={`${styles.categoryTag} ${getCategoryClass(game.category)}`}>
                        {getCategoryTag(game.category)}
                      </span>
                      <i className={`${game.icon} ${styles.gameIcon}`}></i>
                      <h3 className={styles.gameTitle}>{game.title}</h3>
                      <p className={styles.gameDescription}>{game.description}</p>
                      <div className={styles.gameStats}>
                        <span className={styles.gameStat}>
                          <i className="fas fa-users"></i> {game.teams}
                        </span>
                        <span className={styles.gameStat}>
                          <i className="fas fa-clock"></i> {game.time}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : activeTab === 'Online Play' ? (
                // Show the two online-enabled games, then placeholders
                <>
                  {onlineGames.map((game, index) => (
                    <div 
                      key={game.id}
                      className={`${styles.gameCardItem} ${styles[`delay${index % 3}`]}`}
                      data-category={game.category}
                      onClick={() => handleGameClick(game.href)}
                    >
                      <div className={styles.gameCardContent}>
                        <span className={`${styles.categoryTag} ${getCategoryClass(game.category)}`}>
                          {getCategoryTag(game.category)}
                        </span>
                        <i className={`${game.icon} ${styles.gameIcon}`}></i>
                        <h3 className={styles.gameTitle}>{game.title}</h3>
                        <p className={styles.gameDescription}>{game.description}</p>
                        <div className={styles.gameStats}>
                          <span className={styles.gameStat}>
                            <i className="fas fa-users"></i> {game.teams}
                          </span>
                          <span className={styles.gameStat}>
                            <i className="fas fa-clock"></i> {game.time}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {Array.from({ length: Math.max(0, 6 - onlineGames.length) }).map((_, index) => (
                    <div 
                      key={`online-placeholder-${index}`}
                      className={`${styles.gameCardItem} ${styles.comingSoonCard}`}
                    >
                      <div className={styles.gameCardContent}>
                        <i className={`fas fa-rocket ${styles.gameIcon}`}></i>
                        <h3 className={styles.gameTitle}>More Games Coming Soon</h3>
                        <p className={styles.gameDescription}>
                          More games coming soon
                        </p>
                        <div className={styles.comingSoonBadge}>
                          <i className="fas fa-hourglass-half"></i>
                          In Development
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                // Solo Play placeholders (unchanged)
                Array.from({ length: 6 }).map((_, index) => (
                  <div 
                    key={`placeholder-${index}`}
                    className={`${styles.gameCardItem} ${styles.comingSoonCard}`}
                  >
                    <div className={styles.gameCardContent}>
                      <i className={`fas fa-rocket ${styles.gameIcon}`}></i>
                      <h3 className={styles.gameTitle}>Coming Soon</h3>
                      <p className={styles.gameDescription}>
                        Exciting {activeTab.toLowerCase()} games are on the way!
                      </p>
                      <div className={styles.comingSoonBadge}>
                        <i className="fas fa-hourglass-half"></i>
                        In Development
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>

        {/* Audio elements */}
        <audio id="background-music" loop>
          <source src="https://static.wixstatic.com/mp3/9ce3e5_973dcdec546a44b594013ec040a9eb20.mp3" type="audio/mpeg" />
        </audio>
        <audio id="category-select-sound">
          <source src="https://static.wixstatic.com/mp3/9ce3e5_fc326aa1760c485dbac083ec55c2bfcb.wav" type="audio/wav" />
        </audio>
        <audio id="item-select-sound">
          <source src="https://static.wixstatic.com/mp3/9ce3e5_1b9151238aec4e29ab14f1526e9c1334.mp3" type="audio/mpeg" />
        </audio>

        {/* Modals */}
        {settingsOpen && (
          <div className={styles.modal} onClick={() => setSettingsOpen(false)}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <span 
                className={styles.closeModalBtn}
                onClick={() => setSettingsOpen(false)}
              >
                ×
              </span>
              <h2>Settings</h2>
              <div className={styles.settingItem}>
                <label htmlFor="bgm-volume-slider">Music Volume:</label>
                <input 
                  type="range" 
                  id="bgm-volume-slider" 
                  min="0" 
                  max="1" 
                  step="0.01" 
                  value={gameConfig.musicVolume}
                  onChange={(e) => {
                    const newVolume = parseFloat(e.target.value);
                    const newConfig = { ...gameConfig, musicVolume: newVolume };
                    setGameConfig(newConfig);
                    localStorage.setItem('musicVolume', newVolume);
                  }}
                />
              </div>
              <div className={styles.settingItem}>
                <label htmlFor="sfx-toggle-btn">Sound Effects:</label>
                <button 
                  id="sfx-toggle-btn" 
                  className={`${styles.sfxToggle} ${!gameConfig.sfxEnabled ? styles.off : ''}`}
                  onClick={() => {
                    const newSfxEnabled = !gameConfig.sfxEnabled;
                    const newConfig = { ...gameConfig, sfxEnabled: newSfxEnabled };
                    setGameConfig(newConfig);
                    localStorage.setItem('sfxEnabled', newSfxEnabled);
                    playSound(audioRefs.categorySelect);
                  }}
                >
                  SFX: {gameConfig.sfxEnabled ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>
          </div>
        )}

        <ProfileModal 
          isOpen={profileOpen} 
          onClose={() => setProfileOpen(false)} 
        />

        {bucksOpen && (
          <div className={styles.modal} onClick={() => setBucksOpen(false)}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <span 
                className={styles.closeModalBtn}
                onClick={() => setBucksOpen(false)}
              >
                ×
              </span>
              <h2><i className="fas fa-coins"></i>Blyza Bucks</h2>
              
              <div className={styles.walletDisplay}>
                <p>Your Wallet</p>
                <div className={styles.bucksAmount}>{userProfile?.blyzaBucks?.toLocaleString() || 0}</div>
              </div>

              <div className={styles.leaderboard}>
                <h3>Richest Blyza Players</h3>
                <ol>
                  <li>
                    <span className={styles.playerName}>
                      <i className="fas fa-crown" style={{color: 'gold'}}></i> Scrash
                    </span>
                    <span className={styles.playerScore}>98,550 <i className="fas fa-coins"></i></span>
                  </li>
                  <li>
                    <span className={styles.playerName}>Tabetubtv</span>
                    <span className={styles.playerScore}>90,000 <i className="fas fa-coins"></i></span>
                  </li>
                  <li>
                    <span className={styles.playerName}>Waseem</span>
                    <span className={styles.playerScore}>24,000 <i className="fas fa-coins"></i></span>
                  </li>
                  <li>
                    <span className={styles.playerName}>Sinisi_Escobar</span>
                    <span className={styles.playerScore}>22,690 <i className="fas fa-coins"></i></span>
                  </li>
                  <li>
                    <span className={styles.playerName}>BucksBunny</span>
                    <span className={styles.playerScore}>9,150 <i className="fas fa-coins"></i></span>
                  </li>
                </ol>
              </div>

              <p className={styles.infoText}>
                This is the demo version. Soon, you'll use Bucks for real-life discounts, vouchers, and game customizations!
              </p>
            </div>
          </div>
        )}

        {welcomeOpen && (
          <div className={styles.modal}>
            <div className={`${styles.modalContent} ${styles.welcomeModalContent}`}>
              <img 
                className={styles.brandLogoProminent} 
                src="https://static.wixstatic.com/shapes/9ce3e5_4f0149a89dd841859da02f59247b5b6b.svg" 
                alt="Blyza Mascot" 
                style={{maxHeight: '100px', marginBottom: '20px'}}
              />
              <h2>Welcome to Blyza!</h2>
              <p className={styles.welcomeText}>
                We use your browser's local storage to save your settings and remember your favorite games. By clicking "Accept", you agree to this.
              </p>
              <button 
                className={`${styles.btnRetroFloating} ${styles.acceptCookiesBtn}`}
                onClick={() => {
                  playSound(audioRefs.itemSelect);
                  localStorage.setItem('blyzaConsentAccepted', 'true');
                  setWelcomeOpen(false);
                  setOnboardingOpen(true);
                }}
              >
                Accept & Continue <i className="fas fa-rocket"></i>
              </button>
            </div>
          </div>
        )}

        {onboardingOpen && (
          <div className={styles.modal}>
            <div className={`${styles.modalContent} ${styles.onboardingModalContent}`}>
              <h2>Ready to Play?</h2>
              <p className={styles.onboardingText}>
                Can't decide where to start? Try our most popular game to get a feel for Blyza!
              </p>
              <div className={styles.onboardingButtons}>
                <button 
                  className={styles.btnRetroFloating}
                  onClick={() => handleGameClick('/games/game1')}
                >
                  Yes, take me to the game! <i className="fas fa-dice"></i>
                </button>
                <button 
                  className={`${styles.btnRetroFloating} ${styles.btnRetroSecondary}`}
                  onClick={() => {
                    playSound(audioRefs.categorySelect);
                    setOnboardingOpen(false);
                  }}
                >
                  No, I'll browse the menu
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Vercel Analytics */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.va = window.va || function () { (window.va.q = window.va.q || []).push(arguments); };
            `,
          }}
        />
        <script src="/_vercel/insights/script.js" defer></script>
      </div>
    </>
  );
}
