import { Link, router } from '@inertiajs/react';
import { ReactNode, useCallback, useRef, useState } from 'react';
import { Paginated, PaginationLink } from '@/types';
import TextInput from '@/Components/TextInput';
import SelectInput from '@/Components/SelectInput';

export interface Column<T> {
    key: string;
    label: string;
    sortable?: boolean;
    render?: (row: T) => ReactNode;
}

interface DataTableProps<T> {
    data: Paginated<T>;
    columns: Column<T>[];
    filters: Record<string, unknown> & {
        search?: string | null;
        sort?: string;
        direction?: string;
        per_page?: number;
    };
    routeName: string;
    routeParams?: Record<string, unknown>;
}

export default function DataTable<T extends object>({
    data,
    columns,
    filters,
    routeName,
    routeParams = {},
}: DataTableProps<T>) {
    const [search, setSearch] = useState(filters.search || '');
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const buildParams = useCallback(
        (overrides: Record<string, unknown> = {}) => {
            const params: Record<string, unknown> = {
                ...routeParams,
                search: filters.search || undefined,
                sort: filters.sort || undefined,
                direction: filters.direction || undefined,
                per_page: filters.per_page || undefined,
                ...overrides,
            };
            // Remove empty values
            Object.keys(params).forEach((key) => {
                if (params[key] === undefined || params[key] === '' || params[key] === null) {
                    delete params[key];
                }
            });
            return params;
        },
        [filters, routeParams],
    );

    const handleSearch = (value: string) => {
        setSearch(value);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            router.get(
                route(routeName, buildParams({ search: value || undefined, page: undefined })),
                {},
                { preserveState: true, preserveScroll: true },
            );
        }, 300);
    };

    const handleSort = (field: string) => {
        const direction =
            filters.sort === field && filters.direction === 'asc' ? 'desc' : 'asc';
        router.get(
            route(routeName, buildParams({ sort: field, direction, page: undefined })),
            {},
            { preserveState: true, preserveScroll: true },
        );
    };

    const handlePerPage = (value: string) => {
        router.get(
            route(routeName, buildParams({ per_page: parseInt(value), page: undefined })),
            {},
            { preserveState: true, preserveScroll: true },
        );
    };

    const SortIcon = ({ field }: { field: string }) => {
        if (filters.sort !== field) {
            return (
                <svg className="ml-1 inline h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
                </svg>
            );
        }
        return filters.direction === 'asc' ? (
            <svg className="ml-1 inline h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
            </svg>
        ) : (
            <svg className="ml-1 inline h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
        );
    };

    const from = data.total === 0 ? 0 : (data.current_page - 1) * data.per_page + 1;
    const to = Math.min(data.current_page * data.per_page, data.total);

    return (
        <div>
            {/* Toolbar: Search + Per Page */}
            <div className="flex flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full sm:max-w-xs">
                    <TextInput
                        type="text"
                        placeholder="Search..."
                        value={search}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="block w-full pl-10"
                    />
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                        </svg>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>Show</span>
                    <SelectInput
                        value={filters.per_page || 15}
                        onChange={(e) => handlePerPage(e.target.value)}
                        className="py-1 text-sm"
                    >
                        <option value="10">10</option>
                        <option value="15">15</option>
                        <option value="25">25</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                    </SelectInput>
                    <span>entries</span>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    className={
                                        'px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500' +
                                        (col.sortable ? ' cursor-pointer select-none hover:text-gray-700' : '')
                                    }
                                    onClick={col.sortable ? () => handleSort(col.key) : undefined}
                                >
                                    {col.label}
                                    {col.sortable && <SortIcon field={col.key} />}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {data.data.length === 0 && (
                            <tr>
                                <td
                                    colSpan={columns.length}
                                    className="px-6 py-8 text-center text-sm text-gray-500"
                                >
                                    No records found.
                                </td>
                            </tr>
                        )}
                        {data.data.map((row, rowIndex) => {
                            const rowObj = row as Record<string, unknown>;
                            return (
                            <tr key={(rowObj.id as number) ?? rowIndex} className="hover:bg-gray-50">
                                {columns.map((col) => (
                                    <td key={col.key} className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                                        {col.render
                                            ? col.render(row)
                                            : (rowObj[col.key] as ReactNode)}
                                    </td>
                                ))}
                            </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Pagination Footer */}
            <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-200 bg-white px-6 py-4 sm:flex-row">
                <div className="text-sm text-gray-700">
                    {data.total > 0 ? (
                        <>
                            Showing <span className="font-medium">{from}</span> to{' '}
                            <span className="font-medium">{to}</span> of{' '}
                            <span className="font-medium">{data.total}</span> results
                        </>
                    ) : (
                        'No results'
                    )}
                </div>
                {data.last_page > 1 && (
                    <div className="flex space-x-1">
                        {data.links.map((link: PaginationLink, index: number) => (
                            <Link
                                key={index}
                                href={link.url || '#'}
                                className={`relative inline-flex items-center rounded-md px-3 py-2 text-sm font-medium ${
                                    link.active
                                        ? 'z-10 bg-emerald-600 text-white'
                                        : link.url
                                          ? 'text-gray-500 hover:bg-gray-50'
                                          : 'cursor-not-allowed text-gray-300'
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                preserveScroll
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
