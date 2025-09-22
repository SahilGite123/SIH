import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { signupUser } from '../../services/firebase/auth';

function Register() {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [sClass, setSClass] = useState(''); // Changed from 'class' to 'sClass' to avoid keyword conflict
  const [location, setLocation] = useState('');
  const [preferences, setPreferences] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student'); // Default role
  const [parentInviteCode, setParentInviteCode] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      // Validate parent invite code if role is parent
      if (role === 'parent' && !parentInviteCode) {
        setError('Parent invite code is required for parent registration');
        return;
      }

      const extra = { name, role };
      if (role === 'student') {
        extra.age = parseInt(age);
        extra.gender = gender;
        extra.class = sClass;
        extra.location = location;
        extra.preferences = preferences;
      }
      if (role === 'parent') {
        extra.inviteCode = parentInviteCode;
      }

      const res = await signupUser({ email, password, name, role, ...extra });
      if (!res.ok) throw new Error(res.error.message);
      navigate('/'); // Redirect to dashboard after registration
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-6">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {t('register')}
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
          {error && <p className="text-red-500 text-center">{error}</p>}
          
          {/* Role Selection */}
          <select
            required
            className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="student">Student</option>
            <option value="parent">Parent/Guardian</option>
          </select>

          {/* Parent Invite Code - only show for parents */}
          {role === 'parent' && (
            <input
              type="text"
              required
              className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Parent Invite Code"
              value={parentInviteCode}
              onChange={(e) => setParentInviteCode(e.target.value)}
            />
          )}

          <input
            type="text"
            required
            className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
            placeholder={t('name')}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {/* Student-specific fields */}
          {role === 'student' && (
            <>
              <input
                type="number"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder={t('age')}
                value={age}
                onChange={(e) => setAge(e.target.value)}
              />
              <select
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              >
                <option value="">{t('gender')}</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              <select
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                value={sClass}
                onChange={(e) => setSClass(e.target.value)}
              >
                <option value="">{t('class')}</option>
                <option value="10">10</option>
                <option value="12">12</option>
              </select>
              <input
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder={t('location')}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
              <input
                type="text"
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder={`${t('preferences')} (e.g., Science, Arts)`}
                value={preferences}
                onChange={(e) => setPreferences(e.target.value)}
              />
            </>
          )}
          <input
            type="email"
            autoComplete="email"
            required
            className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            autoComplete="new-password"
            required
            className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="submit"
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {t('register')}
          </button>
        </form>
        <div className="text-sm text-center">
          <p className="font-medium text-indigo-600 hover:text-indigo-500">
            Already have an account? <a href="/login" className="text-indigo-600 hover:text-indigo-500">Login</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
