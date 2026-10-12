import React from 'react';
import { NotificationItem } from '../types';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllRead: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0e18]/80 backdrop-blur-sm flex items-start sm:items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#1c1f2a] rounded-xl p-4 shadow-2xl border border-[#262a35] space-y-3 mt-12 sm:mt-0 max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-[#262a35] pb-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#8ed5ff] text-[20px]">
              notifications_active
            </span>
            <h3 className="font-headline-sm text-[16px] text-[#dfe2f1] font-bold">
              Telemetry Notifications
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#bdc8d1] hover:text-[#dfe2f1]"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="flex justify-between items-center px-1">
          <span className="font-label-caps text-[10px] text-[#bdc8d1] uppercase">
            {notifications.length} System Broadcasts
          </span>
          <button
            onClick={onMarkAllRead}
            className="font-data-mono-sm text-[10px] text-[#8ed5ff] hover:underline"
          >
            Mark all read
          </button>
        </div>

        <div className="space-y-2 overflow-y-auto pr-1 flex-1">
          {notifications.map((item) => (
            <div
              key={item.id}
              className={`p-2.5 rounded-lg border transition-all ${
                item.read
                  ? 'bg-[#171b26] border-[#262a35]/60 text-[#bdc8d1]'
                  : 'bg-[#262a35] border-[#38bdf8]/40 text-[#dfe2f1]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-body-md text-[13px] font-semibold flex items-center gap-1.5">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      item.type === 'bullish'
                        ? 'bg-[#56e5a9]'
                        : item.type === 'inference'
                        ? 'bg-[#8ed5ff]'
                        : 'bg-[#c0c1ff]'
                    }`}
                  />
                  {item.title}
                </span>
                <span className="font-data-mono-sm text-[10px] text-[#bdc8d1]">
                  {item.time}
                </span>
              </div>
              <p className="font-body-sm text-[12px] text-[#bdc8d1] leading-snug">
                {item.message}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
