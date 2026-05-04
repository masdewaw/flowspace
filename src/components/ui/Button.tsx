import React from 'react';
import { clsx } from 'clsx';
import { Slot } from '@radix-ui/react-slot';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  iconOnly?: boolean;
  isLoading?: boolean;
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', iconOnly, isLoading, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    
    const variants = {
      primary: 'bg-primary text-white hover:bg-primary-dark shadow-soft hover:shadow-premium',
      secondary: 'bg-surface-2 text-text-primary hover:bg-surface border border-border hover:border-text-muted/30 shadow-sm',
      outline: 'bg-transparent border border-border text-text-primary hover:bg-surface-2',
      ghost: 'bg-transparent text-text-secondary hover:bg-surface-2 hover:text-text-primary',
      danger: 'bg-danger/10 text-danger hover:bg-danger hover:text-white',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
      icon: 'p-2',
    };

    return (
      <Comp
        ref={ref}
        className={clsx(
          'inline-flex items-center justify-center rounded-button font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-[0.98] hover:scale-[1.02] disabled:opacity-50 disabled:pointer-events-none',
          variants[variant],
          iconOnly ? sizes.icon : sizes[size],
          className
        )}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            {!iconOnly && <span>Loading...</span>}
          </div>
        ) : (
          props.children
        )}
      </Comp>
    );
  }
);

Button.displayName = 'Button';

export { Button };
