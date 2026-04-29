import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import TextInput from '@/Components/TextInput';
import { Head, Link, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useState } from 'react';

interface ServiceRow {
    id: number;
    name: string;
    description: string | null;
    is_active: boolean;
    total_tasks: number;
    running_tasks: number;
    completed_tasks: number;
    customer_count: number;
    rate: number;
}

interface Props extends PageProps {
    services: ServiceRow[];
    filters: { search: string | null };
}

function rateColor(rate: number): string {
    if (rate >= 80) return 'bg-green-100 text-green-800';
    if (rate >= 50) return 'bg-amber-100 text-amber-800';
    return 'bg-red-100 text-red-800';
}

export default function Services({ services, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');

    function applyFilters() {
        const params: Record<string, string> = {};
        if (search) params.search = search;
        router.get(route('admin.reports.services'), params, { preserveState: true, preserveScroll: true });
    }

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Service Report</h2>}>
            <Head title="Service Report" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Filters */}
                    <div className="mb-6 flex flex-wrap items-end gap-4 rounded-lg bg-white p-4 shadow">
                        <div className="min-w-[200px] flex-1">
                            <label className="mb-1 block text-xs font-medium text-gray-600">Search</label>
                            <TextInput
                                value={search}
                                className="block w-full"
                                placeholder="Service name..."
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={applyFilters}
                                className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                            >
                                Filter
                            </button>
                        </div>
                    </div>

                    {/* Services table */}
                    <div className="overflow-hidden rounded-lg bg-white shadow">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">#</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Service</th>
                                        <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Customers</th>
                                        <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Total Tasks</th>
                                        <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Running</th>
                                        <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Completed</th>
                                        <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Rate</th>
                                        <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {services.map((s, i) => (
                                        <tr key={s.id} className="hover:bg-gray-50">
                                            <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{i + 1}</td>
                                            <td className="whitespace-nowrap px-4 py-3 text-sm font-medium">
                                                <Link
                                                    href={route('admin.reports.services.show', s.id)}
                                                    className="text-emerald-600 hover:text-emerald-800 hover:underline"
                                                >
                                                    {s.name}
                                                </Link>
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 text-center text-sm text-gray-500">{s.customer_count}</td>
                                            <td className="whitespace-nowrap px-4 py-3 text-center text-sm text-gray-500">{s.total_tasks}</td>
                                            <td className="whitespace-nowrap px-4 py-3 text-center text-sm">
                                                {s.running_tasks > 0 ? (
                                                    <span className="inline-flex rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-800">{s.running_tasks}</span>
                                                ) : <span className="text-gray-400">0</span>}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 text-center text-sm text-gray-500">{s.completed_tasks}</td>
                                            <td className="whitespace-nowrap px-4 py-3 text-center text-sm">
                                                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${rateColor(s.rate)}`}>
                                                    {s.rate}%
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 text-center text-sm">
                                                {s.total_tasks === 0 ? (
                                                    <span className="inline-flex rounded-full bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-800">Proposed</span>
                                                ) : s.is_active ? (
                                                    <span className="inline-flex rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">Active</span>
                                                ) : (
                                                    <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600">Inactive</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {services.length === 0 && (
                                        <tr><td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-400">No services found.</td></tr>
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
