import React, { useEffect, useMemo, useState } from 'react';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import toast from 'react-hot-toast';

const PAGE_SIZE = 5;

function ExamsManager() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);

  const [form, setForm] = useState({
    name: '',
    authority: '',
    level: 'national', // national | state | college
    state: '',
    applicationStart: '',
    applicationEnd: '',
    examDate: '',
    link: '',
  });

  const load = async () => {
    setLoading(true);
    try {
      const ref = collection(db, 'exams');
      const snap = await getDocs(ref);
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setItems(data.sort((a,b) => (a.examDate || '').localeCompare(b.examDate || '')));
    } catch (e) {
      toast.error('Failed to load exams');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return items.filter(r => {
      const name = (r.name || '').toLowerCase();
      const state = (r.state || '').toLowerCase();
      const level = (r.level || '').toLowerCase();
      return !term || name.includes(term) || state.includes(term) || level.includes(term);
    });
  }, [items, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  const resetForm = () => setForm({ name: '', authority: '', level: 'national', state: '', applicationStart: '', applicationEnd: '', examDate: '', link: '' });

  const startCreate = () => { setEditing(null); resetForm(); setShowForm(true); };
  const startEdit = (it) => {
    setEditing(it); setShowForm(true);
    setForm({
      name: it.name || '',
      authority: it.authority || '',
      level: it.level || 'national',
      state: it.state || '',
      applicationStart: (it.applicationStart || '').slice(0,16),
      applicationEnd: (it.applicationEnd || '').slice(0,16),
      examDate: (it.examDate || '').slice(0,16),
      link: it.link || '',
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.level) { toast.error('Name and Level are required'); return; }
    const payload = {
      name: form.name,
      authority: form.authority,
      level: form.level,
      state: form.level === 'state' ? form.state : '',
      applicationStart: form.applicationStart,
      applicationEnd: form.applicationEnd,
      examDate: form.examDate,
      link: form.link,
      updatedAt: serverTimestamp(),
    };
    try {
      if (editing) {
        await updateDoc(doc(db, 'exams', editing.id), payload);
        toast.success('Exam updated');
        await addDoc(collection(db, 'announcements'), {
          title: `Updated exam: ${payload.name}`,
          message: `${payload.level}${payload.state?` (${payload.state})`:''} – Apply ${payload.applicationStart || '-'} → ${payload.applicationEnd || '-'}, Exam ${payload.examDate || '-'}`,
          link: payload.link || '',
          type: 'exam',
          category: 'exam',
          createdAt: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, 'exams'), { ...payload, createdAt: serverTimestamp() });
        toast.success('Exam created');
        await addDoc(collection(db, 'announcements'), {
          title: `New exam: ${payload.name}`,
          message: `${payload.level}${payload.state?` (${payload.state})`:''} – Apply ${payload.applicationStart || '-'} → ${payload.applicationEnd || '-'}, Exam ${payload.examDate || '-'}`,
          link: payload.link || '',
          type: 'exam',
          category: 'exam',
          createdAt: serverTimestamp(),
        });
      }
      setShowForm(false); setEditing(null); resetForm(); load();
    } catch (e) {
      toast.error('Save failed');
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this exam?')) return;
    try {
      await deleteDoc(doc(db, 'exams', id));
      toast.success('Exam deleted');
      load();
    } catch (e) {
      toast.error('Delete failed');
    }
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Exams Manager</h3>
        <button onClick={startCreate} className="px-3 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">Add Exam</button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <input value={search} onChange={(e)=>{ setSearch(e.target.value); setPage(0); }} placeholder="Search by name/state/level..." className="px-3 py-2 rounded border" />
      </div>

      {/* List */}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="space-y-3">
          {pageItems.map(it => (
            <div key={it.id} className="p-4 rounded border flex items-start justify-between">
              <div>
                <div className="text-lg font-semibold">{it.name}</div>
                <div className="text-sm text-gray-600">Level: {it.level}{it.state ? ` (${it.state})` : ''}</div>
                <div className="text-sm text-gray-600">Authority: {it.authority}</div>
                <div className="text-sm text-gray-600">Apply: {it.applicationStart || '-'} → {it.applicationEnd || '-'}</div>
                <div className="text-sm text-gray-600">Exam: {it.examDate || '-'}</div>
                {it.link && <a className="text-indigo-600 underline text-sm" href={it.link} target="_blank" rel="noreferrer">Official Link</a>}
              </div>
              <div className="flex gap-2">
                <button onClick={()=>startEdit(it)} className="px-3 py-1 rounded bg-yellow-500 text-white">Edit</button>
                <button onClick={()=>remove(it.id)} className="px-3 py-1 rounded bg-red-600 text-white">Delete</button>
              </div>
            </div>
          ))}

          {/* Pagination */}
          <div className="flex items-center justify-between pt-2">
            <button disabled={page===0} onClick={()=>setPage(p=>Math.max(0,p-1))} className={`px-3 py-1 rounded border ${page===0?'opacity-50':''}`}>Prev</button>
            <div className="text-sm">Page {page+1} of {totalPages}</div>
            <button disabled={page>=totalPages-1} onClick={()=>setPage(p=>Math.min(totalPages-1,p+1))} className={`px-3 py-1 rounded border ${page>=totalPages-1?'opacity-50':''}`}>Next</button>
          </div>
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <h4 className="text-lg font-semibold mb-3">{editing?'Edit':'Add'} Exam</h4>
            <form onSubmit={submit} className="space-y-3">
              <input required placeholder="Name" value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} className="w-full px-3 py-2 rounded border" />
              <input placeholder="Conducting Authority" value={form.authority} onChange={(e)=>setForm({...form,authority:e.target.value})} className="w-full px-3 py-2 rounded border" />
              <select value={form.level} onChange={(e)=>setForm({...form,level:e.target.value})} className="w-full px-3 py-2 rounded border">
                <option value="national">National</option>
                <option value="state">State</option>
                <option value="college">College</option>
              </select>
              {form.level==='state' && <input placeholder="State" value={form.state} onChange={(e)=>setForm({...form,state:e.target.value})} className="w-full px-3 py-2 rounded border" />}
              <label className="block text-sm">Application Start</label>
              <input type="datetime-local" value={form.applicationStart} onChange={(e)=>setForm({...form,applicationStart:e.target.value})} className="w-full px-3 py-2 rounded border" />
              <label className="block text-sm">Application End</label>
              <input type="datetime-local" value={form.applicationEnd} onChange={(e)=>setForm({...form,applicationEnd:e.target.value})} className="w-full px-3 py-2 rounded border" />
              <label className="block text-sm">Exam Date</label>
              <input type="datetime-local" value={form.examDate} onChange={(e)=>setForm({...form,examDate:e.target.value})} className="w-full px-3 py-2 rounded border" />
              <input placeholder="Official Link" value={form.link} onChange={(e)=>setForm({...form,link:e.target.value})} className="w-full px-3 py-2 rounded border" />
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={()=>{ setShowForm(false); setEditing(null); }} className="px-3 py-2 rounded border">Cancel</button>
                <button type="submit" className="px-3 py-2 rounded bg-indigo-600 text-white">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExamsManager;
