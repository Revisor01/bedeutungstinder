import React from 'react';

export const Checkbox = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <input
      type="checkbox"
      className={`rounded border-gray-300 text-bordeaux focus:border-bordeaux focus:ring-bordeaux ${className}`}
      ref={ref}
      {...props}
    />
  );
});

Checkbox.displayName = 'Checkbox';