// src/components/Roadmap/DynamicRoadmap.js
import React from 'react';
import { BookOpenIcon, ComputerDesktopIcon, BriefcaseIcon, AcademicCapIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

const ICON_MAP = {
  book: BookOpenIcon,
  laptop: ComputerDesktopIcon,
  briefcase: BriefcaseIcon,
  cap: AcademicCapIcon,
};

function StepCard({ step }) {
  const Icon = ICON_MAP[step.icon] || BookOpenIcon;
  const colorMap = {
    study: 'bg-blue-50 border-blue-200',
    portfolio: 'bg-teal-50 border-teal-200',
    internship: 'bg-purple-50 border-purple-200',
    higher: 'bg-indigo-50 border-indigo-200',
  };
  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border ${colorMap[step.type] || 'bg-gray-50 border-gray-200'}`}>
      <div className="w-10 h-10 rounded-lg bg-white shadow flex items-center justify-center">
        <Icon className="w-6 h-6 text-gray-700" />
      </div>
      <div className="flex-1">
        <div className="text-sm font-semibold text-gray-900">{step.title}</div>
        <div className="text-sm text-gray-700 mt-1">{step.details}</div>
      </div>
    </div>
  );
}

export default function DynamicRoadmap({ steps = [] }) {
  if (!Array.isArray(steps) || steps.length === 0) {
    return <div className="p-4 text-gray-600">No steps yet. Fill the form to generate a roadmap.</div>;
  }

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[720px] grid grid-cols-1 gap-3">
        {steps.map((step, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <div className="flex-1"><StepCard step={step} /></div>
            {idx < steps.length - 1 && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white border border-gray-200 shadow flex items-center justify-center">
                <ArrowRightIcon className="w-5 h-5 text-gray-500" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
