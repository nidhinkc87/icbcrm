import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SelectInput from '@/Components/SelectInput';
import TextInput from '@/Components/TextInput';
import { Head, Link, router } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

const EMIRATES = ['Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman', 'Umm Al Quwain', 'Ras Al Khaimah', 'Fujairah'];
const LEGAL_TYPES = ['LLC', 'Sole Establishment', 'Free Zone Company', 'Branch Office', 'Civil Company', 'Partnership', 'Holding Company', 'Other'];
const ISSUING_AUTHORITIES = [
    'DED Abu Dhabi', 'DED Dubai', 'DED Sharjah', 'DED Ajman', 'DED Umm Al Quwain', 'DED Ras Al Khaimah', 'DED Fujairah',
    'DMCC', 'JAFZA', 'DAFZA', 'DIFC', 'ADGM', 'SAIF Zone', 'Hamriyah FZ', 'RAKEZ', 'Ajman FZ', 'UAQ FZ', 'Fujairah FZ',
    'Masdar City', 'KIZAD', 'Other',
];

function ViewCurrentLink({ url }: { url: string | null }) {
    if (!url) return null;
    return <a href={url} target="_blank" rel="noreferrer" className="mb-1 inline-block text-xs text-emerald-600 hover:underline">View current</a>;
}

interface Props {
    allRoles: string[];
    userRoles: string[];
    allCustomers: { id: number; name: string }[];
    user: {
        id: number; name: string; email: string;
        phone: string | null; company: string | null;
        legal_type: string | null; trade_license_no: string | null; issuing_authority: string | null;
        trade_license_file_url: string | null; trade_license_issue_date: string | null; trade_license_expiry_date: string | null;
        moa_file_url: string | null; moa_issue_date: string | null;
        bank_name: string | null; bank_branch: string | null; account_number: string | null; iban: string | null;
        address_line: string | null; city: string | null; emirate: string | null; po_box: string | null;
        contact_person_name: string | null; telephone: string | null;
        customer_ids: number[];
    };
}

