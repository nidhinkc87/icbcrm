import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import TextInput from '@/Components/TextInput';
import SelectInput from '@/Components/SelectInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import { Head, useForm, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useMemo, useState } from 'react';

interface DocumentRow {
    id: number;
    document_type: string;
    document_type_id: number;
    category: string;
    value: string | null;
    issue_date: string | null;
    expiry_date: string | null;
    partner_name: string | null;
    branch_name: string | null;
    file_url: string | null;
    original_name: string | null;
    uploaded_at: string;
}

interface DocumentType {
    id: number;
    name: string;
    category: string;
    has_expiry: boolean;
    has_file: boolean;
    has_value: boolean;
}

interface Partner {
    id: number;
    name: string;
}

interface Branch {
    id: number;
    name: string;
}

interface Props extends PageProps {
    documents: DocumentRow[];
    document_types: DocumentType[];
    partners: Partner[];
    branches: Branch[];
}

export default function DocumentsIndex({ documents, document_types, partners, branches }: Props) {
    const { flash } = usePage<PageProps>().props;
    const [showUpload, setShowUpload] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm<{
        document_type_id: string;
        partner_id: string;
        branch_id: string;
        value: string;
        issue_date: string;
        expiry_date: string;
        file: File | null;
    }>({
        document_type_id: '',
        partner_id: '',
        branch_id: '',
        value: '',
        issue_date: '',
        expiry_date: '',
        file: null,
    });

    const selectedType = useMemo(
        () => document_types.find((t) => String(t.id) === data.document_type_id),
        [document_types, data.document_type_id]
    );

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('customer.documents.store'), {
            forceFormData: true,
            onSuccess: () => {
                reset();
                setShowUpload(false);
            },
        });
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">My Documents</h2>}>
            <Head title="My Documents" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
                    {flash?.success && (
                        <div className="rounded-md bg-green-50 p-3 text-sm text-green-800">{flash.success}</div>
                    )}

                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={() => setShowUpload(!showUpload)}
                            className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                        >
                            {showUpload ? 'Close' : 'Upload Document'}
                        </button>
                    </div>

                    {showUpload && (
                        <form onSubmit={submit} className="space-y-4 rounded-lg bg-white p-6 shadow">
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">Upload new document</h3>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <InputLabel htmlFor="document_type_id" value="Document Type *" />
                                    <SelectInput
                                        value={data.document_type_id}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setData('document_type_id', e.target.value)}
                                    >
                                        <option value="">Select a document type...</option>
                                        {document_types.map((t) => (
                                            <option key={t.id} value={t.id}>{t.name} ({t.category})</option>
                                        ))}
                                    </SelectInput>
                                    <InputError message={errors.document_type_id} className="mt-1" />
                                </div>

                                {selectedType?.has_value && (
                                    <div>
                                        <InputLabel htmlFor="value" value="Reference / Number" />
                                        <TextInput
                                            value={data.value}
                                            className="mt-1 block w-full"
                                            placeholder="e.g. license number"
                                            onChange={(e) => setData('value', e.target.value)}
                                        />
                                        <InputError message={errors.value} className="mt-1" />
                                    </div>
                                )}

                                <div>
                                    <InputLabel htmlFor="partner_id" value="Linked Partner (optional)" />
                                    <SelectInput
                                        value={data.partner_id}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setData('partner_id', e.target.value)}
                                    >
                                        <option value="">— None —</option>
                                        {partners.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </SelectInput>
                                </div>

                                <div>
                                    <InputLabel htmlFor="branch_id" value="Linked Branch (optional)" />
                                    <SelectInput
                                        value={data.branch_id}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setData('branch_id', e.target.value)}
                                    >
                                        <option value="">— None —</option>
                                        {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                                    </SelectInput>
                                </div>

                                <div>
                                    <InputLabel htmlFor="issue_date" value="Issue Date" />
                                    <TextInput
                                        type="date"
                                        value={data.issue_date}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setData('issue_date', e.target.value)}
                                    />
                                </div>

                                {(selectedType?.has_expiry ?? true) && (
                                    <div>
                                        <InputLabel htmlFor="expiry_date" value="Expiry Date" />
                                        <TextInput
                                            type="date"
                                            value={data.expiry_date}
                                            className="mt-1 block w-full"
                                            onChange={(e) => setData('expiry_date', e.target.value)}
                                        />
                                    </div>
                                )}

                                <div className="md:col-span-2">
                                    <InputLabel htmlFor="file" value="File (PDF, JPG, PNG · max 10MB)" />
                                    <input
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={(e) => setData('file', e.target.files?.[0] ?? null)}
                                        className="mt-1 block w-full text-sm text-gray-700 file:mr-3 file:rounded-md file:border-0 file:bg-emerald-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-emerald-700 hover:file:bg-emerald-100"
                                    />
                                    <InputError message={errors.file} className="mt-1" />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 border-t pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowUpload(false)}
                                    className="text-sm text-gray-600 hover:text-gray-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing || !data.document_type_id}
                                    className="rounded-md bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                                >
                                    {processing ? 'Uploading…' : 'Upload'}
                                </button>
                            </div>
                        </form>
                    )}

                    <div className="overflow-hidden rounded-lg bg-white shadow">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">#</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Document</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Reference</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Linked To</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Issue</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Expiry</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">File</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Uploaded</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {documents.map((d, i) => (
                                        <tr key={d.id} className="hover:bg-gray-50">
                                            <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{i + 1}</td>
                                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                                <div>{d.document_type}</div>
                                                <div className="text-xs text-gray-400">{d.category}</div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-700">{d.value ?? '-'}</td>
                                            <td className="px-4 py-3 text-sm text-gray-500">
                                                {d.partner_name ? `Partner: ${d.partner_name}` : d.branch_name ? `Branch: ${d.branch_name}` : '-'}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{d.issue_date ?? '-'}</td>
                                            <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{d.expiry_date ?? '-'}</td>
                                            <td className="whitespace-nowrap px-4 py-3 text-sm">
                                                {d.file_url ? (
                                                    <a href={d.file_url} target="_blank" rel="noreferrer" className="text-emerald-600 hover:underline">
                                                        View
                                                    </a>
                                                ) : <span className="text-gray-400">-</span>}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{d.uploaded_at}</td>
                                        </tr>
                                    ))}
                                    {documents.length === 0 && (
                                        <tr><td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-400">No documents uploaded yet.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
