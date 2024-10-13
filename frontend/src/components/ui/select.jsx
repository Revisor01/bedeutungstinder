import React from 'react';

export const Select = React.forwardRef(({ children, className, ...props }, ref) => {
  return (
    <select
      className={`border-gray-300 focus:border-bordeaux focus:ring-bordeaux rounded-md shadow-sm ${className}`}
      ref={ref}
      {...props}
    >
      {children}
    </select>
  );
});

Select.displayName = 'Select';