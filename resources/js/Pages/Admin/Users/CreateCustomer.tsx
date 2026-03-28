import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SelectInput from '@/Components/SelectInput';
import TextInput from '@/Components/TextInput';
import { Head, Link, router } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

const EMIRATES = [
    'Abu Dhabi',
    'Dubai',
    'Sharjah',
    'Ajman',
    'Umm Al Quwain',
    'Ras Al Khaimah',
    'Fujairah',
];

const LEGAL_TYPES = [
    'LLC',
    'Sole Establishment',
    'Free Zone Company',
    'Branch Office',
    'Civil Company',
    'Partnership',
    'Holding Company',
    'Other',
];

const ISSUING_AUTHORITIES = [
    'DED Abu Dhabi',
    'DED Dubai',
    'DED Sharjah',
    'DED Ajman',
    'DED Umm Al Quwain',
    'DED Ras Al Khaimah',
    'DED Fujairah',
    'DMCC',
    'JAFZA',
    'DAFZA',
    'DIFC',
    'ADGM',
    'SAIF Zone',
    'Hamriyah FZ',
    'RAKEZ',
    'Ajman FZ',
    'UAQ FZ',
    'Fujairah FZ',
    'Masdar City',
    'KIZAD',
    'Other',
];

interface Partner {
    name: string;
    emirates_id_no: string;
    emirates_id_file: File | null;
    passport_no: string;
    passport_file: File | null;
    emirates_id_expiry: string;
    passport_expiry: string;
}

interface Branch {
    name: string;
    trade_license_no: string;
    issuing_authority: string;
    moa_file: File | null;
    issue_date: string;
    expiry_date: string;
}

interface Props {
    roles: string[];
}

const emptyPartner = (): Partner => ({
    name: '',
    emirates_id_no: '',
    emirates_id_file: null,
    passport_no: '',
    passport_file: null,
    emirates_id_expiry: '',
    passport_expiry: '',
});

const emptyBranch = (): Branch => ({
    name: '',
    trade_license_no: '',
    issuing_authority: '',
    moa_file: null,
    issue_date: '',
    expiry_date: '',
});

