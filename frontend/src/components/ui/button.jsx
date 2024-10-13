import React from 'react';

export const Button = ({ children, className, variant, size, ...props }) => (
  <button
    className={`px-4 py-2 rounded ${
      variant === 'outline' ? 'border border-gray-300' : 'bg-blue-500 text-white'
    } ${size === 'icon' ? 'p-2' : ''} ${className}`}
    {...props}
  >
    {children}
  </button>
);