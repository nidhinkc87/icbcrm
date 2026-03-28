import { router } from '@inertiajs/react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface Notification {
    id: string;
    type: string;
    data: {
        type: string;
        title: string;
        message: string;
        url: string;
        task_id?: number;
        is_urgent?: boolean;
    };
    read_at: string | null;
    created_at: string;
}

function csrfToken(): string {
    const meta = document.querySelector('meta[name="csrf-token"]');
    return meta ? meta.getAttribute('content') ?? '' : '';
}


export default function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const fetchNotifications = useCallback(async () => {
        try {
            const res = await fetch('/notifications', {
                headers: { Accept: 'application/json' },
            });
            if (res.ok) {
                const data = await res.json();
                setNotifications(data.notifications ?? []);
                setUnreadCount(data.unread_count ?? 0);
            }
        } catch {
            // silently ignore fetch errors
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);

        // Also refresh on Inertia page navigation
        const handleNavigate = () => fetchNotifications();
        document.addEventListener('inertia:finish', handleNavigate);

        return () => {
            clearInterval(interval);
            document.removeEventListener('inertia:finish', handleNavigate);
        };
    }, [fetchNotifications]);

    // Close on outside click
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        if (open) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [open]);

    const markAsReadAndNavigate = async (notification: Notification) => {
        if (!notification.read_at) {
            try {
                await fetch(`/notifications/${notification.id}/read`, {
                    method: 'PATCH',
                    headers: {
                        'X-CSRF-TOKEN': csrfToken(),
                        Accept: 'application/json',
                    },
                });
                setNotifications((prev) =>
                    prev.map((n) =>
                        n.id === notification.id ? { ...n, read_at: new Date().toISOString() } : n,
                    ),
                );
                setUnreadCount((c) => Math.max(0, c - 1));
            } catch {
                // continue navigation even if mark-read fails
            }
        }
        setOpen(false);
        if (notification.data.url) {
            router.visit(notification.data.url);
        }
    };

    const markAllAsRead = async (e: React.MouseEvent) => {
        e.preventDefault();
        try {
            await fetch('/notifications/read-all', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': csrfToken(),
                    Accept: 'application/json',
                },
            });
            setNotifications((prev) =>
                prev.map((n) => ({ ...n, read_at: n.read_at ?? new Date().toISOString() })),
            );
            setUnreadCount(0);
        } catch {
            // silently ignore
        }
    };

    return (
        <div ref={dropdownRef} className="relative">
            {/* Bell button */}
            <button
                type="button"
                className="relative rounded-full p-1 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                onClick={() => setOpen((prev) => !prev)}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-6 w-6"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
                    />
                </svg>

                {/* Unread badge */}
                {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {open && (
                <div className="absolute right-0 mt-2 w-80 rounded-lg border border-gray-200 bg-white shadow-lg z-50">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                        <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                type="button"
                                onClick={markAllAsRead}
                                className="text-xs font-medium text-emerald-600 hover:text-emerald-800"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>

                    {/* Notification list */}
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="px-4 py-8 text-center text-sm text-gray-500">
                                No notifications
                            </div>
                        ) : (
                            notifications.slice(0, 20).map((notification) => (
                                <button
                                    key={notification.id}
                                    type="button"
                                    onClick={() => markAsReadAndNavigate(notification)}
                                    className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 ${
                                        !notification.read_at ? 'bg-emerald-50/50' : ''
                                    } ${notification.data.is_urgent ? 'border-l-2 border-l-red-500' : ''}`}
                                >
                                    {/* Status dot */}
                                    <span
                                        className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                                            notification.read_at ? 'bg-emerald-400' : 'bg-blue-500'
                                        }`}
                                    />

                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-semibold text-gray-900">
                                            {notification.data.title}
                                        </p>
                                        <p className="mt-0.5 line-clamp-2 text-xs text-gray-500">
                                            {notification.data.message}
                                        </p>
                                        <p className="mt-1 text-xs text-gray-400">
                                            {notification.created_at}
                                        </p>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
