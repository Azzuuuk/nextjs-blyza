// lib/authUtils.js

import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from '/firebaseconfig'; // Assuming firebaseconfig.js is at the root or correctly linked. Adjust path if needed.

// Create a Google Auth Provider instance
const googleProvider = new GoogleAuthProvider();

/**
 * Initiates the Google Sign-in process using a popup window.
 * Catches errors and logs them to the console.
 * @returns {Promise<import("firebase/auth").UserCredential | null>} A promise that resolves with the user's credentials on successful sign-in, or null on error.
 */
export async function signInWithGooglePopup() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    // This gives you a Google Access Token. You can use it to access the Google API.
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential.accessToken; // Example: Access token if needed
    
    // The signed-in user info.
    const user = result.user;
    console.log("Successfully signed in with Google:", user);
    return result; // Return the full result or user object as needed
  } catch (error) {
    // Handle Errors here.
    const errorCode = error.code;
    const errorMessage = error.message;
    // The email of the user's account used.
    const email = error.customData?.email; // Use optional chaining for safety
    // The AuthCredential type that was used.
    const credential = GoogleAuthProvider.credentialFromError(error);

    let displayMessage = errorMessage;
    if (errorCode === 'auth/popup-closed-by-user') {
      displayMessage = 'Google Sign-in popup was closed.';
    } else if (errorCode === 'auth/cancelled-popup-request') {
      displayMessage = 'Google Sign-in popup request cancelled. Please try again.';
    } else if (errorCode === 'auth/account-exists-with-different-credential') {
      displayMessage = 'An account with this email already exists. Please sign in with your existing method.';
    }
    
    console.error("Error during Google Sign-in:", errorCode, errorMessage, email, credential);
    throw new Error(displayMessage); // Throw a simplified error message
  }
}