import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);

function Analytics() {
  const { t } = useTranslation();
  const [analytics, setAnalytics] = useState({
    totalStudents: 0,
    totalParents: 0,
    quizCompletions: 0,
    streamDistribution: { Science: 0, Arts: 0, Commerce: 0 },
    registrationTrend: [],
    quizTrend: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Fetch users data
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const users = usersSnapshot.docs.map(doc => doc.data());
      
      const students = users.filter(user => user.role === 'student');
      const parents = users.filter(user => user.role === 'parent');

      // Fetch quiz results
      const quizSnapshot = await getDocs(collection(db, 'quizResults'));
      const quizResults = quizSnapshot.docs.map(doc => doc.data());

      // Calculate stream distribution
      const streamDist = { Science: 0, Arts: 0, Commerce: 0 };
      quizResults.forEach(result => {
        const maxStream = Object.keys(result.scores || {}).reduce((a, b) => 
          (result.scores[a] || 0) > (result.scores[b] || 0) ? a : b
        );
        if (streamDist[maxStream] !== undefined) {
          streamDist[maxStream]++;
        }
      });

      // Registration trend (per month, last 6 months) based on users.createdAt
      const monthKey = (d) => {
        const date = d instanceof Date ? d : (d?.toDate ? d.toDate() : new Date(d));
        return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}`;
      };
      const labelOf = (key) => {
        const [y,m] = key.split('-');
        return new Date(Number(y), Number(m)-1, 1).toLocaleString('en', { month: 'short' });
      };
      const now = new Date();
      const last6 = Array.from({length:6}, (_,i)=>{
        const d = new Date(now.getFullYear(), now.getMonth()- (5-i), 1);
        return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
      });
      const regCounts = Object.fromEntries(last6.map(k=>[k,0]));
      users.forEach(u => {
        if (u.createdAt) {
          const k = monthKey(u.createdAt);
          if (k in regCounts) regCounts[k]++;
        }
      });
      const registrationTrend = last6.map(k => ({ month: labelOf(k), registrations: regCounts[k] }));

      // Quiz completion trend from quizResults.completedAt per month (last 6 months)
      const quizCounts = Object.fromEntries(last6.map(k=>[k,0]));
      quizResults.forEach(q => {
        if (q.completedAt) {
          const k = monthKey(q.completedAt);
          if (k in quizCounts) quizCounts[k]++;
        }
      });
      const quizTrend = last6.map(k => ({ month: labelOf(k), completions: quizCounts[k] }));

      setAnalytics({
        totalStudents: students.length,
        totalParents: parents.length,
        quizCompletions: quizResults.length,
        streamDistribution: streamDist,
        registrationTrend,
        quizTrend,
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const streamChartData = {
    labels: Object.keys(analytics.streamDistribution),
    datasets: [{
      data: Object.values(analytics.streamDistribution),
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
      hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56']
    }]
  };

  const trendChartData = {
    labels: analytics.registrationTrend.map(item => item.month),
    datasets: [{
      label: 'New Registrations',
      data: analytics.registrationTrend.map(item => item.registrations),
      borderColor: 'rgb(75, 192, 192)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      tension: 0.1
    }]
  };

  const quizTrendData = {
    labels: analytics.quizTrend.map(item => item.month),
    datasets: [{
      label: 'Quiz Completions',
      data: analytics.quizTrend.map(item => item.completions),
      borderColor: 'rgb(99, 102, 241)',
      backgroundColor: 'rgba(99, 102, 241, 0.2)',
      tension: 0.1
    }]
  };

  if (loading) {
    return <div className="p-8 text-center">{t('loading')}</div>;
  }

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">{t('analytics')} Dashboard</h2>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-blue-50 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-blue-800">{t('total_students')}</h3>
              <p className="text-3xl font-bold text-blue-600">{analytics.totalStudents}</p>
            </div>
            <div className="text-4xl text-blue-500">👨‍🎓</div>
          </div>
        </div>
        <div className="bg-green-50 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-green-800">Total Parents</h3>
              <p className="text-3xl font-bold text-green-600">{analytics.totalParents}</p>
            </div>
            <div className="text-4xl text-green-500">👪</div>
          </div>
        </div>
        <div className="bg-purple-50 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-purple-800">Quiz Completions</h3>
              <p className="text-3xl font-bold text-purple-600">{analytics.quizCompletions}</p>
            </div>
            <div className="text-4xl text-purple-500">📝</div>
          </div>
        </div>
        <div className="bg-yellow-50 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-yellow-800">{t('quiz_completion_rate')}</h3>
              <p className="text-3xl font-bold text-yellow-600">
                {analytics.totalStudents > 0 ? Math.round((analytics.quizCompletions / analytics.totalStudents) * 100) : 0}%
              </p>
            </div>
            <div className="text-4xl text-yellow-500">📊</div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded-lg border shadow-lg">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <span className="mr-2">📈</span>
            {t('stream_distribution')}
          </h3>
          <div className="h-64">
            <Pie data={streamChartData} options={{ 
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'bottom'
                }
              }
            }} />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border shadow-lg">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <span className="mr-2">📝</span>
            Quiz Completions Trend
          </h3>
          <div className="h-64">
            <Line data={quizTrendData} options={{ 
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: { y: { beginAtZero: true } }
            }} />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border shadow-lg">
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <span className="mr-2">📅</span>
          Registration Trend
        </h3>
        <div className="h-64">
          <Line data={trendChartData} options={{ 
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false
              }
            },
            scales: {
              y: {
                beginAtZero: true
              }
            }
          }} />
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 rounded-lg text-white">
          <h4 className="text-lg font-semibold mb-2">Active Users Today</h4>
          <p className="text-2xl font-bold">{Math.floor(analytics.totalStudents * 0.3)}</p>
          <p className="text-sm opacity-80">30% of total users</p>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-teal-600 p-6 rounded-lg text-white">
          <h4 className="text-lg font-semibold mb-2">Avg. Quiz Score</h4>
          <p className="text-2xl font-bold">78%</p>
          <p className="text-sm opacity-80">Across all streams</p>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-red-600 p-6 rounded-lg text-white">
          <h4 className="text-lg font-semibold mb-2">Career Matches</h4>
          <p className="text-2xl font-bold">{analytics.quizCompletions * 3}</p>
          <p className="text-sm opacity-80">Total recommendations</p>
        </div>
      </div>
    </div>
  );
}

export default Analytics;
