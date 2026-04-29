import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import TextInput from '@/Components/TextInput';
import { Head, Link, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useState } from 'react';

interface ServiceRow {
    id: number;
    name: string;
    description: string | null;
    fields_count: number;
    my_running: number;
    my_completed: number;
}

interface Props extends PageProps {
    services: ServiceRow[];
    filters: { search: string | null };
}

export default function ServicesIndex({ services, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');

    function applyFilters() {
        const params: Record<string, string> = {};
        if (search) params.search = search;
        router.get(route('customer.services'), params, { preserveState: true, preserveScroll: true });
    }

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Services</h2>}>
            <Head title="Services" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
                    <div className="rounded-lg bg-white p-4 shadow">
                        <div className="flex flex-wrap items-end gap-4">
                            <div className="min-w-[240px] flex-1">
                                <label className="mb-1 block text-xs font-medium text-gray-600">Search services</label>
                                <TextInput
                                    value={search}
                                    className="block w-full"
                                    placeholder="Search by service name..."
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                                />
                            </div>
                            <button
                                onClick={applyFilters}
                                className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                            >
                                Filter
                            </button>
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {services.map((s) => (
                            <div key={s.id} className="flex flex-col rounded-lg bg-white p-5 shadow transition hover:shadow-md">
                                <h3 className="mb-2 text-lg font-semibold text-gray-900">{s.name}</h3>
                                {s.description && <p className="mb-4 line-clamp-3 text-sm text-gray-600">{s.description}</p>}

                                <div className="mt-auto flex items-center gap-3 text-xs text-gray-500">
                                    {s.my_running > 0 && (
                                        <span className="inline-flex rounded-full bg-blue-50 px-2 py-0.5 font-semibold text-blue-700">
                                            {s.my_running} active
                                        </span>
                                    )}
                                    {s.my_completed > 0 && (
                                        <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-700">
                                            {s.my_completed} completed
                                        </span>
                                    )}
                                </div>

                                <div className="mt-4 flex justify-end">
                                    <Link
                                        href={route('customer.services.request', s.id)}
                                        className="inline-flex items-center rounded-md bg-emerald-600 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-white hover:bg-emerald-700"
                                    >
                                        Request Service
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="ml-1.5 h-4 w-4">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                        </svg>
                                    </Link>
                                </div>
                            </div>
                        ))}
                        {services.length === 0 && (
                            <div className="col-span-full rounded-lg bg-white p-10 text-center text-sm text-gray-400 shadow">
                                No services available right now.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
