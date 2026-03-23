import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DynamicFormRenderer from '@/Components/DynamicFormRenderer';
import PrimaryButton from '@/Components/PrimaryButton';
import { FormField } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

interface ServiceInfo {
    id: number;
    name: string;
    description: string | null;
    form_schema: FormField[];
}

interface Props {
    service: ServiceInfo;
}

export default function Submit({ service }: Props) {
    const initialData: Record<string, unknown> = {};
    service.form_schema.forEach((field) => {
        initialData[field.name] = field.type === 'checkbox' ? false : '';
    });

    const [data, setData] = useState<Record<string, unknown>>(initialData);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

    const setFieldData = (key: string, value: unknown) => {
        setData((prev) => ({ ...prev, [key]: value }));
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        setProcessing(true);

        const formData = new FormData();
        service.form_schema.forEach((field) => {
            const value = data[field.name];
            if (value instanceof File) {
                formData.append(`fields[${field.name}]`, value);
            } else if (typeof value === 'boolean') {
                formData.append(`fields[${field.name}]`, value ? '1' : '0');
            } else if (value !== null && value !== undefined && value !== '') {
                formData.append(`fields[${field.name}]`, String(value));
            }
        });

        router.post(route('services.store', service.id), formData, {
            forceFormData: true,
            onError: (errs) => setErrors(errs),
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    {service.name}
                </h2>
            }
        >
            <Head title={service.name} />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white p-6 shadow-sm sm:rounded-lg">
                        {service.description && (
                            <p className="mb-6 text-sm text-gray-600">{service.description}</p>
                        )}

                        <form onSubmit={submit}>
                            <DynamicFormRenderer
                                schema={service.form_schema}
                                data={data}
                                setFieldData={setFieldData}
                                errors={errors}
                            />

                            <div className="mt-6 flex items-center justify-end space-x-4">
                                <Link
                                    href={route('services.index')}
                                    className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                                >
                                    Cancel
                                </Link>
                                <PrimaryButton disabled={processing}>
                                    Submit
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
