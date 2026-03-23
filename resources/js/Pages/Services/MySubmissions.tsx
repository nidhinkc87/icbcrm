import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DataTable, { Column } from '@/Components/DataTable';
import { Head } from '@inertiajs/react';
import { Paginated, PageProps } from '@/types';

interface SubmissionRow {
    id: number;
    service_name: string;
    status: string;
    created_at: string;
}

interface Props extends PageProps {
    submissions: Paginated<SubmissionRow>;
}

const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    reviewed: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
};

export default function MySubmissions({ submissions }: Props) {
    const columns: Column<SubmissionRow>[] = [
        { key: 'service_name', label: 'Service' },
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
    ];

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    My Submissions
                </h2>
            }
        >
            <Head title="My Submissions" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <DataTable<SubmissionRow>
                            data={submissions}
                            columns={columns}
                            filters={{}}
                            routeName="services.my-submissions"
                        />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
