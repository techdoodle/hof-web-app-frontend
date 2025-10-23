import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'outline' | 'ghost' | 'link';
    size?: 'default' | 'sm' | 'lg';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'default', size = 'default', ...props }, ref) => {
        return (
            <button
                className={cn(
                    'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-400 disabled:pointer-events-none disabled:opacity-50',
                    {
                        'default': 'bg-primary text-primary-foreground shadow hover:bg-primary/90',
                        'outline': 'border border-input bg-transparent hover:bg-accent hover:text-accent-foreground',
                        'ghost': 'hover:bg-accent hover:text-accent-foreground',
                        'link': 'text-primary underline-offset-4 hover:underline',
                    }[variant],
                    {
                        'default': 'h-9 px-4 py-2',
                        'sm': 'h-8 rounded-md px-3 text-xs',
                        'lg': 'h-10 rounded-md px-8',
                    }[size],
                    className
                )}
                ref={ref}
                {...props}
            />
        );
    }
);

Button.displayName = 'Button';

export { Button };
