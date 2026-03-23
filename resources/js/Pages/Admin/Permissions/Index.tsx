import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DangerButton from '@/Components/DangerButton';
import DataTable, { Column } from '@/Components/DataTable';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Paginated, PageProps } from '@/types';
import { useState } from 'react';

interface PermissionRow {
    id: number;
    name: string;
    roles_count: number;
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
    permissions: Paginated<PermissionRow>;
    filters: Filters;
}

export default function Index({ permissions, filters }: Props) {
    const { flash } = usePage<PageProps>().props;
    const [confirmingDeletion, setConfirmingDeletion] = useState(false);
    const [permToDelete, setPermToDelete] = useState<PermissionRow | null>(null);

    const confirmDelete = (perm: PermissionRow) => {
        setPermToDelete(perm);
        setConfirmingDeletion(true);
    };

    const deletePermission = () => {
        if (permToDelete) {
            router.delete(route('admin.permissions.destroy', permToDelete.id), {
                onSuccess: () => {
                    setConfirmingDeletion(false);
                    setPermToDelete(null);
                },
            });
        }
    };

    const columns: Column<PermissionRow>[] = [
        { key: 'name', label: 'Name', sortable: true },
        {
            key: 'roles_count',
            label: 'Used by Roles',
            render: (perm) => (
                <span className="inline-flex rounded-full bg-gray-100 px-2 text-xs font-semibold leading-5 text-gray-800">
                    {perm.roles_count}
                </span>
            ),
        },
        { key: 'created_at', label: 'Created', sortable: true },
        {
            key: 'actions',
            label: 'Actions',
            render: (perm) =>
                perm.roles_count === 0 ? (
                    <button
                        onClick={() => confirmDelete(perm)}
                        className="text-red-600 hover:text-red-900"
                    >
                        Delete
                    </button>
                ) : (
                    <span className="text-xs text-gray-400">In use</span>
                ),
        },
    ];

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Permissions
                </h2>
            }
        >
            <Head title="Permissions" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {flash?.success && (
                        <div className="mb-4 rounded-md bg-green-50 p-4">
                            <p className="text-sm text-green-800">{flash.success}</p>
                        </div>
                    )}

                    <div className="mb-4 flex justify-end">
                        <Link
                            href={route('admin.permissions.create')}
                            className="inline-flex items-center rounded-md border border-transparent bg-emerald-600 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition duration-150 ease-in-out hover:bg-emerald-700 focus:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 active:bg-emerald-900"
                        >
                            Create Permission
                        </Link>
                    </div>

                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <DataTable<PermissionRow>
                            data={permissions}
                            columns={columns}
                            filters={filters}
                            routeName="admin.permissions.index"
                        />
                    </div>
                </div>
            </div>

            <Modal show={confirmingDeletion} onClose={() => setConfirmingDeletion(false)}>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900">Delete Permission</h2>
                    <p className="mt-1 text-sm text-gray-600">
                        Are you sure you want to delete the permission <strong>{permToDelete?.name}</strong>?
                    </p>
                    <div className="mt-6 flex justify-end space-x-3">
                        <SecondaryButton onClick={() => setConfirmingDeletion(false)}>
                            Cancel
                        </SecondaryButton>
                        <DangerButton onClick={deletePermission}>
                            Delete Permission
                        </DangerButton>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
