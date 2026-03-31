import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useCallback, useEffect, useMemo, useState } from 'react';

type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
type TaskStatus = 'pending' | 'in_progress' | 'completed';
type ViewMode = 'month' | 'week' | 'day';

interface CalendarTask {
    id: number;
    service_name: string;
    customer_name: string;
    responsible_name: string;
    responsible_id: number;
    priority: TaskPriority;
    status: TaskStatus;
    due_date: string;
    is_overdue: boolean;
    has_pending_delay: boolean;
    can_work: boolean;
}

interface Props extends PageProps {
    tasks_by_date: Record<string, CalendarTask[]>;
    current_month: number;
    current_year: number;
    delay_reasons: Record<string, string>;
    auth_user_id: number;
}

const priorityDot: Record<TaskPriority, string> = {
    low: 'bg-gray-400',
    medium: 'bg-blue-500',
    high: 'bg-amber-500',
    urgent: 'bg-red-500',
};

const priorityBorder: Record<TaskPriority, string> = {
    low: 'border-l-gray-300',
    medium: 'border-l-blue-400',
    high: 'border-l-amber-400',
    urgent: 'border-l-red-500',
};

const priorityBadge: Record<TaskPriority, string> = {
    low: 'bg-gray-100 text-gray-700',
    medium: 'bg-blue-100 text-blue-700',
    high: 'bg-amber-100 text-amber-700',
    urgent: 'bg-red-100 text-red-700',
};

const statusBadge: Record<TaskStatus, string> = {
    pending: 'bg-amber-100 text-amber-700',
    in_progress: 'bg-blue-100 text-blue-700',
    completed: 'bg-emerald-100 text-emerald-700',
};

const statusLabel: Record<TaskStatus, string> = {
    pending: 'Pending',
    in_progress: 'In Progress',
    completed: 'Completed',
};

