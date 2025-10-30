import { getAuth } from "firebase/auth";
import { useState } from "react";

export default function UpgradeButton() {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      alert("Please log in first!");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: user.uid }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url; // Redirect to Stripe Checkout
      } else {
        alert("Something went wrong!");
      }
    } catch (err) {
      console.error("Error starting checkout:", err);
      alert("Error starting checkout.");
    }
    setLoading(false);
  };

  return (
    <button
      onClick={handleUpgrade}
      disabled={loading}
      style={{
        background: "#FF8833",
        color: "#fff",
        border: "none",
        padding: "12px 24px",
        borderRadius: "8px",
        cursor: "pointer",
        fontWeight: "600",
        fontSize: "16px",
      }}
    >
      {loading ? "Loading..." : "🎉 Get Blyza Premium!"}
    </button>
  );
}
