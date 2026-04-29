import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useState } from 'react';

interface ServiceInfo {
    id: number;
    name: string;
    description: string | null;
    is_active: boolean;
    status: 'Active' | 'Inactive' | 'Proposed';
}

interface Kpis {
    total_tasks: number;
    completed_tasks: number;
    running_tasks: number;
    overdue_tasks: number;
    rate: number;
    project_count: number;
    running_project_count: number;
}

interface Person {
    id: number;
    name: string;
}

interface ProjectRow {
    customer_id: number;
    customer_name: string;
    start_date: string | null;
    end_date: string | null;
    days: number | null;
    total_tasks: number;
    completed: number;
    pending: number;
    in_progress: number;
    overdue: number;
    rate: number;
    is_running: boolean;
    employees: Person[];
    managers: Person[];
    assignment_status: 'Assigned' | 'To be Assigned';
}

interface Props extends PageProps {
    service: ServiceInfo;
    kpis: Kpis;
    running_projects: ProjectRow[];
    all_projects: ProjectRow[];
}

function rateColor(rate: number): string {
    if (rate >= 80) return 'bg-green-100 text-green-800';
    if (rate >= 50) return 'bg-amber-100 text-amber-800';
    return 'bg-red-100 text-red-800';
}

function statusBadge(status: ServiceInfo['status']) {
    if (status === 'Active') return 'bg-green-100 text-green-800';
    if (status === 'Proposed') return 'bg-purple-100 text-purple-800';
    return 'bg-gray-100 text-gray-600';
}

const tabs = ['Running Projects', 'All Projects'] as const;
type Tab = typeof tabs[number];

export default function ServiceShow({ service, kpis, running_projects, all_projects }: Props) {
    const [activeTab, setActiveTab] = useState<Tab>('Running Projects');
    const rows = activeTab === 'Running Projects' ? running_projects : all_projects;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-3">
                    <Link href={route('admin.reports.services')} className="text-gray-400 hover:text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                        </svg>
                    </Link>
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">{service.name}</h2>
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${statusBadge(service.status)}`}>
                        {service.status}
                    </span>
                </div>
            }
        >
            <Head title={`${service.name} — Service Report`} />

            <div className="py-6">
                <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">

                    {/* Service Info + KPIs */}
                    <div className="grid gap-6 lg:grid-cols-3">
                        <div className="rounded-lg bg-white p-5 shadow">
                            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">Service Info</h3>
                            <dl className="space-y-2 text-sm">
                                <InfoRow label="Name" value={service.name} />
                                <InfoRow label="Status" value={service.status} />
                                {service.description && (
                                    <div className="pt-2">
                                        <dt className="mb-1 text-gray-500">Description</dt>
                                        <dd className="text-gray-700">{service.description}</dd>
                                    </div>
                                )}
                            </dl>
                        </div>

                        <div className="col-span-1 grid grid-cols-2 gap-3 lg:col-span-2 lg:grid-cols-4">
                            <KpiCard label="Projects" value={kpis.project_count} sub={`${kpis.running_project_count} running`} />
                            <KpiCard label="Total Tasks" value={kpis.total_tasks} />
                            <KpiCard label="Completed" value={kpis.completed_tasks} sub={`${kpis.rate}% rate`} color="emerald" />
                            <KpiCard label="Running" value={kpis.running_tasks} color="blue" />
                            <KpiCard label="Overdue" value={kpis.overdue_tasks} color={kpis.overdue_tasks > 0 ? 'red' : 'gray'} />
                        </div>
                    </div>

                    {/* Projects table */}
                    <div className="overflow-hidden rounded-lg bg-white shadow">
                        <div className="border-b border-gray-200">
                            <nav className="-mb-px flex" aria-label="Tabs">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab}
                                        type="button"
                                        onClick={() => setActiveTab(tab)}
                                        className={`whitespace-nowrap border-b-2 px-6 py-3 text-sm font-medium transition-colors ${
                                            activeTab === tab
                                                ? 'border-emerald-600 text-emerald-600'
                                                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                        }`}
                                    >
                                        {tab}
                                        <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                                            {tab === 'Running Projects' ? running_projects.length : all_projects.length}
                                        </span>
                                    </button>
                                ))}
                            </nav>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">SN</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Customer Name</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Start</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">End</th>
                                        <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Days</th>
                                        <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Completion</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Employees</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Managers</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {rows.map((p, i) => (
                                        <tr key={p.customer_id} className="hover:bg-gray-50">
                                            <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{i + 1}</td>
                                            <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">
                                                <Link
                                                    href={route('admin.reports.customers.show', p.customer_id)}
                                                    className="text-emerald-600 hover:text-emerald-800 hover:underline"
                                                >
                                                    {p.customer_name}
                                                </Link>
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{p.start_date ?? '-'}</td>
                                            <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{p.end_date ?? '-'}</td>
                                            <td className="whitespace-nowrap px-4 py-3 text-center text-sm text-gray-500">{p.days ?? '-'}</td>
                                            <td className="whitespace-nowrap px-4 py-3 text-center text-sm">
                                                <div className="flex items-center justify-center gap-2">
                                                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${rateColor(p.rate)}`}>
                                                        {p.rate}%
                                                    </span>
                                                    <span className="text-xs text-gray-400">
                                                        ({p.completed}/{p.total_tasks})
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                {p.employees.length > 0 ? (
                                                    <div className="flex flex-wrap gap-1">
                                                        {p.employees.map((e) => (
                                                            <span key={e.id} className="inline-flex rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-blue-200">
                                                                {e.name}
                                                            </span>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                                                        To be Assigned
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                {p.managers.length > 0 ? (
                                                    <div className="flex flex-wrap gap-1">
                                                        {p.managers.map((m) => (
                                                            <span key={m.id} className="inline-flex rounded-full bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700 ring-1 ring-purple-200">
                                                                {m.name}
                                                            </span>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                                                        To be Assigned
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {rows.length === 0 && (
                                        <tr>
                                            <td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-400">
                                                {service.status === 'Proposed'
                                                    ? 'This service has no tasks yet — Proposed.'
                                                    : 'No projects to show.'}
                                            </td>
                                        </tr>
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
