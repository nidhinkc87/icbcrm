import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useState } from 'react';

interface CustomerInfo {
    id: number;
    name: string;
    email: string;
    phone: string;
    emirate: string;
    legal_type: string;
    trade_license_no: string;
}

interface Kpis {
    total_tasks: number;
    completed: number;
    pending: number;
    in_progress: number;
    overdue: number;
    rate: number;
    renewals: number;
    expired_docs: number;
}

interface PersonRow {
    id: number;
    name: string;
    role: string;
    department: string;
    designation: string;
}

interface TaskRow {
    id: number;
    status: string;
    priority: string;
    due_date: string | null;
    responsible_name: string;
    is_overdue: boolean;
}

interface ServiceGroup {
    service_id: number;
    service_name: string;
    is_active: boolean;
    total: number;
    completed: number;
    pending: number;
    in_progress: number;
    overdue: number;
    rate: number;
    assigned_to: PersonRow[];
    tasks: TaskRow[];
}

interface PartnerRow {
    id: number;
    name: string;
    total_docs: number;
    renewals: number;
}

interface PeopleRow {
    id: number;
    name: string;
    role: string;
    department: string;
    designation: string;
    tasks_count: number;
    completed_count: number;
}

interface Props extends PageProps {
    customer: CustomerInfo;
    kpis: Kpis;
    services: ServiceGroup[];
    partners: PartnerRow[];
    people: PeopleRow[];
}

