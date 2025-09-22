import React, { useEffect, useMemo, useState } from 'react';
import { collection, getDocs, addDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import { onAuthStateChanged } from 'firebase/auth';

function NotificationsCenter() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showAdd, setShowAdd] = useState(null); // announcement to add as timeline
  const [dueDate, setDueDate] = useState('');
  const [type, setType] = useState('exam');
  const [reminderEnabled, setReminderEnabled] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u)=> setUser(u));
    return () => unsub();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'announcements'));
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      data.sort((a,b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setItems(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const addToTimeline = async () => {
    if (!user) return;
    if (!dueDate) return;
    try {
      const payload = {
        title: showAdd.title || 'Reminder',
        description: showAdd.message || '',
        link: showAdd.link || '',
        type,
        dueDate,
        status: 'pending',
        reminderEnabled,
        createdAt: serverTimestamp(),
      };
      await addDoc(collection(db, 'timelines', user.uid, 'milestones'), payload);
      setShowAdd(null);
      setDueDate('');
    } catch (e) {
      // noop, could add toast
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Notifications</h1>

      {loading ? (
        <div>Loading...</div>
      ) : items.length === 0 ? (
        <div className="p-6 rounded border">No notifications yet.</div>
      ) : (
        <div className="space-y-3">
          {items.map(a => (
            <div key={a.id} className="p-4 rounded-lg border bg-white dark:bg-gray-900">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs uppercase text-gray-500">{a.category || a.type || 'update'}</div>
                  <div className="text-lg font-semibold">{a.title}</div>
                  {a.message && <div className="text-sm text-gray-600 dark:text-gray-300">{a.message}</div>}
                  {a.link && <a className="text-sm text-indigo-600 underline" href={a.link} target="_blank" rel="noreferrer">Open link</a>}
                </div>
                <div className="flex gap-2">
                  {user && (
                    <button onClick={()=>{ setShowAdd(a); setDueDate(''); setType(a.type || 'exam'); setReminderEnabled(true); }} className="px-3 py-2 rounded bg-indigo-600 text-white">Add to Timeline</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h4 className="text-lg font-semibold mb-3">Add to Timeline</h4>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-700">{showAdd.title}</div>
                <div className="text-xs text-gray-500">{showAdd.message}</div>
              </div>
              <select value={type} onChange={(e)=>setType(e.target.value)} className="w-full px-3 py-2 rounded border">
                <option value="exam">Exam</option>
                <option value="scholarship">Scholarship</option>
                <option value="application">Application</option>
                <option value="other">Other</option>
              </select>
              <label className="block text-sm">Due date/time</label>
              <input type="datetime-local" value={dueDate} onChange={(e)=>setDueDate(e.target.value)} className="w-full px-3 py-2 rounded border" />
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" checked={reminderEnabled} onChange={(e)=>setReminderEnabled(e.target.checked)} /> Enable reminder
              </label>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={()=>setShowAdd(null)} className="px-3 py-2 rounded border">Cancel</button>
                <button onClick={addToTimeline} className="px-3 py-2 rounded bg-indigo-600 text-white">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationsCenter;
