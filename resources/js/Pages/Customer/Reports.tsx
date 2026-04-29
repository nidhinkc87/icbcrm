import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/types';

interface Kpis {
    total_tasks: number;
    completed_tasks: number;
    completion_rate: number;
    total_documents: number;
    expired_docs: number;
    expiring_docs: number;
}

interface ServiceUsage {
    service_id: number;
    service_name: string;
    total: number;
    completed: number;
    rate: number;
}

interface MonthPoint {
    month: string;
    count: number;
}

interface RecentActivity {
    id: number;
    service_name: string;
    status: string;
    timestamp: string;
}

interface Props extends PageProps {
    kpis: Kpis;
    service_usage: ServiceUsage[];
    completion_trend: MonthPoint[];
    recent_activity: RecentActivity[];
}

const statusColors: Record<string, string> = {
    completed: 'bg-green-100 text-green-800',
    in_progress: 'bg-blue-100 text-blue-800',
    pending: 'bg-amber-100 text-amber-800',
};

function rateColor(rate: number): string {
    if (rate >= 80) return 'bg-green-100 text-green-800';
    if (rate >= 50) return 'bg-amber-100 text-amber-800';
    return 'bg-red-100 text-red-800';
}

export default function CustomerReports({ kpis, service_usage, completion_trend, recent_activity }: Props) {
    const maxTrend = Math.max(1, ...completion_trend.map((p) => p.count));

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Reports</h2>}>
            <Head title="Reports" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
                    <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
                        <KpiCard label="Total Tasks" value={kpis.total_tasks} sub={`${kpis.completion_rate}% completion`} color="emerald" />
                        <KpiCard label="Completed" value={kpis.completed_tasks} color="emerald" />
                        <KpiCard label="Documents" value={kpis.total_documents} sub={`${kpis.expired_docs} expired · ${kpis.expiring_docs} expiring`} color={kpis.expired_docs > 0 ? 'red' : 'gray'} />
                    </div>

                    <div className="grid gap-6 lg:grid-cols-2">
                        {/* Service usage */}
                        <div className="overflow-hidden rounded-lg bg-white shadow">
                            <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
                                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-600">Services Used</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Service</th>
                                            <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Total</th>
                                            <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Done</th>
                                            <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Rate</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {service_usage.map((s) => (
                                            <tr key={s.service_id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-sm font-medium text-gray-900">{s.service_name}</td>
                                                <td className="whitespace-nowrap px-4 py-3 text-center text-sm text-gray-700">{s.total}</td>
                                                <td className="whitespace-nowrap px-4 py-3 text-center text-sm text-gray-700">{s.completed}</td>
                                                <td className="whitespace-nowrap px-4 py-3 text-center text-sm">
                                                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${rateColor(s.rate)}`}>{s.rate}%</span>
                                                </td>
                                            </tr>
                                        ))}
                                        {service_usage.length === 0 && (
                                            <tr><td colSpan={4} className="px-4 py-6 text-center text-sm text-gray-400">No services used yet.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Completion trend */}
                        <div className="overflow-hidden rounded-lg bg-white shadow">
                            <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
                                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-600">Completed Tasks (last 6 months)</h3>
                            </div>
                            <div className="p-6">
                                <div className="flex h-48 items-end gap-3">
                                    {completion_trend.map((p) => (
                                        <div key={p.month} className="flex flex-1 flex-col items-center justify-end">
                                            <div
                                                className="w-full rounded-t bg-emerald-500"
                                                style={{ height: `${(p.count / maxTrend) * 100}%`, minHeight: p.count > 0 ? '4px' : '0' }}
                                                title={`${p.count} tasks`}
                                            />
                                            <span className="mt-2 text-xs text-gray-500">{p.month}</span>
                                            <span className="text-xs font-semibold text-gray-700">{p.count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent activity */}
                    <div className="overflow-hidden rounded-lg bg-white shadow">
                        <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-600">Recent Activity</h3>
                        </div>
                        <ul className="divide-y divide-gray-100">
                            {recent_activity.map((a) => (
                                <li key={a.id} className="flex items-center gap-3 px-4 py-3 text-sm">
                                    <Link href={route('tasks.show', a.id)} className="text-emerald-600 hover:underline">#{a.id}</Link>
                                    <span className="flex-1 text-gray-700">{a.service_name}</span>
                                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${statusColors[a.status] ?? 'bg-gray-100 text-gray-600'}`}>
                                        {a.status.replace('_', ' ')}
                                    </span>
                                    <span className="text-xs text-gray-400">{a.timestamp}</span>
                                </li>
                            ))}
                            {recent_activity.length === 0 && (
                                <li className="px-4 py-6 text-center text-sm text-gray-400">No recent activity.</li>
                            )}
                        </ul>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function KpiCard({ label, value, sub, color = 'gray' }: { label: string; value: number | string; sub?: string; color?: string }) {
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
            {sub && <p className="mt-0.5 text-xs opacity-60">{sub}</p>}
        </div>
    );
}
