'use client';

import React from 'react';
import { Notification } from './ToastProvider';

export default function ToastContainer({
  notifications,
  onRemove,
}: {
  notifications: Notification[];
  onRemove: (id: string) => void;
}) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 w-96 max-w-full">
      {notifications.map((n) => (
        <div
          key={n.id}
          className={`rounded-lg p-3 shadow-md ring-1 ring-gray-200 bg-white flex items-start gap-3 animate-slide-in`}
        >
          <div className="flex-shrink-0 mt-0.5">
            {n.type === 'success' ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : n.type === 'error' ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01"
                />
              </svg>
            )}
          </div>
          <div className="flex-1">
            {n.title && (
              <div className="font-medium text-gray-900">{n.title}</div>
            )}
            <div className="text-sm text-gray-700">{n.message}</div>
          </div>
          <div className="ml-2 flex-shrink-0">
            <button
              className="text-gray-400 hover:text-gray-600"
              onClick={() => onRemove(n.id)}
              aria-label="dismiss"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
