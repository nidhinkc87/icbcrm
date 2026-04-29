import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useState } from 'react';

interface TaskRow {
    id: number;
    status: string;
    priority: string;
    due_date: string | null;
    responsible_name: string;
    is_overdue: boolean;
    created_at: string;
}

interface ServiceGroup {
    service_id: number;
    service_name: string;
    total: number;
    completed: number;
    pending: number;
    in_progress: number;
    overdue: number;
    rate: number;
    tasks: TaskRow[];
}

interface Kpis {
    total_tasks: number;
    completed: number;
    in_progress: number;
    pending: number;
    overdue: number;
}

interface Props extends PageProps {
    kpis: Kpis;
    service_groups: ServiceGroup[];
}

const statusColors: Record<string, string> = {
    completed: 'bg-green-100 text-green-800',
    in_progress: 'bg-blue-100 text-blue-800',
    pending: 'bg-amber-100 text-amber-800',
};

const priorityColors: Record<string, string> = {
    urgent: 'text-red-600',
    high: 'text-orange-600',
    medium: 'text-amber-600',
    low: 'text-gray-500',
};

function rateColor(rate: number): string {
    if (rate >= 80) return 'bg-green-100 text-green-800';
    if (rate >= 50) return 'bg-amber-100 text-amber-800';
    return 'bg-red-100 text-red-800';
}

export default function Progress({ kpis, service_groups }: Props) {
    const [expanded, setExpanded] = useState<number | null>(service_groups[0]?.service_id ?? null);

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Track Progress</h2>}>
            <Head title="Track Progress" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
                    <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
                        <KpiCard label="Total Tasks" value={kpis.total_tasks} />
                        <KpiCard label="Completed" value={kpis.completed} color="emerald" />
                        <KpiCard label="In Progress" value={kpis.in_progress} color="blue" />
                        <KpiCard label="Pending" value={kpis.pending} color="amber" />
                        <KpiCard label="Overdue" value={kpis.overdue} color={kpis.overdue > 0 ? 'red' : 'gray'} />
                    </div>

                    <div className="overflow-hidden rounded-lg bg-white shadow">
                        <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-600">Services</h3>
                        </div>
                        <div className="divide-y divide-gray-200">
                            {service_groups.map((g) => (
                                <div key={g.service_id}>
                                    <button
                                        type="button"
                                        onClick={() => setExpanded(expanded === g.service_id ? null : g.service_id)}
                                        className="flex w-full items-center gap-4 px-4 py-3 text-left hover:bg-gray-50"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
                                            className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${expanded === g.service_id ? 'rotate-90' : ''}`}
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                        </svg>
                                        <span className="min-w-0 flex-1 text-sm font-medium text-gray-900">{g.service_name}</span>
                                        <div className="flex items-center gap-3 text-xs text-gray-500">
                                            <span>{g.total} tasks</span>
                                            <span className={`inline-flex rounded-full px-2 py-0.5 font-semibold ${rateColor(g.rate)}`}>{g.rate}%</span>
                                            {g.overdue > 0 && (
                                                <span className="inline-flex rounded-full bg-red-100 px-2 py-0.5 font-semibold text-red-800">{g.overdue} overdue</span>
                                            )}
                                        </div>
                                    </button>

                                    {expanded === g.service_id && (
                                        <div className="border-t border-gray-100 bg-gray-50 px-4 py-4">
                                            <div className="mb-3 flex flex-wrap gap-3 text-xs">
                                                <span className="rounded bg-green-50 px-2 py-1 text-green-700">{g.completed} completed</span>
                                                <span className="rounded bg-blue-50 px-2 py-1 text-blue-700">{g.in_progress} in progress</span>
                                                <span className="rounded bg-amber-50 px-2 py-1 text-amber-700">{g.pending} pending</span>
                                            </div>

                                            <div className="overflow-x-auto rounded bg-white">
                                                <table className="min-w-full divide-y divide-gray-200">
                                                    <thead>
                                                        <tr>
                                                            <th className="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500">Task</th>
                                                            <th className="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500">Started</th>
                                                            <th className="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500">Assigned To</th>
                                                            <th className="px-3 py-2 text-center text-xs font-medium uppercase text-gray-500">Priority</th>
                                                            <th className="px-3 py-2 text-center text-xs font-medium uppercase text-gray-500">Status</th>
                                                            <th className="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500">Due</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-100">
                                                        {g.tasks.map((t) => (
                                                            <tr key={t.id} className={`hover:bg-gray-50 ${t.is_overdue ? 'bg-red-50/40' : ''}`}>
                                                                <td className="px-3 py-2 text-sm">
                                                                    <Link href={route('tasks.show', t.id)} className="text-emerald-600 hover:underline">#{t.id}</Link>
                                                                </td>
                                                                <td className="px-3 py-2 text-sm text-gray-500">{t.created_at}</td>
                                                                <td className="px-3 py-2 text-sm text-gray-700">{t.responsible_name}</td>
                                                                <td className="px-3 py-2 text-center text-sm">
                                                                    <span className={`font-medium ${priorityColors[t.priority] ?? 'text-gray-500'}`}>
                                                                        {t.priority}
                                                                    </span>
                                                                </td>
                                                                <td className="px-3 py-2 text-center text-sm">
                                                                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${statusColors[t.status] ?? 'bg-gray-100 text-gray-600'}`}>
                                                                        {t.status.replace('_', ' ')}
                                                                    </span>
                                                                </td>
                                                                <td className="px-3 py-2 text-sm">
                                                                    <span className={t.is_overdue ? 'font-medium text-red-600' : 'text-gray-700'}>
                                                                        {t.due_date ?? '-'}
                                                                        {t.is_overdue && ' (overdue)'}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                            {service_groups.length === 0 && (
                                <p className="px-4 py-10 text-center text-sm text-gray-400">No services yet. Browse services and request one to get started.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function KpiCard({ label, value, color = 'gray' }: { label: string; value: number; color?: string }) {
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
