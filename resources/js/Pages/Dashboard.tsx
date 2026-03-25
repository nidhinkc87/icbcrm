import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import {
    PieChart, Pie, Cell,
    BarChart, Bar,
    LineChart, Line, Area, AreaChart,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer,
} from 'recharts';

interface ChartDataPoint {
    name: string;
    value: number;
}

interface TrendDataPoint {
    date: string;
    count: number;
}

interface ActivityItem {
    id: number;
    type: 'task' | 'comment';
    description: string;
    status: string | null;
    timestamp: string;
    link?: string;
}

interface OverdueTask {
    id: number;
    service_name: string;
    client_name: string;
    responsible_name: string;
    due_date: string;
    days_overdue: number;
}

interface UpcomingTask {
    id: number;
    service_name: string;
    client_name: string;
    due_date: string;
    priority: string;
    status: string;
}

interface ServiceProgress {
    service_name: string;
    total: number;
    completed: number;
    in_progress: number;
    pending: number;
}

interface Props extends PageProps {
    role: 'admin' | 'employee' | 'client';
    kpis: Record<string, number>;
    charts: {
        status_distribution: ChartDataPoint[];
        priority_distribution?: ChartDataPoint[];
        completion_trend?: TrendDataPoint[];
        employee_workload?: ChartDataPoint[];
        service_usage?: ChartDataPoint[];
    };
    recent_activity: ActivityItem[];
    overdue_tasks?: OverdueTask[];
    upcoming_tasks?: UpcomingTask[];
    service_progress?: ServiceProgress[];
}

const STATUS_COLORS: Record<string, string> = {
    'Pending': '#f59e0b',
    'In progress': '#3b82f6',
    'Completed': '#10b981',
};

const PRIORITY_COLORS: Record<string, string> = {
    'Low': '#9ca3af',
    'Medium': '#3b82f6',
    'High': '#f59e0b',
    'Urgent': '#ef4444',
};

const CHART_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const priorityBadgeColors: Record<string, string> = {
    low: 'bg-gray-100 text-gray-700',
    medium: 'bg-blue-100 text-blue-700',
    high: 'bg-amber-100 text-amber-700',
    urgent: 'bg-red-100 text-red-700',
};

const statusBadgeColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
};

