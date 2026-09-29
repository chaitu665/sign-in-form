import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider,
  browserLocalPersistence,
  setPersistence
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration provided for pdfwatermark-f4824
export const firebaseConfig = {
  apiKey: "AIzaSyD5HxFHy02IXFiYzZ5uqeGd23_MmRC0RUg",
  authDomain: "pdfwatermark-f4824.firebaseapp.com",
  projectId: "pdfwatermark-f4824",
  storageBucket: "pdfwatermark-f4824.firebasestorage.app",
  messagingSenderId: "78610155102",
  appId: "1:78610155102:web:6962f24fedd80537a496cf"
};

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Configure default browser persistence
try {
  setPersistence(auth, browserLocalPersistence).catch((err) => {
    console.warn('Failed to set local persistence:', err);
  });
} catch {
  // Ignore in environments where persistence is unavailable
}

// Initialize Firestore (optional for user profile enrichment)
export const db = getFirestore(app);

/**
 * Maps Firebase Auth error codes to friendly, actionable messages.
 */
export function getFriendlyAuthErrorMessage(errorCodeOrMessage: string): { title: string; message: string; actionHint?: string } {
  const code = errorCodeOrMessage.toLowerCase();

  if (code.includes('auth/invalid-credential') || code.includes('auth/wrong-password') || code.includes('auth/user-not-found')) {
    return {
      title: 'Invalid Credentials',
      message: 'The email address or password you entered does not match any existing account.',
      actionHint: 'Double-check your email and password, or use the "Forgot Password" link.'
    };
  }

  if (code.includes('auth/email-already-in-use')) {
    return {
      title: 'Email Already In Use',
      message: 'An account with this email address already exists.',
      actionHint: 'Please switch to the Sign In tab or reset your password if you forgot it.'
    };
  }

  if (code.includes('auth/weak-password')) {
    return {
      title: 'Weak Password',
      message: 'The password is too weak. Firebase requires at least 6 characters.',
      actionHint: 'Use at least 8 characters including uppercase letters, numbers, and symbols.'
    };
  }

  if (code.includes('auth/invalid-email')) {
    return {
      title: 'Invalid Email Address',
      message: 'Please provide a properly formatted email address (e.g., name@example.com).',
    };
  }

  if (code.includes('auth/operation-not-allowed')) {
    return {
      title: 'Sign-in Method Disabled in Firebase',
      message: 'Email/Password or Google sign-in is not yet enabled in your Firebase Console.',
      actionHint: 'Open Firebase Console > Authentication > Sign-in method, then enable "Email/Password" and/or "Google".'
    };
  }

  if (code.includes('auth/popup-closed-by-user')) {
    return {
      title: 'Sign-in Cancelled',
      message: 'The Google authentication popup was closed before completing the sign-in.',
      actionHint: 'Click "Continue with Google" again and complete the sign-in in the popup.'
    };
  }

  if (code.includes('auth/popup-blocked')) {
    return {
      title: 'Popup Blocked',
      message: 'The browser blocked the sign-in popup window.',
      actionHint: 'Please allow popups for this site in your browser settings and try again.'
    };
  }

  if (code.includes('auth/too-many-requests')) {
    return {
      title: 'Account Temporarily Locked',
      message: 'Access to this account has been temporarily disabled due to many failed login attempts.',
      actionHint: 'You can immediately restore it by resetting your password or waiting a few minutes.'
    };
  }

  if (code.includes('auth/user-disabled')) {
    return {
      title: 'Account Suspended',
      message: 'This user account has been disabled by an administrator.',
    };
  }

  if (code.includes('auth/network-request-failed')) {
    return {
      title: 'Network Error',
      message: 'Unable to connect to Firebase authentication servers.',
      actionHint: 'Check your internet connection and verify that pdfwatermark-f4824.firebaseapp.com is accessible.'
    };
  }

  if (code.includes('auth/requires-recent-login')) {
    return {
      title: 'Re-authentication Required',
      message: 'This sensitive action requires you to have recently signed in.',
      actionHint: 'Please sign out, sign back in, and try changing your password again.'
    };
  }

  return {
    title: 'Authentication Error',
    message: errorCodeOrMessage.replace(/^Firebase:\s*/i, '').replace(/\(auth\/[^)]+\)\.?/i, '').trim() || 'An error occurred during authentication.'
  };
}
