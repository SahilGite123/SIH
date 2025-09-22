import React, { useEffect, useMemo, useState } from 'react';
import Card from '../UI/Card';
import Button from '../UI/Button';
import { useTranslation } from 'react-i18next';
import { auth, db, requestNotificationPermission } from '../../firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';

const Timeline = () => {
  const { t } = useTranslation();
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', dueDate: '', type: 'exam', status: 'pending', reminderEnabled: false });
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (!auth.currentUser) return;
    const ref = collection(db, 'timelines', auth.currentUser.uid, 'milestones');
    const unsub = onSnapshot(ref, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setMilestones(data.sort((a,b) => new Date(a.dueDate) - new Date(b.dueDate)));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Simple client-side reminder: schedule Notification for items due within 24h if enabled and page is open
  useEffect(() => {
    const timers = [];
    milestones.forEach((m) => {
      if (!m.reminderEnabled) return;
      const due = new Date(m.dueDate).getTime();
      const now = Date.now();
      const diff = due - now;
      if (diff > 0 && diff < 24*60*60*1000) {
        const timer = setTimeout(() => {
          if (Notification?.permission === 'granted') {
            new Notification('Upcoming milestone', { body: `${m.title} on ${new Date(m.dueDate).toLocaleString()}` });
          }
        }, diff);
        timers.push(timer);
      }
    });
    return () => timers.forEach(clearTimeout);
  }, [milestones]);

  const handleEnableNotifications = async () => {
    const token = await requestNotificationPermission();
    if (token && auth.currentUser) {
      try {
        await addDoc(collection(db, 'notificationsTokens'), {
          uid: auth.currentUser.uid,
          fcmToken: token,
          platform: 'web',
          createdAt: serverTimestamp(),
        });
        toast.success('Notifications enabled');
      } catch (e) {
        toast.error('Failed to save notification token');
      }
    } else {
      toast('Notification permission was not granted');
    }
  };

  const resetForm = () => setForm({ title: '', dueDate: '', type: 'exam', status: 'pending', reminderEnabled: false });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    if (!form.title || !form.dueDate) {
      toast.error('Title and Due Date are required');
      return;
    }
    setSaving(true);
    try {
      const ref = collection(db, 'timelines', auth.currentUser.uid, 'milestones');
      if (editingId) {
        await updateDoc(doc(ref, editingId), form);
        toast.success('Milestone updated');
      } else {
        await addDoc(ref, { ...form, createdAt: serverTimestamp() });
        toast.success('Milestone added');
      }
      resetForm();
      setEditingId(null);
    } catch (e) {
      toast.error('Failed to save milestone');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (m) => {
    setForm({ title: m.title || '', dueDate: (m.dueDate || '').slice(0,16), type: m.type || 'exam', status: m.status || 'pending', reminderEnabled: !!m.reminderEnabled });
    setEditingId(m.id);
  };

  const remove = async (id) => {
    if (!auth.currentUser) return;
    if (!window.confirm('Delete this milestone?')) return;
    try {
      const ref = collection(db, 'timelines', auth.currentUser.uid, 'milestones');
      await deleteDoc(doc(ref, id));
      toast.success('Milestone deleted');
    } catch (e) {
      toast.error('Failed to delete milestone');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{t('timeline')}</h1>

      <Card className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">{t('enable_reminders') || 'Enable reminders'}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">{t('enable_reminders_desc') || 'Get notified about exam forms, scholarship dates, and application deadlines.'}</p>
          </div>
          <Button onClick={handleEnableNotifications}>{t('enable_notifications') || 'Enable Notifications'}</Button>
        </div>
      </Card>

      {/* Add / Edit Form */}
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Title</label>
            <input value={form.title} onChange={(e)=>setForm({...form,title:e.target.value})} className="w-full px-3 py-2 rounded border dark:bg-gray-900" placeholder="e.g., JEE Main Application" required />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Due Date & Time</label>
            <input type="datetime-local" value={form.dueDate} onChange={(e)=>setForm({...form,dueDate:e.target.value})} className="w-full px-3 py-2 rounded border dark:bg-gray-900" required />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Type</label>
            <select value={form.type} onChange={(e)=>setForm({...form,type:e.target.value})} className="w-full px-3 py-2 rounded border dark:bg-gray-900">
              <option value="exam">Exam</option>
              <option value="scholarship">Scholarship</option>
              <option value="application">Application</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Status</label>
            <select value={form.status} onChange={(e)=>setForm({...form,status:e.target.value})} className="w-full px-3 py-2 rounded border dark:bg-gray-900">
              <option value="pending">Pending</option>
              <option value="submitted">Submitted</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input id="rem" type="checkbox" checked={form.reminderEnabled} onChange={(e)=>setForm({...form,reminderEnabled:e.target.checked})} />
            <label htmlFor="rem" className="text-sm text-gray-700 dark:text-gray-300">Enable Reminder</label>
          </div>
          <div className="flex gap-3">
            <Button type="submit" loading={saving}>{editingId ? 'Update' : 'Add'}</Button>
            {editingId && (
              <Button type="button" variant="secondary" onClick={()=>{ setEditingId(null); resetForm(); }}>Cancel</Button>
            )}
          </div>
        </form>
      </Card>

      {/* List */}
      <Card className="p-6">
        {loading ? (
          <div className="text-gray-600">Loading timeline...</div>
        ) : milestones.length === 0 ? (
          <div className="text-gray-600">{t('timeline_placeholder') || 'Your personalized admission and scholarship timeline will appear here.'}</div>
        ) : (
          <div className="space-y-3">
            {milestones.map((m)=> (
              <div key={m.id} className="flex items-start justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-800">
                <div>
                  <div className="text-sm uppercase tracking-wide text-gray-500">{m.type}</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">{m.title}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Due: {new Date(m.dueDate).toLocaleString()}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Status: {m.status}</div>
                  {m.reminderEnabled && (
                    <div className="text-xs text-indigo-600">Reminder enabled</div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={()=>startEdit(m)}>Edit</Button>
                  <Button variant="danger" onClick={()=>remove(m.id)}>Delete</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default Timeline;
