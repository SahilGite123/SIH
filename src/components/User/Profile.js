import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { auth } from '../../firebase';
import { getUserProfile, setUserProfile } from '../../services/firebase/db';

function Profile() {
  const { t } = useTranslation();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form fields for editing
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [sClass, setSClass] = useState('');
  const [location, setLocation] = useState('');
  const [preferences, setPreferences] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (auth.currentUser) {
        try {
          const res = await getUserProfile(auth.currentUser.uid);
          if (res.ok && res.data) {
            const data = res.data;
            setUserProfile(data);
            setName(data.name);
            setAge(data.age);
            setGender(data.gender);
            setSClass(data.class);
            setLocation(data.location);
            setPreferences(data.preferences);
          } else {
            setError("No such document!");
          }
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
        setError("No user logged in.");
      }
    };

    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (auth.currentUser) {
      try {
        const update = {
          name,
          age: parseInt(age),
          gender,
          class: sClass,
          location,
          preferences,
        };
        const res = await setUserProfile(auth.currentUser.uid, update);
        if (!res.ok) throw new Error(res.error.message);
        setUserProfile({
          ...userProfile,
          name,
          age: parseInt(age),
          gender,
          class: sClass,
          location,
          preferences,
        });
        setIsEditing(false);
      } catch (err) {
        setError(err.message);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-2xl mb-4 font-bold text-red-500">Error</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
            <p className="text-red-500">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-2xl mb-4 font-bold text-gray-500">No Profile</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Profile Found</h2>
            <p className="text-gray-600">Please complete your registration to view your profile.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full px-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-xl text-gray-600">Manage your personal information and preferences</p>
        </div>

        {!isEditing ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-3xl font-bold text-indigo-600">
                      {userProfile.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="text-white">
                      <h2 className="text-2xl font-bold">{userProfile.name}</h2>
                      <p className="text-indigo-100">Student • Class {userProfile.class}</p>
                      <p className="text-indigo-100 text-sm">{userProfile.location}</p>
                    </div>
                  </div>
                </div>

                {/* Profile Details */}
                <div className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-500">Full Name</p>
                        <p className="text-lg font-semibold text-gray-900">{userProfile.name}</p>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-500">Age</p>
                        <p className="text-lg font-semibold text-gray-900">{userProfile.age} years</p>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-500">Gender</p>
                        <p className="text-lg font-semibold text-gray-900 capitalize">{userProfile.gender}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-500">Class</p>
                        <p className="text-lg font-semibold text-gray-900">Class {userProfile.class}</p>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-500">Location</p>
                        <p className="text-lg font-semibold text-gray-900">{userProfile.location}</p>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-500">Interests</p>
                        <p className="text-lg font-semibold text-gray-900">{userProfile.preferences || 'Not specified'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                    >
                      Edit Profile
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats & Actions */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Stats</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Profile Completion</span>
                    <span className="font-bold text-green-600">85%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{width: '85%'}}></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Quiz Status</span>
                    <span className="font-bold text-blue-600">Completed</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Recommendations</span>
                    <span className="font-bold text-purple-600">Available</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button className="w-full bg-blue-50 text-blue-700 py-3 px-4 rounded-lg hover:bg-blue-100 transition-colors text-left">
                    Retake Quiz
                  </button>
                  <button className="w-full bg-green-50 text-green-700 py-3 px-4 rounded-lg hover:bg-green-100 transition-colors text-left">
                    View Recommendations
                  </button>
                  <button className="w-full bg-purple-50 text-purple-700 py-3 px-4 rounded-lg hover:bg-purple-100 transition-colors text-left">
                    Find Colleges
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Account Info</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email</span>
                    <span className="font-medium">{auth.currentUser?.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Role</span>
                    <span className="font-medium capitalize">{userProfile.role || 'Student'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Joined</span>
                    <span className="font-medium">
                      {userProfile.createdAt ? new Date(userProfile.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Edit Profile</h2>
              <p className="text-gray-600">Update your personal information</p>
            </div>
            
            <form className="space-y-6" onSubmit={handleUpdateProfile}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                  <input
                    type="number"
                    required
                    min="10"
                    max="25"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                    placeholder="Enter your age"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                  <select
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                  >
                    <option value="">Select your gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
                  <select
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                    value={sClass}
                    onChange={(e) => setSClass(e.target.value)}
                  >
                    <option value="">Select your class</option>
                    <option value="10">Class 10</option>
                    <option value="12">Class 12</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                    placeholder="Enter your city/location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Interests/Preferences</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                    placeholder="e.g., Science, Arts, Technology"
                    value={preferences}
                    onChange={(e) => setPreferences(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex space-x-4 pt-6">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