function KpiCard({ label, value, icon, color, subtext }: {
    label: string;
    value: number;
    icon: React.ReactNode;
    color: string;
    subtext?: string;
}) {
    return (
        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
            <div className="p-5">
                <div className="flex items-center">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${color}`}>
                        {icon}
                    </div>
                    <div className="ml-4 min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-500 truncate">{label}</p>
                        <p className="text-2xl font-bold text-gray-900">{value}</p>
                        {subtext && <p className="text-xs text-gray-400 mt-0.5">{subtext}</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}

function ChartCard({ title, subtitle, children }: {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
            <div className="p-5">
                <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
                {subtitle && <p className="mt-0.5 text-xs text-gray-500">{subtitle}</p>}
                <div className="mt-4">{children}</div>
            </div>
        </div>
    );
}

function EmptyChart({ message }: { message: string }) {
    return (
        <div className="flex h-[250px] items-center justify-center rounded-lg border-2 border-dashed border-gray-200">
            <p className="text-sm text-gray-400">{message}</p>
        </div>
    );
}

// Custom tooltip
function CustomTooltip({ active, payload, label }: any) {
    if (active && payload && payload.length) {
        return (
            <div className="rounded-lg bg-gray-900 px-3 py-2 text-xs text-white shadow-lg">
                <p className="font-medium">{label || payload[0].name}</p>
                <p className="mt-0.5">{payload[0].value}</p>
            </div>
        );
    }
    return null;
}

function AdminDashboard({ kpis, charts, recent_activity, overdue_tasks }: Props) {
    return (
        <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                <KpiCard label="Total Tasks" value={kpis.total_tasks} color="bg-emerald-50"
                    icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6 text-emerald-600"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" /></svg>}
                />
                <KpiCard label="Completed" value={kpis.completed_tasks} color="bg-green-50"
                    icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6 text-green-600"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                />
                <KpiCard label="In Progress" value={kpis.in_progress_tasks} color="bg-blue-50"
                    icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6 text-blue-600"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182M2.985 19.644l3.181-3.182" /></svg>}
                />
                <KpiCard label="Overdue" value={kpis.overdue_tasks} color="bg-red-50"
                    icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6 text-red-600"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>}
                />
                <KpiCard label="Pending" value={kpis.pending_tasks} color="bg-amber-50"
                    icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6 text-amber-600"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                />
                <KpiCard label="Total Clients" value={kpis.total_clients} color="bg-purple-50"
                    icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6 text-purple-600"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>}
                />
                <KpiCard label="Employees" value={kpis.total_employees} color="bg-cyan-50"
                    icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6 text-cyan-600"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>}
                />
            </div>

            {/* Charts Row 1: Status + Priority */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <ChartCard title="Task Status Distribution">
                    {charts.status_distribution.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={charts.status_distribution}
                                    cx="50%" cy="50%"
                                    innerRadius={60} outerRadius={100}
                                    paddingAngle={3}
                                    dataKey="value"
                                    label={({ name, percent }: any) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                                >
                                    {charts.status_distribution.map((entry, i) => (
                                        <Cell key={i} fill={STATUS_COLORS[entry.name] || CHART_COLORS[i % CHART_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : <EmptyChart message="No tasks yet" />}
                </ChartCard>

                <ChartCard title="Tasks by Priority">
                    {charts.priority_distribution && charts.priority_distribution.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={charts.priority_distribution} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" allowDecimals={false} />
                                <YAxis type="category" dataKey="name" width={60} tick={{ fontSize: 12 }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                    {charts.priority_distribution.map((entry, i) => (
                                        <Cell key={i} fill={PRIORITY_COLORS[entry.name] || CHART_COLORS[i]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : <EmptyChart message="No tasks yet" />}
                </ChartCard>
            </div>

            {/* Charts Row 2: Completion Trend */}
            <ChartCard title="Task Completion Trend" subtitle="Last 30 days">
                {charts.completion_trend && charts.completion_trend.some(d => d.count > 0) ? (
                    <ResponsiveContainer width="100%" height={280}>
                        <AreaChart data={charts.completion_trend}>
                            <defs>
                                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="date" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2} fill="url(#colorCount)" />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : <EmptyChart message="No completed tasks in the last 30 days" />}
            </ChartCard>

            {/* Charts Row 3: Employee Workload + Service Usage */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <ChartCard title="Employee Workload" subtitle="Active tasks per employee">
                    {charts.employee_workload && charts.employee_workload.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={charts.employee_workload}>
                                <CartesianGrid strokeDasharray="3 3" horizontal />
                                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : <EmptyChart message="No active tasks" />}
                </ChartCard>

                <ChartCard title="Service Usage" subtitle="Tasks per service">
                    {charts.service_usage && charts.service_usage.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={charts.service_usage}>
                                <CartesianGrid strokeDasharray="3 3" horizontal />
                                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : <EmptyChart message="No service data" />}
                </ChartCard>
            </div>

            {/* Bottom Row: Activity + Overdue */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Recent Activity */}
                <ChartCard title="Recent Activity">
                    {recent_activity.length > 0 ? (
                        <div className="max-h-[320px] space-y-3 overflow-y-auto pr-1">
                            {recent_activity.map((item, i) => (
                                <div key={`${item.type}-${item.id}-${i}`} className="flex items-start gap-3">
                                    <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${item.type === 'task' ? 'bg-emerald-50' : 'bg-blue-50'}`}>
                                        {item.type === 'task' ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-3.5 w-3.5 text-emerald-600"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" /></svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-3.5 w-3.5 text-blue-600"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg>
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        {item.link ? (
                                            <Link href={item.link} className="text-sm text-gray-700 hover:text-emerald-600">
                                                {item.description}
                                            </Link>
                                        ) : (
                                            <p className="text-sm text-gray-700">{item.description}</p>
                                        )}
                                        <p className="text-xs text-gray-400">{item.timestamp}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex h-[250px] items-center justify-center">
                            <p className="text-sm text-gray-400">No recent activity</p>
                        </div>
                    )}
                </ChartCard>

                {/* Overdue Tasks */}
                <ChartCard title="Overdue Tasks">
                    {overdue_tasks && overdue_tasks.length > 0 ? (
                        <div className="max-h-[320px] space-y-2 overflow-y-auto pr-1">
                            {overdue_tasks.map((task) => (
                                <Link
                                    key={task.id}
                                    href={route('tasks.show', task.id)}
                                    className="block rounded-lg border border-red-100 bg-red-50/50 p-3 hover:bg-red-50 transition"
                                >
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium text-gray-900">{task.service_name}</p>
                                        <span className="inline-flex rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                                            {task.days_overdue}d overdue
                                        </span>
                                    </div>
                                    <p className="mt-0.5 text-xs text-gray-500">
                                        {task.client_name} · {task.responsible_name} · Due {task.due_date}
                                    </p>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="flex h-[250px] flex-col items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-10 w-10 text-green-300">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="mt-2 text-sm font-medium text-green-600">All caught up!</p>
                            <p className="text-xs text-gray-400">No overdue tasks</p>
                        </div>
                    )}
                </ChartCard>
            </div>
        </>
    );
}

function EmployeeDashboard({ kpis, charts, upcoming_tasks, recent_activity }: Props) {
    return (
        <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <KpiCard label="My Tasks" value={kpis.my_tasks} color="bg-emerald-50"
                    icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6 text-emerald-600"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" /></svg>}
                />
                <KpiCard label="In Progress" value={kpis.in_progress} color="bg-blue-50"
                    icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6 text-blue-600"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182M2.985 19.644l3.181-3.182" /></svg>}
                />
                <KpiCard label="Completed" value={kpis.completed} color="bg-green-50"
                    icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6 text-green-600"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                />
                <KpiCard label="Overdue" value={kpis.overdue} color="bg-red-50"
                    icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6 text-red-600"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>}
                />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Status Chart */}
                <ChartCard title="My Task Status">
                    {charts.status_distribution.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie data={charts.status_distribution} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value"
                                    label={({ name, percent }: any) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                                    {charts.status_distribution.map((entry, i) => (
                                        <Cell key={i} fill={STATUS_COLORS[entry.name] || CHART_COLORS[i % CHART_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : <EmptyChart message="No tasks assigned" />}
                </ChartCard>

                {/* Upcoming Due Dates */}
                <ChartCard title="Upcoming Due Dates" subtitle="Next 7 days">
                    {upcoming_tasks && upcoming_tasks.length > 0 ? (
                        <div className="max-h-[250px] space-y-2 overflow-y-auto pr-1">
                            {upcoming_tasks.map((task) => (
                                <Link
                                    key={task.id}
                                    href={route('tasks.show', task.id)}
                                    className="block rounded-lg border border-gray-100 p-3 hover:bg-gray-50 transition"
                                >
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium text-gray-900">{task.service_name}</p>
                                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${priorityBadgeColors[task.priority] || ''}`}>
                                            {task.priority}
                                        </span>
                                    </div>
                                    <p className="mt-0.5 text-xs text-gray-500">
                                        {task.client_name} · Due {task.due_date}
                                    </p>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="flex h-[250px] items-center justify-center">
                            <p className="text-sm text-gray-400">No upcoming deadlines</p>
                        </div>
                    )}
                </ChartCard>
            </div>

            {/* Recent Activity */}
            <ChartCard title="Recent Activity on My Tasks">
                {recent_activity.length > 0 ? (
                    <div className="max-h-[300px] space-y-3 overflow-y-auto pr-1">
                        {recent_activity.map((item, i) => (
                            <div key={`${item.type}-${item.id}-${i}`} className="flex items-start gap-3">
                                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-3.5 w-3.5 text-blue-600"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg>
                                </div>
                                <div className="min-w-0 flex-1">
                                    {item.link ? (
                                        <Link href={item.link} className="text-sm text-gray-700 hover:text-emerald-600">{item.description}</Link>
                                    ) : (
                                        <p className="text-sm text-gray-700">{item.description}</p>
                                    )}
                                    <p className="text-xs text-gray-400">{item.timestamp}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex h-[200px] items-center justify-center">
                        <p className="text-sm text-gray-400">No recent activity</p>
                    </div>
                )}
            </ChartCard>
        </>
    );
}

function ClientDashboard({ kpis, charts, service_progress, recent_activity }: Props) {
    return (
        <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <KpiCard label="Total Tasks" value={kpis.total_tasks} color="bg-emerald-50"
                    icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6 text-emerald-600"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" /></svg>}
                />
                <KpiCard label="Completed" value={kpis.completed} color="bg-green-50"
                    icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6 text-green-600"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                />
                <KpiCard label="In Progress" value={kpis.in_progress} color="bg-blue-50"
                    icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6 text-blue-600"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182M2.985 19.644l3.181-3.182" /></svg>}
                />
                <KpiCard label="Pending" value={kpis.pending} color="bg-amber-50"
                    icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6 text-amber-600"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Status Chart */}
                <ChartCard title="Task Status Overview">
                    {charts.status_distribution.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie data={charts.status_distribution} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value"
                                    label={({ name, percent }: any) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                                    {charts.status_distribution.map((entry, i) => (
                                        <Cell key={i} fill={STATUS_COLORS[entry.name] || CHART_COLORS[i % CHART_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : <EmptyChart message="No tasks yet" />}
                </ChartCard>

                {/* Service Progress */}
                <ChartCard title="Service Progress">
                    {service_progress && service_progress.length > 0 ? (
                        <div className="max-h-[250px] space-y-4 overflow-y-auto pr-1">
                            {service_progress.map((sp, i) => {
                                const completedPct = sp.total > 0 ? Math.round((sp.completed / sp.total) * 100) : 0;
                                return (
                                    <div key={i}>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="font-medium text-gray-900">{sp.service_name}</span>
                                            <span className="text-xs text-gray-500">{sp.completed}/{sp.total} done</span>
                                        </div>
                                        <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-gray-100">
                                            <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${completedPct}%` }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex h-[250px] items-center justify-center">
                            <p className="text-sm text-gray-400">No services yet</p>
                        </div>
                    )}
                </ChartCard>
            </div>

            {/* Recent Activity */}
            <ChartCard title="Recent Updates">
                {recent_activity.length > 0 ? (
                    <div className="max-h-[300px] space-y-3 overflow-y-auto pr-1">
                        {recent_activity.map((item, i) => (
                            <div key={`${item.type}-${item.id}-${i}`} className="flex items-start gap-3">
                                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-50">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-3.5 w-3.5 text-emerald-600"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" /></svg>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm text-gray-700">{item.description}</p>
                                    <p className="text-xs text-gray-400">{item.timestamp}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex h-[200px] items-center justify-center">
                        <p className="text-sm text-gray-400">No recent updates</p>
                    </div>
                )}
            </ChartCard>
        </>
    );
}

export default function Dashboard(props: Props) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Dashboard
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    {props.role === 'admin' && <AdminDashboard {...props} />}
                    {props.role === 'employee' && <EmployeeDashboard {...props} />}
                    {props.role === 'client' && <ClientDashboard {...props} />}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
