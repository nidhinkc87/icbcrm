import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DangerButton from '@/Components/DangerButton';
import DataTable, { Column } from '@/Components/DataTable';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Paginated, PageProps } from '@/types';
import { useState } from 'react';

interface ServiceRow {
    id: number;
    name: string;
    is_active: boolean;
    fields_count: number;
    submissions_count: number;
    created_at: string;
}

interface Filters {
    search?: string | null;
    sort?: string;
    direction?: string;
    per_page?: number;
    [key: string]: unknown;
}

interface Props extends PageProps {
    services: Paginated<ServiceRow>;
    filters: Filters;
}

export default function Index({ services, filters }: Props) {
    const { flash } = usePage<PageProps>().props;
    const [confirmingDeletion, setConfirmingDeletion] = useState(false);
    const [serviceToDelete, setServiceToDelete] = useState<ServiceRow | null>(null);

    const confirmDelete = (service: ServiceRow) => {
        setServiceToDelete(service);
        setConfirmingDeletion(true);
    };

    const deleteService = () => {
        if (serviceToDelete) {
            router.delete(route('admin.services.destroy', serviceToDelete.id), {
                onSuccess: () => {
                    setConfirmingDeletion(false);
                    setServiceToDelete(null);
                },
            });
        }
    };

    const columns: Column<ServiceRow>[] = [
        { key: 'name', label: 'Name', sortable: true },
        {
            key: 'is_active',
            label: 'Status',
            sortable: true,
            render: (service) => (
                <span
                    className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        service.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                    }`}
                >
                    {service.is_active ? 'Active' : 'Inactive'}
                </span>
            ),
        },
        { key: 'fields_count', label: 'Fields' },
        {
            key: 'submissions_count',
            label: 'Submissions',
            render: (service) => (
                <Link
                    href={route('admin.services.submissions', service.id)}
                    className="text-emerald-600 hover:text-emerald-900"
                >
                    {service.submissions_count}
                </Link>
            ),
        },
        { key: 'created_at', label: 'Created', sortable: true },
        {
            key: 'actions',
            label: 'Actions',
            render: (service) => (
                <div className="flex space-x-3">
                    <Link
                        href={route('admin.services.edit', service.id)}
                        className="text-emerald-600 hover:text-emerald-900"
                    >
                        Edit
                    </Link>
                    <button
                        onClick={() => confirmDelete(service)}
                        className="text-red-600 hover:text-red-900"
                    >
                        Delete
                    </button>
                </div>
            ),
        },
    ];

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Services
                </h2>
            }
        >
            <Head title="Services" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {flash?.success && (
                        <div className="mb-4 rounded-md bg-green-50 p-4">
                            <p className="text-sm text-green-800">{flash.success}</p>
                        </div>
                    )}

                    <div className="mb-4 flex justify-end">
                        <Link
                            href={route('admin.services.create')}
                            className="inline-flex items-center rounded-md border border-transparent bg-emerald-600 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition duration-150 ease-in-out hover:bg-emerald-700 focus:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 active:bg-emerald-900"
                        >
                            Create Service
                        </Link>
                    </div>

                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <DataTable<ServiceRow>
                            data={services}
                            columns={columns}
                            filters={filters}
                            routeName="admin.services.index"
                        />
                    </div>
                </div>
            </div>

            <Modal show={confirmingDeletion} onClose={() => setConfirmingDeletion(false)}>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900">Delete Service</h2>
                    <p className="mt-1 text-sm text-gray-600">
                        Are you sure you want to delete <strong>{serviceToDelete?.name}</strong>? All submissions will also be deleted. This action cannot be undone.
                    </p>
                    <div className="mt-6 flex justify-end space-x-3">
                        <SecondaryButton onClick={() => setConfirmingDeletion(false)}>
                            Cancel
                        </SecondaryButton>
                        <DangerButton onClick={deleteService}>Delete Service</DangerButton>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
