// functions/index.js
// Firebase Cloud Functions: generateGuidance (Gemini 1.5) callable
// - Uses server-side API key from functions config: functions:config:set gemini.key="..."
// - Builds prompt from student profile + quiz data
// - Requests strict JSON; validates and saves to Firestore guidance/{uid}

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { GoogleGenerativeAI } = require('@google/generative-ai');

admin.initializeApp();
const db = admin.firestore();

function buildPrompt({ student_profile = {}, past_quiz_responses = [] }) {
  const p = student_profile || {};
  return `You are an expert AI Career Mentor and Education Advisor.
Return ONLY valid JSON.

Input:
${JSON.stringify({ student_profile: p, past_quiz_responses }, null, 2)}

Task:
1. Identify the best career stream (e.g., BSc, Commerce, Engineering) for the student.
2. If the stream is broad, suggest the best specialization(s) and explain why.
3. For the top specialization, provide a step-by-step roadmap including skills, courses/certifications, internships/projects, career options, expected growth.
4. Optionally, provide secondary career options in the same stream for comparison.

Respond in this JSON structure:
{
  "student_name": string,
  "stream": string,
  "top_specialization": {
    "name": string,
    "reason": string,
    "roadmap": string[],
    "career_options": [{"title": string, "growth": string}]
  },
  "alternative_specializations": [
    {
      "name": string,
      "reason": string,
      "roadmap": string[],
      "career_options": [{"title": string, "growth": string}]
    }
  ]
}
`;
}

function safeJsonParse(text) {
  try {
    // Sometimes models wrap JSON in code fences
    const cleaned = text.replace(/^```(json)?/i, '').replace(/```$/i, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    throw new Error('AI returned non-JSON or malformed JSON');
  }
}

exports.generateGuidance = functions.https.onCall(async (data, context) => {
  // Require auth
  const uid = context.auth?.uid || data?.uid;
  if (!uid) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { student_profile = null, past_quiz_responses = [], quizScores = {} } = data || {};

  // If profile not sent, try reading from Firestore
  let profile = student_profile;
  if (!profile) {
    const profSnap = await db.collection('users').doc(uid).get();
    profile = profSnap.exists ? profSnap.data() : {};
  }

  // Build prompt
  const prompt = buildPrompt({ student_profile: profile, past_quiz_responses });

  // Call Gemini 1.5
  const apiKey = functions.config().gemini?.key;
  if (!apiKey) {
    throw new functions.https.HttpsError('failed-precondition', 'Gemini API key not configured');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  let aiResponseText = '';
  try {
    const result = await model.generateContent({ contents: [{ role: 'user', parts: [{ text: prompt }] }] });
    aiResponseText = result?.response?.text?.() || '';
  } catch (e) {
    console.error('Gemini call failed:', e);
    throw new functions.https.HttpsError('internal', 'AI generation failed');
  }

  // Parse JSON
  let guidance;
  try {
    guidance = safeJsonParse(aiResponseText);
  } catch (e) {
    console.error('JSON parse error:', e, aiResponseText);
    throw new functions.https.HttpsError('internal', 'AI returned invalid JSON');
  }

  // Persist to Firestore
  const payload = {
    ...guidance,
    meta: {
      model: 'gemini-1.5-flash',
      generatedAt: admin.firestore.FieldValue.serverTimestamp(),
      inputs: { usedQuizScores: !!quizScores && Object.keys(quizScores).length > 0 },
    },
  };

  await db.collection('guidance').doc(uid).set(payload, { merge: true });

  return payload;
});
