import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import degreesData from '../../data/degrees.json';
import collegesData from '../../data/colleges.json';
import { Link } from 'react-router-dom';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  RadialLinearScale,
} from 'chart.js';
import { Pie, Bar, Radar } from 'react-chartjs-2';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  RadialLinearScale
);

// Stream meta for interactive expandable cards
const STREAMS_CONFIG = [
  {
    key: 'Engineering', tag: 'Science-PCM', color: 'indigo',
    icon: '🛠️',
    careers: [
      { title: 'B.Tech - Computer Science / AI-ML', scope: 'High demand in software, data, AI/ML', roadmap: 'Class 11–12 PCM → JEE Mains/Advanced or CUET → B.Tech CS/AI → SDE/ML Engineer' },
      { title: 'B.Tech - Mechanical / Civil / Electrical', scope: 'Core engineering roles in industry and infrastructure', roadmap: 'Class 11–12 PCM → JEE/CUET → B.Tech (Core) → Design/Project/Plant roles' },
      { title: 'B.Sc - Physics / Maths', scope: 'Research, analytics, higher studies', roadmap: 'Class 11–12 PCM → CUET → B.Sc → MSc/Research/Analytics' },
    ],
  },
  {
    key: 'Medical', tag: 'Science-PCB', color: 'emerald',
    icon: '🩺',
    careers: [
      { title: 'MBBS', scope: 'Doctor (clinical practice, specializations)', roadmap: 'Class 11–12 PCB → NEET UG → MBBS → PG (MD/MS)' },
      { title: 'BDS / BAMS / BHMS', scope: 'Dental / Ayurveda / Homeopathy practice', roadmap: 'Class 11–12 PCB → NEET UG/AYUSH → BDS/BAMS/BHMS' },
      { title: 'Nursing / Biotechnology', scope: 'Healthcare workforce and research', roadmap: 'Class 11–12 PCB → CUET/Institute Exams → BSc Nursing/Biotech' },
    ],
  },
  {
    key: 'Commerce', tag: 'Business & Finance', color: 'amber',
    icon: '💼',
    careers: [
      { title: 'B.Com / B.Com (H)', scope: 'Accounting, finance, analytics', roadmap: 'Class 11–12 Commerce → CUET → B.Com → Finance/Analytics' },
      { title: 'CA / CFA', scope: 'Chartered Accountant / Finance Analyst', roadmap: 'Class 11–12 Commerce → CA Foundation / CFA L1 → Articleship/Analyst' },
      { title: 'BBA / Economics', scope: 'Management, consulting, data', roadmap: 'Class 11–12 (any) → CUET → BBA/BA Eco → Management/DA' },
    ],
  },
  {
    key: 'Arts', tag: 'Humanities & Design', color: 'rose',
    icon: '🎨',
    careers: [
      { title: 'BA Psychology / Sociology', scope: 'Counseling, HR, research', roadmap: 'Class 11–12 (any) → CUET → BA Psych/Soc → HR/Research' },
      { title: 'Design / Fine Arts', scope: 'UI/UX, product, visual arts', roadmap: 'Class 11–12 (any) → NID/NIFT/UCEED → B.Des/BFA → Designer' },
      { title: 'Journalism / Media / Literature', scope: 'Reporting, content, editorial', roadmap: 'Class 11–12 (any) → CUET → BA Journalism/Eng → Media/Content' },
    ],
  },
];

// Tailwind-safe color classes
const COLOR_MAP = {
  indigo: {
    cardBg: 'bg-indigo-50',
    cardBorder: 'border-indigo-200',
    chipBorder: 'border-indigo-200',
    chipText: 'text-indigo-700',
  },
  emerald: {
    cardBg: 'bg-emerald-50',
    cardBorder: 'border-emerald-200',
    chipBorder: 'border-emerald-200',
    chipText: 'text-emerald-700',
  },
  amber: {
    cardBg: 'bg-amber-50',
    cardBorder: 'border-amber-200',
    chipBorder: 'border-amber-200',
    chipText: 'text-amber-700',
  },
  rose: {
    cardBg: 'bg-rose-50',
    cardBorder: 'border-rose-200',
    chipBorder: 'border-rose-200',
    chipText: 'text-rose-700',
  },
};

