import React from 'react';
import { motion } from 'framer-motion';

const Card = ({ 
  children, 
  className = '', 
  hover = true, 
  gradient = false,
  onClick,
  ...props 
}) => {
  const baseClasses = `
    bg-white dark:bg-gray-800 
    rounded-xl shadow-lg 
    border border-gray-100 dark:border-gray-700
    overflow-hidden
    ${gradient ? 'bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900' : ''}
    ${onClick ? 'cursor-pointer' : ''}
    ${className}
  `;

  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    hover: hover ? { 
      y: -5, 
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' 
    } : {}
  };

  return (
    <motion.div
      className={baseClasses}
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      transition={{ duration: 0.2 }}
      onClick={onClick}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default Card;
