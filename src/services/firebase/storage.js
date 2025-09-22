// src/services/firebase/storage.js
// File/image uploads and URL retrieval

import { getDownloadURL, ref, uploadBytes, uploadBytesResumable } from 'firebase/storage';
import { storage } from '../../firebase';

const ok = (data) => ({ ok: true, data, error: null });
const fail = (error) => ({ ok: false, data: null, error: normalizeError(error) });

function normalizeError(error) {
  if (!error) return { code: 'unknown', message: 'Unknown error' };
  const { code, message } = error;
  return { code: code || 'unknown', message: message || String(error) };
}

export async function uploadFile(path, file, { metadata } = {}) {
  try {
    const storageRef = ref(storage, path);
    const snap = await uploadBytes(storageRef, file, metadata);
    const url = await getDownloadURL(snap.ref);
    return ok({ path, url });
  } catch (e) { return fail(e); }
}

export function uploadFileResumable(path, file, { metadata, onProgress, onError, onComplete } = {}) {
  const storageRef = ref(storage, path);
  const task = uploadBytesResumable(storageRef, file, metadata);
  task.on('state_changed', (snapshot) => {
    if (onProgress) {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      onProgress(progress, snapshot);
    }
  }, (error) => {
    if (onError) onError(normalizeError(error));
  }, async () => {
    const url = await getDownloadURL(task.snapshot.ref);
    if (onComplete) onComplete({ path, url });
  });
  return task;
}

export async function getFileURL(path) {
  try {
    const storageRef = ref(storage, path);
    const url = await getDownloadURL(storageRef);
    return ok(url);
  } catch (e) { return fail(e); }
}