function rateColor(rate: number): string {
    if (rate >= 80) return 'bg-green-100 text-green-800';
    if (rate >= 50) return 'bg-amber-100 text-amber-800';
    return 'bg-red-100 text-red-800';
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

export default function CustomerShow({ customer, kpis, services, partners, people }: Props) {
    const [expandedService, setExpandedService] = useState<number | null>(null);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-3">
                    <Link href={route('admin.reports.dashboard')} className="text-gray-400 hover:text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                        </svg>
                    </Link>
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">{customer.name}</h2>
                </div>
            }
        >
            <Head title={`${customer.name} — Report`} />

            <div className="py-6">
                <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">

                    {/* Customer Info + KPIs */}
                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Info card */}
                        <div className="rounded-lg bg-white p-5 shadow">
                            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">Customer Info</h3>
                            <dl className="space-y-2 text-sm">
                                <InfoRow label="Email" value={customer.email} />
                                <InfoRow label="Phone" value={customer.phone} />
                                <InfoRow label="Emirate" value={customer.emirate} />
                                <InfoRow label="Legal Type" value={customer.legal_type} />
                                <InfoRow label="Trade License" value={customer.trade_license_no} />
                            </dl>
                        </div>

                        {/* KPIs */}
                        <div className="col-span-1 grid grid-cols-2 gap-3 lg:col-span-2 lg:grid-cols-4">
                            <KpiCard label="Total Tasks" value={kpis.total_tasks} />
                            <KpiCard label="Completed" value={kpis.completed} sub={`${kpis.rate}% rate`} color="emerald" />
                            <KpiCard label="In Progress" value={kpis.in_progress} color="blue" />
                            <KpiCard label="Pending" value={kpis.pending} color="amber" />
                            <KpiCard label="Overdue" value={kpis.overdue} color="red" />
                            <KpiCard label="Renewals Due" value={kpis.renewals} sub={`${kpis.expired_docs} expired`} color={kpis.renewals > 0 ? 'red' : 'emerald'} />
                        </div>
                    </div>

                    {/* Services */}
                    <div className="overflow-hidden rounded-lg bg-white shadow">
                        <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-600">Services</h3>
                        </div>
                        <div className="divide-y divide-gray-200">
                            {services.map((svc) => (
                                <div key={svc.service_id}>
                                    {/* Service header row */}
                                    <button
                                        type="button"
                                        onClick={() => setExpandedService(expandedService === svc.service_id ? null : svc.service_id)}
                                        className="flex w-full items-center gap-4 px-4 py-3 text-left hover:bg-gray-50"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
                                            className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${expandedService === svc.service_id ? 'rotate-90' : ''}`}
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                        </svg>
                                        <span className="min-w-0 flex-1 text-sm font-medium text-gray-900">{svc.service_name}</span>
                                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${svc.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                                            {svc.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                        <div className="flex items-center gap-3 text-xs text-gray-500">
                                            <span>{svc.total} tasks</span>
                                            <span className={`inline-flex rounded-full px-2 py-0.5 font-semibold ${rateColor(svc.rate)}`}>{svc.rate}%</span>
                                            {svc.overdue > 0 && (
                                                <span className="inline-flex rounded-full bg-red-100 px-2 py-0.5 font-semibold text-red-800">{svc.overdue} overdue</span>
                                            )}
                                        </div>
                                    </button>

                                    {/* Expanded: assigned people + tasks */}
                                    {expandedService === svc.service_id && (
                                        <div className="border-t border-gray-100 bg-gray-50 px-4 py-4">
                                            {/* Assigned people */}
                                            {svc.assigned_to.length > 0 && (
                                                <div className="mb-4">
                                                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Assigned To</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {svc.assigned_to.map((p) => (
                                                            <span key={p.id} className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-700 shadow-sm ring-1 ring-gray-200">
                                                                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-700">
                                                                    {p.name.charAt(0)}
                                                                </span>
                                                                {p.name}
                                                                <span className="text-gray-400">({p.role})</span>
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Status summary */}
                                            <div className="mb-3 flex gap-4 text-xs">
                                                <span className="rounded bg-green-50 px-2 py-1 text-green-700">{svc.completed} completed</span>
                                                <span className="rounded bg-blue-50 px-2 py-1 text-blue-700">{svc.in_progress} in progress</span>
                                                <span className="rounded bg-amber-50 px-2 py-1 text-amber-700">{svc.pending} pending</span>
                                            </div>

                                            {/* Task list */}
                                            <table className="min-w-full divide-y divide-gray-200 rounded bg-white">
                                                <thead>
                                                    <tr>
                                                        <th className="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500">Task</th>
                                                        <th className="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500">Responsible</th>
                                                        <th className="px-3 py-2 text-center text-xs font-medium uppercase text-gray-500">Priority</th>
                                                        <th className="px-3 py-2 text-center text-xs font-medium uppercase text-gray-500">Status</th>
                                                        <th className="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500">Due Date</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100">
                                                    {svc.tasks.map((t) => (
                                                        <tr key={t.id} className="hover:bg-gray-50">
                                                            <td className="px-3 py-2 text-sm">
                                                                <Link href={route('tasks.show', t.id)} className="text-emerald-600 hover:underline">#{t.id}</Link>
                                                            </td>
                                                            <td className="px-3 py-2 text-sm text-gray-600">{t.responsible_name}</td>
                                                            <td className="px-3 py-2 text-center text-sm">
                                                                <span className={`font-medium ${priorityColors[t.priority] ?? 'text-gray-500'}`}>
                                                                    {t.priority.charAt(0).toUpperCase() + t.priority.slice(1)}
                                                                </span>
                                                            </td>
                                                            <td className="px-3 py-2 text-center text-sm">
                                                                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${statusColors[t.status] ?? 'bg-gray-100 text-gray-600'}`}>
                                                                    {t.status.replace('_', ' ')}
                                                                </span>
                                                            </td>
                                                            <td className="px-3 py-2 text-sm">
                                                                <span className={t.is_overdue ? 'font-medium text-red-600' : 'text-gray-500'}>
                                                                    {t.due_date ?? '-'}
                                                                    {t.is_overdue && ' (overdue)'}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            ))}
                            {services.length === 0 && (
                                <p className="px-4 py-8 text-center text-sm text-gray-400">No services found for this customer.</p>
                            )}
                        </div>
                    </div>

                    {/* People + Partners side by side */}
                    <div className="grid gap-6 lg:grid-cols-2">
                        {/* People (Employees & Managers) */}
                        <div className="overflow-hidden rounded-lg bg-white shadow">
                            <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
                                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-600">Employees & Managers</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Name</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Role</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Department</th>
                                            <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Tasks</th>
                                            <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Done</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {people.map((p) => (
                                            <tr key={p.id} className="hover:bg-gray-50">
                                                <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">{p.name}</td>
                                                <td className="whitespace-nowrap px-4 py-3 text-sm">
                                                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                                                        p.role === 'manager' ? 'bg-purple-100 text-purple-800'
                                                        : p.role === 'admin' ? 'bg-indigo-100 text-indigo-800'
                                                        : 'bg-blue-100 text-blue-800'
                                                    }`}>
                                                        {p.role}
                                                    </span>
                                                </td>
                                                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{p.department}</td>
                                                <td className="whitespace-nowrap px-4 py-3 text-center text-sm text-gray-500">{p.tasks_count}</td>
                                                <td className="whitespace-nowrap px-4 py-3 text-center text-sm text-gray-500">{p.completed_count}</td>
                                            </tr>
                                        ))}
                                        {people.length === 0 && (
                                            <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-400">No assigned people.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Partners */}
                        <div className="overflow-hidden rounded-lg bg-white shadow">
                            <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
                                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-600">Partners</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Partner</th>
                                            <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Documents</th>
                                            <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Renewals</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {partners.map((p) => (
                                            <tr key={p.id} className="hover:bg-gray-50">
                                                <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">{p.name}</td>
                                                <td className="whitespace-nowrap px-4 py-3 text-center text-sm text-gray-500">{p.total_docs}</td>
                                                <td className="whitespace-nowrap px-4 py-3 text-center text-sm">
                                                    {p.renewals > 0 ? (
                                                        <span className="inline-flex rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-800">{p.renewals}</span>
                                                    ) : <span className="text-gray-400">0</span>}
                                                </td>
                                            </tr>
                                        ))}
                                        {partners.length === 0 && (
                                            <tr><td colSpan={3} className="px-4 py-8 text-center text-sm text-gray-400">No partners.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

/* ── Sub-components ── */

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between">
            <dt className="text-gray-500">{label}</dt>
            <dd className="font-medium text-gray-900">{value}</dd>
        </div>
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
