import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  updateProfile,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  type User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  type Firestore,
} from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import {
  initializeAppCheck,
  ReCaptchaEnterpriseProvider,
  CustomProvider,
  getToken as getAppCheckTokenValue,
  type AppCheck,
} from 'firebase/app-check';
import firebaseConfigJson from '../../firebase-applet-config.json';

export const firebaseConfig = {
  apiKey: firebaseConfigJson.apiKey,
  authDomain: firebaseConfigJson.authDomain,
  projectId: firebaseConfigJson.projectId,
  storageBucket: firebaseConfigJson.storageBucket,
  messagingSenderId: firebaseConfigJson.messagingSenderId,
  appId: firebaseConfigJson.appId,
  measurementId: firebaseConfigJson.measurementId || undefined,
};

// Initialize or reuse Firebase App
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Auth with browser local persistence
export const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence).catch((err) => {
  console.warn('[ContractLens Auth] Persistence initialization notice:', err?.message);
});

// Configure Google Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Initialize Firestore targeting the provisioned custom database ID
const databaseId = firebaseConfigJson.firestoreDatabaseId || '(default)';
export const db: Firestore = getFirestore(app, databaseId);

// Initialize Firebase Storage
export const storage: FirebaseStorage = getStorage(app);

// Initialize Firebase App Check
// Integration point: Protected against abuse using reCAPTCHA Enterprise
let appCheckInstance: AppCheck | null = null;

export function initAppCheck(): AppCheck | null {
  if (typeof window === 'undefined') return null;
  if (appCheckInstance) return appCheckInstance;

  try {
    const siteKey = firebaseConfigJson.recaptchaSiteKey;
    if (siteKey && siteKey.trim() !== '') {
      console.log('[ContractLens Security] Initializing Firebase App Check with reCAPTCHA Enterprise');
      appCheckInstance = initializeAppCheck(app, {
        provider: new ReCaptchaEnterpriseProvider(siteKey),
        isTokenAutoRefreshEnabled: true,
      });
    } else {
      // In development / preview when site key is not yet provisioned in Cloud console,
      // provide a non-blocking custom provider so the application remains 100% functional
      console.info('[ContractLens Security] App Check integration point ready (awaiting production reCAPTCHA Enterprise key)');
      appCheckInstance = initializeAppCheck(app, {
        provider: new CustomProvider({
          getToken: async () => {
            return {
              token: 'contractlens_dev_appcheck_token_' + Date.now(),
              expireTimeMillis: Date.now() + 60 * 60 * 1000,
            };
          },
        }),
        isTokenAutoRefreshEnabled: true,
      });
    }
  } catch (err: any) {
    console.warn('[ContractLens Security] App Check initialization note:', err?.message);
  }

  return appCheckInstance;
}

// Safely obtain App Check token for backend requests
export async function getAppCheckToken(): Promise<string | null> {
  if (!appCheckInstance) {
    initAppCheck();
  }
  if (!appCheckInstance) return null;

  try {
    const result = await getAppCheckTokenValue(appCheckInstance, false);
    return result?.token || null;
  } catch (err: any) {
    console.debug('[ContractLens Security] App Check token acquisition skipped:', err?.message);
    return null;
  }
}

// Validate connection to Firestore as recommended in skill guidelines
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'system', 'connection_probe'));
    return true;
  } catch (error: any) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('[ContractLens] Firestore offline notification:', error.message);
    }
    return false;
  }
}

export type { User, Firestore, FirebaseStorage, AppCheck };

export {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  updateProfile,
  onAuthStateChanged,
};
