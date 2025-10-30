import Stripe from "stripe";

// init Stripe with secret key (server-side only)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { uid } = req.body;
    if (!uid) {
      return res.status(400).json({ error: "Missing user id" });
    }

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: "payment", // single charge, not subscription
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Blyza Premium (Ad-Free Access)",
              description:
                "Ad-free experience + premium perks on PlayBlyza",
            },
            unit_amount: 200, // $2.00 (in cents)
          },
          quantity: 1,
        },
      ],
      // We'll use metadata to remember which user paid
      metadata: {
        uid, // <-- important
      },
      success_url: process.env.STRIPE_SUCCESS_URL,
      cancel_url: process.env.STRIPE_CANCEL_URL,
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("Stripe session error:", err);
    return res.status(500).json({ error: "Stripe session failed" });
  }
}
