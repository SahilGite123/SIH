import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Toaster } from 'react-hot-toast';
import Chatbot from '../Chatbot/Chatbot';
import Sidebar from '../Sidebar/Sidebar';

const Layout = ({ children }) => {
  const { t } = useTranslation();
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const layoutVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1
      }
    }
  };

  return (
    <motion.div 
      className="min-h-screen bg-purple-50/40 transition-colors duration-300"
      variants={layoutVariants}
      initial="initial"
      animate="animate"
    >
      {/* Left Sidebar (desktop) */}
      <Sidebar />

      <main className="md:ml-64">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </div>
        </motion.div>
      </main>

      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: darkMode ? '#374151' : '#ffffff',
            color: darkMode ? '#f3f4f6' : '#111827',
            border: `1px solid ${darkMode ? '#4b5563' : '#e5e7eb'}`,
          },
        }}
      />

      {/* Floating FAQs chatbot */}
      <Chatbot />
    </motion.div>
  );
};

export default Layout;
