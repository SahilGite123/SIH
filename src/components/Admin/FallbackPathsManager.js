import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';

function FallbackPathsManager() {
  const { t } = useTranslation();
  const [fallbackPaths, setFallbackPaths] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingPath, setEditingPath] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    originalStream: '',
    targetStream: '',
    requirements: [],
    duration: '',
    difficulty: 'Medium',
    successRate: '',
    steps: [],
    resources: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFallbackPaths();
  }, []);

  const fetchFallbackPaths = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'fallbackPaths'));
      const pathData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFallbackPaths(pathData);
    } catch (error) {
      console.error('Error fetching fallback paths:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const pathData = {
        ...formData,
        requirements: Array.isArray(formData.requirements) ? formData.requirements : formData.requirements.split(',').map(item => item.trim()),
        steps: Array.isArray(formData.steps) ? formData.steps : formData.steps.split(',').map(item => item.trim()),
        resources: Array.isArray(formData.resources) ? formData.resources : formData.resources.split(',').map(item => item.trim()),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      if (editingPath) {
        await updateDoc(doc(db, 'fallbackPaths', editingPath.id), { ...pathData, updatedAt: new Date() });
      } else {
        await addDoc(collection(db, 'fallbackPaths'), pathData);
      }
      
      setShowForm(false);
      setEditingPath(null);
      resetForm();
      fetchFallbackPaths();
    } catch (error) {
      console.error('Error saving fallback path:', error);
    }
  };

  const handleEdit = (path) => {
    setEditingPath(path);
    setFormData({
      title: path.title,
      description: path.description,
      originalStream: path.originalStream,
      targetStream: path.targetStream,
      requirements: Array.isArray(path.requirements) ? path.requirements.join(', ') : path.requirements,
      duration: path.duration,
      difficulty: path.difficulty,
      successRate: path.successRate,
      steps: Array.isArray(path.steps) ? path.steps.join(', ') : path.steps,
      resources: Array.isArray(path.resources) ? path.resources.join(', ') : path.resources
    });
    setShowForm(true);
  };

  const handleDelete = async (pathId) => {
    if (window.confirm('Are you sure you want to delete this fallback path?')) {
      try {
        await deleteDoc(doc(db, 'fallbackPaths', pathId));
        fetchFallbackPaths();
      } catch (error) {
        console.error('Error deleting fallback path:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      originalStream: '',
      targetStream: '',
      requirements: [],
      duration: '',
      difficulty: 'Medium',
      successRate: '',
      steps: [],
      resources: []
    });
  };

  const filteredPaths = fallbackPaths.filter(path =>
    path.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    path.originalStream?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    path.targetStream?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="p-8 text-center">{t('loading')}</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Fallback Career Paths Management</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center space-x-2"
        >
          <span>🔄</span>
          <span>{t('add_new')} Path</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder={`${t('search')} fallback paths...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-400">🔍</span>
          </div>
        </div>
      </div>

      {/* Fallback Path Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">
              {editingPath ? 'Edit Fallback Path' : 'Add New Fallback Path'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Path Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., 2-3 years"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Original Stream
                  </label>
                  <select
                    value={formData.originalStream}
                    onChange={(e) => setFormData({ ...formData, originalStream: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select Stream</option>
                    <option value="Science">Science</option>
                    <option value="Arts">Arts</option>
                    <option value="Commerce">Commerce</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Stream
                  </label>
                  <select
                    value={formData.targetStream}
                    onChange={(e) => setFormData({ ...formData, targetStream: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select Stream</option>
                    <option value="Science">Science</option>
                    <option value="Arts">Arts</option>
                    <option value="Commerce">Commerce</option>
                    <option value="Technology">Technology</option>
                    <option value="Creative">Creative</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty Level
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Success Rate (%)
                  </label>
                  <input
                    type="number"
                    value={formData.successRate}
                    onChange={(e) => setFormData({ ...formData, successRate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    min="0"
                    max="100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows="3"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Requirements (comma-separated)
                </label>
                <textarea
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows="2"
                  placeholder="e.g., Basic math skills, Computer literacy, English proficiency"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Steps (comma-separated)
                </label>
                <textarea
                  value={formData.steps}
                  onChange={(e) => setFormData({ ...formData, steps: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows="3"
                  placeholder="e.g., Complete foundation course, Take entrance exam, Apply for programs"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resources (comma-separated)
                </label>
                <textarea
                  value={formData.resources}
                  onChange={(e) => setFormData({ ...formData, resources: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows="2"
                  placeholder="e.g., Online courses, Books, Coaching centers"
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingPath(null);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  {editingPath ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Fallback Paths List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredPaths.map((path) => (
          <div key={path.id} className="border border-gray-200 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-semibold text-lg text-gray-900">{path.title}</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(path)}
                  className="px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600"
                >
                  {t('edit')}
                </button>
                <button
                  onClick={() => handleDelete(path.id)}
                  className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                >
                  {t('delete')}
                </button>
              </div>
            </div>
            
            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>From:</strong> {path.originalStream} <strong>To:</strong> {path.targetStream}</p>
              <p><strong>Duration:</strong> {path.duration}</p>
              <p><strong>Difficulty:</strong> 
                <span className={`ml-1 px-2 py-1 rounded text-xs ${
                  path.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                  path.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {path.difficulty}
                </span>
              </p>
              {path.successRate && <p><strong>Success Rate:</strong> {path.successRate}%</p>}
              <p className="text-gray-700">{path.description}</p>
              
              {path.requirements && path.requirements.length > 0 && (
                <div>
                  <strong>Requirements:</strong>
                  <ul className="list-disc list-inside ml-2 mt-1">
                    {(Array.isArray(path.requirements) ? path.requirements : path.requirements.split(',')).map((req, index) => (
                      <li key={index} className="text-xs">{req.trim()}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredPaths.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No fallback paths found. Add your first path to get started.
        </div>
      )}
    </div>
  );
}

export default FallbackPathsManager;
