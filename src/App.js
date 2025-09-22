import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

import './App.css'; // You can remove this if not needed

// Import Components
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Profile from './components/User/Profile';
import Quiz from './components/Quiz/Quiz'; // Import Quiz component
import Recommendations from './components/Recommendations/Recommendations'; // Import Recommendations component
import Careers from './components/Careers/Careers'; // Import Careers component
import Colleges from './components/Colleges/Colleges'; // Import Colleges component
import ParentPortal from './components/Parent/ParentPortal'; // Import ParentPortal component
import StreamComparison from './components/StreamComparison/StreamComparison'; // Import StreamComparison component
import AdminPanel from './components/Admin/AdminPanel'; // Import AdminPanel component
import AlternativePaths from './components/AlternativePaths/AlternativePaths'; // Import AlternativePaths component
import Dashboard from './components/Dashboard/Dashboard'; // Import Dashboard component
import Timeline from './components/Timeline/Timeline';
import Resources from './components/Resources/Resources';
import Simulator from './components/Simulator/Simulator';
import Analytics from './components/Analytics/Analytics';
import NotificationsCenter from './components/Notifications/NotificationsCenter';
import Layout from './components/Layout/Layout';
import GuidancePage from './components/Guidance/GuidancePage';
import ResultsPage from './components/Results/ResultsPage';
import RoadmapBuilderPage from './components/Roadmap/RoadmapBuilderPage';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Fetch user role from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserRole(userDoc.data().role || 'student');
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
          setUserRole('student'); // Default fallback
        }
      } else {
        setUserRole(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return <div className="text-center py-10">Loading application...</div>;
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes wrapped in Layout */}
          {currentUser ? (
            <>
              <Route path="/" element={<Layout><Dashboard /></Layout>} />
              <Route path="/profile" element={<Layout><Profile /></Layout>} />
              <Route path="/quiz" element={<Layout><Quiz /></Layout>} />
              <Route path="/recommendations" element={<Layout><Recommendations /></Layout>} />
              <Route path="/colleges" element={<Layout><Colleges /></Layout>} />
              <Route path="/careers" element={<Layout><Careers /></Layout>} />
              <Route path="/stream-comparison" element={<Layout><StreamComparison /></Layout>} />
              <Route path="/alternative-paths" element={<Layout><AlternativePaths /></Layout>} />
              <Route path="/parent-portal" element={<Layout><ParentPortal /></Layout>} />
              <Route path="/timeline" element={<Layout><Timeline /></Layout>} />
              {/* <Route path="/resources" element={<Layout><Resources /></Layout>} />  */}
              <Route path="/simulator" element={<Layout><Simulator /></Layout>} />
              <Route path="/analytics" element={<Layout><Analytics /></Layout>} />
              <Route path="/notifications" element={<Layout><NotificationsCenter /></Layout>} />
              <Route path="/guidance" element={<Layout><GuidancePage /></Layout>} />
              <Route path="/results" element={<Layout><ResultsPage /></Layout>} />
              <Route path="/roadmap-builder" element={<Layout><RoadmapBuilderPage /></Layout>} />
              {userRole === 'admin' && (
                <Route path="/admin" element={<Layout><AdminPanel /></Layout>} />
              )}
            </>
          ) : (
            // Redirect to login if not authenticated
            <Route path="*" element={<Login />} />
          )}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
