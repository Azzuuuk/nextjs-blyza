// Simple test endpoint to check if Stripe is configured
export default async function handler(req, res) {
  try {
    // Check if Stripe package is available
    const stripeVersion = require('stripe/package.json').version;
    
    // Check environment variables (without exposing them)
    const hasSecretKey = !!process.env.STRIPE_SECRET_KEY;
    const hasSuccessUrl = !!process.env.STRIPE_SUCCESS_URL;
    const hasCancelUrl = !!process.env.STRIPE_CANCEL_URL;
    
    return res.status(200).json({
      status: 'ok',
      stripe: {
        packageInstalled: true,
        version: stripeVersion,
      },
      env: {
        STRIPE_SECRET_KEY: hasSecretKey ? 'SET' : 'MISSING',
        STRIPE_SUCCESS_URL: hasSuccessUrl ? 'SET' : 'MISSING',
        STRIPE_CANCEL_URL: hasCancelUrl ? 'SET' : 'MISSING',
      }
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error.message,
      stripe: {
        packageInstalled: false,
      }
    });
  }
}
