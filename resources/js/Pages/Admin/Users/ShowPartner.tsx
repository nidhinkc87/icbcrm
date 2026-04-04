import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

interface Props {
    user: {
        id: number;
        name: string;
        email: string;
        phone: string | null;
        company: string | null;
        customers: { id: number; name: string }[];
        created_at: string;
    };
}

function InfoItem({ label, value }: { label: string; value: string | null }) {
    return (
        <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium text-gray-500">{label}</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{value || '-'}</dd>
        </div>
    );
}

export default function ShowPartner({ user }: Props) {
    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Partner Details</h2>}>
            <Head title="Partner Details" />

            <div className="py-6">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow sm:rounded-lg">
                        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                            <h3 className="text-lg font-medium text-gray-900">{user.name}</h3>
                            <Link
                                href={route('admin.users.edit', user.id)}
                                className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700"
                            >
                                Edit
                            </Link>
                        </div>

                        <div className="px-6 py-4">
                            <dl className="divide-y divide-gray-200">
                                <InfoItem label="Name" value={user.name} />
                                <InfoItem label="Email" value={user.email} />
                                <InfoItem label="Phone" value={user.phone} />
                                <InfoItem label="Company / Agency" value={user.company} />
                                <InfoItem label="Created" value={user.created_at} />
                            </dl>
                        </div>

                        {/* Assigned Customers */}
                        <div className="border-t border-gray-200 px-6 py-4">
                            <h4 className="mb-3 text-sm font-semibold uppercase text-gray-500">
                                Assigned Customers ({user.customers.length})
                            </h4>
                            {user.customers.length === 0 ? (
                                <p className="text-sm text-gray-400">No customers assigned.</p>
                            ) : (
                                <div className="divide-y divide-gray-100 rounded-md border border-gray-200">
                                    {user.customers.map((c) => (
                                        <div key={c.id} className="flex items-center justify-between px-4 py-2.5">
                                            <span className="text-sm font-medium text-gray-700">{c.name}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-4">
                        <Link
                            href={route('admin.users.index', { role: 'partner' })}
                            className="text-sm text-gray-600 hover:text-gray-900 hover:underline"
                        >
                            &larr; Back to Partners
                        </Link>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
