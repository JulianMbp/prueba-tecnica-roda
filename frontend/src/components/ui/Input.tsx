import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, icon, className = '', ...props }, ref) => {
    const inputClasses = `
      block w-full px-3 py-2 border rounded-md shadow-sm placeholder-roda-gray-400 
      focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors
      ${error
        ? 'border-roda-error focus:ring-roda-error focus:border-roda-error'
        : 'border-roda-gray-300 focus:ring-roda-yellow focus:border-roda-yellow'
      }
      ${icon ? 'pl-10' : ''}
      ${className}
    `.trim();

    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-roda-gray-700">
            {label}
          </label>
        )}
        
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-roda-gray-400">{icon}</span>
            </div>
          )}
          
          <input
            ref={ref}
            className={inputClasses}
            {...props}
          />
        </div>
        
        {error && (
          <p className="text-sm text-roda-error">{error}</p>
        )}
        
        {helperText && !error && (
          <p className="text-sm text-roda-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
