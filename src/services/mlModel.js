// src/services/mlModel.js
// Lightweight rule-based model that mimics ML behavior for predicting a career domain
// Input: answers/scores object. Can include: Science, Math, Biology, Arts, Commerce,
// Creativity, Logic, GK, Leadership, Communication, Tech, etc.
// Output (updated): Top-3 predictions with normalized confidences,
// e.g. [{ domain: 'Engineering', confidence: 0.85 }, ...], and a score breakdown for debugging/analytics.

function safeGet(scores, key) {
  const v = scores?.[key];
  return typeof v === 'number' && !isNaN(v) ? v : 0;
}

function normalizeScores(raw) {
  // Accept both { Science, Arts, Commerce } and extended features
  const s = {
    Science: safeGet(raw, 'Science') + safeGet(raw, 'science'),
    Arts: safeGet(raw, 'Arts') + safeGet(raw, 'arts') + safeGet(raw, 'Creativity') + safeGet(raw, 'creativity'),
    Commerce: safeGet(raw, 'Commerce') + safeGet(raw, 'commerce'),
    Math: safeGet(raw, 'Math') + safeGet(raw, 'math') + safeGet(raw, 'Quant') + safeGet(raw, 'quant'),
    Biology: safeGet(raw, 'Biology') + safeGet(raw, 'biology'),
    Logic: safeGet(raw, 'Logic') + safeGet(raw, 'logic') + safeGet(raw, 'Reasoning') + safeGet(raw, 'reasoning'),
    GK: safeGet(raw, 'GK') + safeGet(raw, 'gk') + safeGet(raw, 'General') + safeGet(raw, 'general'),
    Leadership: safeGet(raw, 'Leadership') + safeGet(raw, 'leadership'),
    Communication: safeGet(raw, 'Communication') + safeGet(raw, 'communication'),
    Creativity: safeGet(raw, 'Creativity') + safeGet(raw, 'creativity'),
    Tech: safeGet(raw, 'Tech') + safeGet(raw, 'tech'),
  };
  return s;
}

export function predictDomain(rawScores) {
  const s = normalizeScores(rawScores || {});

  // Weighted heuristics
  const engineeringScore = s.Science * 0.6 + s.Math * 0.8 + s.Logic * 0.4 + s.Tech * 0.5;
  const medicineScore = s.Biology * 0.8 + s.Science * 0.5 + s.Communication * 0.2;
  const lawScore = s.Communication * 0.6 + s.Logic * 0.5 + s.GK * 0.4 + s.Leadership * 0.3;
  const commerceScore = s.Commerce * 0.8 + s.Math * 0.5 + s.Logic * 0.3 + s.Communication * 0.2;
  const upscScore = s.GK * 0.7 + s.Leadership * 0.5 + s.Communication * 0.4 + s.Logic * 0.3;
  const artsScore = s.Arts * 0.7 + s.Creativity * 0.7 + s.Communication * 0.2;

  const candidates = [
    { domain: 'Engineering', score: engineeringScore },
    { domain: 'Medicine', score: medicineScore },
    { domain: 'Law', score: lawScore },
    { domain: 'Commerce', score: commerceScore },
    { domain: 'UPSC', score: upscScore },
    { domain: 'Arts', score: artsScore },
  ];

  // Sort by score and compute normalized confidences
  const sorted = [...candidates].sort((a, b) => b.score - a.score);
  const top = sorted.slice(0, 3);
  const sumPos = sorted.reduce((acc, c) => acc + Math.max(c.score, 0), 0);
  const normalized = top.map(c => ({
    domain: c.domain,
    confidence: sumPos > 0 ? Number((Math.max(c.score, 0) / sumPos).toFixed(4)) : Number((1 / top.length).toFixed(4)),
  }));

  return {
    predictions: normalized,
    scoreBreakdown: {
      Engineering: engineeringScore,
      Medicine: medicineScore,
      Law: lawScore,
      Commerce: commerceScore,
      UPSC: upscScore,
      Arts: artsScore,
    },
  };
}

export default {
  predict: predictDomain,
};
