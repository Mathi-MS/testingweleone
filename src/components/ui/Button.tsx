import React from 'react';
import { getButtonClass } from '../../theme';
import type { ButtonProps } from '../../types/ui';

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const baseClasses = 'flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  return (
    <button
      className={`${variant === 'custom' ? '' : baseClasses} ${getButtonClass(variant)} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};