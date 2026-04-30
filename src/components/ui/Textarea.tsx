import React from 'react';
import { theme } from '../../theme';
import type { TextareaProps } from '../../types/ui';

export const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  className = '',
  ...props
}) => {
  const textareaClasses = `
    w-full px-3 py-2 rounded-md border transition-colors resize-vertical
    ${error ? theme.input.error : theme.input.default}
    ${className}
  `.trim();

  return (
    <div className="space-y-1">
      {label && (
        <label className={`block text-sm font-medium ${theme.text.primary}`}>
          {label}
        </label>
      )}
      <textarea className={textareaClasses} {...props} />
      {error && (
        <p className="text-sm text-error-500">{error}</p>
      )}
    </div>
  );
};