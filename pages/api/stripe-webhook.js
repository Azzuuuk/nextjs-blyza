import Stripe from "stripe";
import { buffer } from "micro";
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";

export const config = {
  api: {
    bodyParser: false, // Stripe needs raw body
  },
};

// --- Firebase init using env vars ---
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

if (!getApps().length) {
  initializeApp(firebaseConfig);
}

const db = getFirestore();

// --- Stripe init ---
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2022-11-15", // lock it so it's stable
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    console.error("Webhook hit with non-POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  let event;

  try {
    // 1. Verify signature
    const rawBody = await buffer(req);
    const signature = req.headers["stripe-signature"];

    if (!signature) {
      console.error("❌ Missing stripe-signature header");
      return res.status(400).json({ error: "Missing Stripe signature" });
    }

    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    console.log("✅ Webhook verified:", event.type);

  } catch (err) {
    console.error("❌ Signature verification failed:", err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  // 2. Handle only the event we care about
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const uid = session.metadata?.uid;

    console.log("💳 checkout.session.completed for session:", session.id);
    console.log("👤 uid from metadata:", uid);

    if (!uid) {
      console.error("❌ No uid in session.metadata, cannot mark premium");
      // we still 200 so Stripe stops retrying
      return res.status(200).json({
        received: true,
        updatedPremium: false,
        reason: "missing uid",
      });
    }

    try {
      const userRef = doc(db, "users", uid);

      await setDoc(
        userRef,
        {
          premium: true,
          premiumSince: Date.now(),
          plan: "premium",
        },
        { merge: true }
      );

      console.log("✅ Firestore updated. User is now premium:", uid);

      return res.status(200).json({
        received: true,
        updatedPremium: true,
        uid,
      });
    } catch (firestoreErr) {
      console.error("❌ Firestore update failed:", firestoreErr);

      // We STILL return 200 so Stripe stops retrying,
      // but now we tell ourselves what failed:
      return res.status(200).json({
        received: true,
        updatedPremium: false,
        uid,
        error: "firestore write failed",
        details: firestoreErr.message || String(firestoreErr),
      });
    }
  }

  // 3. Ignore other events, but respond OK
  console.log("ℹ️ Unhandled event type:", event.type);
  return res.status(200).json({ received: true, handled: false });
}
