import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

interface UserData {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    department: string | null;
    designation: string | null;
    date_of_joining: string | null;
    created_at: string;
}

interface Props {
    user: UserData;
}

function InfoItem({ label, value }: { label: string; value: string | null }) {
    return (
        <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium text-gray-500">{label}</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                {value || <span className="text-gray-400">Not provided</span>}
            </dd>
        </div>
    );
}

export default function ShowEmployee({ user }: Props) {
    const initials = user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Employee Details
                </h2>
            }
        >
            <Head title={`Employee - ${user.name}`} />

            <div className="py-12">
                <div className="max-w-4xl sm:px-6 lg:px-8 space-y-6">
                    {/* Profile Header Card */}
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="bg-emerald-950 px-6 py-8">
                            <div className="flex items-center gap-5">
                                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-emerald-800 text-xl font-bold text-white">
                                    {initials}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h3 className="text-xl font-semibold text-white truncate">{user.name}</h3>
                                    <p className="mt-1 text-sm text-emerald-200">{user.email}</p>
                                    <span className="mt-2 inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                                        Employee
                                    </span>
                                </div>
                                <div className="hidden sm:flex gap-2">
                                    <Link
                                        href={route('admin.users.edit', user.id)}
                                        className="inline-flex items-center gap-1.5 rounded-md bg-white/10 px-3.5 py-2 text-sm font-medium text-white backdrop-blur-sm hover:bg-white/20"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                        </svg>
                                        Edit
                                    </Link>
                                    <Link
                                        href={route('admin.users.index')}
                                        className="inline-flex items-center gap-1.5 rounded-md bg-white/10 px-3.5 py-2 text-sm font-medium text-white backdrop-blur-sm hover:bg-white/20"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                                        </svg>
                                        Back
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Mobile action buttons */}
                        <div className="flex gap-2 border-b border-gray-200 px-6 py-3 sm:hidden">
                            <Link
                                href={route('admin.users.edit', user.id)}
                                className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700"
                            >
                                Edit
                            </Link>
                            <Link
                                href={route('admin.users.index')}
                                className="inline-flex items-center gap-1.5 rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200"
                            >
                                Back
                            </Link>
                        </div>

                        {/* Details */}
                        <div className="px-6 py-2">
                            <dl className="divide-y divide-gray-100">
                                <InfoItem label="Phone" value={user.phone} />
                                <InfoItem label="Department" value={user.department} />
                                <InfoItem label="Designation" value={user.designation} />
                                <InfoItem label="Date of Joining" value={user.date_of_joining} />
                                <InfoItem label="Member Since" value={user.created_at} />
                            </dl>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
