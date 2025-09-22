import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import InviteGenerator from './InviteGenerator';
import ParentDashboard from './ParentDashboard';

function ParentPortal() {
  const { t } = useTranslation();
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [studentId, setStudentId] = useState(null);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    try {
      const inviteDocRef = doc(db, "invites", inviteCodeInput);
      const inviteDocSnap = await getDoc(inviteDocRef);

      if (inviteDocSnap.exists() && inviteDocSnap.data().status === "active") {
        setStudentId(inviteDocSnap.data().studentId);
        setIsAuthenticated(true);
        setError(null);
      } else {
        setError("Invalid or expired invite code.");
        setIsAuthenticated(false);
      }
    } catch (err) {
      setError(err.message);
      setIsAuthenticated(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md space-y-8">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">{t('parent_portal')}</h2>

        {!isAuthenticated ? (
          <div className="space-y-6">
            <p className="text-center text-gray-700">Enter the invite code provided by your child to view their progress.</p>
            <form onSubmit={handleCodeSubmit} className="flex flex-col sm:flex-row items-center gap-4">
              <input
                type="text"
                required
                className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter Invite Code"
                value={inviteCodeInput}
                onChange={(e) => setInviteCodeInput(e.target.value)}
              />
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
              >
                Submit Code
              </button>
            </form>
            {error && <p className="text-red-500 text-center">Error: {error}</p>}
          </div>
        ) : (
          <ParentDashboard studentId={studentId} />
        )}

        <InviteGenerator />
      </div>
    </div>
  );
}

export default ParentPortal;

