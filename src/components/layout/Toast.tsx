import React, { createContext, useContext, useState, useCallback } from 'react';

interface Toast { id: string; message: string; type: 'success' | 'error' | 'info'; }

interface ToastContextValue { addToast: (message: string, type?: Toast['type']) => void; }

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 no-print">
        {toasts.map(toast => (
          <div key={toast.id} className={`px-4 py-3 rounded-lg shadow-lg text-sm font-medium max-w-sm ${
            toast.type === 'success' ? 'bg-green-600 text-white' :
            toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-100'}`}>
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
