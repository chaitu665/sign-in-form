import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  updatePassword
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider, getFriendlyAuthErrorMessage } from '../firebase/config';

export interface UserProfileData {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  bio?: string;
  role?: string;
  company?: string;
  phone?: string;
  createdAt?: string;
  lastLoginAt?: string;
}

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfileData | null;
  loading: boolean;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (name: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  updateProfileData: (data: Partial<UserProfileData>) => Promise<void>;
  changePassword: (newPassword: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_PROFILE_KEY = 'pdfwatermark_user_profile_cache';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Helper to load profile from Firestore or local storage cache
  const loadUserProfile = async (user: User) => {
    const defaultProfile: UserProfileData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || user.email?.split('@')[0] || 'User',
      photoURL: user.photoURL,
      role: 'Member',
      createdAt: user.metadata.creationTime,
      lastLoginAt: user.metadata.lastSignInTime,
    };

    try {
      const userDocRef = doc(db, 'users', user.uid);
      const snapshot = await getDoc(userDocRef);

      if (snapshot.exists()) {
        const firestoreData = snapshot.data();
        const merged: UserProfileData = {
          ...defaultProfile,
          ...firestoreData,
          displayName: user.displayName || firestoreData.displayName || defaultProfile.displayName,
          email: user.email || firestoreData.email,
          photoURL: user.photoURL || firestoreData.photoURL,
        };
        setUserProfile(merged);
        localStorage.setItem(`${LOCAL_STORAGE_PROFILE_KEY}_${user.uid}`, JSON.stringify(merged));
        return;
      } else {
        // Document doesn't exist yet, attempt to initialize it in Firestore
        try {
          await setDoc(userDocRef, {
            ...defaultProfile,
            createdAtTimestamp: serverTimestamp(),
            lastLoginTimestamp: serverTimestamp(),
          });
        } catch (writeErr) {
          console.warn('Firestore write notice (using local state fallback):', writeErr);
        }
      }
    } catch (err) {
      console.warn('Firestore fetch notice (using cached profile):', err);
    }

    // Try reading cached extra fields from local storage
    const cached = localStorage.getItem(`${LOCAL_STORAGE_PROFILE_KEY}_${user.uid}`);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setUserProfile({ ...defaultProfile, ...parsed });
        return;
      } catch {
        // ignore parse error
      }
    }

    setUserProfile(defaultProfile);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await loadUserProfile(user);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithEmail = async (email: string, password: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    await loadUserProfile(cred.user);
  };

  const registerWithEmail = async (name: string, email: string, password: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    
    // Set display name in Firebase Auth
    if (name.trim()) {
      await updateProfile(cred.user, {
        displayName: name.trim()
      });
    }

    // Send email verification
    try {
      await sendEmailVerification(cred.user);
    } catch (err) {
      console.warn('Could not send verification email immediately:', err);
    }

    // Initialize profile
    const initialProfile: UserProfileData = {
      uid: cred.user.uid,
      email: cred.user.email,
      displayName: name.trim() || cred.user.email?.split('@')[0] || 'User',
      photoURL: null,
      role: 'Member',
      bio: '',
      company: '',
      phone: '',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'users', cred.user.uid), {
        ...initialProfile,
        createdAtTimestamp: serverTimestamp()
      });
    } catch (e) {
      console.warn('Firestore user doc sync notice:', e);
    }

    localStorage.setItem(`${LOCAL_STORAGE_PROFILE_KEY}_${cred.user.uid}`, JSON.stringify(initialProfile));
    setUserProfile(initialProfile);
  };

  const loginWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    await loadUserProfile(result.user);
  };

  const logout = async () => {
    await signOut(auth);
    setUserProfile(null);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const resendVerificationEmail = async () => {
    if (!auth.currentUser) throw new Error('No user is currently signed in');
    await sendEmailVerification(auth.currentUser);
  };

  const updateProfileData = async (data: Partial<UserProfileData>) => {
    if (!auth.currentUser) throw new Error('User not authenticated');

    // Update Firebase Auth display name / photoURL if provided
    if (data.displayName !== undefined || data.photoURL !== undefined) {
      await updateProfile(auth.currentUser, {
        displayName: data.displayName !== undefined ? data.displayName : auth.currentUser.displayName,
        photoURL: data.photoURL !== undefined ? data.photoURL : auth.currentUser.photoURL,
      });
    }

    // Update Firestore if available
    try {
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userDocRef, {
        ...data,
        updatedAtTimestamp: serverTimestamp()
      });
    } catch {
      // If doc didn't exist or permissions error, fallback to setDoc or local cache
      try {
        const userDocRef = doc(db, 'users', auth.currentUser.uid);
        await setDoc(userDocRef, { ...userProfile, ...data }, { merge: true });
      } catch (err) {
        console.warn('Firestore profile update fallback to local state:', err);
      }
    }

    // Update local state and storage
    const updated = {
      ...(userProfile || {}),
      ...data,
      uid: auth.currentUser.uid,
      email: auth.currentUser.email,
      displayName: data.displayName ?? auth.currentUser.displayName,
      photoURL: data.photoURL ?? auth.currentUser.photoURL,
    } as UserProfileData;

    setUserProfile(updated);
    localStorage.setItem(`${LOCAL_STORAGE_PROFILE_KEY}_${auth.currentUser.uid}`, JSON.stringify(updated));
  };

  const changePassword = async (newPassword: string) => {
    if (!auth.currentUser) throw new Error('User not authenticated');
    await updatePassword(auth.currentUser, newPassword);
  };

  const refreshUser = async () => {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      setCurrentUser(auth.currentUser);
      await loadUserProfile(auth.currentUser);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        logout,
        resetPassword,
        resendVerificationEmail,
        updateProfileData,
        changePassword,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
