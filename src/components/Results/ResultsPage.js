// src/components/Results/ResultsPage.js
import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Link } from 'react-router-dom';
import { auth } from '../../firebase';
import { getQuizResult, getUserProfile, getCareerPath, setCareerPath } from '../../services/firebase/db';
import mlModel from '../../services/mlModel';
import CareerRoadmap from '../CareerRoadmap/CareerRoadmap';
import { generateRoadmapAI } from '../../services/ai';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function ResultsPage() {
  const [scores, setScores] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [mainPath, setMainPath] = useState(null);
  const [altPaths, setAltPaths] = useState([]);
  const [location, setLocation] = useState('J&K');
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        if (!auth.currentUser) {
          throw new Error('Please login to view your results.');
        }
        const uid = auth.currentUser.uid;
        const [q, p] = await Promise.all([
          getQuizResult(uid),
          getUserProfile(uid),
        ]);
        if (p.ok && p.data?.location) setLocation(p.data.location);

        if (!q.ok || !q.data || !q.data.scores) {
          throw new Error('No saved quiz results found. Please take the quiz.');
        }
        setScores(q.data.scores);

        // Derive predictions directly from the 4-category chart to stay consistent with visuals
        const s = q.data.scores || {};
        const four = [
          { domain: 'Engineering', score: (s.Science ?? 0) },
          { domain: 'Medical', score: (s.Science ?? 0) },
          { domain: 'Commerce', score: (s.Commerce ?? 0) },
          { domain: 'Arts', score: (s.Arts ?? 0) },
        ];
        const sortedFour = [...four].sort((a, b) => b.score - a.score);
        const sum = sortedFour.reduce((acc, it) => acc + Math.max(it.score, 0), 0) || 1;
        const preds = sortedFour.slice(0, 3).map(it => ({
          domain: it.domain,
          confidence: Number((Math.max(it.score, 0) / sum).toFixed(4))
        }));
        setPredictions(preds);

        // Resolve main + alternate career paths
        const toResolve = preds.slice(0, 3);
        const resolved = [];
        for (const pr of toResolve) {
          const domainKey = String(pr.domain || '').toLowerCase();
          const existing = await getCareerPath(domainKey);
          if (existing.ok && existing.data && existing.data.steps?.length) {
            resolved.push({ domain: pr.domain, path: existing.data });
          } else {
            const ai = await generateRoadmapAI({ domain: pr.domain, location: p.data?.location || 'J&K', scores: q.data.scores });
            const toSave = { title: ai.title || pr.domain, steps: ai.steps || [], scholarships: ai.scholarships || [], colleges: ai.colleges || [] };
            await setCareerPath(pr.domain, toSave);
            resolved.push({ domain: pr.domain, path: { id: domainKey, ...toSave } });
          }
        }
        setMainPath(resolved[0]?.path || null);
        setAltPaths(resolved.slice(1).map(r => r.path));
      } catch (e) {
        setErr(e.message || String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Build 4 categories to mirror Dashboard (Engineering, Medical, Commerce, Arts)
  const categories = scores ? [
    { label: 'Engineering', score: (scores?.Science ?? 0) }, // from Science (PCM)
    { label: 'Medical', score: (scores?.Science ?? 0) },     // from Science (PCB)
    { label: 'Commerce', score: (scores?.Commerce ?? 0) },
    { label: 'Arts', score: (scores?.Arts ?? 0) },
  ] : [];

  const colorMap = {
    Engineering: '#3B82F6', // blue
    Medical: '#10B981',     // green
    Commerce: '#F59E0B',    // orange
    Arts: '#6366F1',        // indigo
  };

  const sortedCats = [...categories].sort((a, b) => b.score - a.score);
  const labels = sortedCats.map(c => c.label);
  const values = sortedCats.map(c => c.score);
  const colors = sortedCats.map(c => colorMap[c.label]);

  const data = scores ? {
    labels,
    datasets: [
      {
        label: 'Your Score',
        data: values,
        backgroundColor: colors,
        borderWidth: 0,
      },
    ],
  } : null;

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' },
      title: { display: true, text: 'Aptitude & Interest Quiz Results' },
      tooltip: { callbacks: { label: (ctx) => ` ${ctx.dataset.label}: ${ctx.parsed.y}` } },
    },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 5 }, grid: { color: 'rgba(0,0,0,0.06)' }, max: 50 },
      x: { grid: { display: false } },
    },
    elements: { bar: { borderRadius: 8, borderSkipped: false } },
    animation: { duration: 700, easing: 'easeOutQuart' },
  };

  if (loading) return <div className="p-6">Loading results...</div>;
  if (err) return <div className="p-6 text-red-600">{err}</div>;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full bg-white p-8 rounded-lg shadow-md space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-extrabold text-gray-900">Your Quiz Results</h2>
          <Link to="/guidance" className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-sm font-medium">View Full Guidance</Link>
        </div>
        {data && (
          <div className="p-4">
            <Bar data={data} options={options} />
          </div>
        )}

        <div className="text-center">
          <p className="text-xl font-semibold mt-2">
            Top Match: <span className="text-indigo-600">{predictions?.[0]?.domain || '—'}</span>
          </p>
        </div>

        <CareerRoadmap mainPath={mainPath} altPaths={altPaths} predictions={predictions} location={location} />
      </div>
    </div>
  );
}
