// src/components/Guidance/GuidancePage.js
import React, { useEffect, useMemo, useState } from 'react';
import { auth } from '../../firebase';
import { getUserProfile, getQuizResult, getGuidance, saveGuidance } from '../../services/firebase/db';
import { generateGuidanceSim } from '../../services/aiGuidanceSim';
import { generateGuidanceRemote } from '../../services/aiRemote';
import { toast } from 'react-hot-toast';
import { BoltIcon, AcademicCapIcon, BriefcaseIcon, GlobeAltIcon, SparklesIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function GuidancePage() {
  const [profile, setProfile] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [guidance, setGuidance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);
  const [savedFlag, setSavedFlag] = useState(false);

  const lastGenerated = useMemo(() => {
    const ts = guidance?.meta?.generatedAt;
    try {
      if (!ts) return null;
      // Firestore Timestamp or ISO
      const date = ts?.toDate ? ts.toDate() : new Date(ts);
      if (!date || isNaN(date.getTime())) return null;
      return date.toLocaleString();
    } catch { return null; }
  }, [guidance]);

  useEffect(() => {
    (async () => {
      try {
        if (!auth.currentUser) {
          setErr('Please login to view guidance');
          setLoading(false);
          return;
        }
        const uid = auth.currentUser.uid;
        const [p, q, g] = await Promise.all([
          getUserProfile(uid),
          getQuizResult(uid),
          getGuidance(uid),
        ]);
        if (p.ok) setProfile(p.data);
        if (q.ok) setQuiz(q.data);
        if (g.ok) setGuidance(g.data);
      } catch (e) {
        setErr(e.message || String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleGenerate() {
    try {
      setErr(null);
      setSavedFlag(false);
      if (!auth.currentUser) throw new Error('Not logged in');
      const student_profile = profile || {};
      const quizScores = quiz?.scores || {};
      const past_quiz_responses = quiz?.answers || [];
      let gen = null;
      if (process.env.REACT_APP_AI_MODE === 'remote') {
        // Prefer remote AI (Cloud Function) if enabled
        try {
          gen = await generateGuidanceRemote({ student_profile, past_quiz_responses, quizScores });
          toast.success('Generated with AI (Gemini)');
          // Auto-save for convenience
          const res = await saveGuidance(auth.currentUser.uid, gen);
          if (res.ok) {
            setSavedFlag(true);
            toast.success('Guidance saved');
          }
        } catch (e) {
          console.warn('Remote AI failed, falling back to simulator:', e);
          gen = generateGuidanceSim({ student_profile, past_quiz_responses, quizScores });
          toast('Using local simulator', { icon: '🧪' });
        }
      } else {
        gen = generateGuidanceSim({ student_profile, past_quiz_responses, quizScores });
      }
      setGuidance(gen);
    } catch (e) {
      setErr(e.message || String(e));
    }
  }

  async function handleSave() {
    try {
      if (!auth.currentUser) throw new Error('Not logged in');
      if (!guidance) return;
      setSaving(true);
      const res = await saveGuidance(auth.currentUser.uid, guidance);
      if (!res.ok) throw new Error(res.error?.message || 'Failed to save');
      setSavedFlag(true);
    } catch (e) {
      setErr(e.message || String(e));
    } finally {
      setSaving(false);
    }
  }

  const Section = ({ title, children }) => (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
      <h3 className="text-xl font-bold text-gray-900 mb-4">{title}</h3>
      {children}
    </div>
  );

  if (loading) return <div className="p-6">Loading guidance...</div>;
  if (err) return <div className="p-6 text-red-600">{err}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-white py-8">
      <div className="max-w-6xl mx-auto px-4 space-y-6">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-2xl p-6 bg-white shadow-[0_10px_30px_rgba(0,0,0,0.06)] border border-indigo-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">Personalized Guidance</h2>
                {guidance?.meta?.model?.toLowerCase?.().includes('gemini') && (
                  <span className="px-2 py-1 text-xs rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">Powered by Gemini</span>
                )}
                {lastGenerated && (
                  <span className="px-2 py-1 text-xs rounded-full bg-teal-50 text-teal-700 border border-teal-200">Last generated: {lastGenerated}</span>
                )}
              </div>
              <p className="text-gray-600 mt-2 flex items-center gap-2">
                <SparklesIcon className="w-5 h-5 text-indigo-500"/>
                Get a curated plan: careers, scholarships, colleges, and action steps tailored to you.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleGenerate}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow"
              >Generate Guidance</button>
              <button
                onClick={handleSave}
                disabled={!guidance || saving}
                className={`px-4 py-2 rounded-lg ${guidance ? 'bg-green-600 hover:bg-green-700 text-white shadow' : 'bg-gray-300 text-gray-600 cursor-not-allowed'}`}
              >{saving ? 'Saving...' : savedFlag ? 'Saved' : 'Save Guidance'}</button>
            </div>
          </div>
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-100 rounded-full blur-2xl opacity-70 pointer-events-none" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Section title="Student Snapshot">
            <div className="text-sm text-gray-700 space-y-2">
              <div className="flex items-center justify-between"><span className="font-medium">Name</span><span>{profile?.name || '—'}</span></div>
              <div className="flex items-center justify-between"><span className="font-medium">Location</span><span>{profile?.location || 'J&K'}</span></div>
              <div className="flex items-center justify-between"><span className="font-medium">Interests</span><span className="text-right truncate max-w-[60%]">{(profile?.interests || []).join(', ') || '—'}</span></div>
              <div className="flex items-center justify-between"><span className="font-medium">Skills</span><span className="text-right truncate max-w-[60%]">{(profile?.skills || []).join(', ') || '—'}</span></div>
            </div>
          </Section>

          <Section title="Latest Quiz Scores">
            <div className="text-sm text-gray-700 space-y-1">
              {quiz?.scores ? (
                Object.entries(quiz.scores).map(([k,v]) => (
                  <div key={k} className="flex justify-between"><span>{k}</span><span className="font-medium">{v}</span></div>
                ))
              ) : (
                <div>—</div>
              )}
            </div>
          </Section>

          <Section title="Top Predictions">
            <div className="flex flex-wrap gap-2">
              {(guidance?.meta?.predictions || []).slice(0,3).map((p, i) => (
                <span key={i} className={`px-3 py-1 rounded-full text-sm ${i===0 ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-800'}`}>
                  {p.domain} • {(p.confidence*100).toFixed(1)}%
                </span>
              ))}
              {!(guidance?.meta?.predictions || []).length && (
                <span className="text-sm text-gray-500">Generate guidance to view predictions here.</span>
              )}
            </div>
          </Section>
        </div>

        {guidance ? (
          <>
            <Section title="Top Careers">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(guidance.careers || []).map((c, idx) => (
                  <div key={idx} className="p-5 rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2">
                      <BoltIcon className="w-5 h-5 text-indigo-500" />
                      <div className="text-lg font-semibold text-gray-900">{c.title}</div>
                    </div>
                    <div className="text-gray-700 mt-2">{c.rationale}</div>
                    {c.strengths_match && c.strengths_match.length > 0 && (
                      <div className="mt-2 text-sm"><span className="font-medium">Strengths: </span>{c.strengths_match.join(', ')}</div>
                    )}
                    {c.resources && c.resources.length > 0 && (
                      <div className="mt-3">
                        <div className="text-sm font-medium">Resources</div>
                        <ul className="list-disc pl-5 text-sm mt-1">
                          {c.resources.map((r, i) => (
                            <li key={i}><a className="text-indigo-600 hover:underline" href={r.link} target="_blank" rel="noreferrer">{r.title}</a></li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Section title="Scholarships (J&K first)">
                <ul className="list-disc pl-5 space-y-2">
                  {(guidance.scholarships || []).map((s, i) => (
                    <li key={i}>
                      <div className="font-medium flex items-center gap-2">{s.title} {s.region === 'J&K' && <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">J&K</span>}</div>
                      <div className="text-sm text-gray-700">Eligibility: {s.eligibility || '—'} | Deadline: {s.deadline || '—'}</div>
                      {s.link && <a className="text-sm text-indigo-600 hover:underline" href={s.link} target="_blank" rel="noreferrer">Visit</a>}
                    </li>
                  ))}
                </ul>
              </Section>

              <Section title="Colleges (J&K first)">
                <ul className="list-disc pl-5 space-y-2">
                  {(guidance.colleges || []).map((c, i) => (
                    <li key={i}>
                      <div className="font-medium flex items-center gap-2">{c.title} {c.region === 'J&K' && <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">J&K</span>}</div>
                      {c.link && <a className="text-sm text-indigo-600 hover:underline" href={c.link} target="_blank" rel="noreferrer">Visit</a>}
                    </li>
                  ))}
                </ul>
              </Section>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Section title="Adaptive Quiz (Next)">
                <ol className="list-decimal pl-5 space-y-2">
                  {(guidance.adaptive_quiz || []).map((q, i) => (
                    <li key={i}>
                      <div className="font-medium">{q.question}</div>
                      <div className="text-sm text-gray-600">Type: {q.type}{q.scale ? ` (1-${q.scale})` : ''}{q.options ? ` | Options: ${q.options.join(', ')}` : ''}</div>
                    </li>
                  ))}
                </ol>
              </Section>

              <Section title="Action Plan">
                <div className="space-y-3 text-sm text-gray-800">
                  <div>
                    <div className="font-semibold flex items-center gap-2"><CheckCircleIcon className="w-4 h-4 text-teal-600"/> Short Term (1–3 months)</div>
                    <ul className="list-disc pl-5">{(guidance.action_plan?.short_term || []).map((a, i) => <li key={i}>{a}</li>)}</ul>
                  </div>
                  <div>
                    <div className="font-semibold flex items-center gap-2"><CheckCircleIcon className="w-4 h-4 text-indigo-600"/> Medium Term (6–12 months)</div>
                    <ul className="list-disc pl-5">{(guidance.action_plan?.medium_term || []).map((a, i) => <li key={i}>{a}</li>)}</ul>
                  </div>
                  <div>
                    <div className="font-semibold flex items-center gap-2"><CheckCircleIcon className="w-4 h-4 text-purple-600"/> Long Term</div>
                    <ul className="list-disc pl-5">{(guidance.action_plan?.long_term || []).map((a, i) => <li key={i}>{a}</li>)}</ul>
                  </div>
                </div>
              </Section>
            </div>

            <Section title="Analytics Suggestions (Preview)">
              <ul className="list-disc pl-5 text-sm">
                {(guidance.analytics_suggestions || []).map((a, i) => (
                  <li key={i}>{a.insight}</li>
                ))}
              </ul>
            </Section>
          </>
        ) : (
          <div className="bg-white rounded-2xl shadow p-8 border border-gray-100 text-center">
            <div className="mx-auto w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
              <SparklesIcon className="w-6 h-6 text-indigo-500"/>
            </div>
            <h3 className="mt-3 text-lg font-semibold text-gray-900">No guidance yet</h3>
            <p className="text-gray-600 mt-1">Click “Generate Guidance” to build your personalized plan using your profile and quiz.</p>
            <div className="mt-4">
              <button onClick={handleGenerate} className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">Generate Guidance</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
