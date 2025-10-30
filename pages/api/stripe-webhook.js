const Stripe = require("stripe");
const { buffer } = require("micro");
const { initializeApp, getApps } = require("firebase/app");
const { getFirestore, doc, setDoc } = require("firebase/firestore");

// Disable Next.js body parser - we need raw body for Stripe signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};

// Firebase configuration (reusing your existing config)
const firebaseConfig = {
  apiKey: "AIzaSyAm7bYgAGs26GmDyI3P1hnMTcTUXgXjJoM",
  authDomain: "blyza-2767e.firebaseapp.com",
  projectId: "blyza-2767e",
  storageBucket: "blyza-2767e.firebasestorage.app",
  messagingSenderId: "312532709432",
  appId: "1:312532709432:web:6f1add8b846806258c76cd",
  measurementId: "G-R0RBTD0DBB"
};

// Initialize Firebase app only once
if (!getApps().length) {
  initializeApp(firebaseConfig);
}

const db = getFirestore();

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  let event;

  try {
    // Get raw request body for signature verification
    const rawBody = await buffer(req);
    const signature = req.headers["stripe-signature"];

    if (!signature) {
      console.error("❌ Missing Stripe signature header");
      return res.status(400).json({ error: "Missing signature" });
    }

    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    console.log("✅ Webhook verified:", event.type);

  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  // Handle checkout.session.completed event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    console.log("�� Checkout session completed:", session.id);

    // Get Firebase UID from session metadata
    const uid = session.metadata?.uid;

    if (!uid) {
      console.error("❌ Missing uid in session metadata! Session ID:", session.id);
      // Still return 200 to acknowledge receipt, but log the error
      return res.status(200).json({ received: true, error: "Missing uid in metadata" });
    }

    try {
      // Update user document in Firestore
      const userRef = doc(db, "users", uid);

      await setDoc(
        userRef,
        {
          premium: true,
          premiumSince: Date.now(),
          plan: "premium",
        },
        { merge: true } // Merge to preserve existing fields like blyzaBucks
      );

      console.log("✅ Successfully upgraded user to premium:", uid);

    } catch (firestoreErr) {
      console.error("❌ Failed to update Firestore for uid:", uid, firestoreErr);
      // Still return 200 to Stripe (we received the webhook)
      // but log the Firestore error for debugging
    }
  }

  // Always return 200 to acknowledge receipt
  return res.status(200).json({ received: true });
}
