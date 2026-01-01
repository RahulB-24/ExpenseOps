import React from 'react';
import { ExpenseStatus } from '../../types';

interface BadgeProps {
  status: ExpenseStatus | string;
}

export const Badge: React.FC<BadgeProps> = ({ status }) => {
  let styles = 'bg-slate-100 text-slate-600';

  switch (status) {
    case ExpenseStatus.SUBMITTED:
      styles = 'bg-amber-100 text-amber-700 border border-amber-200';
      break;
    case ExpenseStatus.APPROVED:
      styles = 'bg-green-100 text-green-700 border border-green-200';
      break;
    case ExpenseStatus.REJECTED:
      styles = 'bg-red-100 text-red-700 border border-red-200';
      break;
    case ExpenseStatus.REIMBURSED:
      styles = 'bg-blue-100 text-blue-700 border border-blue-200';
      break;
    default:
      styles = 'bg-slate-100 text-slate-600 border border-slate-200';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wide ${styles}`}>
      {status}
    </span>
  );
};