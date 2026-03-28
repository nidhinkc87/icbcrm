import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import {
    PieChart, Pie, Cell,
    BarChart, Bar,
    AreaChart, Area,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer,
} from 'recharts';

interface Props extends PageProps {
    employee: {
        id: number;
        name: string;
        email: string;
        department: string;
        designation: string;
        date_of_joining: string | null;
    };
    kpis: {
        total_tasks: number;
        completed: number;
        on_time_rate: number;
        avg_days: number;
    };
    charts: {
        status_distribution: { name: string; value: number }[];
        completion_trend: { month: string; count: number }[];
        priority_breakdown: { name: string; total: number; completed: number }[];
        on_time_vs_late: { name: string; value: number }[];
        service_performance: { name: string; total: number; completed: number }[];
        weekly_activity: { week: string; comments: number; attachments: number }[];
    };
    recent_tasks: {
        id: number;
        service_name: string;
        customer_name: string;
        priority: string;
        due_date: string;
        completed_at: string;
        days_taken: number;
        on_time: boolean;
    }[];
    collaboration: {
        tasks_collaborated: number;
        comments_posted: number;
        attachments_uploaded: number;
    };
    filters: { period: string };
}

const STATUS_COLORS: Record<string, string> = {
    'Pending': '#f59e0b',
    'In progress': '#3b82f6',
    'Completed': '#10b981',
};

const ON_TIME_COLORS: Record<string, string> = {
    'On Time': '#10b981',
    'Late': '#ef4444',
};

const PRIORITY_BADGE: Record<string, string> = {
    low: 'bg-gray-100 text-gray-700',
    medium: 'bg-blue-100 text-blue-700',
    high: 'bg-amber-100 text-amber-700',
    urgent: 'bg-red-100 text-red-700',
};

const periods = [
    { value: '30', label: 'Last 30 Days' },
    { value: '90', label: 'Last 90 Days' },
    { value: '180', label: 'Last 180 Days' },
    { value: '365', label: 'Last 365 Days' },
    { value: 'all', label: 'All Time' },
];

