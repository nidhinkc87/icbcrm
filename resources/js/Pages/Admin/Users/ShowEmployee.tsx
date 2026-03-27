import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

interface UserData {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    personal_email: string | null;
    contact_number: string | null;
    department: string | null;
    designation: string | null;
    date_of_joining: string | null;
    emergency_contact_name: string | null;
    emergency_contact_number: string | null;
    emergency_contact_relationship: string | null;
    local_address_line: string | null;
    local_city: string | null;
    local_emirate: string | null;
    local_po_box: string | null;
    home_address_line: string | null;
    home_city: string | null;
    home_state: string | null;
    home_country: string | null;
    home_postal_code: string | null;
    home_contact_number: string | null;
    photo: string | null;
    passport: string | null;
    emirates_id: string | null;
    visa: string | null;
    driving_id: string | null;
    insurance: string | null;
    education_certificates: string[];
    offer_letter: string | null;
    labour_contract: string | null;
    nda: string | null;
    handbook: string | null;
    personal_goal: string[];
    professional_goal: string[];
    submission_date: string | null;
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

function DocLinks({ label, urls }: { label: string; urls: string[] }) {
    if (!urls || urls.length === 0) return null;
    return (
        <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium text-gray-500">{label}</dt>
            <dd className="mt-1 flex flex-wrap gap-3 sm:col-span-2 sm:mt-0">
                {urls.map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" /></svg>
                        File {i + 1}
                    </a>
                ))}
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
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Employee Details</h2>}
        >
            <Head title={`Employee - ${user.name}`} />

            <div className="py-12">
                <div className="max-w-4xl sm:px-6 lg:px-8 space-y-6">
                    {/* Profile Header Card */}
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="bg-emerald-950 px-6 py-8">
                            <div className="flex items-center gap-5">
                                {user.photo ? (
                                    <img src={user.photo} alt={user.name} className="h-16 w-16 shrink-0 rounded-full object-cover" />
                                ) : (
                                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-emerald-800 text-xl font-bold text-white">
                                        {initials}
                                    </div>
                                )}
                                <div className="min-w-0 flex-1">
                                    <h3 className="text-xl font-semibold text-white truncate">{user.name}</h3>
                                    <p className="mt-1 text-sm text-emerald-200">{user.email}</p>
                                    {user.department && user.designation && (
                                        <p className="mt-1 text-xs text-emerald-300">{user.designation} — {user.department}</p>
                                    )}
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

                        {/* Basic Info */}
                        <div className="px-6 py-2">
                            <h4 className="pt-4 text-sm font-semibold uppercase tracking-wider text-gray-400">Contact Information</h4>
                            <dl className="divide-y divide-gray-100">
                                <InfoItem label="Contact Number" value={user.contact_number} />
                                <InfoItem label="Personal Email" value={user.personal_email} />
                                <InfoItem label="Phone (Alternate)" value={user.phone} />
                            </dl>

                            <h4 className="mt-6 pt-4 text-sm font-semibold uppercase tracking-wider text-gray-400">ICB Details</h4>
                            <dl className="divide-y divide-gray-100">
                                <InfoItem label="Department" value={user.department} />
                                <InfoItem label="Designation" value={user.designation} />
                                <InfoItem label="Date of Joining" value={user.date_of_joining} />
                                <InfoItem label="Submission Date" value={user.submission_date} />
                            </dl>

                            <h4 className="mt-6 pt-4 text-sm font-semibold uppercase tracking-wider text-gray-400">Emergency Contact</h4>
                            <dl className="divide-y divide-gray-100">
                                <InfoItem label="Name" value={user.emergency_contact_name} />
                                <InfoItem label="Number" value={user.emergency_contact_number} />
                                <InfoItem label="Relationship" value={user.emergency_contact_relationship} />
                            </dl>

                            <h4 className="mt-6 pt-4 text-sm font-semibold uppercase tracking-wider text-gray-400">Local Address (UAE)</h4>
                            <dl className="divide-y divide-gray-100">
                                <InfoItem label="Address Line" value={user.local_address_line} />
                                <InfoItem label="City" value={user.local_city} />
                                <InfoItem label="Emirate" value={user.local_emirate} />
                                <InfoItem label="PO Box" value={user.local_po_box} />
                            </dl>

                            <h4 className="mt-6 pt-4 text-sm font-semibold uppercase tracking-wider text-gray-400">Home Country Address</h4>
                            <dl className="divide-y divide-gray-100">
                                <InfoItem label="Address Line" value={user.home_address_line} />
                                <InfoItem label="City" value={user.home_city} />
                                <InfoItem label="State / Province" value={user.home_state} />
                                <InfoItem label="Country" value={user.home_country} />
                                <InfoItem label="Postal / ZIP Code" value={user.home_postal_code} />
                                <InfoItem label="Contact Number" value={user.home_contact_number} />
                            </dl>

                            <h4 className="mt-6 pt-4 text-sm font-semibold uppercase tracking-wider text-gray-400">Identity Documents</h4>
                            <dl className="divide-y divide-gray-100">
                                <DocLink label="Passport" url={user.passport} />
                                <DocLink label="Emirates ID" url={user.emirates_id} />
                                <DocLink label="VISA" url={user.visa} />
                                <DocLink label="Driving ID" url={user.driving_id} />
                                <DocLink label="Insurance" url={user.insurance} />
                                {!user.passport && !user.emirates_id && !user.visa && !user.driving_id && !user.insurance && (
                                    <div className="py-3 text-sm text-gray-400">No identity documents uploaded</div>
                                )}
                            </dl>

                            <h4 className="mt-6 pt-4 text-sm font-semibold uppercase tracking-wider text-gray-400">Employment Documents</h4>
                            <dl className="divide-y divide-gray-100">
                                <DocLinks label="Education Certificates" urls={user.education_certificates} />
                                <DocLink label="Offer Letter" url={user.offer_letter} />
                                <DocLink label="MOHRE Labour Contract" url={user.labour_contract} />
                                <DocLink label="NDA" url={user.nda} />
                                <DocLink label="Hand Book" url={user.handbook} />
                            </dl>

                            <h4 className="mt-6 pt-4 text-sm font-semibold uppercase tracking-wider text-gray-400">Goals</h4>
                            <dl className="divide-y divide-gray-100">
                                <DocLinks label="Personal Goal" urls={user.personal_goal} />
                                <DocLinks label="Professional Goal" urls={user.professional_goal} />
                                {(!user.personal_goal || user.personal_goal.length === 0) && (!user.professional_goal || user.professional_goal.length === 0) && (
                                    <div className="py-3 text-sm text-gray-400">No goal documents uploaded</div>
                                )}
                            </dl>

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
