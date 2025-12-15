'use client';

import React, { useContext, useState } from 'react';
import { ToastContext } from './ToastProvider';

export default function NotificationButton() {
  const ctx = useContext(ToastContext);
  const [open, setOpen] = useState(false);

  const items = ctx?.notifications || [];

  return (
    <div className="fixed top-4 right-4 z-60">
      <div className="relative">
        <button
          onClick={() => setOpen((s) => !s)}
          className="h-10 w-10 rounded-full bg-white shadow flex items-center justify-center ring-1 ring-gray-200"
          aria-label="Notifications"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-700"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          {items.length > 0 && (
            <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-medium rounded-full bg-red-600 text-white">
              {items.length}
            </span>
          )}
        </button>

        {open && (
          <div className="mt-2 w-80 max-w-screen-sm bg-white shadow-lg rounded-lg ring-1 ring-gray-200">
            <div className="p-3">
              <h4 className="font-medium text-gray-900">Notifications</h4>
            </div>
            <div className="max-h-64 overflow-y-auto divide-y divide-gray-100">
              {items.length === 0 ? (
                <div className="p-3 text-sm text-gray-500">
                  No notifications
                </div>
              ) : (
                items.map((n) => (
                  <div key={n.id} className="p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {n.title ||
                            (n.type === 'success'
                              ? 'Success'
                              : n.type === 'error'
                              ? 'Error'
                              : 'Info')}
                        </div>
                        <div className="text-sm text-gray-700">{n.message}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          {new Date(n.createdAt).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
