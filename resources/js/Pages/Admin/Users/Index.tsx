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
                    <div className="flex items-center space-x-2">
                        <Link
                            href={route('admin.users.show', user.id)}
                            className="rounded p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                            title="View"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </Link>
                        <Link
                            href={route('admin.users.edit', user.id)}
                            className="rounded p-1 text-gray-400 transition hover:bg-emerald-50 hover:text-emerald-600"
                            title="Edit"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                            </svg>
                        </Link>
                        <button
                            onClick={() => confirmDelete(user)}
                            className="rounded p-1 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                            title="Delete"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
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
