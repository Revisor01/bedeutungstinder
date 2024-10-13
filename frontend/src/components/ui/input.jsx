import React from 'react';

export const Input = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <input
      className={`border-gray-300 focus:border-bordeaux focus:ring-bordeaux rounded-md shadow-sm ${className}`}
      ref={ref}
      {...props}
    />
  );
});

Input.displayName = 'Input';