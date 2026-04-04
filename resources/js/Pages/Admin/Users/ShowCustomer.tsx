import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

interface Partner {
    id: number;
    name: string;
    emirates_id_no: string | null;
    emirates_id_file_url: string | null;
    passport_no: string | null;
    passport_file_url: string | null;
    emirates_id_expiry: string | null;
    passport_expiry: string | null;
}

interface Branch {
    id: number;
    name: string;
    trade_license_no: string | null;
    issuing_authority: string | null;
    moa_file_url: string | null;
    issue_date: string | null;
    expiry_date: string | null;
}

interface UserData {
    id: number;
    name: string;
    email: string;
    created_at: string;
    phone: string | null;
    address_line: string | null;
    city: string | null;
    emirate: string | null;
    country: string | null;
    po_box: string | null;
    legal_type: string | null;
    trade_license_no: string | null;
    issuing_authority: string | null;
    contact_person_name: string | null;
    telephone: string | null;
    trade_license_file_url: string | null;
    moa_file_url: string | null;
    trade_license_issue_date: string | null;
    trade_license_expiry_date: string | null;
    moa_issue_date: string | null;
    bank_name: string | null;
    bank_branch: string | null;
    account_number: string | null;
    iban: string | null;
    partners: Partner[];
    branches: Branch[];
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

function DocLink({ label, url }: { label: string; url: string | null }) {
    if (!url) return null;
    return (
        <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium text-gray-500">{label}</dt>
            <dd className="mt-1 sm:col-span-2 sm:mt-0">
                <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-emerald-600 hover:text-emerald-700">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" /></svg>
                    View Document
                </a>
            </dd>
        </div>
    );
}

function ExpiryDate({ label, date }: { label: string; date: string | null }) {
    if (!date) {
        return <InfoItem label={label} value={null} />;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiryDate = new Date(date);
    expiryDate.setHours(0, 0, 0, 0);
    const diffMs = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    let colorClass = 'text-green-600';
    let badge = '';
    if (diffDays < 0) {
        colorClass = 'text-red-600';
        badge = 'Expired';
    } else if (diffDays <= 30) {
        colorClass = 'text-amber-600';
        badge = 'Expiring soon';
    }

    return (
        <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium text-gray-500">{label}</dt>
            <dd className="mt-1 sm:col-span-2 sm:mt-0">
                <span className={`text-sm font-medium ${colorClass}`}>{date}</span>
                {badge && (
                    <span className={`ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${diffDays < 0 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                        {badge}
                    </span>
                )}
            </dd>
        </div>
    );
}

export default function ShowCustomer({ user }: Props) {
    const initials = user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Customer Details</h2>}
        >
            <Head title={`Customer - ${user.name}`} />

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
                                </div>
                                <div className="hidden sm:flex gap-2">
                                    <Link href={route('admin.users.edit', user.id)} className="inline-flex items-center gap-1.5 rounded-md bg-white/10 px-3.5 py-2 text-sm font-medium text-white backdrop-blur-sm hover:bg-white/20">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
                                        Edit
                                    </Link>
                                    <Link href={route('admin.users.index')} className="inline-flex items-center gap-1.5 rounded-md bg-white/10 px-3.5 py-2 text-sm font-medium text-white backdrop-blur-sm hover:bg-white/20">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" /></svg>
                                        Back
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2 border-b border-gray-200 px-6 py-3 sm:hidden">
                            <Link href={route('admin.users.edit', user.id)} className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700">Edit</Link>
                            <Link href={route('admin.users.index')} className="inline-flex items-center gap-1.5 rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200">Back</Link>
                        </div>

                        <div className="px-6 py-2">
                            {/* Section 1: Company Details */}
                            <h4 className="pt-4 text-sm font-semibold uppercase tracking-wider text-gray-400">Company Details</h4>
                            <dl className="divide-y divide-gray-100">
                                <InfoItem label="Legal Type" value={user.legal_type} />
                                <InfoItem label="Trade License No" value={user.trade_license_no} />
                                <InfoItem label="Issuing Authority" value={user.issuing_authority} />
                                <DocLink label="Trade License Copy" url={user.trade_license_file_url} />
                                <DocLink label="MOA Copy" url={user.moa_file_url} />
                                <ExpiryDate label="Trade License Issue Date" date={user.trade_license_issue_date} />
                                <ExpiryDate label="Trade License Expiry Date" date={user.trade_license_expiry_date} />
                                <ExpiryDate label="MOA Issue Date" date={user.moa_issue_date} />
                                <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
                                    <dt className="text-sm font-medium text-gray-500">Role</dt>
                                    <dd className="mt-1 sm:col-span-2 sm:mt-0">
                                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                                            Customer
                                        </span>
                                    </dd>
                                </div>
                            </dl>

                            {/* Section 2: Partner/Manager Details */}
                            <h4 className="mt-6 pt-4 text-sm font-semibold uppercase tracking-wider text-gray-400">Partner / Manager Details</h4>
                            {(!user.partners || user.partners.length === 0) ? (
                                <div className="py-3 text-sm text-gray-400">No partners added</div>
                            ) : (
                                <div className="mt-2 space-y-4">
                                    {user.partners.map((partner, index) => (
                                        <div key={partner.id} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                                            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                                                Partner {index + 1}
                                            </p>
                                            <dl className="divide-y divide-gray-100">
                                                <InfoItem label="Name" value={partner.name} />
                                                <InfoItem label="Emirates ID No" value={partner.emirates_id_no} />
                                                <InfoItem label="Passport No" value={partner.passport_no} />
                                                <DocLink label="Emirates ID Copy" url={partner.emirates_id_file_url} />
                                                <DocLink label="Passport Copy" url={partner.passport_file_url} />
                                                <ExpiryDate label="Emirates ID Expiry" date={partner.emirates_id_expiry} />
                                                <ExpiryDate label="Passport Expiry" date={partner.passport_expiry} />
                                            </dl>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Section 3: Bank Details */}
                            <h4 className="mt-6 pt-4 text-sm font-semibold uppercase tracking-wider text-gray-400">Bank Details</h4>
                            <dl className="divide-y divide-gray-100">
                                <InfoItem label="Bank Name" value={user.bank_name} />
                                <InfoItem label="Branch" value={user.bank_branch} />
                                <InfoItem label="Account Number" value={user.account_number} />
                                <InfoItem label="IBAN" value={user.iban} />
                            </dl>

                            {/* Section 4: Address Details */}
                            <h4 className="mt-6 pt-4 text-sm font-semibold uppercase tracking-wider text-gray-400">Address Details</h4>
                            <dl className="divide-y divide-gray-100">
                                <InfoItem label="Company Address" value={user.address_line} />
                                <InfoItem label="City" value={user.city} />
                                <InfoItem label="Emirate" value={user.emirate} />
                                <InfoItem label="PO Box" value={user.po_box} />
                            </dl>

                            {/* Section 5: Contact Details */}
                            <h4 className="mt-6 pt-4 text-sm font-semibold uppercase tracking-wider text-gray-400">Contact Details</h4>
                            <dl className="divide-y divide-gray-100">
                                <InfoItem label="Contact Person Name" value={user.contact_person_name} />
                                <InfoItem label="Mobile No" value={user.phone} />
                                <InfoItem label="Telephone No" value={user.telephone} />
                                <InfoItem label="Email" value={user.email} />
                            </dl>

                            {/* Section 6: Branch Details */}
                            {user.branches && user.branches.length > 0 && (
                                <>
                                    <h4 className="mt-6 pt-4 text-sm font-semibold uppercase tracking-wider text-gray-400">Branch Details</h4>
                                    <div className="mt-2 space-y-4">
                                        {user.branches.map((branch, index) => (
                                            <div key={branch.id} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                                                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                                                    Branch {index + 1}
                                                </p>
                                                <dl className="divide-y divide-gray-100">
                                                    <InfoItem label="Branch Name" value={branch.name} />
                                                    <InfoItem label="Trade License No" value={branch.trade_license_no} />
                                                    <InfoItem label="Issuing Authority" value={branch.issuing_authority} />
                                                    <DocLink label="MOA Copy" url={branch.moa_file_url} />
                                                    <ExpiryDate label="Issue Date" date={branch.issue_date} />
                                                    <ExpiryDate label="Expiry Date" date={branch.expiry_date} />
                                                </dl>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}

                            <div className="mt-4 border-t border-gray-100 py-3 text-xs text-gray-400">
                                Member since {user.created_at}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
