// src/services/aiGuidanceSim.js
// Client-side dynamic simulation for AI guidance (no external API).
// Consumes: student profile + quiz results; Produces: structured JSON matching Windsurf prompt spec.

function normalizeArray(arr) {
  return Array.isArray(arr) ? arr : [];
}

function scoreDomainFromProfile(profile, quizScores) {
  const grades = profile?.grades || {};
  const interests = new Set(normalizeArray(profile?.interests).map(String));
  const skills = new Set(normalizeArray(profile?.skills).map(String));
  const prefs = profile?.preferences || {};

  const s = (quizScores || {});
  const math = Number(grades.Math || 0);
  const science = Number(grades.Science || 0);
  const english = Number(grades.English || 0);

  const has = (set, v) => set.has(String(v));

  // Heuristic base scores mixed from profile + quiz
  const engineering = (s.Science || 0) * 0.6 + (s.Logic || 0) * 0.5 + (s.Math || 0) * 0.6 + (has(interests, 'Technology') ? 5 : 0) + (math > 80 ? 5 : 0);
  const medicine = (s.Biology || 0) * 0.8 + (s.Science || 0) * 0.4 + (has(interests, 'Biology') ? 5 : 0) + (science > 80 ? 4 : 0);
  const law = (s.Communication || 0) * 0.6 + (s.Logic || 0) * 0.5 + (english > 80 ? 3 : 0);
  const commerce = (s.Commerce || 0) * 0.7 + (s.Math || 0) * 0.3 + (has(interests, 'Business') ? 4 : 0);
  const upsc = (s.GK || 0) * 0.7 + (s.Leadership || 0) * 0.5 + (s.Communication || 0) * 0.4 + (has(skills, 'Analytical thinking') ? 2 : 0);
  const arts = (s.Arts || 0) * 0.7 + (s.Creativity || 0) * 0.7 + (has(interests, 'Design') || has(interests, 'Media') ? 3 : 0);

  const raw = [
    { domain: 'Engineering', score: engineering },
    { domain: 'Medicine', score: medicine },
    { domain: 'Law', score: law },
    { domain: 'Commerce', score: commerce },
    { domain: 'UPSC', score: upsc },
    { domain: 'Arts', score: arts },
  ].sort((a,b) => b.score - a.score);

  const sum = raw.reduce((acc, r) => acc + Math.max(0, r.score), 0) || 1;
  return raw.slice(0, 5).map(r => ({ domain: r.domain, confidence: +(Math.max(0, r.score)/sum).toFixed(4) }));
}

function jkBoost(items = []) {
  const JK_KEYWORDS = ['J&K', 'Jammu', 'Kashmir', 'Srinagar'];
  const score = (text) => {
    const t = String(text || '').toLowerCase();
    return JK_KEYWORDS.some(k => t.includes(k.toLowerCase())) ? 1 : 0;
  };
  return [...items].sort((a, b) => (score(b.title||b)||0) - (score(a.title||a)||0));
}

export function generateGuidanceSim({ student_profile, past_quiz_responses = [], quizScores = {} }) {
  const name = student_profile?.name || 'Student';
  const location = student_profile?.location || 'J&K';
  const predictions = scoreDomainFromProfile(student_profile, quizScores);

  // Careers with rationale/resources (mocked but contextual)
  const careers = predictions.slice(0, 5).map((p) => ({
    title: p.domain,
    rationale: `${p.domain} aligns with your interests/skills and quiz signals. Confidence ${(p.confidence*100).toFixed(1)}%.`,
    strengths_match: normalizeArray(student_profile?.skills).slice(0, 3),
    resources: [
      { type: 'course', title: 'Intro to ' + p.domain, link: 'https://www.coursera.org' },
      { type: 'project', title: `${p.domain} Mini Project`, link: 'https://www.github.com/topics' }
    ]
  }));

  // Scholarships & Colleges (India/J&K aware)
  const baseSch = [
    { title: 'PMSS for J&K Students', region: 'J&K', eligibility: 'Class 12 pass; domicile J&K', deadline: '2025-10-31', link: 'https://aicte-india.org/PMSS' },
    { title: 'NSP National Scholarship', region: 'India', eligibility: 'Varies', deadline: '2025-12-31', link: 'https://scholarships.gov.in' },
    { title: 'State Merit Scholarship', region: 'India', eligibility: 'Merit-based', deadline: '2025-11-15', link: 'https://example.state.gov/scholarship' },
  ];
  const baseColleges = [
    { title: 'NIT Srinagar', region: 'J&K', link: 'https://nitsri.ac.in' },
    { title: 'AIIMS Jammu', region: 'J&K', link: 'https://aiimsjammu.edu.in' },
    { title: 'IIT Delhi', region: 'India', link: 'https://home.iitd.ac.in' },
    { title: 'NIT Trichy', region: 'India', link: 'https://www.nitt.edu' }
  ];

  const scholarships = jkBoost(baseSch);
  const colleges = jkBoost(baseColleges);

  // Adaptive Quiz (next 5)
  const adaptive_quiz = [
    { question: 'How comfortable are you with Data Structures & Algorithms?', type: 'rating', scale: 5 },
    { question: 'Which work style do you prefer?', type: 'mcq', options: ['Remote', 'On-site', 'Hybrid'] },
    { question: 'Rate your interest in Biology/Healthcare.', type: 'rating', scale: 5 },
    { question: 'Pick domains you want to explore more.', type: 'mcq', options: ['AI/ML', 'Design', 'Law', 'Finance'] },
    { question: 'How many hours/week can you spend on skill-building?', type: 'mcq', options: ['<3', '3-5', '6-10', '10+'] }
  ];

  // Action Plan
  const action_plan = {
    short_term: ['Finish a foundations course aligned to top domain', 'Complete 20 practice problems weekly', 'Build 1 mini-project'],
    medium_term: ['Apply for an internship/competition', 'Earn 1 certification (e.g., AWS, Coursera Specialization)'],
    long_term: ['Target degree aligned to top domain', 'Plan for specialization or civil services as per interest']
  };

  // Analytics Suggestions
  const analytics_suggestions = [
    { insight: 'Many students show weaker Logic/Quant scores. Recommend weekend workshops.', metric: 'logic_weak_share' },
  ];

  return {
    careers,
    scholarships,
    colleges,
    adaptive_quiz,
    action_plan,
    analytics_suggestions,
    meta: { name, location, predictions }
  };
}

export default { generateGuidanceSim };
