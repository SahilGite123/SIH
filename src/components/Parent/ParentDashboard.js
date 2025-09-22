import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function ParentDashboard({ studentId }) {
  const { t } = useTranslation();
  const [studentProfile, setStudentProfile] = useState(null);
  const [quizScores, setQuizScores] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        // Fetch student profile
        const studentDocRef = doc(db, "users", studentId);
        const studentDocSnap = await getDoc(studentDocRef);
        if (studentDocSnap.exists()) {
          setStudentProfile(studentDocSnap.data());
        } else {
          setError("Student profile not found.");
        }

        // Fetch quiz results (placeholder for now, assuming they are stored in the user profile)
        // In a real application, quiz results might be in a separate collection or subcollection
        const quizDocRef = doc(db, "quizResults", studentId); // Assuming quiz results are saved under a 'quizResults' collection
        const quizDocSnap = await getDoc(quizDocRef);
        if (quizDocSnap.exists()) {
          setQuizScores(quizDocSnap.data());
        } else {
          // Placeholder quiz results if not found
          setQuizScores({ Science: 45, Arts: 30, Commerce: 20 });
        }

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (studentId) {
      fetchStudentData();
    }
  }, [studentId]);

  if (loading) {
    return <div className="text-center py-10">Loading student data...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">Error: {error}</div>;
  }

  if (!studentProfile) {
    return <div className="text-center py-10">No student data available.</div>;
  }

  const quizChartData = quizScores ? {
    labels: Object.keys(quizScores).map(key => t(key.toLowerCase())),
    datasets: [
      {
        label: 'Quiz Score',
        data: Object.values(quizScores),
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

  const quizChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Student Quiz Results',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 50, // Max possible score for MVP quiz
      },
    },
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-8">
      <h3 className="text-xl font-semibold mb-4">Student Dashboard for {studentProfile.name}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-lg font-bold mb-2">Profile Information:</h4>
          <p><strong>{t('name')}:</strong> {studentProfile.name}</p>
          <p><strong>{t('age')}:</strong> {studentProfile.age}</p>
          <p><strong>{t('gender')}:</strong> {studentProfile.gender}</p>
          <p><strong>{t('class')}:</strong> {studentProfile.class}</p>
          <p><strong>{t('location')}:</strong> {studentProfile.location}</p>
          <p><strong>{t('preferences')}:</strong> {studentProfile.preferences}</p>
        </div>
        {quizChartData && (
          <div>
            <h4 className="text-lg font-bold mb-2">Quiz Results:</h4>
            <Bar data={quizChartData} options={quizChartOptions} />
          </div>
        )}
      </div>
      {/* Placeholder for recommendations and resources */}
      <div className="mt-6">
        <h4 className="text-lg font-bold mb-2">Recommendations (Placeholder):</h4>
        <p>Recommendations for {studentProfile.name} will appear here.</p>
      </div>
      <div className="mt-6">
        <h4 className="text-lg font-bold mb-2">Resources (Placeholder):</h4>
        <p>Relevant resources for {studentProfile.name} will be listed here.</p>
      </div>
    </div>
  );
}

export default ParentDashboard;

