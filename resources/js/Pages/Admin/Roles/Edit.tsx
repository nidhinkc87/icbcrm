import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

interface RoleData {
    id: number;
    name: string;
    permissions: string[];
}

interface Props {
    role: RoleData;
    permissions: Record<string, string[]>;
}

export default function Edit({ role, permissions }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: role.name,
        permissions: [...role.permissions],
    });

    const isAdmin = role.name === 'admin';

    const togglePermission = (permission: string) => {
        setData(
            'permissions',
            data.permissions.includes(permission)
                ? data.permissions.filter((p) => p !== permission)
                : [...data.permissions, permission],
        );
    };

    const toggleGroup = (groupPermissions: string[]) => {
        const allSelected = groupPermissions.every((p) => data.permissions.includes(p));
        if (allSelected) {
            setData('permissions', data.permissions.filter((p) => !groupPermissions.includes(p)));
        } else {
            const merged = new Set([...data.permissions, ...groupPermissions]);
            setData('permissions', Array.from(merged));
        }
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('admin.roles.update', role.id));
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Edit Role: {role.name}
                </h2>
            }
        >
            <Head title={`Edit Role: ${role.name}`} />

            <div className="py-12">
                <div className="max-w-4xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white p-6 shadow-sm sm:rounded-lg">
                        <form onSubmit={submit}>
                            <div>
                                <InputLabel htmlFor="name" value="Role Name" />
                                <TextInput
                                    id="name"
                                    name="name"
                                    value={data.name}
                                    className="mt-1 block w-full max-w-md"
                                    onChange={(e) => setData('name', e.target.value)}
                                    disabled={isAdmin}
                                    required
                                />
                                {isAdmin && (
                                    <p className="mt-1 text-xs text-gray-500">
                                        The admin role cannot be renamed.
                                    </p>
                                )}
                                <InputError message={errors.name} className="mt-2" />
                            </div>

                            <div className="mt-6">
                                <InputLabel value="Permissions" />
                                <InputError message={errors.permissions} className="mt-2" />

                                <div className="mt-3 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {Object.entries(permissions).map(([group, groupPerms]) => (
                                        <div key={group} className="rounded-lg border border-gray-200 p-4">
                                            <label className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    className="rounded border-gray-300 text-emerald-600 shadow-sm focus:ring-emerald-500"
                                                    checked={groupPerms.every((p) => data.permissions.includes(p))}
                                                    onChange={() => toggleGroup(groupPerms)}
                                                />
                                                <span className="ml-2 text-sm font-semibold text-gray-700">
                                                    {group}
                                                </span>
                                            </label>
                                            <div className="mt-3 space-y-2 pl-6">
                                                {groupPerms.map((perm) => (
                                                    <label key={perm} className="flex items-center">
                                                        <input
                                                            type="checkbox"
                                                            className="rounded border-gray-300 text-emerald-600 shadow-sm focus:ring-emerald-500"
                                                            checked={data.permissions.includes(perm)}
                                                            onChange={() => togglePermission(perm)}
                                                        />
                                                        <span className="ml-2 text-sm text-gray-600">
                                                            {perm}
                                                        </span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-6 flex items-center justify-end space-x-4">
                                <Link
                                    href={route('admin.roles.index')}
                                    className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                                >
                                    Cancel
                                </Link>
                                <PrimaryButton disabled={processing}>
                                    Update Role
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
