import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useState } from 'react';

interface Kpis {
    total_tasks: number;
    completed_tasks: number;
    pending_tasks: number;
    in_progress_tasks: number;
    overdue_tasks: number;
    completion_rate: number;
    total_customers: number;
    total_employees: number;
    total_managers: number;
    total_services: number;
    active_services: number;
    total_renewals: number;
    expired_docs: number;
}

interface ServiceRow {
    id: number;
    name: string;
    total_tasks: number;
    completed: number;
    rate: number;
    is_active: boolean;
}

interface CustomerRow {
    id: number;
    name: string;
    total_tasks: number;
    completed: number;
    rate: number;
    renewals: number;
    is_active: boolean;
}

interface PartnerRow {
    id: number;
    name: string;
    customer_name: string;
    renewals: number;
    total_docs: number;
}

interface ManagerRow {
    id: number;
    name: string;
    department: string;
    total_tasks: number;
    completed: number;
    rate: number;
    active_tasks: number;
    overdue: number;
}

interface EmployeeRow {
    id: number;
    name: string;
    department: string;
    designation: string;
    total_tasks: number;
    completed: number;
    rate: number;
    active_tasks: number;
    overdue: number;
}

interface Props extends PageProps {
    kpis: Kpis;
    services: ServiceRow[];
    customers: CustomerRow[];
    partners: PartnerRow[];
    managers: ManagerRow[];
    employees: EmployeeRow[];
}

function rateColor(rate: number): string {
    if (rate >= 80) return 'bg-green-100 text-green-800';
    if (rate >= 50) return 'bg-amber-100 text-amber-800';
    return 'bg-red-100 text-red-800';
}

