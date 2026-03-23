import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DataTable, { Column } from '@/Components/DataTable';
import { Head, Link, usePage } from '@inertiajs/react';
import { FormField, Paginated, PageProps } from '@/types';

interface SubmissionRow {
    id: number;
    user_name: string;
    user_email: string;
    status: string;
    created_at: string;
}

interface ServiceInfo {
    id: number;
    name: string;
    form_schema: FormField[];
}

interface Props extends PageProps {
    service: ServiceInfo;
    submissions: Paginated<SubmissionRow>;
    filters: { per_page?: number; [key: string]: unknown };
}

const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    reviewed: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
};

export default function Submissions({ service, submissions, filters }: Props) {
    const columns: Column<SubmissionRow>[] = [
        { key: 'user_name', label: 'Name' },
        { key: 'user_email', label: 'Email' },
        {
            key: 'status',
            label: 'Status',
            render: (row) => (
                <span
                    className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${statusColors[row.status] ?? 'bg-gray-100 text-gray-800'}`}
                >
                    {row.status}
                </span>
            ),
        },
        { key: 'created_at', label: 'Submitted' },
        {
            key: 'actions',
            label: 'Actions',
            render: (row) => (
                <Link
                    href={route('admin.services.submissions.show', [service.id, row.id])}
                    className="text-emerald-600 hover:text-emerald-900"
                >
                    View
                </Link>
            ),
        },
    ];

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center space-x-2">
                    <Link
                        href={route('admin.services.index')}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        Services
                    </Link>
                    <span className="text-gray-400">/</span>
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        {service.name} — Submissions
                    </h2>
                </div>
            }
        >
            <Head title={`${service.name} Submissions`} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <DataTable<SubmissionRow>
                            data={submissions}
                            columns={columns}
                            filters={filters}
                            routeName="admin.services.submissions"
                            routeParams={{ service: service.id }}
                        />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
