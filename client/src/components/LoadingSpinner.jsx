import React from 'react';
import { Activity } from 'lucide-react';

export default function LoadingSpinner({ message = 'Loading healthcare portal...' }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-4">
      <div className="relative">
        <div className="w-14 h-14 rounded-full border-4 border-sky-200 border-t-sky-600 animate-spin"></div>
        <Activity className="w-6 h-6 text-sky-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
      </div>
      <p className="text-slate-600 dark:text-slate-300 font-medium text-sm animate-pulse">{message}</p>
    </div>
  );
}
