import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';

function QuizManager() {
  const { t } = useTranslation();
  const [quizzes, setQuizzes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [formData, setFormData] = useState({
    question: '',
    options: [
      { text: 'Strongly Disagree', value: 1 },
      { text: 'Disagree', value: 2 },
      { text: 'Neutral', value: 3 },
      { text: 'Agree', value: 4 },
      { text: 'Strongly Agree', value: 5 }
    ],
    category: 'Science'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'quizQuestions'));
      const quizData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setQuizzes(quizData);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingQuiz) {
        await updateDoc(doc(db, 'quizQuestions', editingQuiz.id), formData);
      } else {
        await addDoc(collection(db, 'quizQuestions'), formData);
      }
      
      setShowForm(false);
      setEditingQuiz(null);
      resetForm();
      fetchQuizzes();
    } catch (error) {
      console.error('Error saving quiz:', error);
    }
  };

  const handleEdit = (quiz) => {
    setEditingQuiz(quiz);
    setFormData({
      question: quiz.question,
      options: quiz.options,
      category: quiz.category
    });
    setShowForm(true);
  };

  const handleDelete = async (quizId) => {
    if (window.confirm('Are you sure you want to delete this quiz question?')) {
      try {
        await deleteDoc(doc(db, 'quizQuestions', quizId));
        fetchQuizzes();
      } catch (error) {
        console.error('Error deleting quiz:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      question: '',
      options: [
        { text: 'Strongly Disagree', value: 1 },
        { text: 'Disagree', value: 2 },
        { text: 'Neutral', value: 3 },
        { text: 'Agree', value: 4 },
        { text: 'Strongly Agree', value: 5 }
      ],
      category: 'Science'
    });
  };

  const updateOption = (index, field, value) => {
    const newOptions = [...formData.options];
    newOptions[index][field] = field === 'value' ? parseInt(value) : value;
    setFormData({ ...formData, options: newOptions });
  };

  if (loading) {
    return <div className="p-8 text-center">{t('loading')}</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{t('manage_quizzes')}</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center space-x-2"
        >
          <span>➕</span>
          <span>{t('add_new')} Question</span>
        </button>
      </div>

      {/* Quiz Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">
              {editingQuiz ? 'Edit Question' : 'Add New Question'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question
                </label>
                <textarea
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows="3"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Science">Science</option>
                  <option value="Arts">Arts</option>
                  <option value="Commerce">Commerce</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Options
                </label>
                {formData.options.map((option, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={option.text}
                      onChange={(e) => updateOption(index, 'text', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Option text"
                    />
                    <input
                      type="number"
                      value={option.value}
                      onChange={(e) => updateOption(index, 'value', e.target.value)}
                      className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      min="1"
                      max="5"
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingQuiz(null);
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
                  {editingQuiz ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quiz List */}
      <div className="space-y-4">
        {quizzes.map((quiz) => (
          <div key={quiz.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">{quiz.question}</h3>
                <p className="text-sm text-gray-600 mb-2">Category: {quiz.category}</p>
                <div className="space-y-1">
                  {quiz.options?.map((option, index) => (
                    <div key={index} className="text-sm text-gray-700">
                      {option.text} (Value: {option.value})
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(quiz)}
                  className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(quiz.id)}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {quizzes.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No quiz questions found. Add your first question to get started.
        </div>
      )}
    </div>
  );
}

export default QuizManager;
