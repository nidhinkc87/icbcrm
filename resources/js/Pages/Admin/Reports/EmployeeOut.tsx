import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DownloadDropdown from '@/Components/DownloadDropdown';
import TextInput from '@/Components/TextInput';
import { Head, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useState } from 'react';

interface OutRecord {
    id: string;
    date: string;
    date_display: string;
    employee_name: string;
    status: string;
    location: string;
    timing: string;
    reason: string;
}

interface Props extends PageProps {
    records: OutRecord[];
    filters: {
        month: string;
        search: string | null;
    };
    month_label: string;
}

export default function EmployeeOut({ records, filters, month_label }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');

    function applyFilters(overrides: Record<string, string | null> = {}) {
        const params: Record<string, string> = {};
        const merged = { search, month: filters.month, ...overrides };
        Object.entries(merged).forEach(([k, v]) => {
            if (v) params[k] = v;
        });
        router.get(route('admin.reports.employee-out'), params, { preserveState: true, preserveScroll: true });
    }

    function buildParams() {
        const params = new URLSearchParams();
        params.set('month', filters.month);
        if (search) params.set('search', search);
        return params.toString();
    }

    function downloadPdf() {
        window.open(`${route('admin.reports.employee-out.pdf')}?${buildParams()}`, '_blank');
    }

    function downloadExcel() {
        window.open(`${route('admin.reports.employee-out.excel')}?${buildParams()}`, '_blank');
    }

    function changeMonth(delta: number) {
        const [year, month] = filters.month.split('-').map(Number);
        const date = new Date(year, month - 1 + delta, 1);
        const newMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        applyFilters({ month: newMonth });
    }

    // Group records by date
    const groupedByDate: Record<string, OutRecord[]> = {};
    records.forEach((r) => {
        if (!groupedByDate[r.date]) groupedByDate[r.date] = [];
        groupedByDate[r.date].push(r);
    });

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Employee Out Report</h2>}>
            <Head title="Employee Out Report" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Filters */}
                    <div className="mb-6 flex flex-wrap items-end gap-4 rounded-lg bg-white p-4 shadow">
                        {/* Month navigation */}
                        <div>
                            <label className="mb-1 block text-xs font-medium text-gray-600">Month</label>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => changeMonth(-1)}
                                    className="rounded-md border border-gray-300 p-2 text-gray-500 hover:bg-gray-50"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                                    </svg>
                                </button>
                                <input
                                    type="month"
                                    value={filters.month}
                                    onChange={(e) => applyFilters({ month: e.target.value })}
                                    className="rounded-md border-gray-300 text-sm shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                                />
                                <button
                                    onClick={() => changeMonth(1)}
                                    className="rounded-md border border-gray-300 p-2 text-gray-500 hover:bg-gray-50"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="min-w-[180px] flex-1">
                            <label className="mb-1 block text-xs font-medium text-gray-600">Search Employee</label>
                            <TextInput
                                value={search}
                                className="block w-full"
                                placeholder="Employee name..."
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && applyFilters({ search })}
                            />
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => applyFilters({ search })}
                                className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                            >
                                Filter
                            </button>
                            {(search || filters.search) && (
                                <button
                                    onClick={() => { setSearch(''); applyFilters({ search: null }); }}
                                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Clear
                                </button>
                            )}
                            <DownloadDropdown onPdf={downloadPdf} onExcel={downloadExcel} />
                        </div>
                    </div>

                    {/* Month label */}
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-700">{month_label}</h3>
                        <span className="text-sm text-gray-500">{records.length} record(s)</span>
                    </div>

                    {/* Table */}
                    <div className="overflow-hidden rounded-lg bg-white shadow">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">#</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Date</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Employee Name</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Out Status</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Location</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Timing</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Reason</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {records.map((r, i) => (
                                        <tr key={r.id} className="hover:bg-gray-50">
                                            <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{i + 1}</td>
                                            <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">{r.date_display}</td>
                                            <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">{r.employee_name}</td>
                                            <td className="whitespace-nowrap px-4 py-3 text-sm">
                                                <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                                                    {r.status}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{r.location}</td>
                                            <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{r.timing}</td>
                                            <td className="max-w-xs truncate px-4 py-3 text-sm text-gray-500" title={r.reason}>{r.reason}</td>
                                        </tr>
                                    ))}
                                    {records.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-400">
                                                No onsite records found for {month_label}.
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
