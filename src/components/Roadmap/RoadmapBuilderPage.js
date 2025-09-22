// src/components/Roadmap/RoadmapBuilderPage.js
import React, { useState } from 'react';
import DynamicRoadmap from './DynamicRoadmap';
import { buildRoadmap } from '../../services/roadmapBuilder';

const selectClass = 'mt-1 block w-full rounded-lg border border-gray-200 p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500';

export default function RoadmapBuilderPage() {
  const [form, setForm] = useState({
    education: 'Class 11-12',
    interest: 'Design',
    goal: 'Designer',
    skill: 'Drawing',
    studyPref: 'India',
    availability: '5–10 hrs/week',
  });
  const [steps, setSteps] = useState([]);

  const update = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const onGenerate = (e) => {
    e.preventDefault();
    const out = buildRoadmap(form);
    setSteps(out);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto py-8 space-y-6">
        <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900">Dynamic Career Roadmap</h2>
          <p className="text-gray-600 mt-1">Generate a personalized, minimal flowchart based on your current stage and preferences.</p>

          <form onSubmit={onGenerate} className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Current Education Level</label>
              <select className={selectClass} value={form.education} onChange={(e) => update('education', e.target.value)}>
                <option>Class 10</option>
                <option>Class 11-12</option>
                <option>Undergraduate</option>
                <option>Graduate</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Preferred Interest Area</label>
              <select className={selectClass} value={form.interest} onChange={(e) => update('interest', e.target.value)}>
                <option>Fine Arts</option>
                <option>Design</option>
                <option>Journalism/Media</option>
                <option>Psychology/Social Sciences</option>
                <option>Literature</option>
                <option>Political Science/Law</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Career Goal</label>
              <select className={selectClass} value={form.goal} onChange={(e) => update('goal', e.target.value)}>
                <option>Designer</option>
                <option>Journalist</option>
                <option>Teacher</option>
                <option>Researcher</option>
                <option>Writer</option>
                <option>Social Worker</option>
                <option>Undecided</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Skill Preference</label>
              <select className={selectClass} value={form.skill} onChange={(e) => update('skill', e.target.value)}>
                <option>Writing</option>
                <option>Drawing</option>
                <option>Communication</option>
                <option>Research</option>
                <option>Editing/Media</option>
                <option>Public Speaking</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Study Preference</label>
              <select className={selectClass} value={form.studyPref} onChange={(e) => update('studyPref', e.target.value)}>
                <option>India</option>
                <option>Abroad</option>
                <option>Both</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Availability for Extra Activities</label>
              <select className={selectClass} value={form.availability} onChange={(e) => update('availability', e.target.value)}>
                <option>&lt;5 hrs/week</option>
                <option>5–10 hrs/week</option>
                <option>10+ hrs/week</option>
              </select>
            </div>

            <div className="md:col-span-3 mt-2">
              <button type="submit" className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-sm font-medium">
                Generate Roadmap
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
          <DynamicRoadmap steps={steps} />
        </div>
      </div>
    </div>
  );
}
