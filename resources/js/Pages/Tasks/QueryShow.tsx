import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useState } from 'react';

interface QueryResponse {
    id: number;
    body: string;
    user_name: string;
    user_initials: string;
    attachment_url: string | null;
    attachment_name: string | null;
    created_at: string;
}

interface QueryDetail {
    id: number;
    subject: string;
    description: string;
    priority: 'normal' | 'urgent';
    status: 'open' | 'answered' | 'closed';
    raised_by_name: string;
    raised_by_id: number;
    directed_to_name: string | null;
    directed_to_id: number | null;
    created_at: string;
    can_close: boolean;
    responses: QueryResponse[];
}

interface Props extends PageProps {
    task: { id: number; service_name: string };
    query: QueryDetail;
}

const statusColors: Record<string, string> = {
    open: 'bg-amber-100 text-amber-800',
    answered: 'bg-blue-100 text-blue-800',
    closed: 'bg-green-100 text-green-800',
};

const statusLabels: Record<string, string> = {
    open: 'Open',
    answered: 'Answered',
    closed: 'Closed',
};

export default function QueryShow({ task, query }: Props) {
    const [body, setBody] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

    const handleSubmitResponse = (e: React.FormEvent) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('body', body);
        if (file) {
            formData.append('attachment', file);
        }

        setProcessing(true);
        router.post(route('tasks.queries.respond', [task.id, query.id]), formData, {
            forceFormData: true,
            onSuccess: () => {
                setBody('');
                setFile(null);
                setErrors({});
                const fileInput = document.getElementById('response-attachment') as HTMLInputElement;
                if (fileInput) fileInput.value = '';
            },
            onError: (errs) => {
                setErrors(errs);
            },
            onFinish: () => {
                setProcessing(false);
            },
        });
    };

    const handleClose = () => {
        router.patch(route('tasks.queries.close', [task.id, query.id]));
    };

    const handleReopen = () => {
        router.patch(route('tasks.queries.reopen', [task.id, query.id]));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-2 text-sm">
                    <Link href={route('tasks.index')} className="text-gray-500 hover:text-gray-700">Tasks</Link>
                    <span className="text-gray-400">/</span>
                    <Link href={route('tasks.show', task.id)} className="text-gray-500 hover:text-gray-700">Task #{task.id}</Link>
                    <span className="text-gray-400">/</span>
                    <span className="font-medium text-gray-900">Query</span>
                </div>
            }
        >
            <Head title={`Query: ${query.subject}`} />

            <div className="max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Query Header Card */}
                <div className="rounded-xl bg-white p-6 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-lg font-semibold text-gray-900">
                                    {query.subject}
                                </h1>
                                <span
                                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[query.status]}`}
                                >
                                    {statusLabels[query.status]}
                                </span>
                                {query.priority === 'urgent' && (
                                    <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">
                                        Urgent
                                    </span>
                                )}
                            </div>

                            <p className="mt-3 whitespace-pre-wrap text-sm text-gray-700">
                                {query.description}
                            </p>

                            <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-gray-500">
                                <div>
                                    <span className="font-medium text-gray-600">Raised by:</span>{' '}
                                    {query.raised_by_name}
                                </div>
                                <div>
                                    <span className="font-medium text-gray-600">Directed to:</span>{' '}
                                    {query.directed_to_name || 'Anyone'}
                                </div>
                                <div>
                                    <span className="font-medium text-gray-600">Created:</span>{' '}
                                    {query.created_at}
                                </div>
                            </div>
                        </div>

                        {query.can_close && (
                            <div className="flex-shrink-0">
                                {query.status !== 'closed' ? (
                                    <SecondaryButton onClick={handleClose}>
                                        Close Query
                                    </SecondaryButton>
                                ) : (
                                    <SecondaryButton onClick={handleReopen}>
                                        Reopen
                                    </SecondaryButton>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Response Form */}
                {query.status !== 'closed' && (
                    <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">
                        <form onSubmit={handleSubmitResponse}>
                            <div>
                                <textarea
                                    rows={3}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                                    placeholder="Write your response..."
                                    value={body}
                                    onChange={(e) => setBody(e.target.value)}
                                />
                                <InputError message={errors.body} className="mt-1" />
                            </div>

                            <div className="mt-3">
                                <input
                                    id="response-attachment"
                                    type="file"
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-emerald-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-emerald-700 hover:file:bg-emerald-100"
                                    onChange={(e) =>
                                        setFile(e.target.files ? e.target.files[0] : null)
                                    }
                                />
                                <InputError message={errors.attachment} className="mt-1" />
                            </div>

                            <div className="mt-4 flex justify-end">
                                <PrimaryButton type="submit" disabled={processing}>
                                    Post Response
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                )}

                {/* Responses Timeline */}
                <div className="mt-6">
                    <h2 className="mb-4 text-sm font-semibold text-gray-900">Responses</h2>

                    {query.responses.length === 0 ? (
                        <div className="rounded-xl bg-white p-8 text-center shadow-sm">
                            <p className="text-sm text-gray-500">No responses yet</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {query.responses.map((response) => (
                                <div
                                    key={response.id}
                                    className="rounded-lg border border-gray-100 bg-white p-4"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                                            {response.user_initials}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                {response.user_name}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {response.created_at}
                                            </p>
                                        </div>
                                    </div>

                                    <p className="mt-3 whitespace-pre-wrap text-sm text-gray-700">
                                        {response.body}
                                    </p>

                                    {response.attachment_url && response.attachment_name && (
                                        <div className="mt-3">
                                            <a
                                                href={response.attachment_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1.5 text-sm text-emerald-600 hover:text-emerald-700"
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-4 w-4"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                    strokeWidth={2}
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                                                    />
                                                </svg>
                                                {response.attachment_name}
                                            </a>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
