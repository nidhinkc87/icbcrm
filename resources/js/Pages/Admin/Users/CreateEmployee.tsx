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
    const { data, setData, post, processing, errors } = useForm<Record<string, any>>({
        name: '',
        email: '',
        type: 'employee',
        phone: '',
        personal_email: '',
        contact_number: '',
        department: '',
        designation: '',
        date_of_joining: '',
        emergency_contact_name: '',
        emergency_contact_number: '',
        emergency_contact_relationship: '',
        local_address_line: '',
        local_city: '',
        local_emirate: '',
        local_po_box: '',
        home_address_line: '',
        home_city: '',
        home_state: '',
        home_country: '',
        home_postal_code: '',
        home_contact_number: '',
        photo: null,
        passport: null,
        emirates_id: null,
        visa: null,
        driving_id: null,
        insurance: null,
        education_certificates: [],
        offer_letter: null,
        labour_contract: null,
        nda: null,
        handbook: null,
        personal_goal: [],
        professional_goal: [],
        submission_date: '',
        role: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('admin.users.store'), { forceFormData: true });
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
                            {/* Basic Information */}
                            <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
                            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <InputLabel htmlFor="name" value="Employee Name *" />
                                    <TextInput id="name" value={data.name} className="mt-1 block w-full" isFocused={true} onChange={(e) => setData('name', e.target.value)} required />
                                    <InputError message={errors.name} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="email" value="Email (Login) *" />
                                    <TextInput id="email" type="email" value={data.email} className="mt-1 block w-full" onChange={(e) => setData('email', e.target.value)} required />
                                    <InputError message={errors.email} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="personal_email" value="Personal Email ID" />
                                    <TextInput id="personal_email" type="email" value={data.personal_email} className="mt-1 block w-full" onChange={(e) => setData('personal_email', e.target.value)} />
                                    <InputError message={errors.personal_email} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="contact_number" value="Contact Number" />
                                    <TextInput id="contact_number" value={data.contact_number} className="mt-1 block w-full" placeholder="+971 5x xxx xxxx" onChange={(e) => setData('contact_number', e.target.value)} />
                                    <InputError message={errors.contact_number} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="phone" value="Phone (Alternate)" />
                                    <TextInput id="phone" value={data.phone} className="mt-1 block w-full" onChange={(e) => setData('phone', e.target.value)} />
                                    <InputError message={errors.phone} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="photo" value="Latest Photo" />
                                    <input id="photo" type="file" accept="image/*" className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-emerald-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-emerald-700 hover:file:bg-emerald-100" onChange={(e) => setData('photo', e.target.files?.[0] || null)} />
                                    <InputError message={errors.photo} className="mt-2" />
                                </div>
                            </div>

                            {/* ICB Details */}
                            <h3 className="mt-8 border-t border-gray-200 pt-6 text-lg font-medium text-gray-900">ICB Details</h3>
                            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <InputLabel htmlFor="department" value="Department" />
                                    <TextInput id="department" value={data.department} className="mt-1 block w-full" onChange={(e) => setData('department', e.target.value)} />
                                    <InputError message={errors.department} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="designation" value="Designation" />
                                    <TextInput id="designation" value={data.designation} className="mt-1 block w-full" onChange={(e) => setData('designation', e.target.value)} />
                                    <InputError message={errors.designation} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="date_of_joining" value="Date of Joining" />
                                    <TextInput id="date_of_joining" type="date" value={data.date_of_joining} className="mt-1 block w-full" onChange={(e) => setData('date_of_joining', e.target.value)} />
                                    <InputError message={errors.date_of_joining} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="submission_date" value="Submission Date" />
                                    <TextInput id="submission_date" type="date" value={data.submission_date} className="mt-1 block w-full" onChange={(e) => setData('submission_date', e.target.value)} />
                                    <InputError message={errors.submission_date} className="mt-2" />
                                </div>
                            </div>

                            {/* Emergency Contact */}
                            <h3 className="mt-8 border-t border-gray-200 pt-6 text-lg font-medium text-gray-900">Emergency Contact</h3>
                            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                                <div>
                                    <InputLabel htmlFor="emergency_contact_name" value="Name" />
                                    <TextInput id="emergency_contact_name" value={data.emergency_contact_name} className="mt-1 block w-full" onChange={(e) => setData('emergency_contact_name', e.target.value)} />
                                    <InputError message={errors.emergency_contact_name} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="emergency_contact_number" value="Number" />
                                    <TextInput id="emergency_contact_number" value={data.emergency_contact_number} className="mt-1 block w-full" onChange={(e) => setData('emergency_contact_number', e.target.value)} />
                                    <InputError message={errors.emergency_contact_number} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="emergency_contact_relationship" value="Relationship" />
                                    <TextInput id="emergency_contact_relationship" value={data.emergency_contact_relationship} className="mt-1 block w-full" onChange={(e) => setData('emergency_contact_relationship', e.target.value)} />
                                    <InputError message={errors.emergency_contact_relationship} className="mt-2" />
                                </div>
                            </div>

                            {/* Local Address (UAE) */}
                            <h3 className="mt-8 border-t border-gray-200 pt-6 text-lg font-medium text-gray-900">Local Address (UAE)</h3>
                            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="sm:col-span-2">
                                    <InputLabel htmlFor="local_address_line" value="Address Line" />
                                    <TextInput id="local_address_line" value={data.local_address_line} className="mt-1 block w-full" placeholder="Building, Street, Area" onChange={(e) => setData('local_address_line', e.target.value)} />
                                    <InputError message={errors.local_address_line} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="local_city" value="City" />
                                    <TextInput id="local_city" value={data.local_city} className="mt-1 block w-full" onChange={(e) => setData('local_city', e.target.value)} />
                                    <InputError message={errors.local_city} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="local_emirate" value="Emirate" />
                                    <select id="local_emirate" value={data.local_emirate} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500" onChange={(e) => setData('local_emirate', e.target.value)}>
                                        <option value="">Select Emirate</option>
                                        {['Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman', 'Umm Al Quwain', 'Ras Al Khaimah', 'Fujairah'].map((e) => (
                                            <option key={e} value={e}>{e}</option>
                                        ))}
                                    </select>
                                    <InputError message={errors.local_emirate} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="local_po_box" value="PO Box" />
                                    <TextInput id="local_po_box" value={data.local_po_box} className="mt-1 block w-full" onChange={(e) => setData('local_po_box', e.target.value)} />
                                    <InputError message={errors.local_po_box} className="mt-2" />
                                </div>
                            </div>

                            {/* Home Country Address */}
                            <h3 className="mt-8 border-t border-gray-200 pt-6 text-lg font-medium text-gray-900">Home Country Address + Contact Details</h3>
                            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="sm:col-span-2">
                                    <InputLabel htmlFor="home_address_line" value="Address Line" />
                                    <TextInput id="home_address_line" value={data.home_address_line} className="mt-1 block w-full" placeholder="House/Flat, Street, Area" onChange={(e) => setData('home_address_line', e.target.value)} />
                                    <InputError message={errors.home_address_line} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="home_city" value="City" />
                                    <TextInput id="home_city" value={data.home_city} className="mt-1 block w-full" onChange={(e) => setData('home_city', e.target.value)} />
                                    <InputError message={errors.home_city} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="home_state" value="State / Province" />
                                    <TextInput id="home_state" value={data.home_state} className="mt-1 block w-full" onChange={(e) => setData('home_state', e.target.value)} />
                                    <InputError message={errors.home_state} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="home_country" value="Country" />
                                    <TextInput id="home_country" value={data.home_country} className="mt-1 block w-full" onChange={(e) => setData('home_country', e.target.value)} />
                                    <InputError message={errors.home_country} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="home_postal_code" value="Postal / ZIP Code" />
                                    <TextInput id="home_postal_code" value={data.home_postal_code} className="mt-1 block w-full" onChange={(e) => setData('home_postal_code', e.target.value)} />
                                    <InputError message={errors.home_postal_code} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="home_contact_number" value="Home Country Contact Number" />
                                    <TextInput id="home_contact_number" value={data.home_contact_number} className="mt-1 block w-full" placeholder="+91 xxxxx xxxxx" onChange={(e) => setData('home_contact_number', e.target.value)} />
                                    <InputError message={errors.home_contact_number} className="mt-2" />
                                </div>
                            </div>

                            {/* Identity Documents */}
                            <h3 className="mt-8 border-t border-gray-200 pt-6 text-lg font-medium text-gray-900">Identity Documents</h3>
                            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                {[
                                    { id: 'passport', label: 'Passport Copy (Both Pages)' },
                                    { id: 'emirates_id', label: 'Emirates ID Copy (Both Pages)' },
                                    { id: 'visa', label: 'VISA Copy (Both Pages)' },
                                    { id: 'driving_id', label: 'Driving ID Copy (Both Pages)' },
                                    { id: 'insurance', label: 'Insurance Copy (Both Pages)' },
                                ].map((doc) => (
                                    <div key={doc.id}>
                                        <InputLabel htmlFor={doc.id} value={doc.label} />
                                        <input id={doc.id} type="file" accept=".pdf,.jpg,.jpeg,.png" className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-emerald-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-emerald-700 hover:file:bg-emerald-100" onChange={(e) => setData(doc.id, e.target.files?.[0] || null)} />
                                        <InputError message={(errors as any)[doc.id]} className="mt-2" />
                                    </div>
                                ))}
                            </div>

                            {/* Education & Employment Documents */}
                            <h3 className="mt-8 border-t border-gray-200 pt-6 text-lg font-medium text-gray-900">Employment Documents</h3>
                            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <InputLabel htmlFor="education_certificates" value="Education Certificates (multiple)" />
                                    <input id="education_certificates" type="file" multiple accept=".pdf,.jpg,.jpeg,.png" className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-emerald-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-emerald-700 hover:file:bg-emerald-100" onChange={(e) => setData('education_certificates', e.target.files ? Array.from(e.target.files) : [])} />
                                    <InputError message={errors.education_certificates} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="offer_letter" value="Offer Letter - ICB" />
                                    <input id="offer_letter" type="file" accept=".pdf,.jpg,.jpeg,.png" className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-emerald-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-emerald-700 hover:file:bg-emerald-100" onChange={(e) => setData('offer_letter', e.target.files?.[0] || null)} />
                                    <InputError message={errors.offer_letter} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="labour_contract" value="MOHRE - Labour Contract" />
                                    <input id="labour_contract" type="file" accept=".pdf,.jpg,.jpeg,.png" className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-emerald-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-emerald-700 hover:file:bg-emerald-100" onChange={(e) => setData('labour_contract', e.target.files?.[0] || null)} />
                                    <InputError message={errors.labour_contract} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="nda" value="NDA - ICB" />
                                    <input id="nda" type="file" accept=".pdf,.jpg,.jpeg,.png" className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-emerald-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-emerald-700 hover:file:bg-emerald-100" onChange={(e) => setData('nda', e.target.files?.[0] || null)} />
                                    <InputError message={errors.nda} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="handbook" value="Hand Book - ICB" />
                                    <input id="handbook" type="file" accept=".pdf,.jpg,.jpeg,.png" className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-emerald-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-emerald-700 hover:file:bg-emerald-100" onChange={(e) => setData('handbook', e.target.files?.[0] || null)} />
                                    <InputError message={errors.handbook} className="mt-2" />
                                </div>
                            </div>

                            {/* Goals */}
                            <h3 className="mt-8 border-t border-gray-200 pt-6 text-lg font-medium text-gray-900">Goals</h3>
                            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <InputLabel htmlFor="personal_goal" value="Personal Goal - ICB (multiple)" />
                                    <input id="personal_goal" type="file" multiple accept=".pdf,.jpg,.jpeg,.png" className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-emerald-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-emerald-700 hover:file:bg-emerald-100" onChange={(e) => setData('personal_goal', e.target.files ? Array.from(e.target.files) : [])} />
                                    <InputError message={errors.personal_goal} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="professional_goal" value="Professional Goal - ICB (multiple)" />
                                    <input id="professional_goal" type="file" multiple accept=".pdf,.jpg,.jpeg,.png" className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-emerald-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-emerald-700 hover:file:bg-emerald-100" onChange={(e) => setData('professional_goal', e.target.files ? Array.from(e.target.files) : [])} />
                                    <InputError message={errors.professional_goal} className="mt-2" />
                                </div>
                            </div>

                            {/* Role */}
                            {roles.length > 0 && (
                                <>
                                    <h3 className="mt-8 border-t border-gray-200 pt-6 text-lg font-medium text-gray-900">Role</h3>
                                    <div className="mt-4 space-y-2">
                                        <label className="flex items-center gap-2">
                                            <input type="radio" name="role" className="border-gray-300 text-emerald-600 shadow-sm focus:ring-emerald-500" checked={data.role === ''} onChange={() => setData('role', '')} />
                                            <span className="text-sm text-gray-700">None</span>
                                        </label>
                                        {roles.map((r) => (
                                            <label key={r} className="flex items-center gap-2">
                                                <input type="radio" name="role" className="border-gray-300 text-emerald-600 shadow-sm focus:ring-emerald-500" checked={data.role === r} onChange={() => setData('role', r)} />
                                                <span className="text-sm text-gray-700 capitalize">{r}</span>
                                            </label>
                                        ))}
                                    </div>
                                    <InputError message={errors.role} className="mt-2" />
                                </>
                            )}

                            <div className="mt-6 flex items-center justify-end space-x-4">
                                <Link href={route('admin.users.index')} className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2">Cancel</Link>
                                <PrimaryButton disabled={processing}>Create Employee</PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
