import React, { useEffect, useMemo, useState } from 'react';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import toast from 'react-hot-toast';

const PAGE_SIZE = 5;

function ResourcesManager() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('all');
  const [page, setPage] = useState(0);

  const [form, setForm] = useState({
    type: 'scholarship',
    title: '',
    description: '',
    link: '',
    tags: '', // comma-separated in UI
  });

  const load = async () => {
    setLoading(true);
    try {
      const ref = collection(db, 'resources');
      const snap = await getDocs(ref);
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setItems(data.sort((a,b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
    } catch (e) {
      toast.error('Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return items.filter(r => {
      const typeOk = type === 'all' ? true : (r.type === type);
      const title = (r.title || '').toLowerCase();
      const tags = (r.tags || []).join(' ').toLowerCase();
      return typeOk && (!term || title.includes(term) || tags.includes(term));
    });
  }, [items, type, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  const resetForm = () => setForm({ type: 'scholarship', title: '', description: '', link: '', tags: '' });

  const startCreate = () => { setEditing(null); resetForm(); setShowForm(true); };
  const startEdit = (it) => {
    setEditing(it); setShowForm(true);
    setForm({ type: it.type || 'scholarship', title: it.title || '', description: it.description || '', link: it.link || '', tags: (it.tags || []).join(', ') });
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.type) { toast.error('Type and Title are required'); return; }
    const payload = {
      type: form.type,
      title: form.title,
      description: form.description,
      link: form.link,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
    };
    try {
      if (editing) {
        await updateDoc(doc(db, 'resources', editing.id), payload);
        toast.success('Resource updated');
        await addDoc(collection(db, 'announcements'), {
          title: `Updated ${payload.type}: ${payload.title}`,
          message: payload.description || '',
          link: payload.link || '',
          type: payload.type,
          category: 'resource',
          createdAt: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, 'resources'), { ...payload, createdAt: serverTimestamp() });
        toast.success('Resource created');
        await addDoc(collection(db, 'announcements'), {
          title: `New ${payload.type}: ${payload.title}`,
          message: payload.description || '',
          link: payload.link || '',
          type: payload.type,
          category: 'resource',
          createdAt: serverTimestamp(),
        });
      }
      setShowForm(false); setEditing(null); resetForm(); load();
    } catch (e) {
      toast.error('Save failed');
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this resource?')) return;
    try {
      await deleteDoc(doc(db, 'resources', id));
      toast.success('Resource deleted');
      load();
    } catch (e) {
      toast.error('Delete failed');
    }
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Resources Manager</h3>
        <button onClick={startCreate} className="px-3 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">Add Resource</button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <input value={search} onChange={(e)=>{ setSearch(e.target.value); setPage(0); }} placeholder="Search..." className="px-3 py-2 rounded border" />
        <select value={type} onChange={(e)=>{ setType(e.target.value); setPage(0); }} className="px-3 py-2 rounded border">
          <option value="all">All</option>
          <option value="scholarship">Scholarship</option>
          <option value="ebook">E-Book</option>
          <option value="guide">Guide</option>
        </select>
      </div>

      {/* List */}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="space-y-3">
          {pageItems.map(it => (
            <div key={it.id} className="p-4 rounded border flex items-start justify-between">
              <div>
                <div className="text-xs uppercase text-gray-500">{it.type}</div>
                <div className="text-lg font-semibold">{it.title}</div>
                <div className="text-sm text-gray-600">{it.description}</div>
                <div className="flex gap-2 flex-wrap mt-1">
                  {(it.tags || []).map((tg, idx) => (
                    <span key={idx} className="text-xs px-2 py-1 rounded-full bg-gray-100">#{tg}</span>
                  ))}
                </div>
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
            <h4 className="text-lg font-semibold mb-3">{editing?'Edit':'Add'} Resource</h4>
            <form onSubmit={submit} className="space-y-3">
              <select value={form.type} onChange={(e)=>setForm({...form,type:e.target.value})} className="w-full px-3 py-2 rounded border">
                <option value="scholarship">Scholarship</option>
                <option value="ebook">E-Book</option>
                <option value="guide">Guide</option>
              </select>
              <input required placeholder="Title" value={form.title} onChange={(e)=>setForm({...form,title:e.target.value})} className="w-full px-3 py-2 rounded border" />
              <textarea placeholder="Description" value={form.description} onChange={(e)=>setForm({...form,description:e.target.value})} className="w-full px-3 py-2 rounded border" rows={3} />
              <input placeholder="Link (optional)" value={form.link} onChange={(e)=>setForm({...form,link:e.target.value})} className="w-full px-3 py-2 rounded border" />
              <input placeholder="Tags (comma separated)" value={form.tags} onChange={(e)=>setForm({...form,tags:e.target.value})} className="w-full px-3 py-2 rounded border" />
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

export default ResourcesManager;
