import React from 'react';

interface BadgeProps {
  status: string;
  variant?: 'solid' | 'subtle';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ status, variant = 'subtle', className = '' }) => {
  const getColors = () => {
    switch (status) {
      case 'Scheduled':
      case 'Available':
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Completed':
      case 'Paid':
      case 'ADEQUATE':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Cancelled':
      case 'CRITICAL_LOW':
      case 'EXPIRED':
      case 'Unavailable':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'Pending':
      case 'No Show':
      case 'LOW_STOCK':
      case 'EXPIRING_SOON':
      case 'In Consultation':
      case 'Partially Paid':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Ordered':
      case 'On Leave':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getColors()} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70" />
      {status}
    </span>
  );
};
