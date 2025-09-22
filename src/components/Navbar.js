import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { auth } from '../firebase';
import { getUserProfile } from '../services/firebase/db';
import { logoutUser } from '../services/firebase/auth';
import { motion } from 'framer-motion';
import { 
  SunIcon, 
  MoonIcon, 
  Bars3Icon, 
  XMarkIcon,
  ChevronDownIcon 
} from '@heroicons/react/24/outline';

function Navbar({ darkMode, toggleDarkMode }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [userRole, setUserRole] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (auth.currentUser) {
        try {
          const res = await getUserProfile(auth.currentUser.uid);
          if (res.ok && res.data) setUserRole(res.data.role || 'student');
        } catch (error) {
          console.error('Error fetching user role:', error);
        }
      }
    };
    fetchUserRole();
  }, []);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const handleLogout = async () => {
    try {
      const res = await logoutUser();
      if (!res.ok) throw new Error(res.error.message);
      navigate('/login');
    } catch (error) {
      console.error("Error logging out: ", error);
    }
  };

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: '/', label: t('dashboard') },
    { path: '/quiz', label: t('quiz') },
    { path: '/colleges', label: t('colleges') },
    { path: '/careers', label: t('careers') || 'Careers' },
    { path: '/timeline', label: t('timeline') },
    { path: '/resources', label: t('resources') },
    { path: '/notifications', label: t('notifications') || 'Notifications' },
    { path: '/simulator', label: t('simulator') },
    { path: '/analytics', label: t('analytics') },
    { path: '/parent-portal', label: t('parent_portal') || 'Parent Portal' },
    { path: '/results', label: 'Results' },
    { path: '/guidance', label: 'Guidance' },
  ];

  return (
    <motion.nav 
      className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.div 
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.05 }}
          >
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">CA</span>
            </div>
            <span className="font-bold text-xl text-gray-900 dark:text-white">
              Career Advisor
            </span>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <motion.div key={item.path} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to={item.path}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(item.path)
                      ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
                      : 'text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {item.label}
                </Link>
              </motion.div>
            ))}
            
            {userRole === 'admin' && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/admin"
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800 transition-all duration-200"
                >
                  Admin
                </Link>
              </motion.div>
            )}
          </div>

          {/* Right side controls */}
          <div className="flex items-center space-x-3">
            {/* Dark mode toggle */}
            <motion.button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {darkMode ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
            </motion.button>

            {/* Language dropdown */}
            <div className="relative">
              <motion.button
                onClick={() => setLanguageDropdownOpen(!languageDropdownOpen)}
                className="flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>{i18n.language === 'hi' ? '🇮🇳' : '🇺🇸'}</span>
                <span>{i18n.language === 'hi' ? 'हिन्दी' : 'English'}</span>
                <ChevronDownIcon className="w-4 h-4" />
              </motion.button>

              {languageDropdownOpen && (
                <motion.div
                  className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <button
                    onClick={() => {
                      changeLanguage('en');
                      setLanguageDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg"
                  >
                    🇺🇸 English
                  </button>
                  <button
                    onClick={() => {
                      changeLanguage('hi');
                      setLanguageDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-lg"
                  >
                    🇮🇳 हिन्दी
                  </button>
                </motion.div>
              )}
            </div>

            {/* Profile avatar dropdown */}
            <div className="relative">
              <motion.button
                onClick={() => setProfileOpen(!profileOpen)}
                className="w-9 h-9 rounded-full bg-indigo-500 text-white flex items-center justify-center font-semibold shadow hover:shadow-md"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Profile menu"
              >
                {/* Initials or generic icon */}
                {auth.currentUser?.email ? auth.currentUser.email[0].toUpperCase() : 'U'}
              </motion.button>
              {profileOpen && (
                <motion.div
                  className="absolute right-0 mt-2 w-44 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                >
                  <Link
                    to="/profile"
                    onClick={() => setProfileOpen(false)}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {t('profile')}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {t('logout')}
                  </button>
                </motion.div>
              )}
            </div>

            {/* Mobile menu button */}
            <motion.button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {mobileMenuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
            </motion.button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <motion.div
            className="md:hidden"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="px-2 pt-2 pb-3 space-y-1 bg-gray-50 dark:bg-gray-800 rounded-lg mt-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActive(item.path)
                      ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
                      : 'text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              
              {userRole === 'admin' && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-md text-base font-medium bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300"
                >
                  Admin
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
}

export default Navbar;
