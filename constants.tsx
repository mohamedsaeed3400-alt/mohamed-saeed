
import React from 'react';

export const COLORS = {
  primary: '#2563eb',
  secondary: '#64748b',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
};

export const STATUS_COLORS: Record<string, string> = {
  NEW: 'bg-blue-100 text-blue-700',
  PACKAGING: 'bg-yellow-100 text-yellow-700',
  PACKED: 'bg-indigo-100 text-indigo-700',
  SHIPPED: 'bg-purple-100 text-purple-700',
  DELIVERED: 'bg-green-100 text-green-700',
  RETURNED: 'bg-red-100 text-red-700',
  EXCHANGE: 'bg-orange-100 text-orange-700',
};
