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

interface AdditionalDoc {
    label: string;
    file: File | null;
}

interface Props {
    roles: string[];
}

export default function CreateCustomer({ roles }: Props) {
    const [data, setData] = useState({
        name: '',
        email: '',
        type: 'customer' as const,
        phone: '',
        address_line: '',
        city: '',
        emirate: '',
        country: 'UAE',
        po_box: '',
    });

    const [kycFiles, setKycFiles] = useState<{
        emirates_id: File | null;
        passport: File | null;
        trade_license: File | null;
        moa: File | null;
    }>({
        emirates_id: null,
        passport: null,
        trade_license: null,
        moa: null,
    });

    const [selectedRole, setSelectedRole] = useState('');
    const [additionalDocs, setAdditionalDocs] = useState<AdditionalDoc[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

    const setField = (key: string, value: string) => {
        setData((prev) => ({ ...prev, [key]: value }));
    };

    const setKycFile = (key: keyof typeof kycFiles, file: File | null) => {
        setKycFiles((prev) => ({ ...prev, [key]: file }));
    };

    const addAdditionalDoc = () => {
        setAdditionalDocs((prev) => [...prev, { label: '', file: null }]);
    };

    const updateAdditionalDoc = (index: number, key: keyof AdditionalDoc, value: string | File | null) => {
        setAdditionalDocs((prev) => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [key]: value };
            return updated;
        });
    };

    const removeAdditionalDoc = (index: number) => {
        setAdditionalDocs((prev) => prev.filter((_, i) => i !== index));
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        setProcessing(true);

        const formData = new FormData();

        // Profile fields
        Object.entries(data).forEach(([key, value]) => {
            formData.append(key, value);
        });

        // Role
        if (selectedRole) {
            formData.append('role', selectedRole);
        }

        // KYC files
        Object.entries(kycFiles).forEach(([key, file]) => {
            if (file) formData.append(key, file);
        });

        // Additional documents
        additionalDocs.forEach((doc, index) => {
            formData.append(`additional_documents[${index}][label]`, doc.label);
            if (doc.file) {
                formData.append(`additional_documents[${index}][file]`, doc.file);
            }
        });

        router.post(route('admin.users.store'), formData, {
            forceFormData: true,
            onError: (errs) => setErrors(errs),
            onFinish: () => setProcessing(false),
        });
    };

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
                            {/* Basic Profile */}
                            <h3 className="text-lg font-medium text-gray-900">Basic Profile</h3>
                            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <InputLabel htmlFor="name" value="Name *" />
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
                                    <InputLabel htmlFor="phone" value="Phone" />
                                    <TextInput
                                        id="phone"
                                        value={data.phone}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setField('phone', e.target.value)}
                                    />
                                    <InputError message={errors.phone} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="address_line" value="Address Line" />
                                    <TextInput
                                        id="address_line"
                                        value={data.address_line}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setField('address_line', e.target.value)}
                                    />
                                    <InputError message={errors.address_line} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="city" value="City" />
                                    <TextInput
                                        id="city"
                                        value={data.city}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setField('city', e.target.value)}
                                    />
                                    <InputError message={errors.city} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="emirate" value="Emirate" />
                                    <SelectInput
                                        id="emirate"
                                        value={data.emirate}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setField('emirate', e.target.value)}
                                    >
                                        <option value="">Select Emirate</option>
                                        {EMIRATES.map((em) => (
                                            <option key={em} value={em}>{em}</option>
                                        ))}
                                    </SelectInput>
                                    <InputError message={errors.emirate} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="country" value="Country" />
                                    <TextInput
                                        id="country"
                                        value={data.country}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setField('country', e.target.value)}
                                    />
                                    <InputError message={errors.country} className="mt-2" />
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

                            {/* KYC Documents */}
                            <h3 className="mt-8 border-t border-gray-200 pt-6 text-lg font-medium text-gray-900">
                                KYC Documents
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Upload PDF, JPG, or PNG files (max 5MB each).
                            </p>
                            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                {([
                                    ['emirates_id', 'Emirates ID *'],
                                    ['passport', 'Passport *'],
                                    ['trade_license', 'Trade License *'],
                                    ['moa', 'MOA (LLC Company) *'],
                                ] as const).map(([key, label]) => (
                                    <div key={key}>
                                        <InputLabel htmlFor={key} value={label} />
                                        <input
                                            id={key}
                                            type="file"
                                            accept=".pdf,.jpg,.jpeg,.png"
                                            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-emerald-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-emerald-700 hover:file:bg-emerald-100"
                                            onChange={(e) => setKycFile(key, e.target.files?.[0] ?? null)}
                                        />
                                        {kycFiles[key] && (
                                            <p className="mt-1 text-xs text-gray-500">{kycFiles[key]!.name}</p>
                                        )}
                                        <InputError message={errors[key]} className="mt-2" />
                                    </div>
                                ))}
                            </div>

                            {/* Additional Documents */}
                            <h3 className="mt-8 border-t border-gray-200 pt-6 text-lg font-medium text-gray-900">
                                Additional Documents
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Upload any additional documents such as registration certificates, VAT certificates, etc.
                            </p>

                            {additionalDocs.length > 0 && (
                                <div className="mt-4 space-y-3">
                                    {additionalDocs.map((doc, index) => (
                                        <div key={index} className="flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
                                            <div className="flex-1">
                                                <InputLabel value="Label *" />
                                                <TextInput
                                                    value={doc.label}
                                                    className="mt-1 block w-full"
                                                    placeholder="e.g. VAT Certificate"
                                                    onChange={(e) => updateAdditionalDoc(index, 'label', e.target.value)}
                                                />
                                                <InputError message={errors[`additional_documents.${index}.label`]} className="mt-1" />
                                            </div>
                                            <div className="flex-1">
                                                <InputLabel value="File *" />
                                                <input
                                                    type="file"
                                                    accept=".pdf,.jpg,.jpeg,.png"
                                                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-emerald-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-emerald-700 hover:file:bg-emerald-100"
                                                    onChange={(e) => updateAdditionalDoc(index, 'file', e.target.files?.[0] ?? null)}
                                                />
                                                {doc.file && (
                                                    <p className="mt-1 text-xs text-gray-500">{doc.file.name}</p>
                                                )}
                                                <InputError message={errors[`additional_documents.${index}.file`]} className="mt-1" />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeAdditionalDoc(index)}
                                                className="mt-6 text-red-400 hover:text-red-600"
                                            >
                                                &#10005;
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={addAdditionalDoc}
                                className="mt-3 text-sm text-emerald-600 hover:text-emerald-500"
                            >
                                + Add Document
                            </button>

                            {/* Role */}
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

                            {/* Submit */}
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
