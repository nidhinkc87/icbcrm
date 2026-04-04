import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DownloadDropdown from '@/Components/DownloadDropdown';
import TextInput from '@/Components/TextInput';
import SelectInput from '@/Components/SelectInput';
import { Head, Link, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useState } from 'react';

interface EmployeeRow {
    id: number;
    name: string;
    department: string;
    designation: string;
    date_of_joining: string | null;
    total_tasks: number;
    completed: number;
    completion_rate: number;
    on_time: number;
    on_time_rate: number;
    overdue: number;
    active_tasks: number;
    avg_days: number | null;
}

interface Props extends PageProps {
    employees: EmployeeRow[];
    filters: {
        search: string | null;
        department: string | null;
        period: string;
    };
}

const periodOptions = [
    { value: '30', label: 'Last 30 days' },
    { value: '90', label: 'Last 90 days' },
    { value: '180', label: 'Last 6 months' },
    { value: '365', label: 'Last year' },
    { value: 'all', label: 'All time' },
];

function rateColor(rate: number): string {
    if (rate >= 80) return 'bg-green-100 text-green-800';
    if (rate >= 50) return 'bg-amber-100 text-amber-800';
    return 'bg-red-100 text-red-800';
}

export default function Employees({ employees, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');

    function applyFilters(overrides: Record<string, string | null> = {}) {
        const params: Record<string, string> = {};
        const merged = { search, period: filters.period, department: filters.department, ...overrides };
        Object.entries(merged).forEach(([k, v]) => {
            if (v) params[k] = v;
        });
        router.get(route('admin.reports.employees'), params, { preserveState: true, preserveScroll: true });
    }

    function downloadPdf() {
        window.open(`${route('admin.reports.employees.pdf')}?${buildParams()}`, '_blank');
    }

    function buildParams() {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (filters.department) params.set('department', filters.department);
        params.set('period', filters.period);
        return params.toString();
    }

    function downloadExcel() {
        window.open(`${route('admin.reports.employees.excel')}?${buildParams()}`, '_blank');
    }

    // Extract unique departments for filter
    const departments = [...new Set(employees.map((e) => e.department).filter((d) => d !== '-'))];

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Employee Report</h2>}>
            <Head title="Employee Report" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Filters */}
                    <div className="mb-6 flex flex-wrap items-end gap-4 rounded-lg bg-white p-4 shadow">
                        <div className="min-w-[180px] flex-1">
                            <label className="mb-1 block text-xs font-medium text-gray-600">Search</label>
                            <TextInput
                                value={search}
                                className="block w-full"
                                placeholder="Name or email..."
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && applyFilters({ search })}
                            />
                        </div>
                        {departments.length > 0 && (
                            <div className="w-48">
                                <label className="mb-1 block text-xs font-medium text-gray-600">Department</label>
                                <SelectInput
                                    value={filters.department ?? ''}
                                    className="block w-full"
                                    onChange={(e) => applyFilters({ department: e.target.value || null })}
                                >
                                    <option value="">All Departments</option>
                                    {departments.map((d) => <option key={d} value={d}>{d}</option>)}
                                </SelectInput>
                            </div>
                        )}
                        <div className="w-44">
                            <label className="mb-1 block text-xs font-medium text-gray-600">Period</label>
                            <SelectInput
                                value={filters.period}
                                className="block w-full"
                                onChange={(e) => applyFilters({ period: e.target.value })}
                            >
                                {periodOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
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
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Name</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Department</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Designation</th>
                                        <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Total</th>
                                        <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Completed</th>
                                        <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Rate</th>
                                        <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">On-Time</th>
                                        <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Overdue</th>
                                        <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Active</th>
                                        <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Avg Days</th>
                                        <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Details</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {employees.map((e, i) => (
                                        <tr key={e.id} className="hover:bg-gray-50">
                                            <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{i + 1}</td>
                                            <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">{e.name}</td>
                                            <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{e.department}</td>
                                            <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{e.designation}</td>
                                            <td className="whitespace-nowrap px-4 py-3 text-center text-sm text-gray-500">{e.total_tasks}</td>
                                            <td className="whitespace-nowrap px-4 py-3 text-center text-sm text-gray-500">{e.completed}</td>
                                            <td className="whitespace-nowrap px-4 py-3 text-center text-sm">
                                                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${rateColor(e.completion_rate)}`}>
                                                    {e.completion_rate}%
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 text-center text-sm text-gray-500">{e.on_time_rate}%</td>
                                            <td className="whitespace-nowrap px-4 py-3 text-center text-sm">
                                                {e.overdue > 0 ? (
                                                    <span className="inline-flex rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-800">{e.overdue}</span>
                                                ) : '0'}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 text-center text-sm text-gray-500">{e.active_tasks}</td>
                                            <td className="whitespace-nowrap px-4 py-3 text-center text-sm text-gray-500">{e.avg_days ?? '-'}</td>
                                            <td className="whitespace-nowrap px-4 py-3 text-center text-sm">
                                                <Link
                                                    href={route('admin.reports.employees.show', e.id)}
                                                    className="text-emerald-600 hover:text-emerald-800 hover:underline"
                                                >
                                                    View
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                    {employees.length === 0 && (
                                        <tr><td colSpan={12} className="px-4 py-8 text-center text-sm text-gray-400">No employees found.</td></tr>
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
