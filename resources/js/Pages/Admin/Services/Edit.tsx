import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Checkbox from '@/Components/Checkbox';
import FormBuilder, { AutofillOption } from '@/Components/FormBuilder';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { FormField, ServiceData } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

interface DocType { id: number; name: string; category: string; }

interface Props {
    service: ServiceData;
    document_types?: DocType[];
    autofill_sources?: AutofillOption[];
}

export default function Edit({ service, document_types, autofill_sources }: Props) {
    const { data, setData, put, processing, errors } = useForm<{
        name: string;
        description: string;
        is_active: boolean;
        form_schema: FormField[];
        completion_schema: FormField[];
        document_type_ids: number[];
        completion_document_type_ids: number[];
    }>({
        name: service.name,
        description: service.description ?? '',
        is_active: service.is_active,
        form_schema: service.form_schema,
        completion_schema: service.completion_schema ?? [],
        document_type_ids: service.document_type_ids ?? [],
        completion_document_type_ids: service.completion_document_type_ids ?? [],
    });

    const toggleDocType = (id: number) => {
        setData('document_type_ids', data.document_type_ids.includes(id)
            ? data.document_type_ids.filter((d) => d !== id)
            : [...data.document_type_ids, id]
        );
    };

    const toggleCompletionDocType = (id: number) => {
        setData('completion_document_type_ids', data.completion_document_type_ids.includes(id)
            ? data.completion_document_type_ids.filter((d) => d !== id)
            : [...data.completion_document_type_ids, id]
        );
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('admin.services.update', service.id));
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Edit Service
                </h2>
            }
        >
            <Head title="Edit Service" />

            <div className="py-12">
                <div className="max-w-4xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white p-6 shadow-sm sm:rounded-lg">
                        <form onSubmit={submit}>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <InputLabel htmlFor="name" value="Service Name" />
                                    <TextInput
                                        id="name"
                                        value={data.name}
                                        className="mt-1 block w-full"
                                        isFocused={true}
                                        onChange={(e) => setData('name', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.name} className="mt-2" />
                                </div>

                                <div className="flex items-end pb-2">
                                    <label className="flex items-center space-x-2">
                                        <Checkbox
                                            checked={data.is_active}
                                            onChange={(e) => setData('is_active', e.target.checked)}
                                        />
                                        <span className="text-sm text-gray-700">Active</span>
                                    </label>
                                </div>

                                <div className="sm:col-span-2">
                                    <InputLabel htmlFor="description" value="Description" />
                                    <textarea
                                        id="description"
                                        value={data.description}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                                        rows={3}
                                        onChange={(e) => setData('description', e.target.value)}
                                    />
                                    <InputError message={errors.description} className="mt-2" />
                                </div>
                            </div>

                            <div className="mt-8 border-t border-gray-200 pt-6">
                                <FormBuilder
                                    title="Work Form"
                                    description="Fields the employee fills while working on the task."
                                    fields={data.form_schema}
                                    onChange={(fields) => setData('form_schema', fields)}
                                    errors={errors}
                                    errorPrefix="form_schema"
                                    autofillSources={autofill_sources}
                                />

                                {document_types && document_types.length > 0 && (
                                    <div className="mt-6 rounded-lg border border-gray-200 p-4">
                                        <h4 className="text-sm font-medium text-gray-900">Required Customer Documents</h4>
                                        <p className="mt-1 text-xs text-gray-500">Select which customer documents are needed for this service. These will be auto-filled from the customer profile when an employee works on a task.</p>
                                        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                            {(['company', 'partner', 'branch', 'other'] as const).map((category) => {
                                                const docs = document_types.filter((d) => d.category === category);
                                                if (docs.length === 0) return null;
                                                return (
                                                    <div key={category} className="rounded-lg border border-gray-200 p-3">
                                                        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">{category}</p>
                                                        <div className="space-y-1.5">
                                                            {docs.map((dt) => (
                                                                <label key={dt.id} className="flex items-center gap-2">
                                                                    <input
                                                                        type="checkbox"
                                                                        className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                                                        checked={data.document_type_ids.includes(dt.id)}
                                                                        onChange={() => toggleDocType(dt.id)}
                                                                    />
                                                                    <span className="text-sm text-gray-700">{dt.name}</span>
                                                                </label>
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <InputError message={errors.document_type_ids} className="mt-2" />
                                    </div>
                                )}
                            </div>

                            <div className="mt-8 border-t border-gray-200 pt-6">
                                <FormBuilder
                                    title="Completion Form"
                                    description="Fields required to complete the task (e.g., certificates, proof documents)."
                                    fields={data.completion_schema}
                                    onChange={(fields) => setData('completion_schema', fields)}
                                    errors={errors}
                                    errorPrefix="completion_schema"
                                    autofillSources={autofill_sources}
                                />

                                {document_types && document_types.length > 0 && (
                                    <div className="mt-6 rounded-lg border border-gray-200 p-4">
                                        <h4 className="text-sm font-medium text-gray-900">Required Customer Documents</h4>
                                        <p className="mt-1 text-xs text-gray-500">Select which customer documents are required to complete this task.</p>
                                        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                            {(['company', 'partner', 'branch', 'other'] as const).map((category) => {
                                                const docs = document_types.filter((d) => d.category === category);
                                                if (docs.length === 0) return null;
                                                return (
                                                    <div key={category} className="rounded-lg border border-gray-200 p-3">
                                                        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">{category}</p>
                                                        <div className="space-y-1.5">
                                                            {docs.map((dt) => (
                                                                <label key={dt.id} className="flex items-center gap-2">
                                                                    <input
                                                                        type="checkbox"
                                                                        className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                                                        checked={data.completion_document_type_ids.includes(dt.id)}
                                                                        onChange={() => toggleCompletionDocType(dt.id)}
                                                                    />
                                                                    <span className="text-sm text-gray-700">{dt.name}</span>
                                                                </label>
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <InputError message={errors.completion_document_type_ids} className="mt-2" />
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 flex items-center justify-end space-x-4">
                                <Link
                                    href={route('admin.services.index')}
                                    className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                                >
                                    Cancel
                                </Link>
                                <PrimaryButton disabled={processing}>
                                    Update Service
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
