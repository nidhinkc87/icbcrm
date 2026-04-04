import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DownloadDropdown from '@/Components/DownloadDropdown';
import TextInput from '@/Components/TextInput';
import { Head, Link, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useState } from 'react';

interface PartnerRow {
    id: number;
    name: string;
    customer_name: string;
    emirates_id_no: string;
    passport_no: string;
    total_docs: number;
    expired_docs: number;
    expiring_docs: number;
}

interface Props extends PageProps {
    partners: {
        data: PartnerRow[];
        links: { url: string | null; label: string; active: boolean }[];
    };
    filters: {
        search: string | null;
        customer: string | null;
    };
}

export default function Partners({ partners, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [customer, setCustomer] = useState(filters.customer ?? '');

    function applyFilters(overrides: Record<string, string | null> = {}) {
        const params: Record<string, string> = {};
        const merged = { search, customer, ...overrides };
        Object.entries(merged).forEach(([k, v]) => {
            if (v) params[k] = v;
        });
        router.get(route('admin.reports.partners'), params, { preserveState: true, preserveScroll: true });
    }

    function buildParams() {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (customer) params.set('customer', customer);
        return params.toString();
    }

    function downloadPdf() {
        window.open(`${route('admin.reports.partners.pdf')}?${buildParams()}`, '_blank');
    }

    function downloadExcel() {
        window.open(`${route('admin.reports.partners.excel')}?${buildParams()}`, '_blank');
    }

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Partner Report</h2>}>
            <Head title="Partner Report" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Filters */}
                    <div className="mb-6 flex flex-wrap items-end gap-4 rounded-lg bg-white p-4 shadow">
                        <div className="min-w-[180px] flex-1">
                            <label className="mb-1 block text-xs font-medium text-gray-600">Partner Name</label>
                            <TextInput
                                value={search}
                                className="block w-full"
                                placeholder="Partner name or email..."
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && applyFilters({ search })}
                            />
                        </div>
                        <div className="min-w-[180px] flex-1">
                            <label className="mb-1 block text-xs font-medium text-gray-600">Customer Name</label>
                            <TextInput
                                value={customer}
                                className="block w-full"
                                placeholder="Search customer..."
                                onChange={(e) => setCustomer(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && applyFilters({ customer })}
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => applyFilters({ search, customer })}
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
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Partner Name</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Customer</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Emirates ID</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Passport No</th>
                                        <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Total Docs</th>
                                        <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Expired</th>
                                        <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Expiring Soon</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {partners.data.map((p, i) => (
                                        <tr key={p.id} className="hover:bg-gray-50">
                                            <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{i + 1}</td>
                                            <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">{p.name}</td>
                                            <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{p.customer_name}</td>
                                            <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{p.emirates_id_no}</td>
                                            <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{p.passport_no}</td>
                                            <td className="whitespace-nowrap px-4 py-3 text-center text-sm text-gray-500">{p.total_docs}</td>
                                            <td className="whitespace-nowrap px-4 py-3 text-center text-sm">
                                                {p.expired_docs > 0 ? (
                                                    <span className="inline-flex rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-800">{p.expired_docs}</span>
                                                ) : '0'}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 text-center text-sm">
                                                {p.expiring_docs > 0 ? (
                                                    <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">{p.expiring_docs}</span>
                                                ) : '0'}
                                            </td>
                                        </tr>
                                    ))}
                                    {partners.data.length === 0 && (
                                        <tr><td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-400">No partners found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {partners.links.length > 3 && (
                            <div className="flex items-center justify-center gap-1 border-t px-4 py-3">
                                {partners.links.map((link, i) => (
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
