import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import TextInput from '@/Components/TextInput';
import { Head, Link, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useState } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from 'recharts';

interface EmployeeMetric {
    id: number;
    name: string;
    department: string;
    designation: string;
    total_tasks: number;
    completed: number;
    completion_rate: number;
    on_time: number;
    on_time_rate: number;
    overdue: number;
    active_tasks: number;
    avg_days: number | null;
}

interface Props extends PageProps {
    employees: EmployeeMetric[];
    kpis: {
        total_employees: number;
        avg_completion_rate: number;
        avg_on_time_rate: number;
        total_overdue: number;
    };
    charts: {
        completion_ranking: { name: string; value: number }[];
        workload_distribution: { name: string; value: number }[];
    };
    filters: {
        search: string | null;
        period: string;
    };
}

const periodOptions = [
    { value: '30', label: 'Last 30 days' },
    { value: '90', label: 'Last 90 days' },
    { value: '180', label: 'Last 6 months' },
    { value: '365', label: 'Last year' },
    { value: 'all', label: 'All time' },
];

function rateColor(rate: number): string {
    if (rate >= 80) return 'bg-green-500';
    if (rate >= 50) return 'bg-amber-500';
    return 'bg-red-500';
}

export default function Index({ employees, kpis, charts, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');

    function applyFilters(overrides: Record<string, string | null> = {}) {
        const params: Record<string, string> = {
            period: filters.period,
            ...overrides,
        };
        if (search && !('search' in overrides)) {
            params.search = search;
        }
        if (overrides.search) {
            params.search = overrides.search;
        }

        // Remove empty values
        Object.keys(params).forEach((key) => {
            if (!params[key]) delete params[key];
        });

        router.get(route('admin.performance.index'), params, {
            preserveState: true,
        });
    }

    function handleSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Enter') {
            applyFilters({ search: search || null });
        }
    }

    function handlePeriodChange(e: React.ChangeEvent<HTMLSelectElement>) {
        applyFilters({ period: e.target.value });
    }

    return (
        <AuthenticatedLayout>
            <Head title="Employee Performance" />

            <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Employee Performance
                    </h1>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Total Employees */}
                    <div className="rounded-xl bg-white p-5 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                                <svg
                                    className="h-6 w-6 text-emerald-600"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
                                    />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">
                                    Total Employees
                                </p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {kpis.total_employees}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Avg Completion Rate */}
                    <div className="rounded-xl bg-white p-5 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                                <svg
                                    className="h-6 w-6 text-blue-600"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                                    />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">
                                    Avg Completion Rate
                                </p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {kpis.avg_completion_rate}%
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Avg On-Time Rate */}
                    <div className="rounded-xl bg-white p-5 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                                <svg
                                    className="h-6 w-6 text-green-600"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                                    />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">
                                    Avg On-Time Rate
                                </p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {kpis.avg_on_time_rate}%
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Total Overdue */}
                    <div className="rounded-xl bg-white p-5 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                                <svg
                                    className="h-6 w-6 text-red-600"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                                    />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">
                                    Total Overdue
                                </p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {kpis.total_overdue}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filter Bar */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="flex-1">
                        <TextInput
                            type="text"
                            placeholder="Search employees..."
                            className="w-full sm:max-w-xs"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={handleSearchKeyDown}
                        />
                    </div>
                    <select
                        value={filters.period}
                        onChange={handlePeriodChange}
                        className="rounded-lg border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                        {periodOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Completion Rate Ranking */}
                    <div className="rounded-xl bg-white p-5 shadow-sm">
                        <h3 className="mb-4 text-base font-semibold text-gray-900">
                            Completion Rate Ranking
                        </h3>
                        {charts.completion_ranking.length > 0 ? (
                            <ResponsiveContainer width="100%" height={280}>
                                <BarChart
                                    data={charts.completion_ranking}
                                    layout="vertical"
                                    margin={{
                                        top: 0,
                                        right: 20,
                                        bottom: 0,
                                        left: 0,
                                    }}
                                >
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        horizontal={false}
                                    />
                                    <XAxis
                                        type="number"
                                        domain={[0, 100]}
                                        tickFormatter={(v) => `${v}%`}
                                        fontSize={12}
                                    />
                                    <YAxis
                                        type="category"
                                        dataKey="name"
                                        width={100}
                                        fontSize={12}
                                        tickLine={false}
                                    />
                                    <Tooltip
                                        formatter={(value: any) => [`${value}%`, 'Completion Rate']}
                                    />
                                    <Bar
                                        dataKey="value"
                                        radius={[0, 4, 4, 0]}
                                        barSize={18}
                                    >
                                        {charts.completion_ranking.map(
                                            (entry, index) => (
                                                <Cell
                                                    key={index}
                                                    fill={
                                                        entry.value >= 80
                                                            ? '#22c55e'
                                                            : entry.value >= 50
                                                              ? '#f59e0b'
                                                              : '#ef4444'
                                                    }
                                                />
                                            ),
                                        )}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex h-[280px] items-center justify-center text-sm text-gray-400">
                                No data available
                            </div>
                        )}
                    </div>

                    {/* Active Workload */}
                    <div className="rounded-xl bg-white p-5 shadow-sm">
                        <h3 className="mb-4 text-base font-semibold text-gray-900">
                            Active Workload
                        </h3>
                        {charts.workload_distribution.length > 0 ? (
                            <ResponsiveContainer width="100%" height={280}>
                                <BarChart
                                    data={charts.workload_distribution}
                                    margin={{
                                        top: 0,
                                        right: 20,
                                        bottom: 0,
                                        left: 0,
                                    }}
                                >
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        vertical={false}
                                    />
                                    <XAxis
                                        dataKey="name"
                                        fontSize={12}
                                        tickLine={false}
                                    />
                                    <YAxis fontSize={12} />
                                    <Tooltip
                                        formatter={(value: any) => [value, 'Active Tasks']}
                                    />
                                    <Bar
                                        dataKey="value"
                                        fill="#10b981"
                                        radius={[4, 4, 0, 0]}
                                        barSize={32}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex h-[280px] items-center justify-center text-sm text-gray-400">
                                No data available
                            </div>
                        )}
                    </div>
                </div>

                {/* Employee Table */}
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                        Employee
                                    </th>
                                    <th className="px-5 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                                        Total Tasks
                                    </th>
                                    <th className="px-5 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                                        Completed
                                    </th>
                                    <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                        Completion Rate
                                    </th>
                                    <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                        On-Time Rate
                                    </th>
                                    <th className="px-5 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                                        Overdue
                                    </th>
                                    <th className="px-5 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                                        Avg Days
                                    </th>
                                    <th className="px-5 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                                        Active
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {employees.length > 0 ? (
                                    employees.map((emp) => (
                                        <tr
                                            key={emp.id}
                                            className="cursor-pointer transition hover:bg-gray-50"
                                            onClick={() =>
                                                router.get(
                                                    route(
                                                        'admin.performance.show',
                                                        emp.id,
                                                    ),
                                                )
                                            }
                                        >
                                            <td className="whitespace-nowrap px-5 py-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {emp.name}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {emp.department}
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-5 py-4 text-center text-sm text-gray-700">
                                                {emp.total_tasks}
                                            </td>
                                            <td className="whitespace-nowrap px-5 py-4 text-center text-sm text-gray-700">
                                                {emp.completed}
                                            </td>
                                            <td className="whitespace-nowrap px-5 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-200">
                                                        <div
                                                            className={`h-2 rounded-full ${rateColor(emp.completion_rate)}`}
                                                            style={{
                                                                width: `${Math.min(emp.completion_rate, 100)}%`,
                                                            }}
                                                        />
                                                    </div>
                                                    <span className="text-xs font-medium text-gray-600">
                                                        {emp.completion_rate}%
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-5 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-200">
                                                        <div
                                                            className={`h-2 rounded-full ${rateColor(emp.on_time_rate)}`}
                                                            style={{
                                                                width: `${Math.min(emp.on_time_rate, 100)}%`,
                                                            }}
                                                        />
                                                    </div>
                                                    <span className="text-xs font-medium text-gray-600">
                                                        {emp.on_time_rate}%
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-5 py-4 text-center">
                                                {emp.overdue > 0 ? (
                                                    <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">
                                                        {emp.overdue}
                                                    </span>
                                                ) : (
                                                    <span className="text-sm text-gray-400">
                                                        0
                                                    </span>
                                                )}
                                            </td>
                                            <td className="whitespace-nowrap px-5 py-4 text-center text-sm text-gray-700">
                                                {emp.avg_days !== null
                                                    ? emp.avg_days
                                                    : '-'}
                                            </td>
                                            <td className="whitespace-nowrap px-5 py-4 text-center text-sm font-medium text-gray-700">
                                                {emp.active_tasks}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={8}
                                            className="px-5 py-16 text-center"
                                        >
                                            <div className="flex flex-col items-center gap-2">
                                                <svg
                                                    className="h-10 w-10 text-gray-300"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    strokeWidth={1.5}
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
                                                    />
                                                </svg>
                                                <p className="text-sm text-gray-500">
                                                    No employees found
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    Try adjusting your search
                                                    or filters
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
