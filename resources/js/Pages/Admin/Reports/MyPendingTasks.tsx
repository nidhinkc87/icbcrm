import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import TextInput from '@/Components/TextInput';
import SelectInput from '@/Components/SelectInput';
import { Head, Link, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useState } from 'react';

interface TaskRow {
    id: number;
    service_name: string;
    customer_name: string;
    priority: string;
    status: string;
    due_date: string | null;
    days_remaining: number | null;
    is_overdue: boolean;
}

interface Props extends PageProps {
    tasks: TaskRow[];
    filters: { search: string | null; priority: string | null };
}

const priorityColors: Record<string, string> = {
    urgent: 'bg-red-100 text-red-800',
    high: 'bg-orange-100 text-orange-800',
    medium: 'bg-amber-100 text-amber-800',
    low: 'bg-gray-100 text-gray-700',
};

const statusColors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-800',
    in_progress: 'bg-blue-100 text-blue-800',
};

export default function MyPendingTasks({ tasks, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');

    function applyFilters(overrides: Record<string, string | null> = {}) {
        const params: Record<string, string> = {};
        const merged = { search, priority: filters.priority, ...overrides };
        Object.entries(merged).forEach(([k, v]) => {
            if (v) params[k] = v;
        });
        router.get(route('admin.reports.my-pending-tasks'), params, { preserveState: true, preserveScroll: true });
    }

    const overdueCount = tasks.filter(t => t.is_overdue).length;
    const urgentCount = tasks.filter(t => t.priority === 'urgent').length;
    const inProgressCount = tasks.filter(t => t.status === 'in_progress').length;

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">My Pending Tasks</h2>}>
            <Head title="My Pending Tasks" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Summary */}
                    <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <SummaryCard label="Pending" value={tasks.length} />
                        <SummaryCard label="In Progress" value={inProgressCount} color="blue" />
                        <SummaryCard label="Urgent" value={urgentCount} color={urgentCount > 0 ? 'red' : 'gray'} />
                        <SummaryCard label="Overdue" value={overdueCount} color={overdueCount > 0 ? 'red' : 'gray'} />
                    </div>

                    {/* Filters */}
                    <div className="mb-6 flex flex-wrap items-end gap-4 rounded-lg bg-white p-4 shadow">
                        <div className="min-w-[200px] flex-1">
                            <label className="mb-1 block text-xs font-medium text-gray-600">Search</label>
                            <TextInput
                                value={search}
                                className="block w-full"
                                placeholder="Service, customer, or instructions..."
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && applyFilters({ search })}
                            />
                        </div>
                        <div className="w-40">
                            <label className="mb-1 block text-xs font-medium text-gray-600">Priority</label>
                            <SelectInput
                                value={filters.priority ?? ''}
                                className="block w-full"
                                onChange={(e) => applyFilters({ priority: e.target.value || null })}
                            >
                                <option value="">All</option>
                                <option value="urgent">Urgent</option>
                                <option value="high">High</option>
                                <option value="medium">Medium</option>
                                <option value="low">Low</option>
                            </SelectInput>
                        </div>
                        <div>
                            <button
                                onClick={() => applyFilters({ search })}
                                className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                            >
                                Filter
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-hidden rounded-lg bg-white shadow">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">#</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Task</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Service</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Customer</th>
                                        <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Priority</th>
                                        <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Due Date</th>
                                        <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Days Left</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {tasks.map((t, i) => (
                                        <tr key={t.id} className={`hover:bg-gray-50 ${t.is_overdue ? 'bg-red-50/40' : ''}`}>
                                            <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{i + 1}</td>
                                            <td className="whitespace-nowrap px-4 py-3 text-sm font-medium">
                                                <Link href={route('tasks.show', t.id)} className="text-emerald-600 hover:underline">
                                                    #{t.id}
                                                </Link>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-700">{t.service_name}</td>
                                            <td className="px-4 py-3 text-sm text-gray-700">{t.customer_name}</td>
                                            <td className="whitespace-nowrap px-4 py-3 text-center text-sm">
                                                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${priorityColors[t.priority] ?? 'bg-gray-100 text-gray-600'}`}>
                                                    {t.priority}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 text-center text-sm">
                                                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${statusColors[t.status] ?? 'bg-gray-100 text-gray-600'}`}>
                                                    {t.status.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 text-sm">
                                                <span className={t.is_overdue ? 'font-semibold text-red-600' : 'text-gray-700'}>
                                                    {t.due_date ?? '-'}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 text-center text-sm">
                                                {t.days_remaining === null ? (
                                                    <span className="text-gray-400">-</span>
                                                ) : t.is_overdue ? (
                                                    <span className="inline-flex rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-800">
                                                        {Math.abs(t.days_remaining)}d overdue
                                                    </span>
                                                ) : t.days_remaining === 0 ? (
                                                    <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">Today</span>
                                                ) : (
                                                    <span className="text-gray-700">{t.days_remaining}d</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {tasks.length === 0 && (
                                        <tr><td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-400">No pending tasks. </td></tr>
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

function SummaryCard({ label, value, color = 'gray' }: { label: string; value: number; color?: string }) {
    const colorMap: Record<string, string> = {
        emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700',
        blue: 'border-blue-200 bg-blue-50 text-blue-700',
        amber: 'border-amber-200 bg-amber-50 text-amber-700',
        red: 'border-red-200 bg-red-50 text-red-700',
        gray: 'border-gray-200 bg-gray-50 text-gray-700',
    };
    return (
        <div className={`rounded-lg border p-4 ${colorMap[color] ?? colorMap.gray}`}>
            <p className="text-xs font-medium uppercase tracking-wider opacity-75">{label}</p>
            <p className="mt-1 text-2xl font-bold">{value}</p>
        </div>
    );
}
