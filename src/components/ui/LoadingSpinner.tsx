import React from 'react';
import { cn } from '../../utils/utils';
import type { LoadingSpinnerProps } from '../../types/ui';

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', className }) => {
  const sizeClasses = {
    xs:'w-2 h-2',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className={cn('flex items-center justify-center py-2', className)}>
      <div className="flex items-center gap-2">
        <div
          className={cn(
            'animate-spin rounded-full border-2 border border-t-[#00BF53]',
            sizeClasses[size]
          )}
        />
        {/* <span className="text-sm text-text-gray">Loading...</span> */}
      </div>
    </div>
  );
};

export { LoadingSpinner };