export default function EditPartner({ user, allCustomers }: Props) {
    const [data, setData] = useState({
        name: user.name, email: user.email, phone: user.phone ?? '', company: user.company ?? '',
        legal_type: user.legal_type ?? '', trade_license_no: user.trade_license_no ?? '', issuing_authority: user.issuing_authority ?? '',
        trade_license_issue_date: user.trade_license_issue_date ?? '', trade_license_expiry_date: user.trade_license_expiry_date ?? '',
        moa_issue_date: user.moa_issue_date ?? '',
        bank_name: user.bank_name ?? '', bank_branch: user.bank_branch ?? '', account_number: user.account_number ?? '', iban: user.iban ?? '',
        address_line: user.address_line ?? '', emirate: user.emirate ?? '', city: user.city ?? '', po_box: user.po_box ?? '',
        contact_person_name: user.contact_person_name ?? '', telephone: user.telephone ?? '',
        customer_ids: user.customer_ids,
        password: '', password_confirmation: '',
    });
    const [tradeLicenseFile, setTradeLicenseFile] = useState<File | null>(null);
    const [moaFile, setMoaFile] = useState<File | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);
    const [customerSearch, setCustomerSearch] = useState('');

    const setField = (key: string, value: string) => setData((prev) => ({ ...prev, [key]: value }));
    const toggleCustomer = (id: number) => setData((prev) => ({
        ...prev,
        customer_ids: prev.customer_ids.includes(id) ? prev.customer_ids.filter((cid) => cid !== id) : [...prev.customer_ids, id],
    }));

    const filteredCustomers = allCustomers.filter((c) => c.name.toLowerCase().includes(customerSearch.toLowerCase()));
    const fileInputClasses = 'mt-1 block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-emerald-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-emerald-700 hover:file:bg-emerald-100';

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        setProcessing(true);

        const formData = new FormData();
        formData.append('_method', 'PUT');
        Object.entries(data).forEach(([k, v]) => {
            if (k === 'customer_ids') {
                (v as number[]).forEach((id) => formData.append('customer_ids[]', String(id)));
            } else if (v) {
                formData.append(k, v as string);
            }
        });
        if (tradeLicenseFile) formData.append('trade_license_file', tradeLicenseFile);
        if (moaFile) formData.append('moa_file', moaFile);

        router.post(route('admin.users.update', user.id), formData, {
            forceFormData: true,
            onError: (errs) => setErrors(errs),
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Edit Partner</h2>}>
            <Head title="Edit Partner" />

            <div className="py-6">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white p-6 shadow sm:rounded-lg">
                        <form onSubmit={submit}>
                            {/* Basic Info */}
                            <h3 className="text-lg font-medium text-gray-900">Partner Details</h3>
                            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <InputLabel htmlFor="name" value="Name *" />
                                    <TextInput id="name" value={data.name} className="mt-1 block w-full" onChange={(e) => setField('name', e.target.value)} required />
                                    <InputError message={errors.name} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="company" value="Company" />
                                    <TextInput id="company" value={data.company} className="mt-1 block w-full" onChange={(e) => setField('company', e.target.value)} />
                                    <InputError message={errors.company} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="email" value="Email ID *" />
                                    <TextInput id="email" type="email" value={data.email} className="mt-1 block w-full" onChange={(e) => setField('email', e.target.value)} required />
                                    <InputError message={errors.email} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="phone" value="Contact" />
                                    <TextInput id="phone" value={data.phone} className="mt-1 block w-full" placeholder="+971 5x xxx xxxx" onChange={(e) => setField('phone', e.target.value)} />
                                    <InputError message={errors.phone} className="mt-2" />
                                </div>
                            </div>

                            {/* Password */}
                            <h3 className="mt-8 border-t border-gray-200 pt-6 text-lg font-medium text-gray-900">Change Password</h3>
                            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <InputLabel htmlFor="password" value="New Password" />
                                    <TextInput id="password" type="password" value={data.password} className="mt-1 block w-full" onChange={(e) => setField('password', e.target.value)} />
                                    <InputError message={errors.password} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="password_confirmation" value="Confirm Password" />
                                    <TextInput id="password_confirmation" type="password" value={data.password_confirmation} className="mt-1 block w-full" onChange={(e) => setField('password_confirmation', e.target.value)} />
                                </div>
                            </div>

                            {/* KYC */}
                            <h3 className="mt-8 border-t border-gray-200 pt-6 text-lg font-medium text-gray-900">KYC Details</h3>
                            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <InputLabel htmlFor="legal_type" value="Legal Type" />
                                    <SelectInput id="legal_type" value={data.legal_type} className="mt-1 block w-full" onChange={(e) => setField('legal_type', e.target.value)}>
                                        <option value="">Select Legal Type</option>
                                        {LEGAL_TYPES.map((lt) => <option key={lt} value={lt}>{lt}</option>)}
                                    </SelectInput>
                                    <InputError message={errors.legal_type} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="trade_license_no" value="Trade License No" />
                                    <TextInput id="trade_license_no" value={data.trade_license_no} className="mt-1 block w-full" onChange={(e) => setField('trade_license_no', e.target.value)} />
                                    <InputError message={errors.trade_license_no} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="issuing_authority" value="Issuing Authority" />
                                    <SelectInput id="issuing_authority" value={data.issuing_authority} className="mt-1 block w-full" onChange={(e) => setField('issuing_authority', e.target.value)}>
                                        <option value="">Select Issuing Authority</option>
                                        {ISSUING_AUTHORITIES.map((ia) => <option key={ia} value={ia}>{ia}</option>)}
                                    </SelectInput>
                                    <InputError message={errors.issuing_authority} className="mt-2" />
                                </div>
                            </div>

                            <h4 className="mt-6 text-sm font-semibold text-gray-700">Trade License</h4>
                            <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-3">
                                <div>
                                    <InputLabel htmlFor="trade_license_file" value="Trade License Copy" />
                                    <ViewCurrentLink url={user.trade_license_file_url} />
                                    <input id="trade_license_file" type="file" accept=".pdf,.jpg,.jpeg,.png" className={fileInputClasses} onChange={(e) => setTradeLicenseFile(e.target.files?.[0] ?? null)} />
                                    <InputError message={errors.trade_license_file} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="trade_license_issue_date" value="Issue Date" />
                                    <TextInput id="trade_license_issue_date" type="date" value={data.trade_license_issue_date} className="mt-1 block w-full" onChange={(e) => setField('trade_license_issue_date', e.target.value)} />
                                </div>
                                <div>
                                    <InputLabel htmlFor="trade_license_expiry_date" value="Expiry Date" />
                                    <TextInput id="trade_license_expiry_date" type="date" value={data.trade_license_expiry_date} className="mt-1 block w-full" onChange={(e) => setField('trade_license_expiry_date', e.target.value)} />
                                </div>
                            </div>

                            <h4 className="mt-6 text-sm font-semibold text-gray-700">MOA</h4>
                            <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-3">
                                <div>
                                    <InputLabel htmlFor="moa_file" value="MOA Copy" />
                                    <ViewCurrentLink url={user.moa_file_url} />
                                    <input id="moa_file" type="file" accept=".pdf,.jpg,.jpeg,.png" className={fileInputClasses} onChange={(e) => setMoaFile(e.target.files?.[0] ?? null)} />
                                </div>
                                <div>
                                    <InputLabel htmlFor="moa_issue_date" value="Issue Date" />
                                    <TextInput id="moa_issue_date" type="date" value={data.moa_issue_date} className="mt-1 block w-full" onChange={(e) => setField('moa_issue_date', e.target.value)} />
                                </div>
                            </div>

                            {/* Bank */}
                            <h3 className="mt-8 border-t border-gray-200 pt-6 text-lg font-medium text-gray-900">Bank Details</h3>
                            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <InputLabel htmlFor="bank_name" value="Name of the Bank" />
                                    <TextInput id="bank_name" value={data.bank_name} className="mt-1 block w-full" onChange={(e) => setField('bank_name', e.target.value)} />
                                </div>
                                <div>
                                    <InputLabel htmlFor="bank_branch" value="Branch" />
                                    <TextInput id="bank_branch" value={data.bank_branch} className="mt-1 block w-full" onChange={(e) => setField('bank_branch', e.target.value)} />
                                </div>
                                <div>
                                    <InputLabel htmlFor="account_number" value="Account Number" />
                                    <TextInput id="account_number" value={data.account_number} className="mt-1 block w-full" onChange={(e) => setField('account_number', e.target.value)} />
                                </div>
                                <div>
                                    <InputLabel htmlFor="iban" value="IBAN Number" />
                                    <TextInput id="iban" value={data.iban} className="mt-1 block w-full" placeholder="AE00 0000 0000 0000 0000 000" onChange={(e) => setField('iban', e.target.value)} />
                                </div>
                            </div>

                            {/* Address */}
                            <h3 className="mt-8 border-t border-gray-200 pt-6 text-lg font-medium text-gray-900">Address Details</h3>
                            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="sm:col-span-2">
                                    <InputLabel htmlFor="address_line" value="Address" />
                                    <TextInput id="address_line" value={data.address_line} className="mt-1 block w-full" onChange={(e) => setField('address_line', e.target.value)} />
                                </div>
                                <div>
                                    <InputLabel htmlFor="emirate" value="Emirate" />
                                    <SelectInput id="emirate" value={data.emirate} className="mt-1 block w-full" onChange={(e) => setField('emirate', e.target.value)}>
                                        <option value="">Select Emirate</option>
                                        {EMIRATES.map((em) => <option key={em} value={em}>{em}</option>)}
                                    </SelectInput>
                                </div>
                                <div>
                                    <InputLabel htmlFor="city" value="City" />
                                    <TextInput id="city" value={data.city} className="mt-1 block w-full" onChange={(e) => setField('city', e.target.value)} />
                                </div>
                                <div>
                                    <InputLabel htmlFor="po_box" value="P.O. Box" />
                                    <TextInput id="po_box" value={data.po_box} className="mt-1 block w-full" onChange={(e) => setField('po_box', e.target.value)} />
                                </div>
                            </div>

                            {/* Contact */}
                            <h3 className="mt-8 border-t border-gray-200 pt-6 text-lg font-medium text-gray-900">Name of the Authorized Person</h3>
                            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <InputLabel htmlFor="contact_person_name" value="Name of the Authorized Person" />
                                    <TextInput id="contact_person_name" value={data.contact_person_name} className="mt-1 block w-full" onChange={(e) => setField('contact_person_name', e.target.value)} />
                                </div>
                                <div>
                                    <InputLabel htmlFor="telephone" value="Telephone No" />
                                    <TextInput id="telephone" value={data.telephone} className="mt-1 block w-full" onChange={(e) => setField('telephone', e.target.value)} />
                                </div>
                            </div>

                            {/* Assign Customers */}
                            <h3 className="mt-8 border-t border-gray-200 pt-6 text-lg font-medium text-gray-900">Assign Customers</h3>
                            <p className="text-sm text-gray-500">Select customers this partner will manage.</p>
                            <TextInput value={customerSearch} className="mt-2 block w-full" placeholder="Search customers..." onChange={(e) => setCustomerSearch(e.target.value)} />
                            <div className="mt-3 max-h-60 overflow-y-auto rounded-md border border-gray-200">
                                {filteredCustomers.length === 0 && <p className="px-4 py-3 text-sm text-gray-400">No customers found.</p>}
                                {filteredCustomers.map((c) => (
                                    <label key={c.id} className="flex cursor-pointer items-center gap-3 border-b border-gray-100 px-4 py-2 hover:bg-gray-50 last:border-0">
                                        <input type="checkbox" checked={data.customer_ids.includes(c.id)} onChange={() => toggleCustomer(c.id)} className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                                        <span className="text-sm text-gray-700">{c.name}</span>
                                    </label>
                                ))}
                            </div>
                            {data.customer_ids.length > 0 && <p className="mt-1 text-sm text-gray-500">{data.customer_ids.length} customer(s) selected</p>}

                            <div className="mt-8 flex items-center gap-4 border-t border-gray-200 pt-6">
                                <PrimaryButton disabled={processing}>{processing ? 'Saving...' : 'Update Partner'}</PrimaryButton>
                                <Link href={route('admin.users.index', { role: 'partner' })} className="text-sm text-gray-600 underline hover:text-gray-900">Cancel</Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
