import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

interface Props {
    user: {
        id: number;
        name: string;
        email: string;
        phone: string | null;
        company: string | null;
        legal_type: string | null;
        trade_license_no: string | null;
        issuing_authority: string | null;
        trade_license_file_url: string | null;
        trade_license_issue_date: string | null;
        trade_license_expiry_date: string | null;
        moa_file_url: string | null;
        moa_issue_date: string | null;
        bank_name: string | null;
        bank_branch: string | null;
        account_number: string | null;
        iban: string | null;
        address_line: string | null;
        city: string | null;
        emirate: string | null;
        po_box: string | null;
        contact_person_name: string | null;
        telephone: string | null;
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

function DocLink({ label, url }: { label: string; url: string | null }) {
    return (
        <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium text-gray-500">{label}</dt>
            <dd className="mt-1 sm:col-span-2 sm:mt-0">
                {url ? (
                    <a href={url} target="_blank" rel="noreferrer" className="text-sm text-emerald-600 hover:underline">View Document</a>
                ) : (
                    <span className="text-sm text-gray-400">Not uploaded</span>
                )}
            </dd>
        </div>
    );
}

export default function ShowPartner({ user }: Props) {
    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Partner Details</h2>}>
            <Head title="Partner Details" />

            <div className="py-6">
                <div className="max-w-4xl px-4 sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow sm:rounded-lg">
                        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                            <h3 className="text-lg font-medium text-gray-900">{user.name}</h3>
                            <Link href={route('admin.users.edit', user.id)} className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700">
                                Edit
                            </Link>
                        </div>

                        <div className="px-6 py-4">
                            {/* Basic Details */}
                            <h4 className="mb-2 text-sm font-semibold uppercase text-gray-400">Partner Info</h4>
                            <dl className="divide-y divide-gray-200">
                                <InfoItem label="Name" value={user.name} />
                                <InfoItem label="Company" value={user.company} />
                                <InfoItem label="Email" value={user.email} />
                                <InfoItem label="Contact" value={user.phone} />
                                <InfoItem label="Created" value={user.created_at} />
                            </dl>

                            {/* KYC */}
                            <h4 className="mb-2 mt-6 text-sm font-semibold uppercase text-gray-400">KYC Details</h4>
                            <dl className="divide-y divide-gray-200">
                                <InfoItem label="Legal Type" value={user.legal_type} />
                                <InfoItem label="Trade License No" value={user.trade_license_no} />
                                <InfoItem label="Issuing Authority" value={user.issuing_authority} />
                                <DocLink label="Trade License Copy" url={user.trade_license_file_url} />
                                <InfoItem label="Trade License Issue Date" value={user.trade_license_issue_date} />
                                <InfoItem label="Trade License Expiry Date" value={user.trade_license_expiry_date} />
                                <DocLink label="MOA Copy" url={user.moa_file_url} />
                                <InfoItem label="MOA Issue Date" value={user.moa_issue_date} />
                            </dl>

                            {/* Bank */}
                            <h4 className="mb-2 mt-6 text-sm font-semibold uppercase text-gray-400">Bank Details</h4>
                            <dl className="divide-y divide-gray-200">
                                <InfoItem label="Bank Name" value={user.bank_name} />
                                <InfoItem label="Branch" value={user.bank_branch} />
                                <InfoItem label="Account Number" value={user.account_number} />
                                <InfoItem label="IBAN" value={user.iban} />
                            </dl>

                            {/* Address */}
                            <h4 className="mb-2 mt-6 text-sm font-semibold uppercase text-gray-400">Address</h4>
                            <dl className="divide-y divide-gray-200">
                                <InfoItem label="Address" value={user.address_line} />
                                <InfoItem label="City" value={user.city} />
                                <InfoItem label="Emirate" value={user.emirate} />
                                <InfoItem label="P.O. Box" value={user.po_box} />
                            </dl>

                            {/* Contact */}
                            <h4 className="mb-2 mt-6 text-sm font-semibold uppercase text-gray-400">Authorized Person</h4>
                            <dl className="divide-y divide-gray-200">
                                <InfoItem label="Name" value={user.contact_person_name} />
                                <InfoItem label="Telephone" value={user.telephone} />
                            </dl>
                        </div>

                        {/* Assigned Customers */}
                        <div className="border-t border-gray-200 px-6 py-4">
                            <h4 className="mb-3 text-sm font-semibold uppercase text-gray-400">
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
                        <Link href={route('admin.users.index', { role: 'partner' })} className="text-sm text-gray-600 hover:text-gray-900 hover:underline">
                            &larr; Back to Partners
                        </Link>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
