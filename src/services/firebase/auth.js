// src/services/firebase/auth.js
// Auth service: signup, login, logout, password reset, Google login, auth state listener

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  getIdToken,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase';

const provider = new GoogleAuthProvider();

// Helper: standardize return
const ok = (data) => ({ ok: true, data, error: null });
const fail = (error) => ({ ok: false, data: null, error: normalizeError(error) });

function normalizeError(error) {
  if (!error) return { code: 'unknown', message: 'Unknown error' };
  const { code, message } = error;
  return { code: code || 'unknown', message: message || String(error) };
}

async function ensureUserProfile(user, extra = {}) {
  try {
    const userRef = doc(db, 'users', user.uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email || '',
        name: user.displayName || extra.name || '',
        photoURL: user.photoURL || '',
        role: extra.role || 'student',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        ...extra,
      }, { merge: true });
    } else if (Object.keys(extra || {}).length) {
      await setDoc(userRef, {
        updatedAt: serverTimestamp(),
        ...extra,
      }, { merge: true });
    }
    return ok(true);
  } catch (error) {
    return fail(error);
  }
}

export async function signupUser({ email, password, name, role = 'student', ...rest }) {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const user = cred.user;
    const res = await ensureUserProfile(user, { name, role, ...rest });
    if (!res.ok) return res;
    return ok({ uid: user.uid, email: user.email });
  } catch (error) {
    return fail(error);
  }
}

export async function loginUser({ email, password }) {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const user = cred.user;
    await ensureUserProfile(user);
    return ok({ uid: user.uid, email: user.email });
  } catch (error) {
    return fail(error);
  }
}

export async function loginWithGoogle() {
  try {
    const cred = await signInWithPopup(auth, provider);
    const user = cred.user;
    await ensureUserProfile(user);
    return ok({ uid: user.uid, email: user.email, name: user.displayName });
  } catch (error) {
    return fail(error);
  }
}

export async function logoutUser() {
  try {
    await signOut(auth);
    return ok(true);
  } catch (error) {
    return fail(error);
  }
}

export async function resetPassword(email) {
  try {
    await sendPasswordResetEmail(auth, email);
    return ok(true);
  } catch (error) {
    return fail(error);
  }
}

export function onAuthChanged(callback) {
  // callback receives { user, uid } or null
  return onAuthStateChanged(auth, (user) => {
    if (!user) return callback(null);
    callback({ user, uid: user.uid });
  });
}

export async function getCurrentUserToken(forceRefresh = false) {
  try {
    if (!auth.currentUser) return ok(null);
    const token = await getIdToken(auth.currentUser, forceRefresh);
    return ok(token);
  } catch (error) {
    return fail(error);
  }
}

export async function isAdmin(uid) {
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    const role = snap.exists() ? snap.data().role : null;
    return ok(role === 'admin');
  } catch (error) {
    return fail(error);
  }
}

export { ensureUserProfile };
