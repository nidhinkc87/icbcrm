import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

interface Props {
    permissions: Record<string, string[]>;
}

export default function Create({ permissions }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        permissions: [] as string[],
    });

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
        post(route('admin.roles.store'));
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Create Role
                </h2>
            }
        >
            <Head title="Create Role" />

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
                                    isFocused={true}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                />
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
                                    Create Role
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
