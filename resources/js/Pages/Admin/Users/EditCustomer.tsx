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

interface PartnerData {
    id?: number;
    name: string;
    emirates_id_no: string;
    emirates_id_file_url?: string | null;
    passport_no: string;
    passport_file_url?: string | null;
    emirates_id_expiry: string;
    passport_expiry: string;
}

interface BranchData {
    id?: number;
    name: string;
    trade_license_no: string;
    issuing_authority: string;
    moa_file_url?: string | null;
    issue_date: string;
    expiry_date: string;
}

interface Partner {
    id?: number;
    name: string;
    emirates_id_no: string;
    emirates_id_file: File | null;
    emirates_id_file_url?: string | null;
    passport_no: string;
    passport_file: File | null;
    passport_file_url?: string | null;
    emirates_id_expiry: string;
    passport_expiry: string;
}

interface Branch {
    id?: number;
    name: string;
    trade_license_no: string;
    issuing_authority: string;
    moa_file: File | null;
    moa_file_url?: string | null;
    issue_date: string;
    expiry_date: string;
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
    partners: PartnerData[];
    bank_name: string | null;
    bank_branch: string | null;
    account_number: string | null;
    iban: string | null;
    branches: BranchData[];
}

interface Props {
    user: UserData;
    allRoles: string[];
    userRoles: string[];
}

const partnerFromData = (p: PartnerData): Partner => ({
    id: p.id,
    name: p.name ?? '',
    emirates_id_no: p.emirates_id_no ?? '',
    emirates_id_file: null,
    emirates_id_file_url: p.emirates_id_file_url ?? null,
    passport_no: p.passport_no ?? '',
    passport_file: null,
    passport_file_url: p.passport_file_url ?? null,
    emirates_id_expiry: p.emirates_id_expiry ?? '',
    passport_expiry: p.passport_expiry ?? '',
});

const emptyPartner = (): Partner => ({
    name: '',
    emirates_id_no: '',
    emirates_id_file: null,
    passport_no: '',
    passport_file: null,
    emirates_id_expiry: '',
    passport_expiry: '',
});

const branchFromData = (b: BranchData): Branch => ({
    id: b.id,
    name: b.name ?? '',
    trade_license_no: b.trade_license_no ?? '',
    issuing_authority: b.issuing_authority ?? '',
    moa_file: null,
    moa_file_url: b.moa_file_url ?? null,
    issue_date: b.issue_date ?? '',
    expiry_date: b.expiry_date ?? '',
});

const emptyBranch = (): Branch => ({
    name: '',
    trade_license_no: '',
    issuing_authority: '',
    moa_file: null,
    issue_date: '',
    expiry_date: '',
});

const ViewCurrentLink = ({ url }: { url?: string | null }) => {
    if (!url) return null;
    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 2a1 1 0 000 2h2.586l-4.293 4.293a1 1 0 101.414 1.414L12 5.414V8a1 1 0 102 0V3a1 1 0 00-1-1H8z" />
                <path d="M3 5a2 2 0 012-2h4a1 1 0 010 2H5v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H5a2 2 0 01-2-2V5z" />
            </svg>
            View current
        </a>
    );
};

