import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  updateProfile,
  onAuthStateChanged,
  type User,
  initAppCheck,
  getAppCheckToken,
  db,
} from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

export type AuthModalView = 'login' | 'register' | 'verify-email';

interface AuthContextType {
  user: User | null;
  uid: string | null;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  signInProvider: string | null;
  loading: boolean;
  authError: string | null;
  isAuthModalOpen: boolean;
  authModalView: AuthModalView;
  openAuthModal: (view?: AuthModalView) => void;
  closeAuthModal: () => void;
  signInWithGoogle: () => Promise<boolean>;
  signInWithEmail: (email: string, pass: string) => Promise<boolean>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<boolean>;
  resendVerificationEmail: () => Promise<boolean>;
  refreshVerificationStatus: () => Promise<boolean>;
  logout: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
  getAppCheckToken: () => Promise<string | null>;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Friendly translation for Firebase Auth error codes
export function formatAuthError(error: any): string {
  const code = error?.code || '';
  switch (code) {
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-disabled':
      return 'This user account has been disabled.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please try again.';
    case 'auth/email-already-in-use':
      return 'An account already exists with this email address. Please sign in.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters with letters and numbers.';
    case 'auth/popup-closed-by-user':
      return 'Sign in was cancelled.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection and retry.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a few moments before trying again.';
    default:
      return error?.message || 'Authentication could not be completed. Please try again.';
  }
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalView, setAuthModalView] = useState<AuthModalView>('login');

  // Initialize App Check on mount
  useEffect(() => {
    initAppCheck();
  }, []);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (currentUser) {
        // Sync user profile to Firestore `/users/{uid}`
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          await setDoc(
            userDocRef,
            {
              uid: currentUser.uid,
              email: currentUser.email || '',
              displayName: currentUser.displayName || '',
              photoURL: currentUser.photoURL || '',
              updatedAt: new Date().toISOString(),
            },
            { merge: true }
          );
        } catch (e: any) {
          console.debug('[ContractLens Auth] Profile sync notification:', e?.message);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const openAuthModal = (view: AuthModalView = 'login') => {
    setAuthError(null);
    setAuthModalView(view);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setAuthError(null);
  };

  const clearAuthError = () => {
    setAuthError(null);
  };

  const signInWithGoogle = async (): Promise<boolean> => {
    setAuthError(null);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      setUser(cred.user);
      closeAuthModal();
      return true;
    } catch (err: any) {
      console.error('[ContractLens Auth] Google sign-in failed:', err);
      setAuthError(formatAuthError(err));
      return false;
    }
  };

  const signInWithEmail = async (email: string, pass: string): Promise<boolean> => {
    setAuthError(null);
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
      setUser(cred.user);
      if (!cred.user.emailVerified) {
        setAuthModalView('verify-email');
        setIsAuthModalOpen(true);
      } else {
        closeAuthModal();
      }
      return true;
    } catch (err: any) {
      console.error('[ContractLens Auth] Email sign-in failed:', err);
      setAuthError(formatAuthError(err));
      return false;
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name: string): Promise<boolean> => {
    setAuthError(null);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      if (name.trim()) {
        await updateProfile(cred.user, { displayName: name.trim() });
      }
      // Send Firebase verification email
      await sendEmailVerification(cred.user);
      setUser(cred.user);
      // Switch view to verify-email prompt
      setAuthModalView('verify-email');
      return true;
    } catch (err: any) {
      console.error('[ContractLens Auth] Sign up failed:', err);
      setAuthError(formatAuthError(err));
      return false;
    }
  };

  const resendVerificationEmail = async (): Promise<boolean> => {
    setAuthError(null);
    if (!auth.currentUser) return false;
    try {
      await sendEmailVerification(auth.currentUser);
      return true;
    } catch (err: any) {
      console.error('[ContractLens Auth] Resend verification failed:', err);
      setAuthError(formatAuthError(err));
      return false;
    }
  };

  const refreshVerificationStatus = async (): Promise<boolean> => {
    if (!auth.currentUser) return false;
    try {
      await auth.currentUser.reload();
      const reloaded = auth.currentUser;
      setUser({ ...reloaded } as User);
      if (reloaded.emailVerified) {
        closeAuthModal();
        return true;
      }
      return false;
    } catch (err: any) {
      console.error('[ContractLens Auth] Refresh verification status error:', err);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
      setUser(null);
      closeAuthModal();
    } catch (err: any) {
      console.error('[ContractLens Auth] Sign out error:', err);
    }
  };

  const getIdToken = async (): Promise<string | null> => {
    if (!auth.currentUser) return null;
    try {
      return await auth.currentUser.getIdToken();
    } catch (err: any) {
      console.error('[ContractLens Auth] Failed to obtain ID token:', err);
      return null;
    }
  };

  const providerId = user?.providerData?.[0]?.providerId || null;
  // Google sign-in accounts are verified by Google OAuth identity provider
  const isEmailVerified = Boolean(user?.emailVerified || providerId === 'google.com');

  return (
    <AuthContext.Provider
      value={{
        user,
        uid: user?.uid || null,
        email: user?.email || null,
        displayName: user?.displayName || user?.email?.split('@')[0] || null,
        photoURL: user?.photoURL || null,
        emailVerified: isEmailVerified,
        signInProvider: providerId,
        loading,
        authError,
        isAuthModalOpen,
        authModalView,
        openAuthModal,
        closeAuthModal,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        resendVerificationEmail,
        refreshVerificationStatus,
        logout,
        getIdToken,
        getAppCheckToken,
        clearAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
