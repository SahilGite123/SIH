import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { v4 as uuidv4 } from 'uuid';

function InviteGenerator() {
  const { t } = useTranslation();
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const generateInviteCode = async () => {
    if (auth.currentUser) {
      try {
        const code = uuidv4();
        const studentId = auth.currentUser.uid;
        await setDoc(doc(db, "invites", code), {
          studentId: studentId,
          generatedAt: new Date(),
          status: "active",
        });
        setInviteCode(code);
        setSuccess(true);
        setError(null);
      } catch (err) {
        setError(err.message);
        setSuccess(false);
      }
    } else {
      setError("No user logged in to generate invite.");
      setSuccess(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4">Generate Parent Invite Code</h3>
      <button
        onClick={generateInviteCode}
        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
      >
        Generate Code
      </button>
      {success && inviteCode && (
        <div className="mt-4 p-4 bg-green-100 text-green-800 rounded-md">
          <p>Share this invite code with your parent:</p>
          <p className="font-mono text-lg font-bold break-all">{inviteCode}</p>
        </div>
      )}
      {error && <p className="text-red-500 mt-4">Error: {error}</p>}
    </div>
  );
}

export default InviteGenerator;

