import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DownloadDropdown from '@/Components/DownloadDropdown';
import TextInput from '@/Components/TextInput';
import SelectInput from '@/Components/SelectInput';
import { Head, Link, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useState } from 'react';

interface CustomerRow {
    id: number;
    name: string;
    email: string;
    phone: string;
    emirate: string;
    legal_type: string;
    trade_license_no: string;
    total_docs: number;
    expired_docs: number;
    expiring_docs: number;
    total_tasks: number;
    pending_tasks: number;
}

interface Props extends PageProps {
    customers: {
        data: CustomerRow[];
        links: { url: string | null; label: string; active: boolean }[];
    };
    filters: {
        search: string | null;
        emirate: string | null;
        legal_type: string | null;
    };
}

const emirates = ['Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman', 'Umm Al Quwain', 'Ras Al Khaimah', 'Fujairah'];

export default function Customers({ customers, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');

    function applyFilters(overrides: Record<string, string | null> = {}) {
        const params: Record<string, string> = {};
        const merged = { search, emirate: filters.emirate, legal_type: filters.legal_type, ...overrides };
        Object.entries(merged).forEach(([k, v]) => {
            if (v) params[k] = v;
        });
        router.get(route('admin.reports.customers'), params, { preserveState: true, preserveScroll: true });
    }

    function buildParams() {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (filters.emirate) params.set('emirate', filters.emirate);
        if (filters.legal_type) params.set('legal_type', filters.legal_type);
        return params.toString();
    }

    function downloadPdf() {
        window.open(`${route('admin.reports.customers.pdf')}?${buildParams()}`, '_blank');
    }

    function downloadExcel() {
        window.open(`${route('admin.reports.customers.excel')}?${buildParams()}`, '_blank');
    }

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Customer Report</h2>}>
            <Head title="Customer Report" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Filters */}
                    <div className="mb-6 flex flex-wrap items-end gap-4 rounded-lg bg-white p-4 shadow">
                        <div className="min-w-[200px] flex-1">
                            <label className="mb-1 block text-xs font-medium text-gray-600">Search</label>
                            <TextInput
                                value={search}
                                className="block w-full"
                                placeholder="Name, email or trade license..."
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && applyFilters({ search })}
                            />
                        </div>
                        <div className="w-48">
                            <label className="mb-1 block text-xs font-medium text-gray-600">Emirate</label>
                            <SelectInput
                                value={filters.emirate ?? ''}
                                className="block w-full"
                                onChange={(e) => applyFilters({ emirate: e.target.value || null })}
                            >
                                <option value="">All Emirates</option>
                                {emirates.map((em) => <option key={em} value={em}>{em}</option>)}
                            </SelectInput>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => applyFilters({ search })}
                                className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                            >
                                Filter
                            </button>
                            <DownloadDropdown onPdf={downloadPdf} onExcel={downloadExcel} />
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
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Legal Type</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Trade License</th>
                                        <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Docs</th>
                                        <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Expired</th>
                                        <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Expiring</th>
                                        <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Tasks</th>
                                        <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Pending</th>
                                        <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Details</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {customers.data.map((c, i) => (
                                        <tr key={c.id} className="hover:bg-gray-50">
                                            <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{i + 1}</td>
                                            <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">{c.name}</td>
                                            <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{c.email}</td>
                                            <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{c.phone}</td>
                                            <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{c.emirate}</td>
                                            <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{c.legal_type}</td>
                                            <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{c.trade_license_no}</td>
                                            <td className="whitespace-nowrap px-4 py-3 text-center text-sm text-gray-500">{c.total_docs}</td>
                                            <td className="whitespace-nowrap px-4 py-3 text-center text-sm">
                                                {c.expired_docs > 0 ? (
                                                    <span className="inline-flex rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-800">{c.expired_docs}</span>
                                                ) : '0'}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 text-center text-sm">
                                                {c.expiring_docs > 0 ? (
                                                    <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">{c.expiring_docs}</span>
                                                ) : '0'}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 text-center text-sm text-gray-500">{c.total_tasks}</td>
                                            <td className="whitespace-nowrap px-4 py-3 text-center text-sm">
                                                {c.pending_tasks > 0 ? (
                                                    <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">{c.pending_tasks}</span>
                                                ) : '0'}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 text-center text-sm">
                                                <Link
                                                    href={route('admin.reports.customers.show', c.id)}
                                                    className="text-emerald-600 hover:text-emerald-800 hover:underline"
                                                >
                                                    View
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                    {customers.data.length === 0 && (
                                        <tr><td colSpan={13} className="px-4 py-8 text-center text-sm text-gray-400">No customers found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {customers.links.length > 3 && (
                            <div className="flex items-center justify-center gap-1 border-t px-4 py-3">
                                {customers.links.map((link, i) => (
                                    <Link
                                        key={i}
                                        href={link.url ?? '#'}
                                        preserveState
                                        className={`rounded px-3 py-1 text-sm ${
                                            link.active
                                                ? 'bg-emerald-600 text-white'
                                                : link.url
                                                    ? 'text-gray-600 hover:bg-gray-100'
                                                    : 'cursor-default text-gray-300'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
