import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import TextInput from '@/Components/TextInput';
import SelectInput from '@/Components/SelectInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import { Head, Link, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useEffect } from 'react';

interface FormField {
    name: string;
    label: string;
    type: 'text' | 'textarea' | 'dropdown' | 'file' | 'image' | 'checkbox' | 'date' | 'number';
    required: boolean;
    placeholder?: string | null;
    options?: string[] | null;
    source?: { type?: string; key?: string } | null;
}

interface ServiceInfo {
    id: number;
    name: string;
    description: string | null;
    form_schema: FormField[];
}

interface Props extends PageProps {
    service: ServiceInfo;
    autofill: Record<string, string | null>;
}

export default function ServiceRequest({ service, autofill }: Props) {
    const { data, setData, post, processing, errors } = useForm<{ form_data: Record<string, string | boolean> }>({
        form_data: {},
    });

    // Apply autofill values once on mount
    useEffect(() => {
        const initial: Record<string, string | boolean> = {};
        service.form_schema.forEach((f) => {
            if (f.source?.type === 'customer' && f.source.key) {
                const key = `customer.${f.source.key}`;
                if (autofill[key]) initial[f.name] = autofill[key]!;
            }
            if (f.type === 'checkbox' && initial[f.name] === undefined) initial[f.name] = false;
        });
        setData('form_data', initial);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const updateField = (name: string, value: string | boolean) => {
        setData('form_data', { ...data.form_data, [name]: value });
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('customer.services.submit', service.id));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-3">
                    <Link href={route('customer.services')} className="text-gray-400 hover:text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                        </svg>
                    </Link>
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">Request: {service.name}</h2>
                </div>
            }
        >
            <Head title={`Request ${service.name}`} />

            <div className="py-6">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                    <form onSubmit={submit} className="space-y-6 rounded-lg bg-white p-6 shadow">
                        {service.description && (
                            <div className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-800">
                                {service.description}
                            </div>
                        )}

                        {service.form_schema.length === 0 ? (
                            <p className="text-sm text-gray-500">No additional information needed. Click submit to request this service.</p>
                        ) : (
                            <div className="space-y-4">
                                {service.form_schema.map((f) => (
                                    <div key={f.name}>
                                        <InputLabel htmlFor={f.name} value={f.label + (f.required ? ' *' : '')} />
                                        {renderField(f, data.form_data[f.name], (v) => updateField(f.name, v))}
                                        <InputError message={errors[`form_data.${f.name}` as keyof typeof errors] as string | undefined} className="mt-1" />
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex items-center justify-end gap-3 border-t pt-4">
                            <Link href={route('customer.services')} className="text-sm text-gray-600 hover:text-gray-800">
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="rounded-md bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                            >
                                {processing ? 'Submitting…' : 'Submit Request'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function renderField(f: FormField, value: string | boolean | undefined, onChange: (v: string | boolean) => void) {
    const placeholder = f.placeholder ?? '';

    if (f.type === 'textarea') {
        return (
            <textarea
                id={f.name}
                value={(value as string) ?? ''}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
            />
        );
    }

    if (f.type === 'dropdown') {
        return (
            <SelectInput
                value={(value as string) ?? ''}
                className="mt-1 block w-full"
                onChange={(e) => onChange(e.target.value)}
            >
                <option value="">Select…</option>
                {(f.options ?? []).map((opt) => <option key={opt} value={opt}>{opt}</option>)}
            </SelectInput>
        );
    }

    if (f.type === 'checkbox') {
        return (
            <label className="mt-1 inline-flex items-center gap-2 text-sm text-gray-700">
                <input
                    type="checkbox"
                    checked={(value as boolean) ?? false}
                    onChange={(e) => onChange(e.target.checked)}
                    className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                {placeholder || 'Yes'}
            </label>
        );
    }

    if (f.type === 'date') {
        return (
            <TextInput
                type="date"
                value={(value as string) ?? ''}
                className="mt-1 block w-full"
                onChange={(e) => onChange(e.target.value)}
            />
        );
    }

    if (f.type === 'number') {
        return (
            <TextInput
                type="number"
                value={(value as string) ?? ''}
                className="mt-1 block w-full"
                placeholder={placeholder}
                onChange={(e) => onChange(e.target.value)}
            />
        );
    }

    return (
        <TextInput
            type="text"
            value={(value as string) ?? ''}
            className="mt-1 block w-full"
            placeholder={placeholder}
            onChange={(e) => onChange(e.target.value)}
        />
    );
}
