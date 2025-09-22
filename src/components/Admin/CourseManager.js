import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';

function CourseManager() {
  const { t } = useTranslation();
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    streams: [],
    higher_studies: [],
    job_roles: [],
    relevant_exams: [],
    alternative_paths: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'courses'));
      const courseData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCourses(courseData);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCourse) {
        await updateDoc(doc(db, 'courses', editingCourse.id), formData);
      } else {
        await addDoc(collection(db, 'courses'), formData);
      }
      
      setShowForm(false);
      setEditingCourse(null);
      resetForm();
      fetchCourses();
    } catch (error) {
      console.error('Error saving course:', error);
    }
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setFormData({
      name: course.name || '',
      description: course.description || '',
      streams: course.streams || [],
      higher_studies: course.higher_studies || [],
      job_roles: course.job_roles || [],
      relevant_exams: course.relevant_exams || [],
      alternative_paths: course.alternative_paths || []
    });
    setShowForm(true);
  };

  const handleDelete = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await deleteDoc(doc(db, 'courses', courseId));
        fetchCourses();
      } catch (error) {
        console.error('Error deleting course:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      streams: [],
      higher_studies: [],
      job_roles: [],
      relevant_exams: [],
      alternative_paths: []
    });
  };

  const handleArrayInput = (field, value) => {
    const array = value.split(',').map(item => item.trim()).filter(item => item);
    setFormData({ ...formData, [field]: array });
  };

  const handleObjectArrayInput = (field, value) => {
    const items = value.split('\n').filter(item => item.trim());
    const objectArray = items.map(item => {
      const [name, description] = item.split(':').map(part => part.trim());
      return { name: name || item, description: description || '' };
    });
    setFormData({ ...formData, [field]: objectArray });
  };

  const formatObjectArrayForDisplay = (array) => {
    return array.map(item => 
      item.description ? `${item.name}: ${item.description}` : item.name
    ).join('\n');
  };

  if (loading) {
    return <div className="p-8 text-center">Loading courses...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Course & Career Management</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          Add New Course
        </button>
      </div>

      {/* Course Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">
              {editingCourse ? 'Edit Course' : 'Add New Course'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course Name
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
                    Streams (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.streams.join(', ')}
                    onChange={(e) => handleArrayInput('streams', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., Science, Commerce"
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
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Higher Studies (one per line, format: Name: Description)
                </label>
                <textarea
                  value={formatObjectArrayForDisplay(formData.higher_studies)}
                  onChange={(e) => handleObjectArrayInput('higher_studies', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows="4"
                  placeholder="M.Sc: Master of Science&#10;MBA: Master of Business Administration"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Roles (one per line, format: Role: Description)
                </label>
                <textarea
                  value={formatObjectArrayForDisplay(formData.job_roles)}
                  onChange={(e) => handleObjectArrayInput('job_roles', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows="4"
                  placeholder="Software Engineer: Develop software applications&#10;Data Analyst: Analyze business data"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Relevant Exams (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.relevant_exams.join(', ')}
                  onChange={(e) => handleArrayInput('relevant_exams', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., JEE Main, NEET, CAT"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alternative Career Paths (one per line, format: Path: Description)
                </label>
                <textarea
                  value={formatObjectArrayForDisplay(formData.alternative_paths)}
                  onChange={(e) => handleObjectArrayInput('alternative_paths', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows="3"
                  placeholder="Entrepreneurship: Start your own business&#10;Freelancing: Work as independent consultant"
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingCourse(null);
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
                  {editingCourse ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Course List */}
      <div className="space-y-6">
        {courses.map((course) => (
          <div key={course.id} className="border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold text-xl">{course.name}</h3>
                <p className="text-sm text-gray-600 mt-1">Streams: {course.streams?.join(', ')}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(course)}
                  className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(course.id)}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
            
            <p className="text-gray-700 mb-4">{course.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <h4 className="font-semibold text-sm text-gray-800 mb-2">Higher Studies</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {course.higher_studies?.map((study, index) => (
                    <li key={index}>
                      <strong>{study.name}:</strong> {study.description}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-sm text-gray-800 mb-2">Job Roles</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {course.job_roles?.map((role, index) => (
                    <li key={index}>
                      <strong>{role.name}:</strong> {role.description}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-sm text-gray-800 mb-2">Relevant Exams</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {course.relevant_exams?.map((exam, index) => (
                    <li key={index}>{exam}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-sm text-gray-800 mb-2">Alternative Paths</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {course.alternative_paths?.map((path, index) => (
                    <li key={index}>
                      <strong>{path.name}:</strong> {path.description}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      {courses.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No courses found. Add your first course to get started.
        </div>
      )}
    </div>
  );
}

export default CourseManager;
