import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatBubbleLeftRightIcon, XMarkIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';

// Utility scoring (moved outside component for stable references)
const tokenize = (s) => (s || '')
  .toLowerCase()
  .replace(/[^a-z0-9\s]/g, ' ')
  .split(/\s+/)
  .filter(Boolean);

const scoreMatch = (query, text) => {
  const qTokens = new Set(tokenize(query));
  const tTokens = new Set(tokenize(text));
  let overlap = 0;
  for (const tok of qTokens) if (tTokens.has(tok)) overlap++;
  const phraseBonus = (text || '').toLowerCase().includes((query || '').toLowerCase()) ? 1 : 0;
  return overlap + phraseBonus;
};

// Local fallback FAQs and intents
const localFaqs = [
  { q: 'How do I take the aptitude quiz?', a: 'Go to the Quiz tab from the navbar. Answer each set and click Submit at the end to save your results.' },
  { q: 'How are recommendations generated?', a: 'Your quiz scores and profile preferences are mapped to degrees and colleges using rule-based logic. This will get smarter over time.' },
  { q: 'How do notifications work?', a: 'Enable notifications on the Timeline page. We will save your browser token and send reminder notifications for upcoming milestones.' },
  { q: 'Where can I find scholarships?', a: 'Open the Resources tab and filter by Scholarship to see relevant opportunities.' },
  { q: 'How to compare streams?', a: 'Use the Stream Comparison page to see side-by-side differences between streams.' },
  { q: 'What is the Timeline for?', a: 'Timeline helps you track exam applications, scholarship dates, and college deadlines. Add milestones with due dates and enable reminders.' },
  { q: 'How to use the Simulator?', a: 'Open Simulator. Enter course fees, expected salary, monthly expenses, city tier, and work hours. It calculates surplus/deficit and years to recover fees.' },
  { q: 'Where is Parent Portal?', a: 'Parent Portal is available in the top Navbar. Click Parent Portal to access guardian-specific guidance and tools.' },
  { q: 'How to view colleges on map?', a: 'Go to Colleges. Click a college card to fly the map to that location. Use the Google Maps link to open navigation externally.' },
  { q: 'How to add resources?', a: 'Admins can add items in Resources collection in Firestore. Each item has type, title, description, link, and tags. End-users can filter and open them in the Resources page.' },
  { q: 'What is in Analytics?', a: 'Analytics shows total students/parents, quiz completions, stream distribution (pie), popular colleges (bar), and registration trend (line). Data comes from Firestore with some placeholders for colleges/trend.' },
];

const keywordIntents = [
  { keys: ['quiz', 'aptitude', 'assessment'], idxs: [0] },
  { keys: ['recommendation', 'recommendations', 'suggestion'], idxs: [1] },
  { keys: ['notification', 'reminder', 'alerts', 'timeline'], idxs: [2,5] },
  { keys: ['scholarship', 'scholarships', 'funding'], idxs: [3] },
  { keys: ['compare', 'streams', 'comparison'], idxs: [4] },
  { keys: ['parent', 'guardian'], idxs: [7] },
  { keys: ['simulator', 'budget', 'recovery'], idxs: [6] },
  { keys: ['college', 'map', 'location'], idxs: [8] },
  { keys: ['resource', 'resources'], idxs: [9] },
];

const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Hi! Ask me anything about the app, exams, or scholarships.' },
  ]);

  const resultsFromLocal = useMemo(() => {
    const term = input.trim();
    if (!term) return [];
    // Intent boost
    let candidateIdxs = new Set();
    const lower = term.toLowerCase();
    keywordIntents.forEach(({ keys, idxs }) => {
      if (keys.some(k => lower.includes(k))) idxs.forEach(i => candidateIdxs.add(i));
    });

    const corpus = localFaqs.map((item, idx) => ({ ...item, _idx: idx }));
    const scored = corpus.map((it) => ({
      it,
      score: scoreMatch(term, `${it.q} ${it.a}`) + (candidateIdxs.has(it._idx) ? 2 : 0),
    }));
    return scored
      .filter(s => s.score > 0)
      .sort((a,b) => b.score - a.score)
      .slice(0, 5)
      .map(s => ({ q: s.it.q, a: s.it.a }));
  }, [input]);

  const searchFirestore = async (term) => {
    try {
      const faqsRef = collection(db, 'faqs');
      // Simple contains: fetch all and filter client-side for demo
      const snap = await getDocs(faqsRef);
      const all = snap.docs.map(d => d.data());
      return all.filter(i => (i.q || '').toLowerCase().includes(term) || (i.a || '').toLowerCase().includes(term)).slice(0, 5);
    } catch (e) {
      return [];
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    const term = input.trim();
    if (!term) return;
    setMessages(prev => [...prev, { role: 'user', text: term }]);

    // Deterministic intent routing: if a top intent is detected, answer from localFaqs directly
    const lower = term.toLowerCase();
    let directAnswer = null;
    for (const intent of keywordIntents) {
      if (intent.keys.some(k => lower.includes(k))) {
        const idx = intent.idxs[0];
        if (typeof idx === 'number' && localFaqs[idx]) {
          directAnswer = localFaqs[idx].a;
          break;
        }
      }
    }
    if (directAnswer) {
      setMessages(prev => [...prev, { role: 'bot', text: directAnswer }]);
      setInput('');
      return;
    }

    // Local + Firestore combined
    const local = resultsFromLocal;
    const remote = await searchFirestore(term.toLowerCase());
    // Merge and re-rank remote by same scoring
    const combinedRaw = [...local, ...remote];
    const rankedPairs = combinedRaw
      .map(it => ({ it, score: scoreMatch(term, `${it.q} ${it.a}`) }))
      .sort((a,b) => b.score - a.score);
    const topPair = rankedPairs[0];
    const MIN_SCORE = 2; // require at least small token overlap/phrase match
    if (topPair && topPair.score >= MIN_SCORE) {
      setMessages(prev => [...prev, { role: 'bot', text: `${topPair.it.a}` }]);
    } else {
      setMessages(prev => [...prev, { role: 'bot', text: "I couldn't find an answer for that. Try a different keyword or visit Resources/Timeline for more details." }]);
    }
    setInput('');
  };

  return (
    <>
      {/* Floating button */}
      <motion.button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Open FAQs chatbot"
      >
        <ChatBubbleLeftRightIcon className="w-6 h-6" />
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="font-semibold">Student FAQs</div>
              <button onClick={() => setOpen(false)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto p-4 space-y-3">
              {messages.map((m, idx) => (
                <div key={idx} className={`text-sm whitespace-pre-wrap ${m.role === 'bot' ? 'text-gray-800 dark:text-gray-200' : 'text-indigo-700 dark:text-indigo-300'}`}>
                  {m.text}
                </div>
              ))}
            </div>
            <form onSubmit={handleSend} className="flex items-center gap-2 p-3 border-t border-gray-200 dark:border-gray-700">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your question..."
                className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800"
              />
              <button type="submit" className="p-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">
                <PaperAirplaneIcon className="w-5 h-5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;
