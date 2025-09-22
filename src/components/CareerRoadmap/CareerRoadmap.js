// src/components/CareerRoadmap/CareerRoadmap.js
import React from 'react';
import 'react-vertical-timeline-component/style.min.css';
import { VerticalTimeline, VerticalTimelineElement } from 'react-vertical-timeline-component';

export default function CareerRoadmap({ mainPath, altPaths = [], predictions = [], location = 'J&K' }) {
  if (!mainPath) return null;

  // Compute location awareness without hooks to avoid conditional hook order
  const locLower = String(location || '').toLowerCase();
  const isJK = locLower.includes('j&k') || locLower.includes('jammu') || locLower.includes('kashmir') || locLower.includes('srinagar');

  const jkKeywords = ['J&K', 'Jammu', 'Kashmir', 'Srinagar', 'Jammu & Kashmir', 'JK'];
  const highlight = (text) => {
    if (!isJK) return false;
    const t = String(text || '');
    return jkKeywords.some(k => t.toLowerCase().includes(k.toLowerCase()));
  };

  const steps = Array.isArray(mainPath.steps) ? mainPath.steps : [];
  const scholarships = Array.isArray(mainPath.scholarships) ? mainPath.scholarships : [];
  const colleges = Array.isArray(mainPath.colleges) ? mainPath.colleges : [];

  return (
    <div className="mt-10">
      {/* Predictions ribbon */}
      {Array.isArray(predictions) && predictions.length > 0 && (
        <div className="mb-6 bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <p className="font-medium text-indigo-800">Top Career Matches</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {predictions.map((p, idx) => (
              <span key={idx} className={`px-3 py-1 rounded-full text-sm ${idx === 0 ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-800'}`}>
                {p.domain} • {(p.confidence * 100).toFixed(1)}%
              </span>
            ))}
          </div>
        </div>
      )}

      <h3 className="text-2xl font-bold text-gray-900 mb-4">Career Roadmap: {mainPath.title}</h3>

      <VerticalTimeline>
        {steps.map((step, idx) => (
          <VerticalTimelineElement
            key={idx}
            className="vertical-timeline-element--work"
            contentStyle={{ background: '#EEF2FF', color: '#111827' }}
            contentArrowStyle={{ borderRight: '7px solid  #EEF2FF' }}
            iconStyle={{ background: '#4F46E5', color: '#fff' }}
            icon={<span className="font-bold">{idx + 1}</span>}
          >
            <h4 className="vertical-timeline-element-title text-lg font-semibold">Step {idx + 1}</h4>
            <p className="mt-2 text-gray-800">{step}</p>
          </VerticalTimelineElement>
        ))}
      </VerticalTimeline>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="p-6 bg-white rounded-lg shadow">
          <h4 className="text-xl font-semibold mb-3">Suggested Scholarships {isJK && <span className="ml-2 text-xs px-2 py-0.5 rounded bg-yellow-100 text-yellow-800">J&K Aware</span>}</h4>
          {scholarships.length === 0 ? (
            <p className="text-gray-500">No scholarships listed.</p>
          ) : (
            <ul className="list-disc pl-5 space-y-2">
              {scholarships.map((s, i) => (
                <li key={i} className={`text-gray-800 ${highlight(s) ? 'font-semibold text-indigo-700' : ''}`}>{s}</li>
              ))}
            </ul>
          )}
        </div>
        <div className="p-6 bg-white rounded-lg shadow">
          <h4 className="text-xl font-semibold mb-3">Top Colleges {isJK && <span className="ml-2 text-xs px-2 py-0.5 rounded bg-yellow-100 text-yellow-800">J&K Aware</span>}</h4>
          {colleges.length === 0 ? (
            <p className="text-gray-500">No colleges listed.</p>
          ) : (
            <ul className="list-disc pl-5 space-y-2">
              {colleges.map((c, i) => (
                <li key={i} className={`text-gray-800 ${highlight(c) ? 'font-semibold text-indigo-700' : ''}`}>{c}</li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Alternates */}
      {Array.isArray(altPaths) && altPaths.length > 0 && (
        <div className="mt-10">
          <h4 className="text-xl font-bold text-gray-900 mb-3">Alternate Paths</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {altPaths.map((p, idx) => (
              <div key={idx} className="p-5 bg-white rounded-lg shadow border">
                <div className="flex items-center justify-between">
                  <h5 className="text-lg font-semibold">{p.title}</h5>
                </div>
                <ul className="list-disc pl-5 mt-3 space-y-1">
                  {(p.steps || []).slice(0, 4).map((s, i) => (
                    <li key={i} className="text-gray-700">{s}</li>
                  ))}
                </ul>
                {(p.scholarships && p.scholarships.length > 0) && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-600">Scholarships:</p>
                    <ul className="list-disc pl-5 mt-1 space-y-1">
                      {p.scholarships.slice(0, 3).map((s, i) => (
                        <li key={i} className={`text-gray-700 ${highlight(s) ? 'font-semibold text-indigo-700' : ''}`}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {(p.colleges && p.colleges.length > 0) && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-600">Colleges:</p>
                    <ul className="list-disc pl-5 mt-1 space-y-1">
                      {p.colleges.slice(0, 3).map((c, i) => (
                        <li key={i} className={`text-gray-700 ${highlight(c) ? 'font-semibold text-indigo-700' : ''}`}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