function Recommendations() {
  const { t } = useTranslation();
  const [userProfile, setUserProfile] = useState(null);
  const [quizResults, setQuizResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recommendedDegrees, setRecommendedDegrees] = useState([]);
  const [recommendedColleges, setRecommendedColleges] = useState([]);
  const [allDegrees, setAllDegrees] = useState([]);
  const [allColleges, setAllColleges] = useState([]);
  const [showRecommended, setShowRecommended] = useState(true);
  const [hasQuizResults, setHasQuizResults] = useState(false);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (auth.currentUser) {
        try {
          // Fetch user profile
          const userDocRef = doc(db, "users", auth.currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            setUserProfile(userDocSnap.data());
          } else {
            setError("User profile not found.");
            setLoading(false);
            return;
          }

          // Try to fetch quiz results from Firestore
          try {
            const quizDocRef = doc(db, "quizResults", auth.currentUser.uid);
            const quizDocSnap = await getDoc(quizDocRef);
            if (quizDocSnap.exists()) {
              setQuizResults(quizDocSnap.data().scores);
              setHasQuizResults(true);
            } else {
              // Use mock data if no quiz results found
              const mockQuizResults = { Science: 40, Arts: 25, Commerce: 30 };
              setQuizResults(mockQuizResults);
              setHasQuizResults(false);
            }
          } catch (quizError) {
            console.log('No quiz results found, using mock data');
            const mockQuizResults = { Science: 40, Arts: 25, Commerce: 30 };
            setQuizResults(mockQuizResults);
            setHasQuizResults(false);
          }

        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
        setError("No user logged in.");
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (userProfile && quizResults) {
      // Simple rule-based recommendation logic
      const recommend = () => {
        let streamRecommendation = '';
        let maxScore = 0;
        for (const stream in quizResults) {
          if (quizResults[stream] > maxScore) {
            maxScore = quizResults[stream];
            streamRecommendation = stream;
          }
        }

        const filteredDegrees = degreesData.filter(degree =>
          degree.streams.includes(streamRecommendation)
        );

        // Further filter by user preferences if available
        let finalDegrees = filteredDegrees;
        if (userProfile.preferences) {
          const preferredStreams = userProfile.preferences.split(',').map(p => p.trim());
          finalDegrees = filteredDegrees.filter(degree =>
            degree.streams.some(s => preferredStreams.includes(s))
          );
        }

        setRecommendedDegrees(finalDegrees);

        // Recommend colleges based on recommended degrees and location
        const collegeRecommendations = collegesData.filter(college =>
          finalDegrees.some(degree =>
            college.courses.some(course =>
              degree.name.includes(course.split(' ')[0]) || degree.name.includes(course) // Simple matching
            )
          ) && (userProfile.location ? college.location.address.includes(userProfile.location) : true)
        );

        setRecommendedColleges(collegeRecommendations);
        
        // Set all degrees and colleges for "All" view
        setAllDegrees(degreesData);
        setAllColleges(collegesData);
      };

      recommend();
    }
  }, [userProfile, quizResults]);

  if (loading) {
    return <div className="text-center py-10">Loading recommendations...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">Error: {error}</div>;
  }

  const currentDegrees = showRecommended ? recommendedDegrees : allDegrees;
  const currentColleges = showRecommended ? recommendedColleges : allColleges;

  // Rank streams based on quiz results; split Science into Engineering & Medical when possible
  const rankedStreams = (() => {
    if (!quizResults) return STREAMS_CONFIG;
    const sciScore = quizResults.Science || 0;
    const artScore = quizResults.Arts || 0;
    const comScore = quizResults.Commerce || 0;
    const arr = [
      { key: 'Engineering', score: sciScore },
      { key: 'Medical', score: sciScore },
      { key: 'Commerce', score: comScore },
      { key: 'Arts', score: artScore },
    ];
    const byKey = Object.fromEntries(STREAMS_CONFIG.map(s => [s.key, s]));
    return arr
      .sort((a,b) => b.score - a.score)
      .map(x => ({ ...byKey[x.key], score: x.score }));
  })();

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-6">
      <div className="w-full bg-white p-8 rounded-lg shadow-md space-y-8">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-extrabold text-gray-900">{t('recommendations')}</h2>
          <Link
            to="/guidance"
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-sm font-medium"
          >
            View Full Guidance
          </Link>
          
          {/* Filter Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setShowRecommended(true)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                showRecommended
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Recommended {hasQuizResults ? '(Based on Quiz)' : '(Sample)'}
            </button>
            <button
              onClick={() => setShowRecommended(false)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                !showRecommended
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All Options
            </button>
          </div>

        {/* Interactive Stream Cards */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {rankedStreams.map((s) => {
            const colors = COLOR_MAP[s.color] || COLOR_MAP.indigo;
            return (
            <div key={s.key} className={`rounded-xl border p-4 hover:shadow-md transition-shadow cursor-pointer ${colors.cardBg} ${colors.cardBorder}`}
              onClick={() => setExpanded(expanded === s.key ? null : s.key)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{s.icon}</span>
                  <div>
                    <div className="text-lg font-semibold text-gray-900">{s.key} <span className={`ml-2 text-xs px-2 py-0.5 rounded-full bg-white border ${colors.chipBorder} ${colors.chipText}`}>{s.tag}</span></div>
                    {typeof s.score === 'number' && <div className="text-sm text-gray-600">Fit score ~ {s.score}</div>}
                  </div>
                </div>
                <div className="text-sm text-gray-500">{expanded === s.key ? 'Hide' : 'Explore'} ▾</div>
              </div>
              {expanded === s.key && (
                <div className="mt-3 space-y-3">
                  {s.careers.map((c, idx) => (
                    <div key={idx} className="rounded-lg bg-white border border-gray-100 p-3">
                      <div className="font-medium text-gray-900">{c.title}</div>
                      <div className="text-sm text-gray-700">Scope: {c.scope}</div>
                      <div className="text-sm text-gray-600 mt-1">Roadmap: {c.roadmap}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );})}
        </div>

        {/* Charts: Stream distribution and Degree alignment */}
        {quizResults && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Stream distribution (Pie) */}
            <div className="p-4 border rounded-lg">
              <h4 className="text-lg font-semibold mb-2">Stream Distribution</h4>
              <Pie
                data={{
                  labels: Object.keys(quizResults),
                  datasets: [
                    {
                      label: 'Score',
                      data: Object.values(quizResults),
                      backgroundColor: ['#6366f1', '#22c55e', '#f97316'],
                      borderWidth: 0,
                    },
                  ],
                }}
                options={{
                  plugins: {
                    legend: { position: 'bottom' },
                    tooltip: { callbacks: { label: (ctx) => ` ${ctx.label}: ${ctx.parsed}` } },
                  },
                  animation: { duration: 800, easing: 'easeOutQuart' },
                }}
              />
            </div>

            {/* Degree count by stream (Bar) */}
            <div className="p-4 border rounded-lg lg:col-span-2">
              <h4 className="text-lg font-semibold mb-2">Degree Options by Stream</h4>
              <Bar
                data={{
                  labels: ['Science', 'Arts', 'Commerce'],
                  datasets: [
                    {
                      label: 'Recommended Degrees',
                      data: [
                        (recommendedDegrees || []).filter(d => d.streams.includes('Science')).length,
                        (recommendedDegrees || []).filter(d => d.streams.includes('Arts')).length,
                        (recommendedDegrees || []).filter(d => d.streams.includes('Commerce')).length,
                      ],
                      backgroundColor: '#6366f1',
                    },
                    {
                      label: 'All Degrees',
                      data: [
                        (allDegrees || []).filter(d => d.streams.includes('Science')).length,
                        (allDegrees || []).filter(d => d.streams.includes('Arts')).length,
                        (allDegrees || []).filter(d => d.streams.includes('Commerce')).length,
                      ],
                      backgroundColor: '#c7d2fe',
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { position: 'bottom' },
                    tooltip: { callbacks: { label: (ctx) => ` ${ctx.dataset.label}: ${ctx.parsed.y}` } },
                  },
                  scales: {
                    y: { beginAtZero: true, ticks: { stepSize: 1 }, grid: { color: 'rgba(0,0,0,0.06)' } },
                    x: { grid: { display: false } },
                  },
                  elements: { bar: { borderRadius: 8, borderSkipped: false } },
                  animation: { duration: 800, easing: 'easeOutQuart' },
                }}
              />
            </div>
          </div>
        )}
        </div>
        
        {!hasQuizResults && showRecommended && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Sample Recommendations
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>These are sample recommendations. Take the quiz to get personalized suggestions based on your interests and aptitude.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentDegrees.length > 0 && (
          <div>
            <h3 className="text-2xl font-semibold mt-6 mb-4">
              {showRecommended ? 'Recommended Degrees' : 'All Available Degrees'}
              <span className="text-lg text-gray-500 ml-2">({currentDegrees.length} options)</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentDegrees.map((degree) => (
                <div key={degree.id} className="border border-gray-200 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <h4 className="text-xl font-bold mb-3 text-indigo-600">{degree.name}</h4>
                  <p className="text-gray-700 mb-3">{degree.description}</p>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Streams:</p>
                      <p className="text-sm text-gray-800">{degree.streams.join(', ')}</p>
                    </div>
                    {degree.job_roles && degree.job_roles.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-600">Career Options:</p>
                        <p className="text-sm text-gray-800">{degree.job_roles.map(job => job.name).join(', ')}</p>
                      </div>
                    )}
                    {degree.relevant_exams && degree.relevant_exams.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-600">Relevant Exams:</p>
                        <p className="text-sm text-gray-800">{degree.relevant_exams.join(', ')}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentColleges.length > 0 && (
          <div>
            <h3 className="text-2xl font-semibold mt-6 mb-4">
              {showRecommended ? 'Recommended Colleges' : 'All Available Colleges'}
              <span className="text-lg text-gray-500 ml-2">({currentColleges.length} options)</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentColleges.map((college) => (
                <div key={college.id} className="border border-gray-200 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <h4 className="text-xl font-bold mb-3 text-green-600">{college.name}</h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Location:</p>
                      <p className="text-sm text-gray-800">{college.location.address}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Available Courses:</p>
                      <p className="text-sm text-gray-800">{college.courses.join(', ')}</p>
                    </div>
                    {college.type && (
                      <div>
                        <p className="text-sm font-medium text-gray-600">Type:</p>
                        <p className="text-sm text-gray-800 capitalize">{college.type}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentDegrees.length === 0 && currentColleges.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Options Available</h3>
            <p className="text-gray-600">No {showRecommended ? 'recommendations' : 'options'} available at the moment.</p>
            {showRecommended && (
              <p className="text-gray-600 mt-2">Complete the quiz and update your profile to get personalized recommendations!</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Recommendations;
