'use client';
import { createContext, useContext, useState, useCallback, useRef } from 'react';

const ToastContext = createContext(null);

let toastIdCounter = 0;

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    const timersRef = useRef({});

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
        if (timersRef.current[id]) {
            clearTimeout(timersRef.current[id]);
            delete timersRef.current[id];
        }
    }, []);

    const addToast = useCallback((message, type = 'info', duration = 3500) => {
        const id = ++toastIdCounter;
        setToasts(prev => [...prev, { id, message, type }]);
        timersRef.current[id] = setTimeout(() => removeToast(id), duration);
        return id;
    }, [removeToast]);

    const toast = useCallback((message, duration) => addToast(message, 'info', duration), [addToast]);
    toast.success = useCallback((message, duration) => addToast(message, 'success', duration), [addToast]);
    toast.error = useCallback((message, duration) => addToast(message, 'error', duration), [addToast]);
    toast.warning = useCallback((message, duration) => addToast(message, 'warning', duration), [addToast]);

    return (
        <ToastContext.Provider value={toast}>
            {children}
            {/* Toast container */}
            <div className="toast-container" aria-live="polite">
                {toasts.map((t) => (
                    <div key={t.id} className={`toast toast-${t.type}`}>
                        <span className="toast-icon">
                            {t.type === 'success' && '✅'}
                            {t.type === 'error' && '❌'}
                            {t.type === 'warning' && '⚠️'}
                            {t.type === 'info' && 'ℹ️'}
                        </span>
                        <span className="toast-message">{t.message}</span>
                        <button
                            className="toast-close"
                            onClick={() => removeToast(t.id)}
                            aria-label="Close"
                        >
                            ✕
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}