function getInitials(name: string): string {
    return name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

function CustomTooltip({ active, payload, label }: any) {
    if (!active || !payload || !payload.length) return null;
    return (
        <div className="rounded-lg bg-gray-900 px-3 py-2 text-sm text-white shadow-lg">
            {label && <p className="mb-1 font-medium">{label}</p>}
            {payload.map((entry: any, i: number) => (
                <p key={i} style={{ color: entry.color || '#fff' }}>
                    {entry.name}: {entry.value}
                </p>
            ))}
        </div>
    );
}

function PieTooltip({ active, payload }: any) {
    if (!active || !payload || !payload.length) return null;
    return (
        <div className="rounded-lg bg-gray-900 px-3 py-2 text-sm text-white shadow-lg">
            <p>
                {payload[0].name}: {payload[0].value}
            </p>
        </div>
    );
}

function EmptyChart({ message = 'No data available' }: { message?: string }) {
    return (
        <div className="flex h-[250px] items-center justify-center rounded-lg border-2 border-dashed border-gray-200">
            <p className="text-sm text-gray-400">{message}</p>
        </div>
    );
}

export default function Show({
    employee,
    kpis,
    charts,
    recent_tasks,
    collaboration,
    filters,
}: Props) {
    function handlePeriodChange(period: string) {
        router.get(route('admin.performance.show', employee.id), { period }, { preserveState: true });
    }

    return (
        <AuthenticatedLayout>
            <Head title={`Performance - ${employee.name}`} />

            <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
                {/* Breadcrumb */}
                <nav className="flex items-center space-x-2 text-sm text-gray-500">
                    <Link
                        href={route('admin.performance.index')}
                        className="hover:text-gray-700"
                    >
                        Performance
                    </Link>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                    <span className="font-medium text-gray-900">{employee.name}</span>
                </nav>

                {/* Employee Header Card */}
                <div className="rounded-xl bg-white p-6 shadow-sm">
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                        <div className="flex items-center gap-4">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-xl font-bold text-white">
                                {getInitials(employee.name)}
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">{employee.name}</h1>
                                <p className="text-sm text-gray-500">{employee.email}</p>
                                <div className="mt-1 flex items-center gap-2">
                                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                                        {employee.department}
                                    </span>
                                    <span className="text-sm text-gray-500">{employee.designation}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <select
                                value={filters.period}
                                onChange={(e) => handlePeriodChange(e.target.value)}
                                className="rounded-lg border-gray-300 text-sm shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                            >
                                {periods.map((p) => (
                                    <option key={p.value} value={p.value}>
                                        {p.label}
                                    </option>
                                ))}
                            </select>
                            {employee.date_of_joining && (
                                <p className="text-xs text-gray-400">
                                    Joined: {new Date(employee.date_of_joining).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Total Tasks */}
                    <div className="rounded-xl bg-white p-5 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 text-emerald-600">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Total Tasks</p>
                                <p className="text-2xl font-bold text-gray-900">{kpis.total_tasks}</p>
                            </div>
                        </div>
                    </div>

                    {/* Completed */}
                    <div className="rounded-xl bg-white p-5 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 text-green-600">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Completed</p>
                                <p className="text-2xl font-bold text-gray-900">{kpis.completed}</p>
                            </div>
                        </div>
                    </div>

                    {/* On-Time Rate */}
                    <div className="rounded-xl bg-white p-5 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 text-blue-600">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">On-Time Rate</p>
                                <p className="text-2xl font-bold text-gray-900">{kpis.on_time_rate}%</p>
                            </div>
                        </div>
                    </div>

                    {/* Avg Completion */}
                    <div className="rounded-xl bg-white p-5 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 text-amber-600">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Avg Completion</p>
                                <p className="text-2xl font-bold text-gray-900">{kpis.avg_days} days</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Row 1: Task Status Distribution */}
                    <div className="rounded-xl bg-white shadow-sm">
                        <div className="p-5">
                            <h3 className="text-sm font-semibold text-gray-900 mb-4">Task Status Distribution</h3>
                            {charts.status_distribution.length > 0 ? (
                                <ResponsiveContainer width="100%" height={250}>
                                    <PieChart>
                                        <Pie
                                            data={charts.status_distribution}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            dataKey="value"
                                            paddingAngle={2}
                                        >
                                            {charts.status_distribution.map((entry, index) => (
                                                <Cell
                                                    key={`status-${index}`}
                                                    fill={STATUS_COLORS[entry.name] || '#9ca3af'}
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<PieTooltip />} />
                                        <Legend
                                            verticalAlign="bottom"
                                            height={36}
                                            formatter={(value: string) => (
                                                <span className="text-xs text-gray-600">{value}</span>
                                            )}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <EmptyChart message="No task status data" />
                            )}
                        </div>
                    </div>

                    {/* Row 1: Monthly Completion Trend */}
                    <div className="rounded-xl bg-white shadow-sm">
                        <div className="p-5">
                            <h3 className="text-sm font-semibold text-gray-900 mb-4">Monthly Completion Trend</h3>
                            {charts.completion_trend.length > 0 ? (
                                <ResponsiveContainer width="100%" height={250}>
                                    <AreaChart data={charts.completion_trend}>
                                        <defs>
                                            <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#10b981" stopOpacity={0.15} />
                                                <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                        <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                                        <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" allowDecimals={false} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Area
                                            type="monotone"
                                            dataKey="count"
                                            name="Completed"
                                            stroke="#10b981"
                                            strokeWidth={2}
                                            fill="url(#emeraldGradient)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <EmptyChart message="No completion trend data" />
                            )}
                        </div>
                    </div>

                    {/* Row 2: Priority Breakdown */}
                    <div className="rounded-xl bg-white shadow-sm">
                        <div className="p-5">
                            <h3 className="text-sm font-semibold text-gray-900 mb-4">Priority Breakdown</h3>
                            {charts.priority_breakdown.length > 0 ? (
                                <ResponsiveContainer width="100%" height={250}>
                                    <BarChart data={charts.priority_breakdown}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                        <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                                        <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" allowDecimals={false} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend
                                            verticalAlign="bottom"
                                            height={36}
                                            formatter={(value: string) => (
                                                <span className="text-xs text-gray-600">{value}</span>
                                            )}
                                        />
                                        <Bar dataKey="total" name="Total" fill="#d1d5db" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="completed" name="Completed" fill="#10b981" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <EmptyChart message="No priority data" />
                            )}
                        </div>
                    </div>

                    {/* Row 2: On-Time vs Late */}
                    <div className="rounded-xl bg-white shadow-sm">
                        <div className="p-5">
                            <h3 className="text-sm font-semibold text-gray-900 mb-4">On-Time vs Late</h3>
                            {charts.on_time_vs_late.length > 0 ? (
                                <ResponsiveContainer width="100%" height={250}>
                                    <PieChart>
                                        <Pie
                                            data={charts.on_time_vs_late}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            dataKey="value"
                                            paddingAngle={2}
                                        >
                                            {charts.on_time_vs_late.map((entry, index) => (
                                                <Cell
                                                    key={`ontime-${index}`}
                                                    fill={ON_TIME_COLORS[entry.name] || '#9ca3af'}
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<PieTooltip />} />
                                        <Legend
                                            verticalAlign="bottom"
                                            height={36}
                                            formatter={(value: string) => (
                                                <span className="text-xs text-gray-600">{value}</span>
                                            )}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <EmptyChart message="No on-time data" />
                            )}
                        </div>
                    </div>

                    {/* Row 3: Service Performance */}
                    <div className="rounded-xl bg-white shadow-sm">
                        <div className="p-5">
                            <h3 className="text-sm font-semibold text-gray-900 mb-4">Service Performance</h3>
                            {charts.service_performance.length > 0 ? (
                                <ResponsiveContainer width="100%" height={250}>
                                    <BarChart data={charts.service_performance}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                        <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                                        <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" allowDecimals={false} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend
                                            verticalAlign="bottom"
                                            height={36}
                                            formatter={(value: string) => (
                                                <span className="text-xs text-gray-600">{value}</span>
                                            )}
                                        />
                                        <Bar dataKey="total" name="Total" fill="#d1d5db" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="completed" name="Completed" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <EmptyChart message="No service data" />
                            )}
                        </div>
                    </div>

                    {/* Row 3: Weekly Activity */}
                    <div className="rounded-xl bg-white shadow-sm">
                        <div className="p-5">
                            <h3 className="text-sm font-semibold text-gray-900 mb-4">Weekly Activity</h3>
                            {charts.weekly_activity.length > 0 ? (
                                <ResponsiveContainer width="100%" height={250}>
                                    <BarChart data={charts.weekly_activity}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                        <XAxis dataKey="week" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                                        <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" allowDecimals={false} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend
                                            verticalAlign="bottom"
                                            height={36}
                                            formatter={(value: string) => (
                                                <span className="text-xs text-gray-600">{value}</span>
                                            )}
                                        />
                                        <Bar dataKey="comments" name="Comments" fill="#3b82f6" stackId="activity" radius={[0, 0, 0, 0]} />
                                        <Bar dataKey="attachments" name="Attachments" fill="#f59e0b" stackId="activity" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <EmptyChart message="No activity data" />
                            )}
                        </div>
                    </div>
                </div>

                {/* Recent Completed Tasks */}
                <div className="rounded-xl bg-white shadow-sm">
                    <div className="p-5">
                        <h3 className="text-sm font-semibold text-gray-900 mb-4">Recent Completed Tasks</h3>
                        {recent_tasks.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead>
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                Service
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                Client
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                Priority
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                Due Date
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                Completed
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                Days Taken
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                Status
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {recent_tasks.map((task) => (
                                            <tr key={task.id} className="hover:bg-gray-50">
                                                <td className="whitespace-nowrap px-4 py-3">
                                                    <Link
                                                        href={route('tasks.show', task.id)}
                                                        className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
                                                    >
                                                        {task.service_name}
                                                    </Link>
                                                </td>
                                                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">
                                                    {task.customer_name}
                                                </td>
                                                <td className="whitespace-nowrap px-4 py-3">
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                                            PRIORITY_BADGE[task.priority] || PRIORITY_BADGE.low
                                                        }`}
                                                    >
                                                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                                                    </span>
                                                </td>
                                                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                                                    {new Date(task.due_date).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                    })}
                                                </td>
                                                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                                                    {new Date(task.completed_at).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                    })}
                                                </td>
                                                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">
                                                    {task.days_taken}
                                                </td>
                                                <td className="whitespace-nowrap px-4 py-3">
                                                    {task.on_time ? (
                                                        <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                                                            On Time
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">
                                                            Late
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed border-gray-200">
                                <p className="text-sm text-gray-400">No completed tasks found for this period.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Collaboration Stats */}
                <div className="rounded-xl bg-white shadow-sm">
                    <div className="p-5">
                        <h3 className="text-sm font-semibold text-gray-900 mb-4">Collaboration Stats</h3>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <div className="rounded-lg bg-gray-50 p-4 text-center">
                                <div className="flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6 text-emerald-500">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                                    </svg>
                                </div>
                                <p className="mt-2 text-2xl font-bold text-gray-900">{collaboration.tasks_collaborated}</p>
                                <p className="text-xs text-gray-500">Tasks Collaborated On</p>
                            </div>
                            <div className="rounded-lg bg-gray-50 p-4 text-center">
                                <div className="flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6 text-blue-500">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                                    </svg>
                                </div>
                                <p className="mt-2 text-2xl font-bold text-gray-900">{collaboration.comments_posted}</p>
                                <p className="text-xs text-gray-500">Comments Posted</p>
                            </div>
                            <div className="rounded-lg bg-gray-50 p-4 text-center">
                                <div className="flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6 text-amber-500">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
                                    </svg>
                                </div>
                                <p className="mt-2 text-2xl font-bold text-gray-900">{collaboration.attachments_uploaded}</p>
                                <p className="text-xs text-gray-500">Attachments Uploaded</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
