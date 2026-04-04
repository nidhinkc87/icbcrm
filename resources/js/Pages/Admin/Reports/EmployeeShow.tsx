import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DownloadDropdown from '@/Components/DownloadDropdown';
import SelectInput from '@/Components/SelectInput';
import { Head, Link, router } from '@inertiajs/react';
import { PageProps } from '@/types';

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
        overdue: number;
    };
    priority_breakdown: { name: string; total: number; completed: number }[];
    service_performance: { name: string; total: number; completed: number }[];
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

const periodOptions = [
    { value: '30', label: 'Last 30 days' },
    { value: '90', label: 'Last 90 days' },
    { value: '180', label: 'Last 6 months' },
    { value: '365', label: 'Last year' },
    { value: 'all', label: 'All time' },
];

const priorityColors: Record<string, string> = {
    urgent: 'bg-red-100 text-red-800',
    high: 'bg-amber-100 text-amber-800',
    medium: 'bg-blue-100 text-blue-800',
    low: 'bg-gray-100 text-gray-800',
};

export default function EmployeeShow({ employee, kpis, priority_breakdown, service_performance, recent_tasks, collaboration, filters }: Props) {
    function buildParams() {
        return new URLSearchParams({ period: filters.period }).toString();
    }

    function downloadPdf() {
        window.open(`${route('admin.reports.employees.show.pdf', employee.id)}?${buildParams()}`, '_blank');
    }

    function downloadExcel() {
        window.open(`${route('admin.reports.employees.show.excel', employee.id)}?${buildParams()}`, '_blank');
    }

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Employee Report - {employee.name}</h2>}>
            <Head title={`Employee Report - ${employee.name}`} />

            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Header actions */}
                    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                        <Link
                            href={route('admin.reports.employees')}
                            className="text-sm text-emerald-600 hover:text-emerald-800 hover:underline"
                        >
                            &larr; Back to Employee Report
                        </Link>
                        <div className="flex items-center gap-3">
                            <SelectInput
                                value={filters.period}
                                className="w-44"
                                onChange={(e) => router.get(route('admin.reports.employees.show', employee.id), { period: e.target.value }, { preserveState: true })}
                            >
                                {periodOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </SelectInput>
                            <DownloadDropdown onPdf={downloadPdf} onExcel={downloadExcel} />
                        </div>
                    </div>

                    {/* Employee Info */}
                    <div className="mb-6 rounded-lg bg-white p-6 shadow">
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                            <div>
                                <p className="text-xs font-medium uppercase text-gray-400">Name</p>
                                <p className="mt-1 text-sm font-semibold text-gray-900">{employee.name}</p>
                            </div>
                            <div>
                                <p className="text-xs font-medium uppercase text-gray-400">Email</p>
                                <p className="mt-1 text-sm text-gray-700">{employee.email}</p>
                            </div>
                            <div>
                                <p className="text-xs font-medium uppercase text-gray-400">Department</p>
                                <p className="mt-1 text-sm text-gray-700">{employee.department}</p>
                            </div>
                            <div>
                                <p className="text-xs font-medium uppercase text-gray-400">Designation</p>
                                <p className="mt-1 text-sm text-gray-700">{employee.designation}</p>
                            </div>
                            <div>
                                <p className="text-xs font-medium uppercase text-gray-400">Date of Joining</p>
                                <p className="mt-1 text-sm text-gray-700">{employee.date_of_joining ?? '-'}</p>
                            </div>
                        </div>
                    </div>

                    {/* KPIs */}
                    <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                        {[
                            { label: 'Total Tasks', value: kpis.total_tasks, color: 'text-gray-900' },
                            { label: 'Completed', value: kpis.completed, color: 'text-emerald-700' },
                            { label: 'On-Time Rate', value: `${kpis.on_time_rate}%`, color: kpis.on_time_rate >= 80 ? 'text-emerald-700' : kpis.on_time_rate >= 50 ? 'text-amber-600' : 'text-red-600' },
                            { label: 'Avg Days', value: kpis.avg_days, color: 'text-gray-900' },
                            { label: 'Overdue', value: kpis.overdue, color: kpis.overdue > 0 ? 'text-red-600' : 'text-gray-900' },
                        ].map((kpi) => (
                            <div key={kpi.label} className="rounded-lg bg-white p-4 shadow">
                                <p className="text-xs font-medium uppercase text-gray-400">{kpi.label}</p>
                                <p className={`mt-1 text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                        {/* Priority Breakdown */}
                        <div className="rounded-lg bg-white p-6 shadow">
                            <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">Task Breakdown by Priority</h3>
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="pb-2 text-left text-xs font-medium text-gray-500">Priority</th>
                                        <th className="pb-2 text-center text-xs font-medium text-gray-500">Total</th>
                                        <th className="pb-2 text-center text-xs font-medium text-gray-500">Completed</th>
                                        <th className="pb-2 text-center text-xs font-medium text-gray-500">Rate</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {priority_breakdown.map((row) => (
                                        <tr key={row.name} className="border-b last:border-0">
                                            <td className="py-2 text-sm font-medium text-gray-700">{row.name}</td>
                                            <td className="py-2 text-center text-sm text-gray-600">{row.total}</td>
                                            <td className="py-2 text-center text-sm text-gray-600">{row.completed}</td>
                                            <td className="py-2 text-center text-sm text-gray-600">
                                                {row.total > 0 ? Math.round((row.completed / row.total) * 100) : 0}%
                                            </td>
                                        </tr>
                                    ))}
                                    {priority_breakdown.length === 0 && (
                                        <tr><td colSpan={4} className="py-4 text-center text-sm text-gray-400">No tasks found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Service Performance */}
                        <div className="rounded-lg bg-white p-6 shadow">
                            <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">Service Performance</h3>
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="pb-2 text-left text-xs font-medium text-gray-500">Service</th>
                                        <th className="pb-2 text-center text-xs font-medium text-gray-500">Total</th>
                                        <th className="pb-2 text-center text-xs font-medium text-gray-500">Completed</th>
                                        <th className="pb-2 text-center text-xs font-medium text-gray-500">Rate</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {service_performance.map((row) => (
                                        <tr key={row.name} className="border-b last:border-0">
                                            <td className="py-2 text-sm font-medium text-gray-700">{row.name}</td>
                                            <td className="py-2 text-center text-sm text-gray-600">{row.total}</td>
                                            <td className="py-2 text-center text-sm text-gray-600">{row.completed}</td>
                                            <td className="py-2 text-center text-sm text-gray-600">
                                                {row.total > 0 ? Math.round((row.completed / row.total) * 100) : 0}%
                                            </td>
                                        </tr>
                                    ))}
                                    {service_performance.length === 0 && (
                                        <tr><td colSpan={4} className="py-4 text-center text-sm text-gray-400">No tasks found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Collaboration Stats */}
                    <div className="mb-6 grid grid-cols-3 gap-4">
                        {[
                            { label: 'Tasks Collaborated', value: collaboration.tasks_collaborated },
                            { label: 'Comments Posted', value: collaboration.comments_posted },
                            { label: 'Attachments Uploaded', value: collaboration.attachments_uploaded },
                        ].map((stat) => (
                            <div key={stat.label} className="rounded-lg bg-white p-4 text-center shadow">
                                <p className="text-xs font-medium uppercase text-gray-400">{stat.label}</p>
                                <p className="mt-1 text-xl font-bold text-gray-900">{stat.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Recent Tasks */}
                    <div className="overflow-hidden rounded-lg bg-white shadow">
                        <div className="border-b px-6 py-4">
                            <h3 className="text-sm font-semibold uppercase text-gray-500">Recent Completed Tasks</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Service</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Customer</th>
                                        <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Priority</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Due Date</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Completed</th>
                                        <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Days</th>
                                        <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {recent_tasks.map((t) => (
                                        <tr key={t.id} className="hover:bg-gray-50">
                                            <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">{t.service_name}</td>
                                            <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">{t.customer_name}</td>
                                            <td className="whitespace-nowrap px-4 py-3 text-center text-sm">
                                                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${priorityColors[t.priority] ?? 'bg-gray-100 text-gray-800'}`}>
                                                    {t.priority.charAt(0).toUpperCase() + t.priority.slice(1)}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{t.due_date}</td>
                                            <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{t.completed_at}</td>
                                            <td className="whitespace-nowrap px-4 py-3 text-center text-sm text-gray-500">{t.days_taken}</td>
                                            <td className="whitespace-nowrap px-4 py-3 text-center text-sm">
                                                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${t.on_time ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {t.on_time ? 'On Time' : 'Late'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {recent_tasks.length === 0 && (
                                        <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-400">No completed tasks found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
