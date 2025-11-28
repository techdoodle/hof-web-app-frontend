import { forwardRef } from 'react';
import { cn } from '@/lib/utils/styles';
import '@/app/globals.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'gradient', size = 'md', isLoading, children, type = 'button', ...props }, ref) => {
    const baseStyles = 'rounded-lg font-medium transition-all duration-200 flex items-center justify-center';

    const variants = {
      primary: 'bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc]',
      secondary: 'border border-solid border-black/[.08] dark:border-white/[.145] hover:bg-primary/20 hover:border-primary/50 dark:hover:bg-primary/20 dark:hover:border-primary/50',
      gradient: 'btn-gradient text-foreground w-full',
    };

    const sizes = {
      sm: 'h-10 px-4 text-sm',
      md: 'h-12 px-5 text-base',
      lg: 'h-14 px-6 text-lg'
    };

    return (
      <button
        ref={ref}
        type={type}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={isLoading}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Loading...
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
); 