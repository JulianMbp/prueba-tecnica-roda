import { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  size?: 'sm' | 'md';
  className?: string;
}

export function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
}: BadgeProps) {
  const baseClasses = 'inline-flex items-center font-medium rounded-full';
  
  const variantClasses = {
    success: 'bg-roda-success text-roda-white',
    warning: 'bg-roda-warning text-roda-white',
    error: 'bg-roda-error text-roda-white',
    info: 'bg-roda-info text-roda-white',
    neutral: 'bg-roda-gray-100 text-roda-gray-800',
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  return (
    <span className={classes}>
      {children}
    </span>
  );
}

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const statusConfig = {
    pendiente: { variant: 'neutral' as const, text: 'Pendiente' },
    pagada: { variant: 'success' as const, text: 'Pagada' },
    pagado: { variant: 'success' as const, text: 'Pagado' },
    vencida: { variant: 'error' as const, text: 'Vencida' },
    vencido: { variant: 'error' as const, text: 'Vencido' },
    parcial: { variant: 'warning' as const, text: 'Parcial' },
    al_dia: { variant: 'success' as const, text: 'Al día' },
    en_mora: { variant: 'error' as const, text: 'En mora' },
    mora: { variant: 'error' as const, text: 'En mora' },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || { variant: 'neutral' as const, text: status || 'Desconocido' };

  return (
    <Badge variant={config.variant} className={className}>
      {config.text}
    </Badge>
  );
}
