import { initializeApp } from 'firebase/app';
import { getAuth, Auth, connectAuthEmulator } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDFXjMY4A-2JzBVOwUOHlDUG3v_--4UpFY",
  authDomain: "career-ai-6ecc2.firebaseapp.com",
  projectId: "career-ai-6ecc2",
  storageBucket: "career-ai-6ecc2.firebasestorage.app",
  messagingSenderId: "300489155434",
  appId: "1:300489155434:web:2f0dc7c9c180f235aabb13",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth: Auth = getAuth(app);

// Local/E2E testing only: route Firebase Auth to the emulator so test sign-ups
// never touch the real Firebase project. Unset in production.
const authEmulatorHost = process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST;
if (authEmulatorHost && typeof window !== 'undefined' && !(window as any).__aarikaAuthEmulator) {
  connectAuthEmulator(auth, `http://${authEmulatorHost}`, { disableWarnings: true });
  (window as any).__aarikaAuthEmulator = true;
}

// Auth utility functions
export const getStoredUser = () => {
  try {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    console.error('Error parsing stored user:', error);
    return null;
  }
};

export const getStoredToken = () => {
  return localStorage.getItem('authToken');
};

export const clearAuthStorage = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('authToken');
};

export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true;
  }
};

export const getUserRole = () => {
  const user = getStoredUser();
  return user?.role || 'user';
};

export const isAuthenticated = (): boolean => {
  const token = getStoredToken();
  const user = getStoredUser();
  
  if (!token || !user) {
    return false;
  }
  
  // Check if token is expired
  if (isTokenExpired(token)) {
    clearAuthStorage();
    return false;
  }
  
  return true;
};