import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { FormField } from '@/types';
import { Head, Link } from '@inertiajs/react';

interface ServiceInfo {
    id: number;
    name: string;
    form_schema: FormField[];
}

interface SubmissionData {
    id: number;
    user_name: string;
    user_email: string;
    form_data: Record<string, unknown>;
    status: string;
    created_at: string;
}

interface Props {
    service: ServiceInfo;
    submission: SubmissionData;
}

const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    reviewed: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
};

export default function ShowSubmission({ service, submission }: Props) {
    const renderValue = (field: FormField, value: unknown) => {
        if (value === null || value === undefined || value === '') {
            return <span className="text-gray-400">—</span>;
        }

        if (field.type === 'checkbox') {
            return value ? 'Yes' : 'No';
        }

        if (field.type === 'file' || field.type === 'image') {
            const path = value as string;
            if (field.type === 'image') {
                return (
                    <a href={`/storage/${path}`} target="_blank" rel="noopener noreferrer">
                        <img
                            src={`/storage/${path}`}
                            alt={field.label}
                            className="h-20 w-20 rounded object-cover"
                        />
                    </a>
                );
            }
            return (
                <a
                    href={`/storage/${path}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-600 hover:text-emerald-900 underline"
                >
                    Download
                </a>
            );
        }

        return String(value);
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center space-x-2">
                    <Link
                        href={route('admin.services.index')}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        Services
                    </Link>
                    <span className="text-gray-400">/</span>
                    <Link
                        href={route('admin.services.submissions', service.id)}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        {service.name}
                    </Link>
                    <span className="text-gray-400">/</span>
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Submission #{submission.id}
                    </h2>
                </div>
            }
        >
            <Head title={`Submission #${submission.id}`} />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white p-6 shadow-sm sm:rounded-lg">
                        <div className="mb-6 grid grid-cols-1 gap-4 border-b border-gray-200 pb-6 sm:grid-cols-3">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Submitted by</p>
                                <p className="mt-1 text-sm text-gray-900">{submission.user_name}</p>
                                <p className="text-sm text-gray-500">{submission.user_email}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Status</p>
                                <span
                                    className={`mt-1 inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${statusColors[submission.status] ?? 'bg-gray-100 text-gray-800'}`}
                                >
                                    {submission.status}
                                </span>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Submitted at</p>
                                <p className="mt-1 text-sm text-gray-900">{submission.created_at}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {service.form_schema.map((field) => (
                                <div key={field.name}>
                                    <p className="text-sm font-medium text-gray-500">{field.label}</p>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {renderValue(field, submission.form_data[field.name])}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
