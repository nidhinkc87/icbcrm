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

interface Props {
    roles: string[];
}

export default function CreatePartner({ roles }: Props) {
    const [data, setData] = useState({
        name: '', email: '', type: 'partner' as const, phone: '', company: '',
        legal_type: '', trade_license_no: '', issuing_authority: '',
        trade_license_issue_date: '', trade_license_expiry_date: '',
        moa_issue_date: '',
        bank_name: '', bank_branch: '', account_number: '', iban: '',
        address_line: '', emirate: '', city: '', po_box: '',
        contact_person_name: '', telephone: '',
    });
    const [tradeLicenseFile, setTradeLicenseFile] = useState<File | null>(null);
    const [moaFile, setMoaFile] = useState<File | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

    const setField = (key: string, value: string) => setData((prev) => ({ ...prev, [key]: value }));

    const fileInputClasses = 'mt-1 block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-emerald-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-emerald-700 hover:file:bg-emerald-100';

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        setProcessing(true);

        const formData = new FormData();
        Object.entries(data).forEach(([k, v]) => { if (v) formData.append(k, v); });
        formData.append('type', 'partner');
        if (tradeLicenseFile) formData.append('trade_license_file', tradeLicenseFile);
        if (moaFile) formData.append('moa_file', moaFile);

        router.post(route('admin.users.store'), formData, {
            forceFormData: true,
            onError: (errs) => setErrors(errs),
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Create Partner</h2>}>
            <Head title="Create Partner" />

            <div className="py-6">
                <div className="max-w-4xl px-4 sm:px-6 lg:px-8">
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

                            {/* Company / KYC Details */}
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

                            {/* Trade License */}
                            <h4 className="mt-6 text-sm font-semibold text-gray-700">Trade License</h4>
                            <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-3">
                                <div>
                                    <InputLabel htmlFor="trade_license_file" value="Trade License Copy" />
                                    <input id="trade_license_file" type="file" accept=".pdf,.jpg,.jpeg,.png" className={fileInputClasses} onChange={(e) => setTradeLicenseFile(e.target.files?.[0] ?? null)} />
                                    {tradeLicenseFile && <p className="mt-1 text-xs text-gray-500">{tradeLicenseFile.name}</p>}
                                    <InputError message={errors.trade_license_file} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="trade_license_issue_date" value="Issue Date" />
                                    <TextInput id="trade_license_issue_date" type="date" value={data.trade_license_issue_date} className="mt-1 block w-full" onChange={(e) => setField('trade_license_issue_date', e.target.value)} />
                                    <InputError message={errors.trade_license_issue_date} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="trade_license_expiry_date" value="Expiry Date" />
                                    <TextInput id="trade_license_expiry_date" type="date" value={data.trade_license_expiry_date} className="mt-1 block w-full" onChange={(e) => setField('trade_license_expiry_date', e.target.value)} />
                                    <InputError message={errors.trade_license_expiry_date} className="mt-2" />
                                </div>
                            </div>

                            {/* MOA */}
                            <h4 className="mt-6 text-sm font-semibold text-gray-700">MOA</h4>
                            <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-3">
                                <div>
                                    <InputLabel htmlFor="moa_file" value="MOA Copy" />
                                    <input id="moa_file" type="file" accept=".pdf,.jpg,.jpeg,.png" className={fileInputClasses} onChange={(e) => setMoaFile(e.target.files?.[0] ?? null)} />
                                    {moaFile && <p className="mt-1 text-xs text-gray-500">{moaFile.name}</p>}
                                    <InputError message={errors.moa_file} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="moa_issue_date" value="Issue Date" />
                                    <TextInput id="moa_issue_date" type="date" value={data.moa_issue_date} className="mt-1 block w-full" onChange={(e) => setField('moa_issue_date', e.target.value)} />
                                    <InputError message={errors.moa_issue_date} className="mt-2" />
                                </div>
                            </div>

                            {/* Bank Details */}
                            <h3 className="mt-8 border-t border-gray-200 pt-6 text-lg font-medium text-gray-900">Bank Details</h3>
                            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <InputLabel htmlFor="bank_name" value="Name of the Bank" />
                                    <TextInput id="bank_name" value={data.bank_name} className="mt-1 block w-full" onChange={(e) => setField('bank_name', e.target.value)} />
                                    <InputError message={errors.bank_name} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="bank_branch" value="Branch" />
                                    <TextInput id="bank_branch" value={data.bank_branch} className="mt-1 block w-full" onChange={(e) => setField('bank_branch', e.target.value)} />
                                    <InputError message={errors.bank_branch} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="account_number" value="Account Number" />
                                    <TextInput id="account_number" value={data.account_number} className="mt-1 block w-full" onChange={(e) => setField('account_number', e.target.value)} />
                                    <InputError message={errors.account_number} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="iban" value="IBAN Number" />
                                    <TextInput id="iban" value={data.iban} className="mt-1 block w-full" placeholder="AE00 0000 0000 0000 0000 000" onChange={(e) => setField('iban', e.target.value)} />
                                    <InputError message={errors.iban} className="mt-2" />
                                </div>
                            </div>

                            {/* Address Details */}
                            <h3 className="mt-8 border-t border-gray-200 pt-6 text-lg font-medium text-gray-900">Address Details</h3>
                            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="sm:col-span-2">
                                    <InputLabel htmlFor="address_line" value="Address" />
                                    <TextInput id="address_line" value={data.address_line} className="mt-1 block w-full" onChange={(e) => setField('address_line', e.target.value)} />
                                    <InputError message={errors.address_line} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="emirate" value="Emirate" />
                                    <SelectInput id="emirate" value={data.emirate} className="mt-1 block w-full" onChange={(e) => setField('emirate', e.target.value)}>
                                        <option value="">Select Emirate</option>
                                        {EMIRATES.map((em) => <option key={em} value={em}>{em}</option>)}
                                    </SelectInput>
                                    <InputError message={errors.emirate} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="city" value="City" />
                                    <TextInput id="city" value={data.city} className="mt-1 block w-full" onChange={(e) => setField('city', e.target.value)} />
                                    <InputError message={errors.city} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="po_box" value="P.O. Box" />
                                    <TextInput id="po_box" value={data.po_box} className="mt-1 block w-full" onChange={(e) => setField('po_box', e.target.value)} />
                                    <InputError message={errors.po_box} className="mt-2" />
                                </div>
                            </div>

                            {/* Contact Person */}
                            <h3 className="mt-8 border-t border-gray-200 pt-6 text-lg font-medium text-gray-900">Name of the Authorized Person</h3>
                            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <InputLabel htmlFor="contact_person_name" value="Name of the Authorized Person" />
                                    <TextInput id="contact_person_name" value={data.contact_person_name} className="mt-1 block w-full" onChange={(e) => setField('contact_person_name', e.target.value)} />
                                    <InputError message={errors.contact_person_name} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="telephone" value="Telephone No" />
                                    <TextInput id="telephone" value={data.telephone} className="mt-1 block w-full" onChange={(e) => setField('telephone', e.target.value)} />
                                    <InputError message={errors.telephone} className="mt-2" />
                                </div>
                            </div>

                            <div className="mt-8 flex items-center gap-4 border-t border-gray-200 pt-6">
                                <PrimaryButton disabled={processing}>
                                    {processing ? 'Creating...' : 'Create Partner'}
                                </PrimaryButton>
                                <Link href={route('admin.users.index', { role: 'partner' })} className="text-sm text-gray-600 underline hover:text-gray-900">
                                    Cancel
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
