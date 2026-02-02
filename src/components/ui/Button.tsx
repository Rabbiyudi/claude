'use client';

import { clsx } from 'clsx';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  isLoading?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  isLoading,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center rounded-full font-medium transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        {
          // Variants
          'bg-[#FFD700] text-gray-900 hover:bg-[#E6C200] shadow-md hover:shadow-lg active:scale-95':
            variant === 'primary',
          'bg-gray-100 text-gray-700 hover:bg-gray-200': variant === 'secondary',
          'bg-transparent text-gray-600 hover:bg-gray-100': variant === 'ghost',
          'bg-transparent text-gray-600 hover:bg-gray-100 rounded-full p-2': variant === 'icon',

          // Sizes
          'px-3 py-1.5 text-sm': size === 'sm' && variant !== 'icon',
          'px-4 py-2 text-base': size === 'md' && variant !== 'icon',
          'px-6 py-3 text-lg': size === 'lg' && variant !== 'icon',
          'p-2': size === 'sm' && variant === 'icon',
          'p-3': size === 'md' && variant === 'icon',
          'p-4': size === 'lg' && variant === 'icon',
        },
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg
          className="animate-spin h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        children
      )}
    </button>
  );
}
