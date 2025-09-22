import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';

function CollegeManager() {
  const { t } = useTranslation();
  const [colleges, setColleges] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCollege, setEditingCollege] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    location: {
      address: '',
      latitude: '',
      longitude: ''
    },
    courses: [],
    eligibility: '',
    facilities: [],
    contact: {
      phone: '',
      email: '',
      website: ''
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchColleges();
  }, []);

  const fetchColleges = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'colleges'));
      const collegeData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setColleges(collegeData);
    } catch (error) {
      console.error('Error fetching colleges:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const collegeData = {
        ...formData,
        location: {
          ...formData.location,
          latitude: parseFloat(formData.location.latitude),
          longitude: parseFloat(formData.location.longitude)
        }
      };

      if (editingCollege) {
        await updateDoc(doc(db, 'colleges', editingCollege.id), collegeData);
      } else {
        await addDoc(collection(db, 'colleges'), collegeData);
      }
      
      setShowForm(false);
      setEditingCollege(null);
      resetForm();
      fetchColleges();
    } catch (error) {
      console.error('Error saving college:', error);
    }
  };

  const handleEdit = (college) => {
    setEditingCollege(college);
    setFormData({
      name: college.name || '',
      location: {
        address: college.location?.address || '',
        latitude: college.location?.latitude?.toString() || '',
        longitude: college.location?.longitude?.toString() || ''
      },
      courses: college.courses || [],
      eligibility: college.eligibility || '',
      facilities: college.facilities || [],
      contact: {
        phone: college.contact?.phone || '',
        email: college.contact?.email || '',
        website: college.contact?.website || ''
      }
    });
    setShowForm(true);
  };

  const handleDelete = async (collegeId) => {
    if (window.confirm('Are you sure you want to delete this college?')) {
      try {
        await deleteDoc(doc(db, 'colleges', collegeId));
        fetchColleges();
      } catch (error) {
        console.error('Error deleting college:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      location: {
        address: '',
        latitude: '',
        longitude: ''
      },
      courses: [],
      eligibility: '',
      facilities: [],
      contact: {
        phone: '',
        email: '',
        website: ''
      }
    });
  };

  const handleArrayInput = (field, value) => {
    const array = value.split(',').map(item => item.trim()).filter(item => item);
    setFormData({ ...formData, [field]: array });
  };

  const filteredColleges = colleges.filter(college =>
    college.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    college.location?.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="p-8 text-center">{t('loading')}</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{t('manage_colleges')}</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center space-x-2"
        >
          <span>🏫</span>
          <span>{t('add_new')} College</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder={`${t('search')} colleges...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-400">🔍</span>
          </div>
        </div>
      </div>

      {/* College Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">
              {editingCollege ? 'Edit College' : 'Add New College'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    College Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Eligibility
                  </label>
                  <input
                    type="text"
                    value={formData.eligibility}
                    onChange={(e) => setFormData({ ...formData, eligibility: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., 10+2 Pass"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  value={formData.location.address}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    location: { ...formData.location, address: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.location.latitude}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      location: { ...formData.location, latitude: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.location.longitude}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      location: { ...formData.location, longitude: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Courses (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.courses.join(', ')}
                  onChange={(e) => handleArrayInput('courses', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., B.Sc, B.A, B.Com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Facilities (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.facilities.join(', ')}
                  onChange={(e) => handleArrayInput('facilities', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., Library, Labs, Sports Complex"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.contact.phone}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      contact: { ...formData.contact, phone: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.contact.email}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      contact: { ...formData.contact, email: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    value={formData.contact.website}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      contact: { ...formData.contact, website: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingCollege(null);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  {editingCollege ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* College List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredColleges.map((college) => (
          <div key={college.id} className="border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-semibold text-lg">{college.name}</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(college)}
                  className="px-2 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(college.id)}
                  className="px-2 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
            
            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>Address:</strong> {college.location?.address}</p>
              <p><strong>Eligibility:</strong> {college.eligibility}</p>
              <p><strong>Courses:</strong> {college.courses?.join(', ')}</p>
              <p><strong>Facilities:</strong> {college.facilities?.join(', ')}</p>
              {college.contact?.phone && (
                <p><strong>Phone:</strong> {college.contact.phone}</p>
              )}
              {college.contact?.email && (
                <p><strong>Email:</strong> {college.contact.email}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {colleges.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No colleges found. Add your first college to get started.
        </div>
      )}
    </div>
  );
}

export default CollegeManager;
