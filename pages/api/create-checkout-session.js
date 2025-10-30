import Stripe from "stripe";

// Initialize Stripe with secret key (server-side only)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  // Only accept POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Get Firebase UID from request body
    const { uid } = req.body;
    
    if (!uid) {
      console.error("❌ Missing uid in request body");
      return res.status(400).json({ error: "Missing user id" });
    }

    console.log("✅ Creating Stripe checkout session for uid:", uid);

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: "payment", // One-time payment
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: "Blyza Premium (Ad-Free)",
              description: "Ad-free experience on PlayBlyza",
            },
            unit_amount: 200, // €2.00 in cents
          },
          quantity: 1,
        },
      ],
      // CRITICAL: Attach Firebase UID to metadata so webhook can identify the user
      metadata: {
        uid: uid,
      },
      success_url: "https://playblyza.com/store?upgrade=success",
      cancel_url: "https://playblyza.com/store?upgrade=cancel",
    });

    console.log("✅ Checkout session created:", session.id);
    
    // Return the checkout URL to redirect the user
    return res.status(200).json({ url: session.url });
    
  } catch (err) {
    console.error("❌ Stripe session error:", err);
    return res.status(500).json({ 
      error: "Stripe session failed", 
      message: err.message 
    });
  }
}
