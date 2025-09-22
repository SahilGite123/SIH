import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { loginUser, signupUser, loginWithGoogle, resetPassword } from '../../services/firebase/auth';
import { setUserRole } from '../../services/firebase/db';

function Login() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // Check for hardcoded admin credentials
      const ADMIN_EMAIL = "admin@careeradvisor.com";
      const ADMIN_PASSWORD = "admin123";
      
      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        // Try login; if not found, sign up then set role as admin
        const loginRes = await loginUser({ email, password });
        if (!loginRes.ok && loginRes.error.code === 'auth/user-not-found') {
          const signupRes = await signupUser({ email, password, name: 'System Administrator', role: 'admin' });
          if (!signupRes.ok) throw new Error(signupRes.error.message);
          await setUserRole(signupRes.data.uid, 'admin');
        } else if (!loginRes.ok) {
          throw new Error(loginRes.error.message);
        } else {
          await setUserRole(loginRes.data.uid, 'admin');
        }
        navigate('/admin');
        return;
      }
      
      // Regular user login
      const res = await loginUser({ email, password });
      if (!res.ok) throw new Error(res.error.message);
      navigate('/'); // Redirect to dashboard after login
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await loginWithGoogle();
      if (!res.ok) throw new Error(res.error.message);
      navigate('/');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError(null);
    if (!email) { setError('Enter your email to reset password'); return; }
    try {
      const res = await resetPassword(email);
      if (!res.ok) throw new Error(res.error.message);
      setResetSent(true);
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-white flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Brand / Illustration panel */}
        <div className="hidden md:flex relative overflow-hidden rounded-2xl bg-white border border-indigo-100 shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
          <div className="p-8 flex flex-col justify-end">
            <h2 className="text-2xl font-extrabold text-gray-900">Welcome to Career Advisor</h2>
            <p className="text-gray-600 mt-2">Personalized guidance, dynamic roadmaps, and scholarships tailored for you.</p>
            <ul className="mt-4 text-sm text-gray-700 space-y-2">
              <li>• Multi-career recommendations with confidence</li>
              <li>• Location-aware scholarships & colleges</li>
              <li>• AI-powered guidance (Gemini)</li>
            </ul>
          </div>
          <div className="absolute -right-10 -top-10 w-56 h-56 bg-indigo-100 rounded-full blur-2xl opacity-70" />
        </div>

        {/* Auth form */}
        <div className="rounded-2xl bg-white border border-gray-100 shadow p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">{t('login')}</h2>
          <p className="text-gray-600 mb-6 text-sm">Sign in to continue to your dashboard.</p>

          {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

          {!resetMode ? (
            <form className="space-y-4" onSubmit={handleLogin}>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  autoComplete="email"
                  required
                  className="mt-1 block w-full rounded-lg border border-gray-200 p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  autoComplete="current-password"
                  required
                  className="mt-1 block w-full rounded-lg border border-gray-200 p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
                >{loading ? 'Signing in...' : t('login')}</button>
                <button type="button" onClick={() => setResetMode(true)} className="text-sm text-indigo-600 hover:underline">Forgot password?</button>
              </div>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-2 text-sm text-gray-500">Or continue with</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogle}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50"
                disabled={loading}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C33.64,6.053,29.082,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C33.64,6.053,29.082,4,24,4C16.318,4,8.02,8.99,6.306,14.691z"/><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.196l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.535,5.025C9.944,39.771,16.438,44,24,44z"/><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.098,5.651c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C35.211,35.091,38,30.333,38,24C38,22.659,37.862,21.35,43.611,20.083z"/></svg>
                Sign in with Google
              </button>

              <div className="text-sm text-center mt-2">
                <span className="text-gray-600">Don't have an account? </span>
                <Link to="/register" className="text-indigo-600 hover:underline">Register</Link>
              </div>
            </form>
          ) : (
            <form className="space-y-4" onSubmit={handleReset}>
              <div className="text-sm text-gray-700">Enter your email and we'll send you a reset link.</div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  className="mt-1 block w-full rounded-lg border border-gray-200 p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              {resetSent && <div className="text-green-600 text-sm">Password reset email sent.</div>}
              <div className="flex items-center gap-3">
                <button type="submit" className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">Send reset link</button>
                <button type="button" onClick={() => setResetMode(false)} className="text-sm text-gray-600 hover:underline">Back to login</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;
