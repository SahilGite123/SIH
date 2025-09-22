// src/services/aiRemote.js
// Remote AI caller using Firebase Callable Functions. Requires a deployed function named 'generateGuidance'.
// SECURITY: Do NOT put API keys in frontend. Store model keys in Firebase Functions config.

import { getFunctions, httpsCallable } from 'firebase/functions';

export async function generateGuidanceRemote(payload) {
  // Use default app instance initialized in firebase.js
  const functions = getFunctions();
  const fn = httpsCallable(functions, 'generateGuidance');
  const res = await fn(payload);
  return res.data; // expected to be the structured guidance JSON
}

export default { generateGuidanceRemote };
