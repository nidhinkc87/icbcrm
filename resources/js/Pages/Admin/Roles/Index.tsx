import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DangerButton from '@/Components/DangerButton';
import DataTable, { Column } from '@/Components/DataTable';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Paginated, PageProps } from '@/types';
import { useState } from 'react';

interface RoleRow {
    id: number;
    name: string;
    permissions_count: number;
    users_count: number;
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
    roles: Paginated<RoleRow>;
    filters: Filters;
}

export default function Index({ roles, filters }: Props) {
    const { flash } = usePage<PageProps>().props;
    const [confirmingDeletion, setConfirmingDeletion] = useState(false);
    const [roleToDelete, setRoleToDelete] = useState<RoleRow | null>(null);

    const confirmDelete = (role: RoleRow) => {
        setRoleToDelete(role);
        setConfirmingDeletion(true);
    };

    const deleteRole = () => {
        if (roleToDelete) {
            router.delete(route('admin.roles.destroy', roleToDelete.id), {
                onSuccess: () => {
                    setConfirmingDeletion(false);
                    setRoleToDelete(null);
                },
            });
        }
    };

    const columns: Column<RoleRow>[] = [
        { key: 'name', label: 'Name', sortable: true },
        {
            key: 'permissions_count',
            label: 'Permissions',
            render: (role) => (
                <span className="inline-flex rounded-full bg-emerald-100 px-2 text-xs font-semibold leading-5 text-emerald-800">
                    {role.permissions_count}
                </span>
            ),
        },
        {
            key: 'users_count',
            label: 'Users',
            render: (role) => (
                <span className="inline-flex rounded-full bg-gray-100 px-2 text-xs font-semibold leading-5 text-gray-800">
                    {role.users_count}
                </span>
            ),
        },
        { key: 'created_at', label: 'Created', sortable: true },
        {
            key: 'actions',
            label: 'Actions',
            render: (role) => (
                <div className="flex space-x-3">
                    <Link
                        href={route('admin.roles.edit', role.id)}
                        className="text-emerald-600 hover:text-emerald-900"
                    >
                        Edit
                    </Link>
                    {role.name !== 'admin' && (
                        <button
                            onClick={() => confirmDelete(role)}
                            className="text-red-600 hover:text-red-900"
                        >
                            Delete
                        </button>
                    )}
                </div>
            ),
        },
    ];

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Roles
                </h2>
            }
        >
            <Head title="Roles" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {flash?.success && (
                        <div className="mb-4 rounded-md bg-green-50 p-4">
                            <p className="text-sm text-green-800">{flash.success}</p>
                        </div>
                    )}

                    <div className="mb-4 flex justify-end">
                        <Link
                            href={route('admin.roles.create')}
                            className="inline-flex items-center rounded-md border border-transparent bg-emerald-600 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition duration-150 ease-in-out hover:bg-emerald-700 focus:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 active:bg-emerald-900"
                        >
                            Create Role
                        </Link>
                    </div>

                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <DataTable<RoleRow>
                            data={roles}
                            columns={columns}
                            filters={filters}
                            routeName="admin.roles.index"
                        />
                    </div>
                </div>
            </div>

            <Modal show={confirmingDeletion} onClose={() => setConfirmingDeletion(false)}>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900">Delete Role</h2>
                    <p className="mt-1 text-sm text-gray-600">
                        Are you sure you want to delete the role <strong>{roleToDelete?.name}</strong>? Users with this role will lose their permissions.
                    </p>
                    <div className="mt-6 flex justify-end space-x-3">
                        <SecondaryButton onClick={() => setConfirmingDeletion(false)}>
                            Cancel
                        </SecondaryButton>
                        <DangerButton onClick={deleteRole}>
                            Delete Role
                        </DangerButton>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
