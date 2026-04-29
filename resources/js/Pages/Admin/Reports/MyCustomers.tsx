import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import TextInput from '@/Components/TextInput';
import { Head, Link, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useState } from 'react';

interface CustomerRow {
    id: number;
    name: string;
    email: string;
    phone: string;
    emirate: string;
    total_tasks: number;
    completed: number;
    pending: number;
    in_progress: number;
    overdue: number;
    rate: number;
    last_activity: string | null;
}

interface Props extends PageProps {
    customers: CustomerRow[];
    filters: { search: string | null };
}

function rateColor(rate: number): string {
    if (rate >= 80) return 'bg-green-100 text-green-800';
    if (rate >= 50) return 'bg-amber-100 text-amber-800';
    return 'bg-red-100 text-red-800';
}

export default function MyCustomers({ customers, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');

    function applyFilters() {
        const params: Record<string, string> = {};
        if (search) params.search = search;
        router.get(route('admin.reports.my-customers'), params, { preserveState: true, preserveScroll: true });
    }

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">My Customers</h2>}>
            <Head title="My Customers" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Summary */}
                    <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <SummaryCard label="Customers" value={customers.length} color="emerald" />
                        <SummaryCard
                            label="Total Tasks"
                            value={customers.reduce((acc, c) => acc + c.total_tasks, 0)}
                        />
                        <SummaryCard
                            label="Pending"
                            value={customers.reduce((acc, c) => acc + c.pending + c.in_progress, 0)}
                            color="blue"
                        />
                        <SummaryCard
                            label="Overdue"
                            value={customers.reduce((acc, c) => acc + c.overdue, 0)}
                            color={customers.some(c => c.overdue > 0) ? 'red' : 'gray'}
                        />
                    </div>

                    {/* Filters */}
                    <div className="mb-6 flex flex-wrap items-end gap-4 rounded-lg bg-white p-4 shadow">
                        <div className="min-w-[200px] flex-1">
                            <label className="mb-1 block text-xs font-medium text-gray-600">Search</label>
                            <TextInput
                                value={search}
                                className="block w-full"
                                placeholder="Customer name or email..."
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                            />
                        </div>
                        <div>
                            <button
                                onClick={applyFilters}
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
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Customer</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Email</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Phone</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Emirate</th>
                                        <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">My Tasks</th>
                                        <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Completed</th>
                                        <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Pending</th>
                                        <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Overdue</th>
                                        <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Rate</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Last Activity</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {customers.map((c, i) => (
                                        <tr key={c.id} className="hover:bg-gray-50">
                                            <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{i + 1}</td>
                                            <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">
                                                <Link
                                                    href={route('tasks.index', { customer_id: c.id })}
                                                    className="text-emerald-600 hover:text-emerald-800 hover:underline"
                                                >
                                                    {c.name}
                                                </Link>
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{c.email}</td>
                                            <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{c.phone}</td>
                                            <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{c.emirate}</td>
                                            <td className="whitespace-nowrap px-4 py-3 text-center text-sm text-gray-500">{c.total_tasks}</td>
                                            <td className="whitespace-nowrap px-4 py-3 text-center text-sm text-gray-500">{c.completed}</td>
                                            <td className="whitespace-nowrap px-4 py-3 text-center text-sm">
                                                {c.pending + c.in_progress > 0 ? (
                                                    <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">{c.pending + c.in_progress}</span>
                                                ) : <span className="text-gray-400">0</span>}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 text-center text-sm">
                                                {c.overdue > 0 ? (
                                                    <span className="inline-flex rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-800">{c.overdue}</span>
                                                ) : <span className="text-gray-400">0</span>}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 text-center text-sm">
                                                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${rateColor(c.rate)}`}>
                                                    {c.rate}%
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{c.last_activity ?? '-'}</td>
                                        </tr>
                                    ))}
                                    {customers.length === 0 && (
                                        <tr><td colSpan={11} className="px-4 py-8 text-center text-sm text-gray-400">No customers assigned to you yet.</td></tr>
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
