import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import QuizManager from './QuizManager';
import CollegeManager from './CollegeManager';
import CourseManager from './CourseManager';
import FallbackPathsManager from './FallbackPathsManager';
import Analytics from './Analytics';
import ResourcesManager from './ResourcesManager';
// Optional: Exams manager for exam updates
import ExamsManager from './ExamsManager';
import FaqManager from './FaqManager';

function AdminPanel() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('analytics');
  const [loading, setLoading] = useState(false);

  const tabs = [
    { id: 'analytics', name: t('analytics') },
    { id: 'quizzes', name: t('manage_quizzes') },
    { id: 'colleges', name: t('manage_colleges') },
    { id: 'courses', name: t('manage_courses') },
    { id: 'resources', name: 'Resources' },
    { id: 'exams', name: 'Exams' },
    { id: 'faqs', name: 'FAQs' },
    { id: 'fallback', name: 'Fallback Paths' },
  ];

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'analytics':
        return <Analytics />;
      case 'quizzes':
        return <QuizManager />;
      case 'colleges':
        return <CollegeManager />;
      case 'courses':
        return <CourseManager />;
      case 'resources':
        return <ResourcesManager />;
      case 'exams':
        return <ExamsManager />;
      case 'faqs':
        return <FaqManager />;
      case 'fallback':
        return <FallbackPathsManager />;
      default:
        return <Analytics />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">{t('admin_panel')}</h1>
            <div className="text-sm text-gray-500">
              Career Advisor Management System
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow">
          {renderActiveTab()}
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;
