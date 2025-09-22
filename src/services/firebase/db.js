// src/services/firebase/db.js
// Firestore CRUD for user profiles, products, cart, and orders

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../../firebase';

const ok = (data) => ({ ok: true, data, error: null });
const fail = (error) => ({ ok: false, data: null, error: normalizeError(error) });

function normalizeError(error) {
  if (!error) return { code: 'unknown', message: 'Unknown error' };
  const { code, message } = error;
  return { code: code || 'unknown', message: message || String(error) };
}

// USERS
export async function getUserProfile(uid) {
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    return ok(snap.exists() ? { id: snap.id, ...snap.data() } : null);
  } catch (e) { return fail(e); }
}

export async function setUserProfile(uid, data) {
  try {
    await setDoc(doc(db, 'users', uid), { ...data, updatedAt: serverTimestamp() }, { merge: true });
    return ok(true);
  } catch (e) { return fail(e); }
}

// PRODUCTS
export async function listProducts({ category, limitTo = 100 } = {}) {
  try {
    const col = collection(db, 'products');
    let q = query(col, orderBy('createdAt', 'desc'), limit(limitTo));
    if (category) q = query(col, where('category', '==', category), orderBy('createdAt', 'desc'), limit(limitTo));
    const snap = await getDocs(q);
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return ok(items);
  } catch (e) { return fail(e); }
}

export async function getProduct(productId) {
  try {
    const snap = await getDoc(doc(db, 'products', productId));
    return ok(snap.exists() ? { id: snap.id, ...snap.data() } : null);
  } catch (e) { return fail(e); }
}

export async function upsertProduct(productId, data) {
  try {
    if (productId) {
      await setDoc(doc(db, 'products', productId), { ...data, updatedAt: serverTimestamp() }, { merge: true });
      return ok(productId);
    }
    const ref = await addDoc(collection(db, 'products'), { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
    return ok(ref.id);
  } catch (e) { return fail(e); }
}

export async function deleteProduct(productId) {
  try { await deleteDoc(doc(db, 'products', productId)); return ok(true); }
  catch (e) { return fail(e); }
}

// CART (per-user subcollection)
export async function getCart(uid) {
  try {
    const col = collection(db, 'users', uid, 'cartItems');
    const snap = await getDocs(col);
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return ok(items);
  } catch (e) { return fail(e); }
}

export async function addToCart(uid, product, qty = 1) {
  try {
    const ref = await addDoc(collection(db, 'users', uid, 'cartItems'), {
      productId: product.id,
      title: product.title || product.name || '',
      price: product.price || 0,
      qty,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return ok(ref.id);
  } catch (e) { return fail(e); }
}

export async function updateCartItem(uid, itemId, data) {
  try {
    await updateDoc(doc(db, 'users', uid, 'cartItems', itemId), { ...data, updatedAt: serverTimestamp() });
    return ok(true);
  } catch (e) { return fail(e); }
}

export async function removeFromCart(uid, itemId) {
  try { await deleteDoc(doc(db, 'users', uid, 'cartItems', itemId)); return ok(true); }
  catch (e) { return fail(e); }
}

// ORDERS (top-level collection with user scoping)
export async function createOrder(uid, { items, total, shipping = {}, payment = {} }) {
  try {
    const ref = await addDoc(collection(db, 'orders'), {
      uid,
      items,
      total,
      shipping,
      payment,
      status: 'created',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return ok(ref.id);
  } catch (e) { return fail(e); }
}

export async function listOrders(uid, { limitTo = 100 } = {}) {
  try {
    const q = query(collection(db, 'orders'), where('uid', '==', uid), orderBy('createdAt', 'desc'), limit(limitTo));
    const snap = await getDocs(q);
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return ok(items);
  } catch (e) { return fail(e); }
}

export async function updateOrder(orderId, data) {
  try {
    await updateDoc(doc(db, 'orders', orderId), { ...data, updatedAt: serverTimestamp() });
    return ok(true);
  } catch (e) { return fail(e); }
}

// ADMIN HELPERS
export async function setUserRole(uid, role) {
  try {
    await setDoc(doc(db, 'users', uid), { role, updatedAt: serverTimestamp() }, { merge: true });
    return ok(true);
  } catch (e) { return fail(e); }
}

// QUIZ RESULTS
export async function saveQuizResult(uid, { scores, answers, prediction, predictions, scoreBreakdown }) {
  try {
    await setDoc(doc(db, 'quizResults', uid), {
      userId: uid,
      scores: scores || {},
      answers: answers || {},
      // maintain both fields for compatibility
      prediction: prediction || null,
      predictions: Array.isArray(predictions) ? predictions : null,
      scoreBreakdown: scoreBreakdown || null,
      completedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }, { merge: true });
    return ok(true);
  } catch (e) { return fail(e); }
}

export async function getQuizResult(uid) {
  try {
    const snap = await getDoc(doc(db, 'quizResults', uid));
    return ok(snap.exists() ? { id: snap.id, ...snap.data() } : null);
  } catch (e) { return fail(e); }
}

// CAREER PATHS
export async function getCareerPath(domain) {
  try {
    const id = String(domain || '').toLowerCase();
    const snap = await getDoc(doc(db, 'career_paths', id));
    return ok(snap.exists() ? { id: snap.id, ...snap.data() } : null);
  } catch (e) { return fail(e); }
}

export async function setCareerPath(domain, data) {
  try {
    const id = String(domain || '').toLowerCase();
    await setDoc(doc(db, 'career_paths', id), {
      title: data?.title || domain,
      steps: Array.isArray(data?.steps) ? data.steps : [],
      scholarships: Array.isArray(data?.scholarships) ? data.scholarships : [],
      colleges: Array.isArray(data?.colleges) ? data.colleges : [],
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    }, { merge: true });
    return ok(true);
  } catch (e) { return fail(e); }
}

// GUIDANCE (per-user)
export async function getGuidance(uid) {
  try {
    const snap = await getDoc(doc(db, 'guidance', uid));
    return ok(snap.exists() ? { id: snap.id, ...snap.data() } : null);
  } catch (e) { return fail(e); }
}

export async function saveGuidance(uid, guidance) {
  try {
    await setDoc(doc(db, 'guidance', uid), {
      ...guidance,
      model: guidance?.meta?.model || 'simulated',
      generatedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }, { merge: true });
    return ok(true);
  } catch (e) { return fail(e); }
}
