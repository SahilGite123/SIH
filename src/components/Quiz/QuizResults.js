import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import mlModel from '../../services/mlModel';
import { auth } from '../../firebase';
import { getCareerPath, setCareerPath, saveQuizResult, getUserProfile, getQuizResult } from '../../services/firebase/db';
import CareerRoadmap from '../CareerRoadmap/CareerRoadmap';
import { generateRoadmapAI } from '../../services/ai';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function QuizResults({ scores, onRetake }) {
  const { t } = useTranslation();
  const [localScores, setLocalScores] = useState(scores || null);
  const [predictions, setPredictions] = useState([]);
  const [mainPath, setMainPath] = useState(null);
  const [altPaths, setAltPaths] = useState([]);
  const [location, setLocation] = useState('J&K');
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const data = localScores ? {
    labels: Object.keys(localScores).map(key => t(key.toLowerCase())),
    datasets: [
      {
        label: 'Your Score',
        data: Object.values(localScores),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
        ],
        borderWidth: 1,
      },
    ],
  } : null;

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: true,
        text: 'Aptitude & Interest Quiz Results',
      },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.dataset.label}: ${ctx.parsed.y}`,
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0,0,0,0.06)' },
        ticks: { stepSize: 5 },
        max: 50, // Assuming max score per category is 10 questions * 5 (max value) = 50
      },
      x: { grid: { display: false } },
    },
    elements: { bar: { borderRadius: 8, borderSkipped: false } },
    animation: { duration: 700, easing: 'easeOutQuart' },
  };

  useEffect(() => {
    (async () => {
      try {
        // -1) If scores were not passed in, try to load last saved quiz result
        if (!localScores) {
          if (!auth.currentUser) {
            throw new Error('Please login to view your saved quiz results.');
          }
          const last = await getQuizResult(auth.currentUser.uid);
          if (last.ok && last.data && last.data.scores) {
            setLocalScores(last.data.scores);
          } else {
            throw new Error('No saved quiz results found. Please take the quiz.');
          }
        }

        // 0) Fetch user profile for location-awareness
        let profile = null;
        if (auth.currentUser) {
          const profRes = await getUserProfile(auth.currentUser.uid);
          if (profRes.ok) profile = profRes.data;
        }

        // 1) Predict top-3 domains using ML model
        const predRes = mlModel.predict(localScores || {});
        const preds = predRes?.predictions || [];
        setPredictions(preds);

        // 2) Persist quiz result with predictions and breakdown
        if (auth.currentUser) {
          await saveQuizResult(auth.currentUser.uid, {
            scores: localScores,
            answers: {},
            prediction: preds[0] ? { domain: preds[0].domain, confidence: preds[0].confidence } : null,
            predictions: preds,
            scoreBreakdown: predRes?.scoreBreakdown || null,
          });
        }

        // 3) Fetch/generate career paths for main + alternates
        const loc = profile?.location || 'J&K';
        setLocation(loc);
        const toResolve = preds.slice(0, 3);
        const resolved = [];
        for (const p of toResolve) {
          const domainKey = String(p.domain || '').toLowerCase();
          const existing = await getCareerPath(domainKey);
          if (existing.ok && existing.data && existing.data.steps?.length) {
            resolved.push({ domain: p.domain, path: existing.data });
          } else {
            // AI-generate roadmap and save
            const ai = await generateRoadmapAI({ domain: p.domain, location: loc, scores: localScores });
            const toSave = {
              title: ai.title || p.domain,
              steps: ai.steps || [],
              scholarships: ai.scholarships || [],
              colleges: ai.colleges || [],
            };
            await setCareerPath(p.domain, toSave);
            resolved.push({ domain: p.domain, path: { id: domainKey, ...toSave } });
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // removed default seeding helper (now done via AI generator)

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl w-full bg-white p-8 rounded-lg shadow-md space-y-8">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">Quiz Results</h2>
        {data && (
          <div className="p-4">
            <Bar data={data} options={options} />
          </div>
        )}
        <div className="text-center">
          {loading ? (
            <p className="text-gray-600">Computing recommendation...</p>
          ) : err ? (
            <p className="text-red-600">{err}</p>
          ) : (
            <>
              <p className="text-xl font-semibold mt-4">
                Based on your responses, your recommended career is: <span className="text-indigo-600">{predictions?.[0]?.domain}</span>
              </p>
              <div className="mt-3">
                <Link
                  to="/guidance"
                  className="inline-block px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-sm font-medium"
                >
                  View Full Guidance
                </Link>
              </div>
              <button
                onClick={onRetake}
                className="mt-4 w-auto inline-flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Retake Quiz
              </button>
              <CareerRoadmap mainPath={mainPath} altPaths={altPaths} predictions={predictions} location={location} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default QuizResults;