function KpiCard({ label, value, sub, color = 'emerald' }: { label: string; value: number | string; sub?: string; color?: string }) {
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

const tabs = ['Services', 'Customers', 'Partners', 'Managers', 'Employees'] as const;
type Tab = typeof tabs[number];

export default function Dashboard({ kpis, services, customers, partners, managers, employees }: Props) {
    const [activeTab, setActiveTab] = useState<Tab>('Services');

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Report Dashboard</h2>}>
            <Head title="Report Dashboard" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">

                    {/* KPI Cards */}
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                        <KpiCard label="Total Tasks" value={kpis.total_tasks} />
                        <KpiCard label="Completed" value={kpis.completed_tasks} sub={`${kpis.completion_rate}% rate`} color="emerald" />
                        <KpiCard label="In Progress" value={kpis.in_progress_tasks} color="blue" />
                        <KpiCard label="Pending" value={kpis.pending_tasks} color="amber" />
                        <KpiCard label="Overdue" value={kpis.overdue_tasks} color="red" />
                        <KpiCard label="Services" value={`${kpis.active_services}/${kpis.total_services}`} sub="Active / Total" />
                        <KpiCard label="Customers" value={kpis.total_customers} />
                        <KpiCard label="Employees" value={kpis.total_employees} />
                        <KpiCard label="Managers" value={kpis.total_managers} />
                        <KpiCard label="Renewals Due" value={kpis.total_renewals} sub={`${kpis.expired_docs} expired`} color={kpis.total_renewals > 0 ? 'red' : 'emerald'} />
                    </div>

                    {/* Tabbed Tables */}
                    <div className="overflow-hidden rounded-lg bg-white shadow">
                        {/* Tab buttons */}
                        <div className="border-b border-gray-200">
                            <nav className="-mb-px flex overflow-x-auto" aria-label="Tabs">
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
                                    </button>
                                ))}
                            </nav>
                        </div>

                        {/* Tab content */}
                        <div className="overflow-x-auto">
                            {activeTab === 'Services' && (
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <Th>Service</Th>
                                            <Th center>Total Tasks</Th>
                                            <Th center>Completed</Th>
                                            <Th center>Rate</Th>
                                            <Th center>Status</Th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {services.map((s) => (
                                            <tr key={s.id} className="hover:bg-gray-50">
                                                <Td bold>{s.name}</Td>
                                                <Td center>{s.total_tasks}</Td>
                                                <Td center>{s.completed}</Td>
                                                <Td center><RateBadge rate={s.rate} /></Td>
                                                <Td center><StatusBadge active={s.is_active} /></Td>
                                            </tr>
                                        ))}
                                        {services.length === 0 && <EmptyRow cols={5} />}
                                    </tbody>
                                </table>
                            )}

                            {activeTab === 'Customers' && (
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <Th>Customer</Th>
                                            <Th center>Total Tasks</Th>
                                            <Th center>Completed</Th>
                                            <Th center>Rate</Th>
                                            <Th center>Renewals</Th>
                                            <Th center>Status</Th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {customers.map((c) => (
                                            <tr key={c.id} className="hover:bg-gray-50">
                                                <Td bold><Link href={route('admin.reports.customers.show', c.id)} className="text-emerald-600 hover:text-emerald-800 hover:underline">{c.name}</Link></Td>
                                                <Td center>{c.total_tasks}</Td>
                                                <Td center>{c.completed}</Td>
                                                <Td center><RateBadge rate={c.rate} /></Td>
                                                <Td center>
                                                    {c.renewals > 0 ? (
                                                        <span className="inline-flex rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-800">{c.renewals}</span>
                                                    ) : <span className="text-gray-400">0</span>}
                                                </Td>
                                                <Td center><StatusBadge active={c.is_active} activeLabel="Active" inactiveLabel="Inactive" /></Td>
                                            </tr>
                                        ))}
                                        {customers.length === 0 && <EmptyRow cols={6} />}
                                    </tbody>
                                </table>
                            )}

                            {activeTab === 'Partners' && (
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <Th>Partner</Th>
                                            <Th>Customer</Th>
                                            <Th center>Documents</Th>
                                            <Th center>Renewals</Th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {partners.map((p) => (
                                            <tr key={p.id} className="hover:bg-gray-50">
                                                <Td bold>{p.name}</Td>
                                                <Td>{p.customer_name}</Td>
                                                <Td center>{p.total_docs}</Td>
                                                <Td center>
                                                    {p.renewals > 0 ? (
                                                        <span className="inline-flex rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-800">{p.renewals}</span>
                                                    ) : <span className="text-gray-400">0</span>}
                                                </Td>
                                            </tr>
                                        ))}
                                        {partners.length === 0 && <EmptyRow cols={4} />}
                                    </tbody>
                                </table>
                            )}

                            {activeTab === 'Managers' && (
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <Th>Manager</Th>
                                            <Th>Department</Th>
                                            <Th center>Total Tasks</Th>
                                            <Th center>Completed</Th>
                                            <Th center>Rate</Th>
                                            <Th center>Active</Th>
                                            <Th center>Overdue</Th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {managers.map((m) => (
                                            <tr key={m.id} className="hover:bg-gray-50">
                                                <Td bold>{m.name}</Td>
                                                <Td>{m.department}</Td>
                                                <Td center>{m.total_tasks}</Td>
                                                <Td center>{m.completed}</Td>
                                                <Td center><RateBadge rate={m.rate} /></Td>
                                                <Td center>{m.active_tasks}</Td>
                                                <Td center>
                                                    {m.overdue > 0 ? (
                                                        <span className="inline-flex rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-800">{m.overdue}</span>
                                                    ) : <span className="text-gray-400">0</span>}
                                                </Td>
                                            </tr>
                                        ))}
                                        {managers.length === 0 && <EmptyRow cols={7} />}
                                    </tbody>
                                </table>
                            )}

                            {activeTab === 'Employees' && (
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <Th>Employee</Th>
                                            <Th>Department</Th>
                                            <Th>Designation</Th>
                                            <Th center>Total Tasks</Th>
                                            <Th center>Completed</Th>
                                            <Th center>Rate</Th>
                                            <Th center>Active</Th>
                                            <Th center>Overdue</Th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {employees.map((e) => (
                                            <tr key={e.id} className="hover:bg-gray-50">
                                                <Td bold>{e.name}</Td>
                                                <Td>{e.department}</Td>
                                                <Td>{e.designation}</Td>
                                                <Td center>{e.total_tasks}</Td>
                                                <Td center>{e.completed}</Td>
                                                <Td center><RateBadge rate={e.rate} /></Td>
                                                <Td center>{e.active_tasks}</Td>
                                                <Td center>
                                                    {e.overdue > 0 ? (
                                                        <span className="inline-flex rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-800">{e.overdue}</span>
                                                    ) : <span className="text-gray-400">0</span>}
                                                </Td>
                                            </tr>
                                        ))}
                                        {employees.length === 0 && <EmptyRow cols={8} />}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

/* ── Shared sub-components ── */

function Th({ children, center }: { children: React.ReactNode; center?: boolean }) {
    return (
        <th className={`px-4 py-3 text-xs font-medium uppercase tracking-wider text-gray-500 ${center ? 'text-center' : 'text-left'}`}>
            {children}
        </th>
    );
}

function Td({ children, center, bold }: { children: React.ReactNode; center?: boolean; bold?: boolean }) {
    return (
        <td className={`whitespace-nowrap px-4 py-3 text-sm ${center ? 'text-center' : ''} ${bold ? 'font-medium text-gray-900' : 'text-gray-500'}`}>
            {children}
        </td>
    );
}

function RateBadge({ rate }: { rate: number }) {
    return (
        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${rateColor(rate)}`}>
            {rate}%
        </span>
    );
}

function StatusBadge({ active, activeLabel = 'Active', inactiveLabel = 'Inactive' }: { active: boolean; activeLabel?: string; inactiveLabel?: string }) {
    return active ? (
        <span className="inline-flex rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">{activeLabel}</span>
    ) : (
        <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600">{inactiveLabel}</span>
    );
}

function EmptyRow({ cols }: { cols: number }) {
    return (
        <tr><td colSpan={cols} className="px-4 py-8 text-center text-sm text-gray-400">No records found.</td></tr>
    );
}
