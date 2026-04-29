import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { PageProps } from '@/types';

interface DocumentRow {
    id: number;
    document_type: string;
    category: string;
    value: string | null;
    issue_date: string | null;
    expiry_date: string | null;
    partner_name: string | null;
    branch_name: string | null;
    file_url: string | null;
    days_remaining: number;
    bucket: 'expired' | 'expiring' | 'active';
}

interface Props extends PageProps {
    kpis: { expired: number; expiring: number; active: number; total: number };
    expired: DocumentRow[];
    expiring: DocumentRow[];
    active: DocumentRow[];
}

export default function DocumentTracker({ kpis, expired, expiring, active }: Props) {
    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Document Tracker</h2>}>
            <Head title="Document Tracker" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <KpiCard label="All Tracked" value={kpis.total} color="gray" />
                        <KpiCard label="Expired" value={kpis.expired} color={kpis.expired > 0 ? 'red' : 'gray'} />
                        <KpiCard label="Expiring (30d)" value={kpis.expiring} color={kpis.expiring > 0 ? 'amber' : 'gray'} />
                        <KpiCard label="Active" value={kpis.active} color="emerald" />
                    </div>

                    <Section title="Expired" docs={expired} accent="red" emptyText="No expired documents." />
                    <Section title="Expiring soon (next 30 days)" docs={expiring} accent="amber" emptyText="Nothing expiring soon." />
                    <Section title="Active" docs={active} accent="emerald" emptyText="No active tracked documents." />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function Section({ title, docs, accent, emptyText }: { title: string; docs: DocumentRow[]; accent: string; emptyText: string }) {
    const accentBg: Record<string, string> = {
        red: 'bg-red-50 text-red-800',
        amber: 'bg-amber-50 text-amber-800',
        emerald: 'bg-emerald-50 text-emerald-800',
    };
    return (
        <div className="overflow-hidden rounded-lg bg-white shadow">
            <div className={`flex items-center justify-between px-4 py-3 ${accentBg[accent] ?? 'bg-gray-50 text-gray-700'}`}>
                <h3 className="text-sm font-semibold uppercase tracking-wider">{title}</h3>
                <span className="text-sm font-semibold">{docs.length}</span>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Document</th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Reference</th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Linked To</th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Issue</th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Expiry</th>
                            <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Days</th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">File</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {docs.map((d) => (
                            <tr key={d.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                    <div>{d.document_type}</div>
                                    <div className="text-xs text-gray-400">{d.category}</div>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-700">{d.value ?? '-'}</td>
                                <td className="px-4 py-3 text-sm text-gray-500">
                                    {d.partner_name ? `Partner: ${d.partner_name}` : d.branch_name ? `Branch: ${d.branch_name}` : '-'}
                                </td>
                                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{d.issue_date ?? '-'}</td>
                                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">{d.expiry_date ?? '-'}</td>
                                <td className="whitespace-nowrap px-4 py-3 text-center text-sm">
                                    {d.bucket === 'expired' ? (
                                        <span className="inline-flex rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-800">
                                            {Math.abs(d.days_remaining)}d ago
                                        </span>
                                    ) : d.bucket === 'expiring' ? (
                                        <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                                            in {d.days_remaining}d
                                        </span>
                                    ) : (
                                        <span className="text-gray-700">{d.days_remaining}d</span>
                                    )}
                                </td>
                                <td className="whitespace-nowrap px-4 py-3 text-sm">
                                    {d.file_url ? (
                                        <a href={d.file_url} target="_blank" rel="noreferrer" className="text-emerald-600 hover:underline">
                                            View
                                        </a>
                                    ) : <span className="text-gray-400">-</span>}
                                </td>
                            </tr>
                        ))}
                        {docs.length === 0 && (
                            <tr><td colSpan={7} className="px-4 py-6 text-center text-sm text-gray-400">{emptyText}</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
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
