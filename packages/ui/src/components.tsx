"use client";

import React from 'react';
import { motion, AnimatePresence, HTMLMotionProps } from 'framer-motion';

// --- Types ---

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'glass' | 'gold';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

// --- Components ---

/**
 * Premium Button with high-fidelity animations and variant-specific glows.
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', isLoading, disabled, children, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center rounded-xl font-medium transition-all ' +
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ' +
      'disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer';

    const variants = {
      primary:    'bg-primary text-primary-foreground shadow-[0_0_20px_-5px_hsl(var(--primary)/0.4)] hover:shadow-[0_0_25px_-2px_hsl(var(--primary)/0.5)]',
      secondary:  'bg-secondary text-secondary-foreground hover:bg-secondary/80',
      outline:    'border-2 border-border bg-transparent text-foreground hover:bg-accent hover:border-accent hover:text-accent-foreground',
      ghost:      'bg-transparent text-foreground hover:bg-primary/5 hover:text-primary',
      destructive:'bg-destructive text-destructive-foreground shadow-md hover:bg-destructive/90',
      glass:      'premium-glass text-foreground hover:bg-glass/80',
      gold:       'bg-accent text-accent-foreground shadow-[0_0_15px_-3px_hsl(var(--accent)/0.3)] hover:shadow-[0_0_20px_0_hsl(var(--accent)/0.4)]',
    };

    const sizes = {
      sm: 'h-9 px-4 text-xs',
      md: 'h-11 px-6 py-2',
      lg: 'h-14 px-8 text-lg font-semibold',
    };

    // Using motion("button") for more robust typing in strict environments
    const M = motion.button as any;
    const MotionSpan = motion.span as any;

    return (
      <M
        whileHover={{ translateY: -2, scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={isLoading || disabled}
        {...props}
      >
        <AnimatePresence mode="wait">
          {isLoading ? (
            <MotionSpan 
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" 
            />
          ) : null}
        </AnimatePresence>
        {children}
      </M>
    );
  }
);

Button.displayName = 'Button';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, ...props }, ref) => {
    const MotionParagraph = motion.p as any;

    return (
      <div className="w-full space-y-2">
        {label && (
          <label className="text-sm font-semibold tracking-tight text-muted-foreground ml-1">
            {label}
          </label>
        )}
        <div className="relative group">
          <input
            className={`flex h-12 w-full rounded-xl border-2 border-input bg-background/50 px-4 py-2 text-sm text-foreground ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus:border-primary/50 disabled:cursor-not-allowed disabled:opacity-50 transition-all ${className}`}
            ref={ref}
            {...props}
          />
          <div className="absolute inset-0 rounded-xl border border-primary/0 group-focus-within:border-primary/20 pointer-events-none transition-all" />
        </div>
        {error && (
            <MotionParagraph 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs font-medium text-destructive ml-1"
            >
                {error}
            </MotionParagraph>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export const Card = ({ className = '', children, hoverable = false }: { className?: string; children: React.ReactNode, hoverable?: boolean }) => {
  const M = motion.div as any;
  return (
    <M 
      whileHover={hoverable ? { translateY: -6, shadow: 'var(--shadow-premium)' } : {}}
      className={`rounded-2xl border border-border bg-card text-card-foreground shadow-soft transition-all duration-300 ${className}`}
    >
      {children}
    </M>
  );
};

export const GlassCard = ({ className = '', children }: { className?: string; children: React.ReactNode }) => {
  const M = motion.div as any;
  return (
    <M 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`premium-glass rounded-3xl p-1 ${className}`}
    >
      <div className="rounded-[calc(1.5rem-1px)] p-6 bg-background/40">
        {children}
      </div>
    </M>
  );
};

export const CardHeader = ({ className = '', children }: { className?: string; children: React.ReactNode }) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>{children}</div>
);

export const CardTitle = ({ className = '', children }: { className?: string; children: React.ReactNode }) => (
  <h3 className={`text-2xl font-bold heading-premium tracking-tight text-foreground ${className}`}>{children}</h3>
);

export const CardContent = ({ className = '', children }: { className?: string; children: React.ReactNode }) => (
  <div className={`p-6 pt-0 ${className}`}>{children}</div>
);

export const Badge = ({
  className = '',
  variant = 'default',
  children,
}: {
  className?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'premium' | 'gold';
  children: React.ReactNode;
}) => {
  const variants = {
    default: 'bg-muted text-muted-foreground',
    success: 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-600 border border-amber-500/20',
    danger:  'bg-rose-500/10 text-rose-600 border border-rose-500/20',
    premium: 'bg-primary/10 text-primary border border-primary/20 animate-pulse',
    gold:    'bg-accent/10 text-accent border border-accent/20',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

export const GradientText = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <span className={`bg-clip-text text-transparent bg-gradient-to-r from-primary via-indigo-500 to-accent animate-gradient-x font-bold ${className}`}>
    {children}
  </span>
);

export const DynamicContainer = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => {
  const MotionDiv = motion.div as any;

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
      className={className}
    >
      {children}
    </MotionDiv>
  );
};

export const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse rounded-md bg-muted ${className}`} />
);
