import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

interface Props {
    roles: string[];
}

export default function CreateEmployee({ roles }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        type: 'employee',
        phone: '',
        department: '',
        designation: '',
        date_of_joining: '',
        role: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('admin.users.store'));
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Create Employee
                </h2>
            }
        >
            <Head title="Create Employee" />

            <div className="py-12">
                <div className="max-w-4xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white p-6 shadow-sm sm:rounded-lg">
                        <form onSubmit={submit}>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <InputLabel htmlFor="name" value="Name" />
                                    <TextInput
                                        id="name"
                                        name="name"
                                        value={data.name}
                                        className="mt-1 block w-full"
                                        autoComplete="name"
                                        isFocused={true}
                                        onChange={(e) => setData('name', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.name} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="email" value="Email" />
                                    <TextInput
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={data.email}
                                        className="mt-1 block w-full"
                                        autoComplete="username"
                                        onChange={(e) => setData('email', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.email} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="phone" value="Phone" />
                                    <TextInput
                                        id="phone"
                                        name="phone"
                                        value={data.phone}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setData('phone', e.target.value)}
                                    />
                                    <InputError message={errors.phone} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="department" value="Department" />
                                    <TextInput
                                        id="department"
                                        name="department"
                                        value={data.department}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setData('department', e.target.value)}
                                    />
                                    <InputError message={errors.department} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="designation" value="Designation" />
                                    <TextInput
                                        id="designation"
                                        name="designation"
                                        value={data.designation}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setData('designation', e.target.value)}
                                    />
                                    <InputError message={errors.designation} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="date_of_joining" value="Date of Joining" />
                                    <TextInput
                                        id="date_of_joining"
                                        type="date"
                                        name="date_of_joining"
                                        value={data.date_of_joining}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setData('date_of_joining', e.target.value)}
                                    />
                                    <InputError message={errors.date_of_joining} className="mt-2" />
                                </div>

                            </div>

                            {/* Role */}
                            {roles.length > 0 && (
                                <>
                                    <h3 className="mt-8 border-t border-gray-200 pt-6 text-lg font-medium text-gray-900">
                                        Role
                                    </h3>
                                    <div className="mt-4 space-y-2">
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name="role"
                                                className="border-gray-300 text-emerald-600 shadow-sm focus:ring-emerald-500"
                                                checked={data.role === ''}
                                                onChange={() => setData('role', '')}
                                            />
                                            <span className="text-sm text-gray-700">None</span>
                                        </label>
                                        {roles.map((r) => (
                                            <label key={r} className="flex items-center gap-2">
                                                <input
                                                    type="radio"
                                                    name="role"
                                                    className="border-gray-300 text-emerald-600 shadow-sm focus:ring-emerald-500"
                                                    checked={data.role === r}
                                                    onChange={() => setData('role', r)}
                                                />
                                                <span className="text-sm text-gray-700 capitalize">{r}</span>
                                            </label>
                                        ))}
                                    </div>
                                    <InputError message={errors.role} className="mt-2" />
                                </>
                            )}

                            <div className="mt-6 flex items-center justify-end space-x-4">
                                <Link
                                    href={route('admin.users.index')}
                                    className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                                >
                                    Cancel
                                </Link>
                                <PrimaryButton disabled={processing}>
                                    Create Employee
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
