
import React from 'react';
import { DAMAGE_CLASS_COLORS } from '../utils';

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' | 'outline' }> = ({ 
  children, className = '', variant = 'primary', ...props 
}) => {
  const baseStyles = "px-4 py-2 rounded-lg font-semibold transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none";
  
  const variants = {
    primary: "bg-[var(--accent-color)] text-white hover:brightness-110",
    secondary: "bg-gray-700 text-gray-200 hover:bg-gray-600",
    danger: "bg-red-600 text-white hover:bg-red-700",
    outline: "border border-[var(--border-color)] bg-black/20 hover:bg-black/40 text-[var(--subtle-text-color)] hover:text-[var(--text-color)]"
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export const Card: React.FC<{ children: React.ReactNode; className?: string; delay?: number }> = ({ children, className = '', delay = 0 }) => (
  <div 
    className={`bg-[var(--card-bg-color)] backdrop-blur-md border border-[var(--border-color)] rounded-2xl shadow-xl overflow-hidden animate-fade-in ${className}`}
    style={{ animationDelay: `${delay}s` }}
  >
    {children}
  </div>
);

export const CardHeader: React.FC<{ title: string }> = ({ title }) => (
  <div className="px-5 py-3 border-b border-[var(--border-color)] bg-white/5">
    <h3 className="font-semibold text-lg">{title}</h3>
  </div>
);

export const Badge: React.FC<{ color?: string; children: React.ReactNode; className?: string }> = ({ color = '#777', children, className = '' }) => (
  <span 
    className={`px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm border border-white/20 inline-block ${className}`}
    style={{ backgroundColor: color, textShadow: '1px 1px 2px rgba(0,0,0,0.4)' }}
  >
    {children}
  </span>
);

export const DamageClassIcon: React.FC<{ damageClass: string, showLabel?: boolean }> = ({ damageClass, showLabel = true }) => {
    const color = DAMAGE_CLASS_COLORS[damageClass.toLowerCase()] || '#777';
    
    const getIcon = () => {
        switch(damageClass.toLowerCase()) {
            case 'physical':
                return (
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                        <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
                    </svg>
                );
            case 'special':
                return (
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
                        <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="1" fill="none" />
                        <circle cx="12" cy="12" r="2" fill="currentColor" />
                    </svg>
                );
            case 'status':
                return (
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                    </svg>
                );
            default:
                return null;
        }
    };

    return (
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-black/30 border border-white/10" title={damageClass}>
            <span style={{ color }}>{getIcon()}</span>
            {showLabel && <span className="text-[10px] font-bold uppercase opacity-80">{damageClass}</span>}
        </div>
    );
};

export const Loader: React.FC = () => (
  <div className="w-5 h-5 border-2 border-gray-300 border-t-[var(--accent-color)] rounded-full animate-spin mx-auto"></div>
);