export default function CreateCustomer({ roles }: Props) {
    // Section 1: Company Details
    const [data, setData] = useState({
        name: '',
        email: '',
        type: 'customer' as const,
        legal_type: '',
        trade_license_no: '',
        issuing_authority: '',
        trade_license_issue_date: '',
        trade_license_expiry_date: '',
        // Section 3: Bank Details
        bank_name: '',
        bank_branch: '',
        account_number: '',
        iban: '',
        // Section 4: Address Details
        address_line: '',
        emirate: '',
        city: '',
        country: 'UAE',
        po_box: '',
        // Section 5: Contact Details
        contact_person_name: '',
        phone: '',
        telephone: '',
    });

    const [tradeLicenseFile, setTradeLicenseFile] = useState<File | null>(null);
    const [moaFile, setMoaFile] = useState<File | null>(null);

    // Section 2: Partners
    const [partners, setPartners] = useState<Partner[]>([emptyPartner()]);

    // Section 6: Branches
    const [branches, setBranches] = useState<Branch[]>([]);

    const [selectedRole, setSelectedRole] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

    const setField = (key: string, value: string) => {
        setData((prev) => ({ ...prev, [key]: value }));
    };

    // Partner helpers
    const addPartner = () => {
        setPartners((prev) => [...prev, emptyPartner()]);
    };

    const updatePartner = (index: number, key: keyof Partner, value: string | File | null) => {
        setPartners((prev) => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [key]: value };
            return updated;
        });
    };

    const removePartner = (index: number) => {
        setPartners((prev) => prev.filter((_, i) => i !== index));
    };

    // Branch helpers
    const addBranch = () => {
        setBranches((prev) => [...prev, emptyBranch()]);
    };

    const updateBranch = (index: number, key: keyof Branch, value: string | File | null) => {
        setBranches((prev) => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [key]: value };
            return updated;
        });
    };

    const removeBranch = (index: number) => {
        setBranches((prev) => prev.filter((_, i) => i !== index));
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        setProcessing(true);

        const formData = new FormData();

        // Basic fields
        formData.append('name', data.name);
        formData.append('email', data.email);
        formData.append('type', data.type);
        formData.append('legal_type', data.legal_type);
        formData.append('trade_license_no', data.trade_license_no);
        formData.append('issuing_authority', data.issuing_authority);
        formData.append('trade_license_issue_date', data.trade_license_issue_date);
        formData.append('trade_license_expiry_date', data.trade_license_expiry_date);
        formData.append('phone', data.phone);
        formData.append('address_line', data.address_line);
        formData.append('city', data.city);
        formData.append('emirate', data.emirate);
        formData.append('country', data.country);
        formData.append('po_box', data.po_box);
        formData.append('contact_person_name', data.contact_person_name);
        formData.append('telephone', data.telephone);

        // Company docs
        if (tradeLicenseFile) formData.append('trade_license_file', tradeLicenseFile);
        if (moaFile) formData.append('moa_file', moaFile);

        // Bank details
        formData.append('bank_name', data.bank_name);
        formData.append('bank_branch', data.bank_branch);
        formData.append('account_number', data.account_number);
        formData.append('iban', data.iban);

        // Partners
        partners.forEach((partner, index) => {
            formData.append(`partners[${index}][name]`, partner.name);
            formData.append(`partners[${index}][emirates_id_no]`, partner.emirates_id_no);
            if (partner.emirates_id_file) {
                formData.append(`partners[${index}][emirates_id_file]`, partner.emirates_id_file);
            }
            formData.append(`partners[${index}][passport_no]`, partner.passport_no);
            if (partner.passport_file) {
                formData.append(`partners[${index}][passport_file]`, partner.passport_file);
            }
            formData.append(`partners[${index}][emirates_id_expiry]`, partner.emirates_id_expiry);
            formData.append(`partners[${index}][passport_expiry]`, partner.passport_expiry);
        });

        // Branches
        branches.forEach((branch, index) => {
            formData.append(`branches[${index}][name]`, branch.name);
            formData.append(`branches[${index}][trade_license_no]`, branch.trade_license_no);
            formData.append(`branches[${index}][issuing_authority]`, branch.issuing_authority);
            if (branch.moa_file) {
                formData.append(`branches[${index}][moa_file]`, branch.moa_file);
            }
            formData.append(`branches[${index}][issue_date]`, branch.issue_date);
            formData.append(`branches[${index}][expiry_date]`, branch.expiry_date);
        });

        // Role
        if (selectedRole) {
            formData.append('role', selectedRole);
        }

        router.post(route('admin.users.store'), formData, {
            forceFormData: true,
            onError: (errs) => setErrors(errs),
            onFinish: () => setProcessing(false),
        });
    };

    const fileInputClasses =
        'mt-1 block w-full text-sm text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-emerald-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-emerald-700 hover:file:bg-emerald-100';

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Create Customer
                </h2>
            }
        >
            <Head title="Create Customer" />

            <div className="py-12">
                <div className="max-w-4xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white p-6 shadow-sm sm:rounded-lg">
                        <form onSubmit={submit}>
                            {/* ── Section 1: Company Details ── */}
                            <h3 className="text-lg font-medium text-gray-900">
                                Company Details
                            </h3>
                            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <InputLabel htmlFor="name" value="Name of Establishment *" />
                                    <TextInput
                                        id="name"
                                        value={data.name}
                                        className="mt-1 block w-full"
                                        isFocused={true}
                                        onChange={(e) => setField('name', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.name} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="email" value="Email *" />
                                    <TextInput
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setField('email', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.email} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="legal_type" value="Legal Type *" />
                                    <SelectInput
                                        id="legal_type"
                                        value={data.legal_type}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setField('legal_type', e.target.value)}
                                        required
                                    >
                                        <option value="">Select Legal Type</option>
                                        {LEGAL_TYPES.map((lt) => (
                                            <option key={lt} value={lt}>{lt}</option>
                                        ))}
                                    </SelectInput>
                                    <InputError message={errors.legal_type} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="trade_license_no" value="Trade License No *" />
                                    <TextInput
                                        id="trade_license_no"
                                        value={data.trade_license_no}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setField('trade_license_no', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.trade_license_no} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="issuing_authority" value="Issuing Authority *" />
                                    <SelectInput
                                        id="issuing_authority"
                                        value={data.issuing_authority}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setField('issuing_authority', e.target.value)}
                                        required
                                    >
                                        <option value="">Select Issuing Authority</option>
                                        {ISSUING_AUTHORITIES.map((ia) => (
                                            <option key={ia} value={ia}>{ia}</option>
                                        ))}
                                    </SelectInput>
                                    <InputError message={errors.issuing_authority} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="trade_license_file" value="Trade License Copy *" />
                                    <input
                                        id="trade_license_file"
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        className={fileInputClasses}
                                        onChange={(e) => setTradeLicenseFile(e.target.files?.[0] ?? null)}
                                        required
                                    />
                                    {tradeLicenseFile && (
                                        <p className="mt-1 text-xs text-gray-500">{tradeLicenseFile.name}</p>
                                    )}
                                    <InputError message={errors.trade_license_file} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="moa_file" value="MOA Copy *" />
                                    <input
                                        id="moa_file"
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        className={fileInputClasses}
                                        onChange={(e) => setMoaFile(e.target.files?.[0] ?? null)}
                                        required
                                    />
                                    {moaFile && (
                                        <p className="mt-1 text-xs text-gray-500">{moaFile.name}</p>
                                    )}
                                    <InputError message={errors.moa_file} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="trade_license_issue_date" value="Trade License & MOA Issue Date *" />
                                    <TextInput
                                        id="trade_license_issue_date"
                                        type="date"
                                        value={data.trade_license_issue_date}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setField('trade_license_issue_date', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.trade_license_issue_date} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="trade_license_expiry_date" value="Trade License & MOA Expiry Date *" />
                                    <TextInput
                                        id="trade_license_expiry_date"
                                        type="date"
                                        value={data.trade_license_expiry_date}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setField('trade_license_expiry_date', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.trade_license_expiry_date} className="mt-2" />
                                </div>
                            </div>

                            {/* ── Section 2: Partner/Manager Details ── */}
                            <h3 className="mt-8 border-t border-gray-200 pt-6 text-lg font-medium text-gray-900">
                                Partner / Manager Details
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Add details for each partner or manager of the establishment.
                            </p>

                            <div className="mt-4 space-y-4">
                                {partners.map((partner, index) => (
                                    <div
                                        key={index}
                                        className="rounded-lg border border-gray-200 bg-gray-50 p-4"
                                    >
                                        <div className="mb-3 flex items-center justify-between">
                                            <span className="text-sm font-semibold text-gray-700">
                                                Partner {index + 1}
                                            </span>
                                            {partners.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removePartner(index)}
                                                    className="text-sm text-red-500 hover:text-red-700"
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                            <div>
                                                <InputLabel value="Name *" />
                                                <TextInput
                                                    value={partner.name}
                                                    className="mt-1 block w-full"
                                                    onChange={(e) => updatePartner(index, 'name', e.target.value)}
                                                    required
                                                />
                                                <InputError message={errors[`partners.${index}.name`]} className="mt-2" />
                                            </div>

                                            <div>
                                                <InputLabel value="Emirates ID No *" />
                                                <TextInput
                                                    value={partner.emirates_id_no}
                                                    className="mt-1 block w-full"
                                                    onChange={(e) => updatePartner(index, 'emirates_id_no', e.target.value)}
                                                    required
                                                />
                                                <InputError message={errors[`partners.${index}.emirates_id_no`]} className="mt-2" />
                                            </div>

                                            <div>
                                                <InputLabel value="Emirates ID Copy *" />
                                                <input
                                                    type="file"
                                                    accept=".pdf,.jpg,.jpeg,.png"
                                                    className={fileInputClasses}
                                                    onChange={(e) => updatePartner(index, 'emirates_id_file', e.target.files?.[0] ?? null)}
                                                    required
                                                />
                                                {partner.emirates_id_file && (
                                                    <p className="mt-1 text-xs text-gray-500">{partner.emirates_id_file.name}</p>
                                                )}
                                                <InputError message={errors[`partners.${index}.emirates_id_file`]} className="mt-2" />
                                            </div>

                                            <div>
                                                <InputLabel value="Passport No *" />
                                                <TextInput
                                                    value={partner.passport_no}
                                                    className="mt-1 block w-full"
                                                    onChange={(e) => updatePartner(index, 'passport_no', e.target.value)}
                                                    required
                                                />
                                                <InputError message={errors[`partners.${index}.passport_no`]} className="mt-2" />
                                            </div>

                                            <div>
                                                <InputLabel value="Passport Copy *" />
                                                <input
                                                    type="file"
                                                    accept=".pdf,.jpg,.jpeg,.png"
                                                    className={fileInputClasses}
                                                    onChange={(e) => updatePartner(index, 'passport_file', e.target.files?.[0] ?? null)}
                                                    required
                                                />
                                                {partner.passport_file && (
                                                    <p className="mt-1 text-xs text-gray-500">{partner.passport_file.name}</p>
                                                )}
                                                <InputError message={errors[`partners.${index}.passport_file`]} className="mt-2" />
                                            </div>

                                            <div>
                                                <InputLabel value="Emirates ID Expiry Date *" />
                                                <TextInput
                                                    type="date"
                                                    value={partner.emirates_id_expiry}
                                                    className="mt-1 block w-full"
                                                    onChange={(e) => updatePartner(index, 'emirates_id_expiry', e.target.value)}
                                                    required
                                                />
                                                <InputError message={errors[`partners.${index}.emirates_id_expiry`]} className="mt-2" />
                                            </div>

                                            <div>
                                                <InputLabel value="Passport Expiry Date *" />
                                                <TextInput
                                                    type="date"
                                                    value={partner.passport_expiry}
                                                    className="mt-1 block w-full"
                                                    onChange={(e) => updatePartner(index, 'passport_expiry', e.target.value)}
                                                    required
                                                />
                                                <InputError message={errors[`partners.${index}.passport_expiry`]} className="mt-2" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button
                                type="button"
                                onClick={addPartner}
                                className="mt-3 text-sm text-emerald-600 hover:text-emerald-500"
                            >
                                + Add Partner
                            </button>

                            {/* ── Section 3: Bank Details ── */}
                            <h3 className="mt-8 border-t border-gray-200 pt-6 text-lg font-medium text-gray-900">
                                Bank Details
                            </h3>
                            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <InputLabel htmlFor="bank_name" value="Name of the Bank *" />
                                    <TextInput
                                        id="bank_name"
                                        value={data.bank_name}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setField('bank_name', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.bank_name} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="bank_branch" value="Branch" />
                                    <TextInput
                                        id="bank_branch"
                                        value={data.bank_branch}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setField('bank_branch', e.target.value)}
                                    />
                                    <InputError message={errors.bank_branch} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="account_number" value="Account Number" />
                                    <TextInput
                                        id="account_number"
                                        value={data.account_number}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setField('account_number', e.target.value)}
                                    />
                                    <InputError message={errors.account_number} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="iban" value="IBAN Number *" />
                                    <TextInput
                                        id="iban"
                                        value={data.iban}
                                        className="mt-1 block w-full"
                                        placeholder="AE00 0000 0000 0000 0000 000"
                                        onChange={(e) => setField('iban', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.iban} className="mt-2" />
                                </div>
                            </div>

                            {/* ── Section 4: Address Details ── */}
                            <h3 className="mt-8 border-t border-gray-200 pt-6 text-lg font-medium text-gray-900">
                                Address Details
                            </h3>
                            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="sm:col-span-2">
                                    <InputLabel htmlFor="address_line" value="Company Address *" />
                                    <TextInput
                                        id="address_line"
                                        value={data.address_line}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setField('address_line', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.address_line} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="emirate" value="Emirate *" />
                                    <SelectInput
                                        id="emirate"
                                        value={data.emirate}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setField('emirate', e.target.value)}
                                        required
                                    >
                                        <option value="">Select Emirate</option>
                                        {EMIRATES.map((em) => (
                                            <option key={em} value={em}>{em}</option>
                                        ))}
                                    </SelectInput>
                                    <InputError message={errors.emirate} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="city" value="City *" />
                                    <TextInput
                                        id="city"
                                        value={data.city}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setField('city', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.city} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="po_box" value="PO Box" />
                                    <TextInput
                                        id="po_box"
                                        value={data.po_box}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setField('po_box', e.target.value)}
                                    />
                                    <InputError message={errors.po_box} className="mt-2" />
                                </div>
                            </div>

                            {/* ── Section 5: Contact Details ── */}
                            <h3 className="mt-8 border-t border-gray-200 pt-6 text-lg font-medium text-gray-900">
                                Contact Details
                            </h3>
                            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <InputLabel htmlFor="contact_person_name" value="Name of Contact Person *" />
                                    <TextInput
                                        id="contact_person_name"
                                        value={data.contact_person_name}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setField('contact_person_name', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.contact_person_name} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="phone" value="Mobile No *" />
                                    <TextInput
                                        id="phone"
                                        value={data.phone}
                                        className="mt-1 block w-full"
                                        placeholder="+971 5x xxx xxxx"
                                        onChange={(e) => setField('phone', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.phone} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="telephone" value="Telephone No" />
                                    <TextInput
                                        id="telephone"
                                        value={data.telephone}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setField('telephone', e.target.value)}
                                    />
                                    <InputError message={errors.telephone} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="contact_email" value="Email ID *" />
                                    <TextInput
                                        id="contact_email"
                                        type="email"
                                        value={data.email}
                                        className="mt-1 block w-full"
                                        disabled
                                    />
                                    <p className="mt-1 text-xs text-gray-400">
                                        Same as login email above. Change it there if needed.
                                    </p>
                                </div>
                            </div>

                            {/* ── Section 6: Branch Details (Optional) ── */}
                            <h3 className="mt-8 border-t border-gray-200 pt-6 text-lg font-medium text-gray-900">
                                Branch Details
                                <span className="ml-2 text-sm font-normal text-gray-400">(Optional)</span>
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Add branch details if the establishment has additional branches.
                            </p>

                            {branches.length > 0 && (
                                <div className="mt-4 space-y-4">
                                    {branches.map((branch, index) => (
                                        <div
                                            key={index}
                                            className="rounded-lg border border-gray-200 bg-gray-50 p-4"
                                        >
                                            <div className="mb-3 flex items-center justify-between">
                                                <span className="text-sm font-semibold text-gray-700">
                                                    Branch {index + 1}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeBranch(index)}
                                                    className="text-sm text-red-500 hover:text-red-700"
                                                >
                                                    Remove
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                                <div>
                                                    <InputLabel value="Name of the Branch *" />
                                                    <TextInput
                                                        value={branch.name}
                                                        className="mt-1 block w-full"
                                                        onChange={(e) => updateBranch(index, 'name', e.target.value)}
                                                        required
                                                    />
                                                    <InputError message={errors[`branches.${index}.name`]} className="mt-2" />
                                                </div>

                                                <div>
                                                    <InputLabel value="Trade License No *" />
                                                    <TextInput
                                                        value={branch.trade_license_no}
                                                        className="mt-1 block w-full"
                                                        onChange={(e) => updateBranch(index, 'trade_license_no', e.target.value)}
                                                        required
                                                    />
                                                    <InputError message={errors[`branches.${index}.trade_license_no`]} className="mt-2" />
                                                </div>

                                                <div>
                                                    <InputLabel value="Issuing Authority *" />
                                                    <SelectInput
                                                        value={branch.issuing_authority}
                                                        className="mt-1 block w-full"
                                                        onChange={(e) => updateBranch(index, 'issuing_authority', e.target.value)}
                                                        required
                                                    >
                                                        <option value="">Select Issuing Authority</option>
                                                        {ISSUING_AUTHORITIES.map((ia) => (
                                                            <option key={ia} value={ia}>{ia}</option>
                                                        ))}
                                                    </SelectInput>
                                                    <InputError message={errors[`branches.${index}.issuing_authority`]} className="mt-2" />
                                                </div>

                                                <div>
                                                    <InputLabel value="MOA Copy" />
                                                    <input
                                                        type="file"
                                                        accept=".pdf,.jpg,.jpeg,.png"
                                                        className={fileInputClasses}
                                                        onChange={(e) => updateBranch(index, 'moa_file', e.target.files?.[0] ?? null)}
                                                    />
                                                    {branch.moa_file && (
                                                        <p className="mt-1 text-xs text-gray-500">{branch.moa_file.name}</p>
                                                    )}
                                                    <InputError message={errors[`branches.${index}.moa_file`]} className="mt-2" />
                                                </div>

                                                <div>
                                                    <InputLabel value="Trade License & MOA Issue Date *" />
                                                    <TextInput
                                                        type="date"
                                                        value={branch.issue_date}
                                                        className="mt-1 block w-full"
                                                        onChange={(e) => updateBranch(index, 'issue_date', e.target.value)}
                                                        required
                                                    />
                                                    <InputError message={errors[`branches.${index}.issue_date`]} className="mt-2" />
                                                </div>

                                                <div>
                                                    <InputLabel value="Trade License & MOA Expiry Date *" />
                                                    <TextInput
                                                        type="date"
                                                        value={branch.expiry_date}
                                                        className="mt-1 block w-full"
                                                        onChange={(e) => updateBranch(index, 'expiry_date', e.target.value)}
                                                        required
                                                    />
                                                    <InputError message={errors[`branches.${index}.expiry_date`]} className="mt-2" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={addBranch}
                                className="mt-3 text-sm text-emerald-600 hover:text-emerald-500"
                            >
                                + Add Branch
                            </button>

                            {/* ── Role ── */}
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
                                                checked={selectedRole === ''}
                                                onChange={() => setSelectedRole('')}
                                            />
                                            <span className="text-sm text-gray-700">None</span>
                                        </label>
                                        {roles.map((r) => (
                                            <label key={r} className="flex items-center gap-2">
                                                <input
                                                    type="radio"
                                                    name="role"
                                                    className="border-gray-300 text-emerald-600 shadow-sm focus:ring-emerald-500"
                                                    checked={selectedRole === r}
                                                    onChange={() => setSelectedRole(r)}
                                                />
                                                <span className="text-sm text-gray-700 capitalize">{r}</span>
                                            </label>
                                        ))}
                                    </div>
                                    <InputError message={errors.role} className="mt-2" />
                                </>
                            )}

                            {/* ── Submit ── */}
                            <div className="mt-8 flex items-center justify-end space-x-4 border-t border-gray-200 pt-6">
                                <Link
                                    href={route('admin.users.index')}
                                    className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                                >
                                    Cancel
                                </Link>
                                <PrimaryButton disabled={processing}>
                                    Create Customer
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
