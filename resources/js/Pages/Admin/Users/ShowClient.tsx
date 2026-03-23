import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

const KYC_LABELS: Record<string, string> = {
    emirates_id: 'Emirates ID',
    passport: 'Passport',
    trade_license: 'Trade License',
    moa: 'MOA (LLC Company)',
};

interface DocumentData {
    id: number;
    type: string;
    label: string | null;
    original_name: string;
    url: string;
}

interface UserData {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    address_line: string | null;
    city: string | null;
    emirate: string | null;
    country: string | null;
    po_box: string | null;
    documents: DocumentData[];
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

function DocumentCard({ doc, label }: { doc: DocumentData; label: string }) {
    const ext = doc.original_name.split('.').pop()?.toUpperCase() ?? 'FILE';
    const isImage = ['JPG', 'JPEG', 'PNG'].includes(ext);

    return (
        <a
            href={doc.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 transition hover:border-emerald-300 hover:shadow-sm"
        >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
                {isImage ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6 text-emerald-600">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6 text-emerald-600">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                )}
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 group-hover:text-emerald-700">{label}</p>
                <p className="mt-0.5 truncate text-xs text-gray-500">{doc.original_name}</p>
            </div>
            <div className="shrink-0">
                <span className="inline-flex items-center rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                    {ext}
                </span>
            </div>
        </a>
    );
}

export default function ShowClient({ user }: Props) {
    const kycDocs = user.documents.filter((d) => d.type !== 'additional');
    const additionalDocs = user.documents.filter((d) => d.type === 'additional');

    const address = [user.address_line, user.city, user.emirate, user.country, user.po_box ? `PO Box ${user.po_box}` : null]
        .filter(Boolean)
        .join(', ');

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
                    Client Details
                </h2>
            }
        >
            <Head title={`Client - ${user.name}`} />

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
                                    <span className="mt-2 inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                                        Client
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

                        {/* Contact & Address Details */}
                        <div className="px-6 py-2">
                            <dl className="divide-y divide-gray-100">
                                <InfoItem label="Phone" value={user.phone} />
                                <InfoItem label="Address" value={address || null} />
                                <InfoItem label="Emirate" value={user.emirate} />
                                <InfoItem label="Country" value={user.country} />
                                {user.po_box && <InfoItem label="PO Box" value={user.po_box} />}
                                <InfoItem label="Member Since" value={user.created_at} />
                            </dl>
                        </div>
                    </div>

                    {/* KYC Documents */}
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 text-gray-400">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                                </svg>
                                <h3 className="text-lg font-medium text-gray-900">KYC Documents</h3>
                            </div>
                            {kycDocs.length === 0 ? (
                                <div className="mt-4 rounded-lg border-2 border-dashed border-gray-200 p-8 text-center">
                                    <p className="text-sm text-gray-500">No KYC documents uploaded yet.</p>
                                </div>
                            ) : (
                                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    {kycDocs.map((doc) => (
                                        <DocumentCard
                                            key={doc.id}
                                            doc={doc}
                                            label={KYC_LABELS[doc.type] ?? doc.type}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Additional Documents */}
                    {additionalDocs.length > 0 && (
                        <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <div className="flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 text-gray-400">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
                                    </svg>
                                    <h3 className="text-lg font-medium text-gray-900">Additional Documents</h3>
                                </div>
                                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    {additionalDocs.map((doc) => (
                                        <DocumentCard
                                            key={doc.id}
                                            doc={doc}
                                            label={doc.label ?? 'Document'}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
