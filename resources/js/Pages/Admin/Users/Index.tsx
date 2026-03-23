import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DangerButton from '@/Components/DangerButton';
import DataTable, { Column } from '@/Components/DataTable';
import Dropdown from '@/Components/Dropdown';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Paginated, PageProps } from '@/types';
import { useState } from 'react';

interface UserRow {
    id: number;
    name: string;
    email: string;
    role: string;
    created_at: string;
}

interface Filters {
    role: string | null;
    search?: string | null;
    sort?: string;
    direction?: string;
    per_page?: number;
    [key: string]: unknown;
}

interface Props extends PageProps {
    users: Paginated<UserRow>;
    filters: Filters;
}

export default function Index({ users, filters }: Props) {
    const { flash } = usePage<PageProps>().props;
    const [confirmingDeletion, setConfirmingDeletion] = useState(false);
    const [userToDelete, setUserToDelete] = useState<UserRow | null>(null);

    const filterTabs = [
        { label: 'All', value: '' },
        { label: 'Employees', value: 'employee' },
        { label: 'Clients', value: 'client' },
    ];

    const confirmDelete = (user: UserRow) => {
        setUserToDelete(user);
        setConfirmingDeletion(true);
    };

    const deleteUser = () => {
        if (userToDelete) {
            router.delete(route('admin.users.destroy', userToDelete.id), {
                onSuccess: () => {
                    setConfirmingDeletion(false);
                    setUserToDelete(null);
                },
            });
        }
    };

    const columns: Column<UserRow>[] = [
        { key: 'name', label: 'Name', sortable: true },
        { key: 'email', label: 'Email', sortable: true },
        {
            key: 'role',
            label: 'Role',
            render: (user) => (
                <span
                    className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        user.role === 'admin'
                            ? 'bg-purple-100 text-purple-800'
                            : user.role === 'employee'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-green-100 text-green-800'
                    }`}
                >
                    {user.role}
                </span>
            ),
        },
        { key: 'created_at', label: 'Created', sortable: true },
        {
            key: 'actions',
            label: 'Actions',
            render: (user) =>
                user.role !== 'admin' ? (
                    <div className="flex space-x-3">
                        <Link
                            href={route('admin.users.show', user.id)}
                            className="text-gray-600 hover:text-gray-900"
                        >
                            View
                        </Link>
                        <Link
                            href={route('admin.users.edit', user.id)}
                            className="text-emerald-600 hover:text-emerald-900"
                        >
                            Edit
                        </Link>
                        <button
                            onClick={() => confirmDelete(user)}
                            className="text-red-600 hover:text-red-900"
                        >
                            Delete
                        </button>
                    </div>
                ) : null,
        },
    ];

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Users
                </h2>
            }
        >
            <Head title="Users" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {flash?.success && (
                        <div className="mb-4 rounded-md bg-green-50 p-4">
                            <p className="text-sm text-green-800">{flash.success}</p>
                        </div>
                    )}

                    <div className="mb-4 flex justify-end">
                        <Dropdown>
                            <Dropdown.Trigger>
                                <button
                                    type="button"
                                    className="inline-flex items-center rounded-md border border-transparent bg-emerald-600 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition duration-150 ease-in-out hover:bg-emerald-700 focus:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 active:bg-emerald-900"
                                >
                                    Create
                                    <svg className="-me-0.5 ms-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </Dropdown.Trigger>
                            <Dropdown.Content align="right">
                                <Dropdown.Link href={route('admin.users.create', { type: 'employee' })}>
                                    Employee
                                </Dropdown.Link>
                                <Dropdown.Link href={route('admin.users.create', { type: 'client' })}>
                                    Client
                                </Dropdown.Link>
                            </Dropdown.Content>
                        </Dropdown>
                    </div>

                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        {/* Role filter tabs */}
                        <div className="border-b border-gray-200">
                            <nav className="flex space-x-8 px-6" aria-label="Tabs">
                                {filterTabs.map((tab) => (
                                    <Link
                                        key={tab.value}
                                        href={route('admin.users.index', tab.value ? { role: tab.value } : {})}
                                        className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${
                                            (filters.role || '') === tab.value
                                                ? 'border-emerald-500 text-emerald-600'
                                                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                        }`}
                                    >
                                        {tab.label}
                                    </Link>
                                ))}
                            </nav>
                        </div>

                        {/* DataTable */}
                        <DataTable<UserRow>
                            data={users}
                            columns={columns}
                            filters={filters}
                            routeName="admin.users.index"
                            routeParams={filters.role ? { role: filters.role } : {}}
                        />
                    </div>
                </div>
            </div>

            <Modal show={confirmingDeletion} onClose={() => setConfirmingDeletion(false)}>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900">
                        Delete User
                    </h2>
                    <p className="mt-1 text-sm text-gray-600">
                        Are you sure you want to delete <strong>{userToDelete?.name}</strong>? This action cannot be undone.
                    </p>
                    <div className="mt-6 flex justify-end space-x-3">
                        <SecondaryButton onClick={() => setConfirmingDeletion(false)}>
                            Cancel
                        </SecondaryButton>
                        <DangerButton onClick={deleteUser}>
                            Delete User
                        </DangerButton>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