const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getCalendarDays(year: number, month: number) {
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const startDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const days: { date: string; day: number; isCurrentMonth: boolean; isToday: boolean }[] = [];
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    // Previous month padding
    const prevMonth = new Date(year, month - 2, 1);
    const daysInPrevMonth = new Date(year, month - 1, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
        const d = daysInPrevMonth - i;
        const m = prevMonth.getMonth() + 1;
        const y = prevMonth.getFullYear();
        const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        days.push({ date: dateStr, day: d, isCurrentMonth: false, isToday: dateStr === todayStr });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        days.push({ date: dateStr, day: d, isCurrentMonth: true, isToday: dateStr === todayStr });
    }

    // Next month padding
    const remaining = 7 - (days.length % 7);
    if (remaining < 7) {
        const nextMonth = month === 12 ? 1 : month + 1;
        const nextYear = month === 12 ? year + 1 : year;
        for (let d = 1; d <= remaining; d++) {
            const dateStr = `${nextYear}-${String(nextMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            days.push({ date: dateStr, day: d, isCurrentMonth: false, isToday: dateStr === todayStr });
        }
    }

    return days;
}

function getWeekDays(year: number, month: number, weekStart: Date) {
    const days: { date: string; day: number; dayName: string; isCurrentMonth: boolean; isToday: boolean }[] = [];
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    for (let i = 0; i < 7; i++) {
        const d = new Date(weekStart);
        d.setDate(d.getDate() + i);
        const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        days.push({
            date: dateStr,
            day: d.getDate(),
            dayName: DAY_NAMES[d.getDay()],
            isCurrentMonth: d.getMonth() + 1 === month,
            isToday: dateStr === todayStr,
        });
    }
    return days;
}

function getCurrentWeekStart(year: number, month: number) {
    const today = new Date();
    const d = new Date(year, month - 1, 1);
    // If current month, start from current week
    if (today.getFullYear() === year && today.getMonth() + 1 === month) {
        const day = today.getDay();
        d.setFullYear(today.getFullYear(), today.getMonth(), today.getDate() - day);
    } else {
        const day = d.getDay();
        d.setDate(d.getDate() - day);
    }
    return d;
}

export default function Calendar({ tasks_by_date, current_month, current_year, delay_reasons, auth_user_id }: Props) {
    const { flash } = usePage<PageProps>().props;
    const [viewMode, setViewMode] = useState<ViewMode>('month');
    const [month, setMonth] = useState(current_month);
    const [year, setYear] = useState(current_year);
    const [tasksByDate, setTasksByDate] = useState(tasks_by_date);
    const [loading, setLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [weekStart, setWeekStart] = useState(() => getCurrentWeekStart(current_year, current_month));

    // Delay modal state
    const [delayTask, setDelayTask] = useState<CalendarTask | null>(null);
    const [delayForm, setDelayForm] = useState({ reason: '', reason_detail: '', proposed_due_date: '' });
    const [delayErrors, setDelayErrors] = useState<Record<string, string>>({});
    const [delaySubmitting, setDelaySubmitting] = useState(false);

    // Task detail popover
    const [hoveredTask, setHoveredTask] = useState<CalendarTask | null>(null);

    // Flash message
    const [flashMsg, setFlashMsg] = useState(flash?.success || '');
    useEffect(() => {
        if (flash?.success) {
            setFlashMsg(flash.success);
            const t = setTimeout(() => setFlashMsg(''), 4000);
            return () => clearTimeout(t);
        }
    }, [flash?.success]);

    const fetchCalendarData = useCallback(async (m: number, y: number) => {
        setLoading(true);
        try {
            const res = await fetch(route('tasks.calendar.data', { month: m, year: y }), {
                headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
            });
            const data = await res.json();
            setTasksByDate(data.tasks_by_date);
        } catch (e) {
            console.error('Failed to fetch calendar data', e);
        }
        setLoading(false);
    }, []);

    const navigateMonth = (direction: -1 | 1) => {
        let newMonth = month + direction;
        let newYear = year;
        if (newMonth < 1) { newMonth = 12; newYear--; }
        if (newMonth > 12) { newMonth = 1; newYear++; }
        setMonth(newMonth);
        setYear(newYear);
        fetchCalendarData(newMonth, newYear);
    };

    const navigateWeek = (direction: -1 | 1) => {
        const newStart = new Date(weekStart);
        newStart.setDate(newStart.getDate() + (direction * 7));
        setWeekStart(newStart);
        // Check if we need to fetch new month data
        const midWeek = new Date(newStart);
        midWeek.setDate(midWeek.getDate() + 3);
        const newMonth = midWeek.getMonth() + 1;
        const newYear = midWeek.getFullYear();
        if (newMonth !== month || newYear !== year) {
            setMonth(newMonth);
            setYear(newYear);
            fetchCalendarData(newMonth, newYear);
        }
    };

    const goToToday = () => {
        const today = new Date();
        const m = today.getMonth() + 1;
        const y = today.getFullYear();
        setMonth(m);
        setYear(y);
        setWeekStart(getCurrentWeekStart(y, m));
        setSelectedDate(`${y}-${String(m).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`);
        if (m !== month || y !== year) {
            fetchCalendarData(m, y);
        }
    };

    const calendarDays = useMemo(() => getCalendarDays(year, month), [year, month]);
    const weekDays = useMemo(() => getWeekDays(year, month, weekStart), [year, month, weekStart]);

    // Delay modal handlers
    const openDelayModal = (task: CalendarTask) => {
        setDelayTask(task);
        setDelayForm({ reason: '', reason_detail: '', proposed_due_date: '' });
        setDelayErrors({});
    };

    const submitDelay = () => {
        if (!delayTask) return;
        const errors: Record<string, string> = {};
        if (!delayForm.reason) errors.reason = 'Please select a reason.';
        if (delayForm.reason === 'other' && !delayForm.reason_detail.trim()) errors.reason_detail = 'Please provide details.';
        if (Object.keys(errors).length) { setDelayErrors(errors); return; }

        setDelaySubmitting(true);
        router.post(route('tasks.delay-reasons.store', delayTask.id), {
            reason: delayForm.reason,
            reason_detail: delayForm.reason_detail || null,
            proposed_due_date: delayForm.proposed_due_date || null,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setDelayTask(null);
                setDelaySubmitting(false);
                fetchCalendarData(month, year);
            },
            onError: (errors) => {
                setDelayErrors(errors as Record<string, string>);
                setDelaySubmitting(false);
            },
        });
    };

    const getTasksForDate = (date: string) => tasksByDate[date] || [];

    // Task pill component for month view
    const TaskPill = ({ task }: { task: CalendarTask }) => (
        <div
            className={`group flex items-center gap-1.5 rounded-md px-2 py-1 text-xs border-l-2 ${priorityBorder[task.priority]} ${
                task.status === 'completed' ? 'bg-gray-50 opacity-60' : task.is_overdue ? 'bg-red-50' : 'bg-white'
            } hover:shadow-sm transition-shadow cursor-pointer`}
            onClick={(e) => { e.stopPropagation(); window.location.href = route('tasks.show', task.id); }}
        >
            <div className={`h-1.5 w-1.5 shrink-0 rounded-full ${priorityDot[task.priority]}`} />
            <span className={`truncate flex-1 ${task.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                {task.service_name}
            </span>
            {task.has_pending_delay && (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-3 w-3 text-amber-500 shrink-0">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )}
        </div>
    );

    // Task card component for week/day views
    const TaskDetailCard = ({ task }: { task: CalendarTask }) => (
        <div className={`rounded-lg border border-gray-200 border-l-4 ${priorityBorder[task.priority]} bg-white p-3 shadow-sm hover:shadow-md transition-shadow`}>
            <div className="flex items-start justify-between gap-2">
                <Link href={route('tasks.show', task.id)} className="min-w-0 flex-1">
                    <p className={`text-sm font-medium truncate ${task.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                        {task.service_name}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500 truncate">{task.customer_name}</p>
                </Link>
                {task.has_pending_delay && (
                    <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-3 w-3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Delay
                    </span>
                )}
            </div>
            <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${statusBadge[task.status]}`}>
                        {statusLabel[task.status]}
                    </span>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${priorityBadge[task.priority]}`}>
                        {task.priority}
                    </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-[9px] font-bold text-emerald-700">
                        {task.responsible_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                </div>
            </div>
            {/* Report delay button */}
            {task.status !== 'completed' && task.can_work && (
                <button
                    onClick={(e) => { e.stopPropagation(); openDelayModal(task); }}
                    className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-md border border-gray-200 bg-gray-50 px-2 py-1.5 text-xs text-gray-600 hover:bg-amber-50 hover:border-amber-200 hover:text-amber-700 transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-3.5 w-3.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Report Delay
                </button>
            )}
        </div>
    );

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Task Calendar</h2>}
        >
            <Head title="Task Calendar" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Flash message */}
                    {flashMsg && (
                        <div className="mb-4 rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3">
                            <p className="text-sm font-medium text-emerald-700">{flashMsg}</p>
                        </div>
                    )}

                    {/* Toolbar */}
                    <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            {/* Month/Week Navigation */}
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => viewMode === 'month' ? navigateMonth(-1) : navigateWeek(-1)}
                                    className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                                    </svg>
                                </button>

                                <h3 className="text-lg font-semibold text-gray-900 min-w-[180px] text-center">
                                    {viewMode === 'day' && selectedDate
                                        ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
                                        : `${MONTH_NAMES[month - 1]} ${year}`}
                                </h3>

                                <button
                                    onClick={() => viewMode === 'month' ? navigateMonth(1) : navigateWeek(1)}
                                    className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                    </svg>
                                </button>
                            </div>

                            <button
                                onClick={goToToday}
                                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Today
                            </button>

                            {loading && (
                                <svg className="h-5 w-5 animate-spin text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                            )}
                        </div>

                        <div className="flex items-center gap-3">
                            {/* View mode toggle */}
                            <div className="inline-flex rounded-lg border border-gray-300 bg-white p-0.5">
                                {(['month', 'week', 'day'] as ViewMode[]).map((mode) => (
                                    <button
                                        key={mode}
                                        onClick={() => {
                                            setViewMode(mode);
                                            if (mode === 'day' && !selectedDate) {
                                                const today = new Date();
                                                setSelectedDate(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`);
                                            }
                                        }}
                                        className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                                            viewMode === mode
                                                ? 'bg-emerald-600 text-white shadow-sm'
                                                : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                    >
                                        {mode.charAt(0).toUpperCase() + mode.slice(1)}
                                    </button>
                                ))}
                            </div>

                            <Link
                                href={route('tasks.index')}
                                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors inline-flex items-center gap-1.5"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                                </svg>
                                List View
                            </Link>
                        </div>
                    </div>

                    {/* Calendar Grid */}
                    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                        {/* Month View */}
                        {viewMode === 'month' && (
                            <>
                                {/* Day headers */}
                                <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
                                    {DAY_NAMES.map((day) => (
                                        <div key={day} className="px-3 py-2.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            {day}
                                        </div>
                                    ))}
                                </div>

                                {/* Calendar cells */}
                                <div className="grid grid-cols-7">
                                    {calendarDays.map((day, idx) => {
                                        const tasks = getTasksForDate(day.date);
                                        const maxVisible = 3;
                                        const overflow = tasks.length - maxVisible;

                                        return (
                                            <div
                                                key={idx}
                                                className={`min-h-[120px] border-b border-r border-gray-100 p-1.5 transition-colors ${
                                                    !day.isCurrentMonth ? 'bg-gray-50/50' : 'bg-white'
                                                } ${day.isToday ? 'bg-emerald-50/40' : ''} hover:bg-gray-50/80 cursor-pointer`}
                                                onClick={() => {
                                                    setSelectedDate(day.date);
                                                    setViewMode('day');
                                                }}
                                            >
                                                {/* Date number */}
                                                <div className="flex items-center justify-between mb-1">
                                                    <span
                                                        className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-sm ${
                                                            day.isToday
                                                                ? 'bg-emerald-600 font-bold text-white'
                                                                : day.isCurrentMonth
                                                                    ? 'font-medium text-gray-900'
                                                                    : 'text-gray-400'
                                                        }`}
                                                    >
                                                        {day.day}
                                                    </span>
                                                    {tasks.length > 0 && (
                                                        <span className="text-[10px] font-medium text-gray-400">{tasks.length}</span>
                                                    )}
                                                </div>

                                                {/* Task pills */}
                                                <div className="space-y-0.5">
                                                    {tasks.slice(0, maxVisible).map((task) => (
                                                        <TaskPill key={task.id} task={task} />
                                                    ))}
                                                    {overflow > 0 && (
                                                        <button className="w-full text-center text-[10px] font-medium text-emerald-600 hover:text-emerald-700 py-0.5">
                                                            +{overflow} more
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        )}

                        {/* Week View */}
                        {viewMode === 'week' && (
                            <>
                                <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
                                    {weekDays.map((day) => (
                                        <div
                                            key={day.date}
                                            className={`px-3 py-3 text-center border-r border-gray-100 last:border-r-0 ${
                                                day.isToday ? 'bg-emerald-50' : ''
                                            }`}
                                        >
                                            <p className="text-xs font-medium text-gray-500 uppercase">{day.dayName}</p>
                                            <p className={`mt-0.5 text-lg font-semibold ${
                                                day.isToday ? 'text-emerald-600' : day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                                            }`}>
                                                {day.day}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-7 divide-x divide-gray-100">
                                    {weekDays.map((day) => {
                                        const tasks = getTasksForDate(day.date);
                                        return (
                                            <div
                                                key={day.date}
                                                className={`min-h-[400px] p-2 space-y-2 ${
                                                    day.isToday ? 'bg-emerald-50/30' : ''
                                                }`}
                                            >
                                                {tasks.length === 0 && (
                                                    <p className="text-center text-xs text-gray-300 mt-8">No tasks</p>
                                                )}
                                                {tasks.map((task) => (
                                                    <TaskDetailCard key={task.id} task={task} />
                                                ))}
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        )}

                        {/* Day View */}
                        {viewMode === 'day' && selectedDate && (() => {
                            const tasks = getTasksForDate(selectedDate);
                            const dateObj = new Date(selectedDate + 'T00:00:00');

                            return (
                                <div className="p-6">
                                    {/* Day navigation */}
                                    <div className="flex items-center justify-between mb-6">
                                        <button
                                            onClick={() => {
                                                const d = new Date(selectedDate + 'T00:00:00');
                                                d.setDate(d.getDate() - 1);
                                                const newDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                                                setSelectedDate(newDate);
                                                // Fetch if month changed
                                                if (d.getMonth() + 1 !== month || d.getFullYear() !== year) {
                                                    setMonth(d.getMonth() + 1);
                                                    setYear(d.getFullYear());
                                                    fetchCalendarData(d.getMonth() + 1, d.getFullYear());
                                                }
                                            }}
                                            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                                            </svg>
                                        </button>
                                        <div className="text-center">
                                            <p className="text-sm text-gray-500">{DAY_NAMES[dateObj.getDay()]}</p>
                                            <p className="text-2xl font-bold text-gray-900">{dateObj.getDate()}</p>
                                            <p className="text-sm text-gray-500">{MONTH_NAMES[dateObj.getMonth()]} {dateObj.getFullYear()}</p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                const d = new Date(selectedDate + 'T00:00:00');
                                                d.setDate(d.getDate() + 1);
                                                const newDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                                                setSelectedDate(newDate);
                                                if (d.getMonth() + 1 !== month || d.getFullYear() !== year) {
                                                    setMonth(d.getMonth() + 1);
                                                    setYear(d.getFullYear());
                                                    fetchCalendarData(d.getMonth() + 1, d.getFullYear());
                                                }
                                            }}
                                            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                            </svg>
                                        </button>
                                    </div>

                                    {/* Tasks */}
                                    {tasks.length === 0 ? (
                                        <div className="text-center py-16">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="mx-auto h-12 w-12 text-gray-300">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                                            </svg>
                                            <p className="mt-3 text-sm text-gray-500">No tasks scheduled for this day</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3 max-w-2xl mx-auto">
                                            <p className="text-sm font-medium text-gray-500 mb-4">{tasks.length} task{tasks.length !== 1 ? 's' : ''}</p>
                                            {tasks.map((task) => (
                                                <TaskDetailCard key={task.id} task={task} />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })()}
                    </div>

                    {/* Legend */}
                    <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-gray-500">
                        <span className="font-medium">Priority:</span>
                        {(['low', 'medium', 'high', 'urgent'] as TaskPriority[]).map((p) => (
                            <span key={p} className="flex items-center gap-1">
                                <span className={`h-2 w-2 rounded-full ${priorityDot[p]}`} />
                                {p.charAt(0).toUpperCase() + p.slice(1)}
                            </span>
                        ))}
                        <span className="mx-2">|</span>
                        <span className="flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-3 w-3 text-amber-500">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Delay reported
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="inline-block h-2 w-4 rounded bg-red-50 border border-red-200" />
                            Overdue
                        </span>
                    </div>
                </div>
            </div>

            {/* Delay Reason Modal */}
            <Modal show={delayTask !== null} onClose={() => setDelayTask(null)} maxWidth="md">
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 text-amber-600">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Report Delay</h3>
                            {delayTask && (
                                <p className="text-sm text-gray-500">{delayTask.service_name} - {delayTask.customer_name}</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4">
                        {/* Reason select */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Reason for delay</label>
                            <select
                                value={delayForm.reason}
                                onChange={(e) => setDelayForm({ ...delayForm, reason: e.target.value })}
                                className="block w-full rounded-lg border-gray-300 text-sm shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                            >
                                <option value="">Select a reason...</option>
                                {Object.entries(delay_reasons).map(([key, label]) => (
                                    <option key={key} value={key}>{label}</option>
                                ))}
                            </select>
                            {delayErrors.reason && <p className="mt-1 text-sm text-red-600">{delayErrors.reason}</p>}
                        </div>

                        {/* Reason detail */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Additional details {delayForm.reason === 'other' && <span className="text-red-500">*</span>}
                            </label>
                            <textarea
                                value={delayForm.reason_detail}
                                onChange={(e) => setDelayForm({ ...delayForm, reason_detail: e.target.value })}
                                rows={3}
                                placeholder="Provide more context about the delay..."
                                className="block w-full rounded-lg border-gray-300 text-sm shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                            />
                            {delayErrors.reason_detail && <p className="mt-1 text-sm text-red-600">{delayErrors.reason_detail}</p>}
                        </div>

                        {/* Proposed due date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Proposed new due date <span className="text-gray-400 font-normal">(optional)</span>
                            </label>
                            <input
                                type="date"
                                value={delayForm.proposed_due_date}
                                onChange={(e) => setDelayForm({ ...delayForm, proposed_due_date: e.target.value })}
                                min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                                className="block w-full rounded-lg border-gray-300 text-sm shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                            />
                            {delayErrors.proposed_due_date && <p className="mt-1 text-sm text-red-600">{delayErrors.proposed_due_date}</p>}
                            <p className="mt-1 text-xs text-gray-400">If approved, the task due date will be updated.</p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-6 flex items-center justify-end gap-3">
                        <button
                            onClick={() => setDelayTask(null)}
                            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={submitDelay}
                            disabled={delaySubmitting}
                            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-500 transition-colors disabled:opacity-50 inline-flex items-center gap-2"
                        >
                            {delaySubmitting && (
                                <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                            )}
                            Submit
                        </button>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
