import React, { useEffect, useMemo, useState } from 'react';
import Card from '../UI/Card';
import Button from '../UI/Button';
import { useTranslation } from 'react-i18next';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase';
import toast from 'react-hot-toast';

const Resources = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [type, setType] = useState('all'); // ebook | guide | scholarship | all
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const ref = collection(db, 'resources');
        // Fetch all and filter client-side for now; can be optimized with compound queries later
        const snap = await getDocs(ref);
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setItems(data.sort((a,b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
      } catch (e) {
        toast.error('Failed to load resources');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return items.filter(r => {
      const typeOk = type === 'all' ? true : (r.type === type);
      const title = (r.title || '').toLowerCase();
      const tags = (r.tags || []).join(' ').toLowerCase();
      const hit = !term || title.includes(term) || tags.includes(term);
      return typeOk && hit;
    });
  }, [items, type, search]);

  const copy = async (link) => {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      toast.success('Link copied');
    } catch (e) {
      toast.error('Copy failed');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{t('resources')}</h1>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            value={search}
            onChange={(e)=>setSearch(e.target.value)}
            placeholder="Search by title or tags..."
            className="px-3 py-2 rounded border dark:bg-gray-900"
          />
          <select value={type} onChange={(e)=>setType(e.target.value)} className="px-3 py-2 rounded border dark:bg-gray-900">
            <option value="all">All Types</option>
            <option value="scholarship">Scholarship</option>
            <option value="ebook">E-Book</option>
            <option value="guide">Guide</option>
          </select>
        </div>
      </Card>

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <Card className="p-6">Loading resources...</Card>
        ) : filtered.length === 0 ? (
          <Card className="p-6">No resources found.</Card>
        ) : (
          filtered.map(r => (
            <Card key={r.id} className="p-5 space-y-3">
              <div className="text-xs uppercase tracking-wide text-gray-500">{r.type}</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{r.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">{r.description}</p>
              <div className="flex gap-2 flex-wrap">
                {(r.tags || []).map((tag, idx) => (
                  <span key={idx} className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">#{tag}</span>
                ))}
              </div>
              <div className="flex gap-3 pt-2">
                {r.link && (
                  <a href={r.link} target="_blank" rel="noreferrer" className="px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700">Open</a>
                )}
                {r.link && (
                  <Button variant="secondary" onClick={()=>copy(r.link)}>Copy link</Button>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Resources;
