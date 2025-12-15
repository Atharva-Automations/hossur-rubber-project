'use client';

import React, {
  createContext,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { v4 as uuidv4 } from 'uuid';
import ToastContainer from './ToastContainer';

export type Notification = {
  id: string;
  type: 'success' | 'error' | 'info';
  title?: string;
  message: string;
  createdAt: number;
};

type ContextValue = {
  notify: (n: Omit<Notification, 'id' | 'createdAt'>) => void;
  notifications: Notification[];
};

export const ToastContext = createContext<ContextValue | null>(null);

// global bridge for simple imperative API
let globalNotify: ((n: Omit<Notification, 'id' | 'createdAt'>) => void) | null =
  null;
export function notifyGlobal(n: Omit<Notification, 'id' | 'createdAt'>) {
  globalNotify?.(n);
}

export default function ToastProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const timers = useRef<Record<string, number>>({});

  const remove = useCallback((id: string) => {
    setNotifications((s) => s.filter((t) => t.id !== id));
    if (timers.current[id]) {
      window.clearTimeout(timers.current[id]);
      delete timers.current[id];
    }
  }, []);

  const notify = useCallback(
    (n: Omit<Notification, 'id' | 'createdAt'>) => {
      const id = uuidv4();
      const toast: Notification = { ...n, id, createdAt: Date.now() };
      setNotifications((s) => [toast, ...s]);
      // auto-dismiss after 5s
      const t = window.setTimeout(() => remove(id), 5000);
      timers.current[id] = t;
    },
    [remove]
  );

  useEffect(() => {
    globalNotify = notify;
    return () => {
      globalNotify = null;
      // clear all timers
      Object.values(timers.current).forEach((v) => window.clearTimeout(v));
      timers.current = {};
    };
  }, [notify]);

  return (
    <ToastContext.Provider value={{ notify, notifications }}>
      {children}
      <ToastContainer notifications={notifications} onRemove={remove} />
    </ToastContext.Provider>
  );
}
