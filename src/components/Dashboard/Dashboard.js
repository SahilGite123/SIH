import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);

function Dashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const [quizResults, setQuizResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const barRef = useRef(null);

  useEffect(() => {
    fetchUserData();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchUserData = async () => {
    if (auth.currentUser) {
      try {
        // Fetch user profile
        const userDocRef = doc(db, "users", auth.currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setUserProfile(userDocSnap.data());
        }

        // Fetch quiz results
        const quizDocRef = doc(db, "quizResults", auth.currentUser.uid);
        const quizDocSnap = await getDoc(quizDocRef);
        if (quizDocSnap.exists()) {
          setQuizResults(quizDocSnap.data());
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getRecommendedAction = () => {
    if (!quizResults) {
      return {
        title: 'Take Your Career Assessment',
        description: 'Start your journey by taking our comprehensive career quiz to discover your strengths and interests.',
        link: '/quiz',
        color: 'bg-blue-500'
      };
    }
    
    const maxStream = Object.keys(quizResults.scores).reduce((a, b) => 
      quizResults.scores[a] > quizResults.scores[b] ? a : b
    );
    
    return {
      title: `Explore ${maxStream} Careers`,
      description: `Based on your quiz results, you show strong aptitude in ${maxStream}. Explore career opportunities in this field.`,
      link: '/careers',
      color: 'bg-green-500'
    };
  };

  const quickStats = [
    { label: 'Available Colleges', value: '50+', color: 'text-blue-600' },
    { label: 'Career Paths', value: '200+', color: 'text-green-600' },
    { label: 'Quiz Questions', value: '25+', color: 'text-purple-600' },
    { label: 'Success Stories', value: '1000+', color: 'text-yellow-600' }
  ];

  const recentUpdates = [
    { title: 'New Engineering Colleges Added', date: '2 days ago', type: 'colleges' },
    { title: 'Updated Career Salary Information', date: '1 week ago', type: 'careers' },
    { title: 'New Quiz Questions Available', date: '2 weeks ago', type: 'quiz' },
    { title: 'Alternative Career Paths Feature', date: '3 weeks ago', type: 'feature' }
  ];

  const upcomingEvents = [
    { title: 'Engineering Entrance Exam Registration', date: 'Dec 15, 2024', type: 'exam' },
    { title: 'Medical College Admission Process', date: 'Jan 10, 2025', type: 'admission' },
    { title: 'Career Counseling Workshop', date: 'Jan 20, 2025', type: 'workshop' },
    { title: 'Scholarship Application Deadline', date: 'Feb 1, 2025', type: 'scholarship' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const recommendedAction = getRecommendedAction();

  // Map bar label to aspiration for AlternativePaths
  const mapLabelToAspiration = (label) => {
    const l = String(label || '').toLowerCase();
    if (l.includes('medical')) return 'Doctor';
    if (l.includes('engineering')) return 'Engineer';
    if (l.includes('commerce')) return 'Business Owner';
    if (l.includes('arts')) return 'Journalist';
    return 'Engineer';
  };

  const handleBarClick = (evt, elements) => {
    try {
      if (!elements || elements.length === 0) return;
      const el = elements[0];
      const index = el.index;
      const labels = barRef.current?.data?.labels || [];
      const label = labels[index];
      const aspiration = mapLabelToAspiration(label);
      navigate(`/alternative-paths?aspiration=${encodeURIComponent(aspiration)}`);
    } catch (e) { /* noop */ }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full px-6 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-indigo-500">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {getGreeting()}, {userProfile?.name || 'Student'}!
                </h1>
                <p className="text-gray-600 mt-2">
                  Welcome to your personalized career guidance dashboard
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {currentTime.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-indigo-600">
                  {currentTime.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
                <p className="text-sm text-gray-500">Current Time</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recommended Action */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Recommended for You</h2>
              <div className={`${recommendedAction.color} rounded-lg p-6 text-white`}>
                <div className="mb-4">
                  <h3 className="text-xl font-bold">{recommendedAction.title}</h3>
                </div>
                <p className="mb-4 opacity-90">{recommendedAction.description}</p>
                <Link 
                  to={recommendedAction.link}
                  className="inline-block bg-white text-gray-900 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Get Started →
                </Link>
              </div>
            </div>

            {/* Quiz Results Chart */}
            {quizResults && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Your Career Assessment Results</h2>
                <div className="h-64">
                  <Bar 
                    ref={barRef}
                    data={{
                      labels: ['Engineering', 'Medical', 'Commerce', 'Arts'],
                      datasets: [{
                        label: 'Your Scores',
                        data: [
                          (quizResults.scores?.Science ?? 0), // Engineering derived from Science (PCM)
                          (quizResults.scores?.Science ?? 0), // Medical derived from Science (PCB)
                          (quizResults.scores?.Commerce ?? 0),
                          (quizResults.scores?.Arts ?? 0),
                        ],
                        backgroundColor: ['#3B82F6', '#10B981', '#F59E0B'],
                        borderColor: ['#2563EB', '#059669', '#D97706'],
                        borderWidth: 2,
                        borderRadius: 8,
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: false },
                        title: { display: false }
                      },
                      scales: {
                        y: { beginAtZero: true, max: 50 }
                      },
                      onClick: handleBarClick
                    }}
                  />
                </div>
                <div className="mt-4 flex justify-center">
                  <Link 
                    to="/recommendations" 
                    className="text-indigo-600 hover:text-indigo-800 font-semibold"
                  >
                    View Detailed Recommendations →
                  </Link>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {
                  [
                    { name: 'Take Quiz', link: '/quiz', color: 'bg-blue-500' },
                    { name: 'Find Colleges', link: '/colleges', color: 'bg-green-500' },
                    { name: 'Explore Careers', link: '/careers', color: 'bg-purple-500' },
                    { name: 'Compare Streams', link: '/stream-comparison', color: 'bg-orange-500' }
                  ].map((action, index) => (
                    <Link 
                      key={index}
                      to={action.link}
                      className={`${action.color} text-white p-4 rounded-lg text-center hover:opacity-90 transition-opacity`}
                    >
                      <div className="text-sm font-semibold">{action.name}</div>
                    </Link>
                  ))
                }
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Profile Summary */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Profile Summary</h2>
              {userProfile ? (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-semibold">{userProfile.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Class:</span>
                    <span className="font-semibold">{userProfile.class}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Location:</span>
                    <span className="font-semibold">{userProfile.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Quiz Status:</span>
                    <span className={`font-semibold ${quizResults ? 'text-green-600' : 'text-orange-600'}`}>
                      {quizResults ? 'Completed' : 'Pending'}
                    </span>
                  </div>
                  <Link 
                    to="/profile" 
                    className="block text-center bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors mt-4"
                  >
                    Edit Profile
                  </Link>
                </div>
              ) : (
                <p className="text-gray-600">Complete your profile to get personalized recommendations.</p>
              )}
            </div>

            {/* Recent Updates */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Updates</h2>
              <div className="space-y-3">
                {recentUpdates.map((update, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">{update.title}</p>
                      <p className="text-xs text-gray-500">{update.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Upcoming Events</h2>
              <div className="space-y-3">
                {upcomingEvents.map((event, index) => (
                  <div key={index} className="border-l-4 border-indigo-500 pl-4 py-2">
                    <p className="text-sm font-semibold text-gray-900">{event.title}</p>
                    <p className="text-xs text-gray-500">{event.date}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
