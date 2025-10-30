// scripts/populateStoreData.js
// Run this script to populate your Firestore with sample store items
// Usage: node scripts/populateStoreData.js

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAm7bYgAGs26GmDyI3P1hnMTcTUXgXjJoM",
  authDomain: "blyza-2767e.firebaseapp.com",
  projectId: "blyza-2767e",
  storageBucket: "blyza-2767e.firebasestorage.app",
  messagingSenderId: "312532709432",
  appId: "1:312532709432:web:6f1add8b846806258c76cd",
  measurementId: "G-R0RBTD0DBB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Sample store items data
const sampleStoreItems = [
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

// Sample secret links (optional - for testing unlocked content)
const sampleSecrets = {
  'asos-discount': { link: 'http://bit.ly/3TylIMH' },
  'nordvpn-discount': { link: 'https://bit.ly/448iWmg' },
  'gymshark-discount': { link: 'https://bit.ly/44bNuDL' },
  'nike-discount': { link: 'https://nike.com/promo-special' },
  'spotify-discount': { link: 'https://spotify.com/premium-offer' },
  'amazon-discount': { link: 'https://amazon.com/credit-redemption' }
};

async function populateStoreData() {
  try {
    console.log('Populating store items...');
    
    // Add store items to /storeItems collection
    for (const item of sampleStoreItems) {
      await setDoc(doc(db, 'storeItems', item.id), item);
      console.log(`✅ Added store item: ${item.title}`);
    }
    
    // Add secret links to /storeItemSecrets collection
    for (const [itemId, secretData] of Object.entries(sampleSecrets)) {
      await setDoc(doc(db, 'storeItemSecrets', itemId), secretData);
      console.log(`🔐 Added secret for: ${itemId}`);
    }
    
    console.log('\n🎉 Store data population complete!');
    console.log('\nNext steps:');
    console.log('1. Update your Firestore Rules in Firebase Console');
    console.log('2. Test the store page at http://localhost:3001/store');
    console.log('3. Ensure users have some Blyza Bucks in their profile');
    
  } catch (error) {
    console.error('❌ Error populating store data:', error);
  }
}

// Run the population script
populateStoreData();
