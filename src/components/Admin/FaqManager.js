import React, { useEffect, useState } from 'react';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import toast from 'react-hot-toast';

const defaultFaqs = [
  { q: 'How to use the Timeline?', a: 'Open Timeline from the navbar, click Enable Notifications, then Add a milestone with title, due date, and enable the reminder checkbox.' },
  { q: 'How to take the aptitude quiz?', a: 'Open Quiz, answer 5 questions per page, click Next, and finally Submit to save and generate recommendations.' },
  { q: 'How are recommendations generated?', a: 'We map your quiz scores and profile preferences to degree and career options using rule-based logic and curated data.' },
  { q: 'Where can I see career options and roles?', a: 'Open Careers from the navbar. Use filters to browse roles, required skills, education, companies, and future scope.' },
  { q: 'How to compare streams?', a: 'Open Stream Comparison to view duration, fees, exams, work-life balance, and growth across streams side-by-side.' },
  { q: 'How to view colleges on a map?', a: 'Open Colleges. Click any college card to fly the map to that location or open the Google Maps link.' },
  { q: 'Where can I find scholarships?', a: 'Open Resources and select type = Scholarship. Use search to filter by tags or titles.' },
  { q: 'How to use the Simulator?', a: 'Enter course fees, salary (CTC/yr), monthly expenses, city tier, and work hours. It calculates surplus/deficit and fee recovery years.' },
  { q: 'What is in Analytics?', a: 'Admin → Analytics shows totals, quiz completions, stream distribution, and registration trends based on Firestore data.' },
  { q: 'How to enable notifications?', a: 'Open Timeline and click Enable Notifications to save your browser token for reminders (requires HTTPS/localhost).' },
  { q: 'Where is the Parent Portal?', a: 'In the navbar, click Parent Portal to access guardian-specific tools and guidance.' },
  { q: 'How to reset password?', a: 'Open Profile → Account → Reset Password to receive a reset email.' },
];

function FaqManager() {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const loadCount = async () => {
    try {
      const snap = await getDocs(collection(db, 'faqs'));
      setCount(snap.size);
    } catch (e) {}
  };
  useEffect(() => { loadCount(); }, []);

  const seed = async () => {
    setLoading(true);
    try {
      const ref = collection(db, 'faqs');
      for (const item of defaultFaqs) {
        await addDoc(ref, item);
      }
      toast.success('Seeded FAQs');
      loadCount();
    } catch (e) {
      toast.error('Seeding failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">FAQs</h3>
        <div className="text-sm text-gray-600">Existing: {count}</div>
      </div>
      <button onClick={seed} disabled={loading} className="px-3 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60">
        {loading ? 'Seeding…' : 'Seed 12 default FAQs'}
      </button>
      <p className="text-sm text-gray-600">This will insert curated FAQs into the 'faqs' collection for the chatbot.</p>
    </div>
  );
}

export default FaqManager;
