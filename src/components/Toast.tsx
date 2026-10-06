/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  description?: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="toast-container fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={() => onDismiss(toast.id)} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: () => void }> = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const config = {
    success: {
      icon: CheckCircle2,
      border: 'border-emerald-200 bg-emerald-50 text-emerald-900',
      iconColor: 'text-emerald-600'
    },
    warning: {
      icon: AlertTriangle,
      border: 'border-amber-200 bg-amber-50 text-amber-900',
      iconColor: 'text-amber-600'
    },
    error: {
      icon: AlertCircle,
      border: 'border-rose-200 bg-rose-50 text-rose-900',
      iconColor: 'text-rose-600'
    },
    info: {
      icon: Info,
      border: 'border-blue-200 bg-blue-50 text-blue-900',
      iconColor: 'text-blue-600'
    }
  }[toast.type];

  const Icon = config.icon;

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-lg border shadow-md transition-all animate-in fade-in slide-in-from-bottom-2 ${config.border}`}
    >
      <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${config.iconColor}`} />
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold">{toast.title}</h4>
        {toast.description && <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{toast.description}</p>}
      </div>
      <button
        onClick={onDismiss}
        className="text-slate-400 hover:text-slate-600 transition-colors p-1"
        aria-label="Tutup notifikasi"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