export default function EditCustomer({ user, allRoles, userRoles }: Props) {
    // Section 1: Company Details
    const [data, setData] = useState({
        name: user.name ?? '',
        email: user.email ?? '',
        type: 'customer' as const,
        legal_type: user.legal_type ?? '',
        trade_license_no: user.trade_license_no ?? '',
        issuing_authority: user.issuing_authority ?? '',
        trade_license_issue_date: user.trade_license_issue_date ?? '',
        trade_license_expiry_date: user.trade_license_expiry_date ?? '',
        moa_issue_date: user.moa_issue_date ?? '',
        // Section 3: Bank Details
        bank_name: user.bank_name ?? '',
        bank_branch: user.bank_branch ?? '',
        account_number: user.account_number ?? '',
        iban: user.iban ?? '',
        // Section 4: Address Details
        address_line: user.address_line ?? '',
        emirate: user.emirate ?? '',
        city: user.city ?? '',
        country: user.country ?? 'UAE',
        po_box: user.po_box ?? '',
        // Section 5: Contact Details
        contact_person_name: user.contact_person_name ?? '',
        phone: user.phone ?? '',
        telephone: user.telephone ?? '',
    });

    const [tradeLicenseFile, setTradeLicenseFile] = useState<File | null>(null);
    const [moaFile, setMoaFile] = useState<File | null>(null);

    // Section 2: Partners
    const [partners, setPartners] = useState<Partner[]>(
        user.partners && user.partners.length > 0
            ? user.partners.map(partnerFromData)
            : [emptyPartner()],
    );

    // Section 6: Branches
    const [branches, setBranches] = useState<Branch[]>(
        user.branches && user.branches.length > 0
            ? user.branches.map(branchFromData)
            : [],
    );

    const [removedPartnerIds, setRemovedPartnerIds] = useState<number[]>([]);
    const [removedBranchIds, setRemovedBranchIds] = useState<number[]>([]);

    const [selectedRole, setSelectedRole] = useState(
        userRoles.find((r) => r !== 'customer' && r !== 'admin') ?? '',
    );
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
        const partner = partners[index];
        if (partner.id) {
            setRemovedPartnerIds((prev) => [...prev, partner.id!]);
        }
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
        const branch = branches[index];
        if (branch.id) {
            setRemovedBranchIds((prev) => [...prev, branch.id!]);
        }
        setBranches((prev) => prev.filter((_, i) => i !== index));
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        setProcessing(true);

        const formData = new FormData();
        formData.append('_method', 'PUT');

        // Basic fields
        formData.append('name', data.name);
        formData.append('email', data.email);
        formData.append('type', data.type);
        formData.append('legal_type', data.legal_type);
        formData.append('trade_license_no', data.trade_license_no);
        formData.append('issuing_authority', data.issuing_authority);
        formData.append('trade_license_issue_date', data.trade_license_issue_date);
        formData.append('trade_license_expiry_date', data.trade_license_expiry_date);
        if (data.moa_issue_date) formData.append('moa_issue_date', data.moa_issue_date);
        formData.append('phone', data.phone);
        formData.append('address_line', data.address_line);
        formData.append('city', data.city);
        formData.append('emirate', data.emirate);
        formData.append('country', data.country);
        formData.append('po_box', data.po_box);
        formData.append('contact_person_name', data.contact_person_name);
        formData.append('telephone', data.telephone);

        // Company docs (optional on edit)
        if (tradeLicenseFile) formData.append('trade_license_file', tradeLicenseFile);
        if (moaFile) formData.append('moa_file', moaFile);

        // Bank details
        formData.append('bank_name', data.bank_name);
        formData.append('bank_branch', data.bank_branch);
        formData.append('account_number', data.account_number);
        formData.append('iban', data.iban);

        // Partners
        partners.forEach((partner, index) => {
            if (partner.id) {
                formData.append(`partners[${index}][id]`, String(partner.id));
            }
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

        // Removed partners
        removedPartnerIds.forEach((id, index) => {
            formData.append(`remove_partner_ids[${index}]`, String(id));
        });

        // Branches
        branches.forEach((branch, index) => {
            if (branch.id) {
                formData.append(`branches[${index}][id]`, String(branch.id));
            }
            formData.append(`branches[${index}][name]`, branch.name);
            formData.append(`branches[${index}][trade_license_no]`, branch.trade_license_no);
            formData.append(`branches[${index}][issuing_authority]`, branch.issuing_authority);
            if (branch.moa_file) {
                formData.append(`branches[${index}][moa_file]`, branch.moa_file);
            }
            formData.append(`branches[${index}][issue_date]`, branch.issue_date);
            formData.append(`branches[${index}][expiry_date]`, branch.expiry_date);
        });

        // Removed branches
        removedBranchIds.forEach((id, index) => {
            formData.append(`remove_branch_ids[${index}]`, String(id));
        });

        // Role
        if (selectedRole) {
            formData.append('role', selectedRole);
        }

        router.post(route('admin.users.update', user.id), formData, {
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
                    Edit Customer
                </h2>
            }
        >
            <Head title="Edit Customer" />

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

                            </div>

                            {/* Trade License */}
                            <h4 className="mt-6 text-sm font-semibold text-gray-700">Trade License</h4>
                            <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-3">
                                <div>
                                    <InputLabel htmlFor="trade_license_file" value="Trade License Copy" />
                                    <ViewCurrentLink url={user.trade_license_file_url} />
                                    <input
                                        id="trade_license_file"
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        className={fileInputClasses}
                                        onChange={(e) => setTradeLicenseFile(e.target.files?.[0] ?? null)}
                                    />
                                    {tradeLicenseFile && (
                                        <p className="mt-1 text-xs text-gray-500">{tradeLicenseFile.name}</p>
                                    )}
                                    <InputError message={errors.trade_license_file} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="trade_license_issue_date" value="Issue Date *" />
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
                                    <InputLabel htmlFor="trade_license_expiry_date" value="Expiry Date *" />
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

                            {/* MOA */}
                            <h4 className="mt-6 text-sm font-semibold text-gray-700">MOA</h4>
                            <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-3">
                                <div>
                                    <InputLabel htmlFor="moa_file" value="MOA Copy" />
                                    <ViewCurrentLink url={user.moa_file_url} />
                                    <input
                                        id="moa_file"
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        className={fileInputClasses}
                                        onChange={(e) => setMoaFile(e.target.files?.[0] ?? null)}
                                    />
                                    {moaFile && (
                                        <p className="mt-1 text-xs text-gray-500">{moaFile.name}</p>
                                    )}
                                    <InputError message={errors.moa_file} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="moa_issue_date" value="Issue Date" />
                                    <TextInput
                                        id="moa_issue_date"
                                        type="date"
                                        value={data.moa_issue_date}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setField('moa_issue_date', e.target.value)}
                                    />
                                    <InputError message={errors.moa_issue_date} className="mt-2" />
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
                                        key={partner.id ?? `new-${index}`}
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
                                                <InputLabel value="Emirates ID Copy" />
                                                <ViewCurrentLink url={partner.emirates_id_file_url} />
                                                <input
                                                    type="file"
                                                    accept=".pdf,.jpg,.jpeg,.png"
                                                    className={fileInputClasses}
                                                    onChange={(e) => updatePartner(index, 'emirates_id_file', e.target.files?.[0] ?? null)}
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
                                                <InputLabel value="Passport Copy" />
                                                <ViewCurrentLink url={partner.passport_file_url} />
                                                <input
                                                    type="file"
                                                    accept=".pdf,.jpg,.jpeg,.png"
                                                    className={fileInputClasses}
                                                    onChange={(e) => updatePartner(index, 'passport_file', e.target.files?.[0] ?? null)}
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
                                    <InputLabel htmlFor="bank_name" value="Name of the Bank" />
                                    <TextInput
                                        id="bank_name"
                                        value={data.bank_name}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setField('bank_name', e.target.value)}
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
                                    <InputLabel htmlFor="iban" value="IBAN Number" />
                                    <TextInput
                                        id="iban"
                                        value={data.iban}
                                        className="mt-1 block w-full"
                                        placeholder="AE00 0000 0000 0000 0000 000"
                                        onChange={(e) => setField('iban', e.target.value)}
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

                            {/* ── Section 5: Name of the Authorized Person ── */}
                            <h3 className="mt-8 border-t border-gray-200 pt-6 text-lg font-medium text-gray-900">
                                Name of the Authorized Person
                            </h3>
                            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <InputLabel htmlFor="contact_person_name" value="Name of the Authorized Person" />
                                    <TextInput
                                        id="contact_person_name"
                                        value={data.contact_person_name}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setField('contact_person_name', e.target.value)}
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
                                        value={user.email}
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
                                            key={branch.id ?? `new-${index}`}
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
                                                    <ViewCurrentLink url={branch.moa_file_url} />
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
                            {allRoles.length > 0 && (
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
                                        {allRoles.map((r) => (
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
                                    Update Customer
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
