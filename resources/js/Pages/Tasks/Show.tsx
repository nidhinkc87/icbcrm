import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import StatusPipeline from '@/Components/Tasks/StatusPipeline';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { FormField, PageProps } from '@/types';
import { useState } from 'react';

type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
type TaskStatus = 'pending' | 'in_progress' | 'completed';

interface Attachment {
    id: number;
    original_name: string;
    url: string;
    mime_type: string | null;
    file_size: number | null;
    uploaded_by_name: string;
    uploaded_at: string;
    can_delete: boolean;
}

interface Comment {
    id: number;
    body: string;
    user_name: string;
    user_initials: string;
    created_at: string;
    can_delete: boolean;
}

interface TaskDetail {
    id: number;
    service_id: number;
    service_name: string;
    customer_id: number;
    customer_name: string;
    responsible_id: number;
    responsible_name: string;
    collaborators: { id: number; name: string; can_work: boolean }[];
    priority: TaskPriority;
    status: TaskStatus;
    due_date: string;
    due_date_display: string;
    is_overdue: boolean;
    instructions: string | null;
    created_by_name: string;
    created_at: string;
    attachments: Attachment[];
    comments: Comment[];
    can_edit: boolean;
    can_update_status: boolean;
    can_add_attachments: boolean;
    has_draft: boolean;
    parent_task_id: number | null;
    follow_up_tasks: { id: number; status: string; due_date: string }[];
    can_work_on_task: boolean;
    can_manage_collaborators: boolean;
}

interface DocSnapshot {
    document_type_id: number;
    document_type_name: string;
    category: string;
    phase: 'work' | 'completion';
    has_file: boolean;
    has_value: boolean;
    has_expiry: boolean;
    value: string | null;
    file_path: string | null;
    original_name: string | null;
    issue_date: string | null;
    expiry_date: string | null;
}

interface SubmissionData {
    form_data: Record<string, any>;
    document_snapshot?: DocSnapshot[];
    status: string;
    created_at: string;
}

interface Employee {
    id: number;
    name: string;
}

interface QueryItem {
    id: number;
    subject: string;
    priority: string;
    status: string;
    raised_by_name: string;
    directed_to_name: string | null;
    responses_count: number;
    created_at: string;
}

interface TaskParticipant {
    id: number;
    name: string;
    role: string;
}

interface Props extends PageProps {
    task: TaskDetail;
    submission?: SubmissionData | null;
    form_schema?: FormField[];
    completion_schema?: FormField[];
    employees?: Employee[];
    queries?: QueryItem[];
    open_queries_count?: number;
    task_participants?: TaskParticipant[];
}

const priorityColors: Record<TaskPriority, string> = {
    low: 'bg-gray-100 text-gray-700',
    medium: 'bg-blue-100 text-blue-700',
    high: 'bg-amber-100 text-amber-700',
    urgent: 'bg-red-100 text-red-700',
};

const statusColors: Record<TaskStatus, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
};

const statusLabels: Record<TaskStatus, string> = {
    pending: 'Pending',
    in_progress: 'In Progress',
    completed: 'Completed',
};

function formatFileSize(bytes: number | null): string {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function getInitials(name: string): string {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

export default function Show({ task, submission, form_schema, completion_schema, employees, queries, open_queries_count, task_participants }: Props) {
    const { flash } = usePage<PageProps>().props;
    const commentForm = useForm({ body: '' });
    const [activeTab, setActiveTab] = useState<'overview' | 'submission' | 'attachments' | 'queries'>('overview');
    const [showQueryForm, setShowQueryForm] = useState(false);
    const [queryForm, setQueryForm] = useState({ subject: '', description: '', directed_to: '', priority: 'normal' });
    const [queryErrors, setQueryErrors] = useState<Record<string, string>>({});
    const [queryProcessing, setQueryProcessing] = useState(false);
    const [uploadFiles, setUploadFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);

    const canMarkInProgress = task.can_update_status && task.status === 'pending';
    const canWorkOnForm = task.can_work_on_task && task.status === 'in_progress';
    const canStartAndWork = task.can_work_on_task && task.status === 'pending';

    const markInProgress = () => {
        router.patch(route('tasks.update-status', task.id), { status: 'in_progress' });
    };

    const submitComment = (e: React.FormEvent) => {
        e.preventDefault();
        commentForm.post(route('tasks.comments.store', task.id), {
            onSuccess: () => commentForm.reset(),
            preserveScroll: true,
        });
    };

    const deleteComment = (commentId: number) => {
        router.delete(route('tasks.comments.destroy', [task.id, commentId]), {
            preserveScroll: true,
        });
    };

    const deleteAttachment = (attachmentId: number) => {
        router.delete(route('tasks.attachments.destroy', [task.id, attachmentId]), {
            preserveScroll: true,
        });
    };

    const uploadAttachments = () => {
        if (uploadFiles.length === 0) return;
        setUploading(true);

        const formData = new FormData();
        uploadFiles.forEach((file, index) => {
            formData.append(`attachments[${index}]`, file);
        });

        router.post(route('tasks.attachments.store', task.id), formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => setUploadFiles([]),
            onFinish: () => setUploading(false),
        });
    };

    const tabs = [
        { key: 'overview' as const, label: 'Overview' },
        { key: 'submission' as const, label: 'Form / Submission' },
        { key: 'attachments' as const, label: `Attachments (${task.attachments.length})` },
        { key: 'queries' as const, label: `Queries${(open_queries_count ?? 0) > 0 ? ` (${open_queries_count})` : ''}` },
    ];

    const submitQuery = () => {
        setQueryProcessing(true);
        router.post(route('tasks.queries.store', task.id), queryForm, {
            onSuccess: () => {
                setShowQueryForm(false);
                setQueryForm({ subject: '', description: '', directed_to: '', priority: 'normal' });
                setQueryErrors({});
            },
            onError: (errs) => setQueryErrors(errs),
            onFinish: () => setQueryProcessing(false),
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-2 text-sm">
                    <Link href={route('tasks.index')} className="text-gray-500 hover:text-gray-700">
                        Tasks
                    </Link>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4 text-gray-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                    <span className="font-semibold text-gray-800">Task #{task.id}</span>
                </div>
            }
        >
            <Head title={`Task #${task.id}`} />

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
                    {flash?.success && (
                        <div className="rounded-md bg-green-50 p-4">
                            <p className="text-sm text-green-800">{flash.success}</p>
                        </div>
                    )}
                    {flash?.error && (
                        <div className="rounded-md bg-red-50 p-4">
                            <p className="text-sm text-red-800">{flash.error}</p>
                        </div>
                    )}

                    {/* Status Pipeline */}
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg p-6">
                        <StatusPipeline currentStatus={task.status} />
                    </div>

                    {/* Two-column layout */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* LEFT COLUMN */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Header Card */}
                            <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                                <div className="bg-emerald-950 px-6 py-8">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="min-w-0 flex-1">
                                            <h1 className="text-xl font-semibold text-white">
                                                Task #{task.id} — {task.service_name}
                                            </h1>
                                            <p className="mt-1 text-sm text-emerald-200">
                                                Client: {task.customer_name}
                                            </p>
                                            <div className="mt-3 flex flex-wrap gap-2">
                                                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${priorityColors[task.priority]}`}>
                                                    {task.priority}
                                                </span>
                                                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[task.status]}`}>
                                                    {statusLabels[task.status]}
                                                </span>
                                                {task.is_overdue && (
                                                    <span className="inline-flex rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                                                        Overdue
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex shrink-0 gap-2">
                                            {task.can_edit && (
                                                <Link
                                                    href={route('tasks.edit', task.id)}
                                                    className="inline-flex items-center gap-1.5 rounded-md bg-white/10 px-3.5 py-2 text-sm font-medium text-white backdrop-blur-sm hover:bg-white/20"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                                    </svg>
                                                    Edit
                                                </Link>
                                            )}
                                            <Link
                                                href={route('tasks.index')}
                                                className="inline-flex items-center gap-1.5 rounded-md bg-white/10 px-3.5 py-2 text-sm font-medium text-white backdrop-blur-sm hover:bg-white/20"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                                                </svg>
                                                Back
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Tabbed Content */}
                            <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                                {/* Tab navigation */}
                                <div className="border-b border-gray-200">
                                    <nav className="flex space-x-8 px-6" aria-label="Tabs">
                                        {tabs.map((tab) => (
                                            <button
                                                key={tab.key}
                                                type="button"
                                                onClick={() => setActiveTab(tab.key)}
                                                className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                                                    activeTab === tab.key
                                                        ? 'border-emerald-500 text-emerald-600'
                                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                                }`}
                                            >
                                                {tab.label}
                                            </button>
                                        ))}
                                    </nav>
                                </div>

                                {/* Tab: Overview */}
                                {activeTab === 'overview' && (
                                    <div className="p-6">
                                        <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
                                            {/* Service */}
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4 text-gray-500">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.384 3.18.86-5.01L2.67 9.18l5.03-.73L10.04 3.6l2.34 4.85 5.03.73-3.64 3.55.86 5.01-5.38-3.18h.17z" />
                                                    </svg>
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs text-gray-500">Service</p>
                                                    <p className="text-sm font-medium text-gray-900">{task.service_name}</p>
                                                </div>
                                            </div>

                                            {/* Customer */}
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4 text-gray-500">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                                    </svg>
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs text-gray-500">Client</p>
                                                    <p className="text-sm font-medium text-gray-900">{task.customer_name}</p>
                                                </div>
                                            </div>

                                            {/* Responsible */}
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4 text-gray-500">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs text-gray-500">Responsible</p>
                                                    <p className="text-sm font-medium text-gray-900">{task.responsible_name}</p>
                                                </div>
                                            </div>

                                            {/* Collaborators */}
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4 text-gray-500">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                                                    </svg>
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs text-gray-500">Collaborators</p>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {task.collaborators.length > 0
                                                            ? task.collaborators.map((c) => c.name).join(', ')
                                                            : <span className="text-gray-400">None</span>}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Due Date */}
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4 text-gray-500">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                                                    </svg>
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs text-gray-500">Due Date</p>
                                                    <p className={`text-sm font-medium ${task.is_overdue ? 'text-red-600' : 'text-gray-900'}`}>
                                                        {task.due_date_display}
                                                        {task.is_overdue && <span className="ml-1 text-xs">(Overdue)</span>}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Priority */}
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4 text-gray-500">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                                                    </svg>
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs text-gray-500">Priority</p>
                                                    <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 capitalize ${priorityColors[task.priority]}`}>
                                                        {task.priority}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Status */}
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4 text-gray-500">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs text-gray-500">Status</p>
                                                    <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${statusColors[task.status]}`}>
                                                        {statusLabels[task.status]}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Created By */}
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4 text-gray-500">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                                    </svg>
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs text-gray-500">Created By</p>
                                                    <p className="text-sm font-medium text-gray-900">{task.created_by_name}</p>
                                                </div>
                                            </div>

                                            {/* Created At */}
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4 text-gray-500">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs text-gray-500">Created At</p>
                                                    <p className="text-sm font-medium text-gray-900">{task.created_at}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Instructions */}
                                        {task.instructions && (
                                            <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
                                                <h4 className="text-sm font-medium text-gray-700">Instructions</h4>
                                                <p className="mt-2 whitespace-pre-wrap text-sm text-gray-600">{task.instructions}</p>
                                            </div>
                                        )}

                                        {/* Linked Tasks */}
                                        {(task.parent_task_id || task.follow_up_tasks.length > 0) && (
                                            <div className="mt-6">
                                                <h4 className="text-sm font-medium text-gray-700 mb-2">Linked Tasks</h4>
                                                <div className="space-y-2">
                                                    {task.parent_task_id && (
                                                        <Link href={route('tasks.show', task.parent_task_id)} className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50 transition">
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4 text-gray-400"><path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" /></svg>
                                                            <span className="text-gray-600">Previous: Task #{task.parent_task_id}</span>
                                                        </Link>
                                                    )}
                                                    {task.follow_up_tasks.map((ft) => (
                                                        <Link key={ft.id} href={route('tasks.show', ft.id)} className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50 transition">
                                                            <div className="flex items-center gap-2">
                                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4 text-emerald-500"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                                                                <span className="text-gray-600">Follow-up: Task #{ft.id}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs text-gray-400">Due {ft.due_date}</span>
                                                                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[ft.status as TaskStatus] || 'bg-gray-100 text-gray-600'}`}>
                                                                    {statusLabels[ft.status as TaskStatus] || ft.status}
                                                                </span>
                                                            </div>
                                                        </Link>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Tab: Form / Submission */}
                                {activeTab === 'submission' && (
                                    <div className="p-6">
                                        {task.status === 'completed' && submission && form_schema && form_schema.length > 0 ? (
                                            <div>
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center gap-2">
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 text-emerald-500">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        <h3 className="text-base font-medium text-gray-900">Service Submission</h3>
                                                    </div>
                                                    <span className="text-xs text-gray-500">Submitted on {submission.created_at}</span>
                                                </div>
                                                {(() => {
                                                    const workData = submission.form_data?.form_data ?? submission.form_data ?? {};
                                                    const compData = submission.form_data?.completion_data ?? {};

                                                    const renderSubmissionField = (field: FormField, data: Record<string, any>) => {
                                                        const value = data[field.name];
                                                        let displayValue: React.ReactNode;
                                                        if (field.type === 'checkbox') {
                                                            displayValue = value ? 'Yes' : 'No';
                                                        } else if (field.type === 'file' || field.type === 'image') {
                                                            displayValue = value ? (
                                                                <a href={`/storage/${value}`} target="_blank" rel="noopener noreferrer" className="text-emerald-600 underline hover:text-emerald-900">View File</a>
                                                            ) : <span className="text-gray-400">Not provided</span>;
                                                        } else {
                                                            displayValue = value || <span className="text-gray-400">Not provided</span>;
                                                        }
                                                        return (
                                                            <div key={field.name} className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
                                                                <dt className="text-sm font-medium text-gray-500">{field.label}</dt>
                                                                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{displayValue}</dd>
                                                            </div>
                                                        );
                                                    };

                                                    const workDocSnaps = (submission.document_snapshot ?? []).filter((d) => d.phase === 'work');
                                                    const compDocSnaps = (submission.document_snapshot ?? []).filter((d) => d.phase === 'completion');

                                                    const renderDocSnapshot = (doc: DocSnapshot) => (
                                                        <div key={`${doc.phase}_${doc.document_type_id}`} className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
                                                            <dt className="text-sm font-medium text-gray-500">{doc.document_type_name}</dt>
                                                            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                                                                <div className="flex flex-wrap items-center gap-3">
                                                                    {doc.has_value && (doc.value ? <span>{doc.value}</span> : <span className="text-gray-400">No value</span>)}
                                                                    {doc.has_expiry && doc.issue_date && <span className="text-xs text-gray-500">Issued: {doc.issue_date}</span>}
                                                                    {doc.has_expiry && doc.expiry_date && <span className="text-xs text-gray-500">Expires: {doc.expiry_date}</span>}
                                                                    {doc.has_file && (doc.file_path ? (
                                                                        <a href={`/storage/${doc.file_path}`} target="_blank" rel="noopener noreferrer" className="text-emerald-600 underline hover:text-emerald-900 text-xs">View File</a>
                                                                    ) : <span className="text-gray-400 text-xs">No file</span>)}
                                                                </div>
                                                            </dd>
                                                        </div>
                                                    );

                                                    return (
                                                        <>
                                                            {(form_schema.length > 0 || workDocSnaps.length > 0) && (
                                                                <>
                                                                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Work Form</p>
                                                                    {workDocSnaps.length > 0 && (
                                                                        <div className="mb-3 rounded-lg border border-gray-100 bg-gray-50 p-3">
                                                                            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Customer Documents</p>
                                                                            <dl className="divide-y divide-gray-100">
                                                                                {workDocSnaps.map(renderDocSnapshot)}
                                                                            </dl>
                                                                        </div>
                                                                    )}
                                                                    {form_schema.length > 0 && (
                                                                        <dl className="divide-y divide-gray-100 mb-6">
                                                                            {form_schema.map((f) => renderSubmissionField(f, workData))}
                                                                        </dl>
                                                                    )}
                                                                </>
                                                            )}
                                                            {(completion_schema && completion_schema.length > 0) || compDocSnaps.length > 0 ? (
                                                                <>
                                                                    <p className="text-xs font-semibold uppercase tracking-wider text-amber-500 mb-1">Completion</p>
                                                                    {compDocSnaps.length > 0 && (
                                                                        <div className="mb-3 rounded-lg border border-amber-100 bg-amber-50/50 p-3">
                                                                            <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-400 mb-1">Uploaded Documents</p>
                                                                            <dl className="divide-y divide-amber-100">
                                                                                {compDocSnaps.map(renderDocSnapshot)}
                                                                            </dl>
                                                                        </div>
                                                                    )}
                                                                    {completion_schema && completion_schema.length > 0 && (
                                                                        <dl className="divide-y divide-gray-100">
                                                                            {completion_schema.map((f) => renderSubmissionField(f, compData))}
                                                                        </dl>
                                                                    )}
                                                                </>
                                                            ) : null}
                                                        </>
                                                    );
                                                })()}
                                            </div>
                                        ) : task.status === 'in_progress' ? (
                                            <div className="flex flex-col items-center justify-center py-12">
                                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-8 w-8 text-blue-500">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                                    </svg>
                                                </div>
                                                <h3 className="mt-4 text-base font-medium text-gray-900">
                                                    {task.has_draft ? 'Continue Working' : 'Work on Task'}
                                                </h3>
                                                <p className="mt-1 text-sm text-gray-500 text-center max-w-sm">
                                                    {task.has_draft
                                                        ? 'You have a saved draft. Continue filling out the service form.'
                                                        : 'Open the service form to fill in the required details and complete this task.'}
                                                </p>
                                                {canWorkOnForm && (
                                                    <Link
                                                        href={route('tasks.complete', task.id)}
                                                        className="mt-6 inline-flex items-center gap-2 rounded-md bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                                        </svg>
                                                        {task.has_draft ? 'Continue Working' : 'Work on Task'}
                                                    </Link>
                                                )}
                                            </div>
                                        ) : task.status === 'pending' ? (
                                            <div className="flex flex-col items-center justify-center py-12">
                                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-50">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-8 w-8 text-yellow-500">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </div>
                                                <h3 className="mt-4 text-base font-medium text-gray-900">Start Task</h3>
                                                <p className="mt-1 text-sm text-gray-500 text-center max-w-sm">
                                                    This task is pending. Start it to begin working on the service form.
                                                </p>
                                                {(canMarkInProgress || canStartAndWork) && (
                                                    <div className="mt-6 flex gap-3">
                                                        {canMarkInProgress && (
                                                            <button
                                                                type="button"
                                                                onClick={markInProgress}
                                                                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                                                            >
                                                                Mark as In Progress
                                                            </button>
                                                        )}
                                                        <Link
                                                            href={route('tasks.complete', task.id)}
                                                            className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                                                        >
                                                            Start & Work on Task
                                                        </Link>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-12">
                                                <p className="text-sm text-gray-500">No submission data available.</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Tab: Attachments */}
                                {activeTab === 'attachments' && (
                                    <div className="p-6">
                                        {task.attachments.length === 0 && uploadFiles.length === 0 && (
                                            <div className="rounded-lg border-2 border-dashed border-gray-200 p-8 text-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="mx-auto h-10 w-10 text-gray-300">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
                                                </svg>
                                                <p className="mt-2 text-sm text-gray-500">No attachments yet.</p>
                                            </div>
                                        )}

                                        {task.attachments.length > 0 && (
                                            <div className="space-y-2">
                                                {task.attachments.map((att) => (
                                                    <div key={att.id} className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 text-emerald-600">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                                            </svg>
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <a
                                                                href={att.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-sm font-medium text-emerald-600 hover:text-emerald-900 underline"
                                                            >
                                                                {att.original_name}
                                                            </a>
                                                            <p className="text-xs text-gray-500">
                                                                {formatFileSize(att.file_size)} · {att.uploaded_by_name} · {att.uploaded_at}
                                                            </p>
                                                        </div>
                                                        {att.can_delete && (
                                                            <button
                                                                onClick={() => deleteAttachment(att.id)}
                                                                className="shrink-0 text-red-400 hover:text-red-600"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                                                </svg>
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Upload area */}
                                        {task.can_add_attachments && (
                                            <div className="mt-4">
                                                {uploadFiles.length > 0 && (
                                                    <div className="mb-3 space-y-2">
                                                        {uploadFiles.map((file, index) => (
                                                            <div key={index} className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2">
                                                                <span className="min-w-0 flex-1 truncate text-sm text-gray-700">{file.name}</span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setUploadFiles((prev) => prev.filter((_, i) => i !== index))}
                                                                    className="shrink-0 text-red-400 hover:text-red-600"
                                                                >
                                                                    &times;
                                                                </button>
                                                            </div>
                                                        ))}
                                                        <PrimaryButton onClick={uploadAttachments} disabled={uploading}>
                                                            {uploading ? 'Uploading...' : 'Upload Files'}
                                                        </PrimaryButton>
                                                    </div>
                                                )}

                                                <input
                                                    type="file"
                                                    multiple
                                                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                                                    className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-emerald-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-emerald-700 hover:file:bg-emerald-100"
                                                    onChange={(e) => {
                                                        if (e.target.files) {
                                                            setUploadFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
                                                        }
                                                        e.target.value = '';
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Tab: Queries */}
                                {activeTab === 'queries' && (
                                    <div className="p-6">
                                        {/* Raise Query Button / Form */}
                                        {!showQueryForm ? (
                                            <button
                                                onClick={() => setShowQueryForm(true)}
                                                className="mb-4 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                                                Raise Query
                                            </button>
                                        ) : (
                                            <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-3">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Subject *</label>
                                                    <input type="text" value={queryForm.subject} onChange={(e) => setQueryForm({...queryForm, subject: e.target.value})} className="mt-1 block w-full rounded-lg border-gray-300 text-sm shadow-sm focus:border-emerald-500 focus:ring-emerald-500" placeholder="e.g., Trade license copy needed" />
                                                    {queryErrors.subject && <p className="mt-1 text-xs text-red-600">{queryErrors.subject}</p>}
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Description *</label>
                                                    <textarea value={queryForm.description} onChange={(e) => setQueryForm({...queryForm, description: e.target.value})} rows={3} className="mt-1 block w-full rounded-lg border-gray-300 text-sm shadow-sm focus:border-emerald-500 focus:ring-emerald-500" placeholder="Describe what you need..." />
                                                    {queryErrors.description && <p className="mt-1 text-xs text-red-600">{queryErrors.description}</p>}
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700">Directed To</label>
                                                        <select value={queryForm.directed_to} onChange={(e) => setQueryForm({...queryForm, directed_to: e.target.value})} className="mt-1 block w-full rounded-lg border-gray-300 text-sm shadow-sm focus:border-emerald-500 focus:ring-emerald-500">
                                                            <option value="">Anyone</option>
                                                            {(task_participants ?? []).map((p) => (
                                                                <option key={p.id} value={p.id}>{p.name} ({p.role})</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700">Priority</label>
                                                        <select value={queryForm.priority} onChange={(e) => setQueryForm({...queryForm, priority: e.target.value})} className="mt-1 block w-full rounded-lg border-gray-300 text-sm shadow-sm focus:border-emerald-500 focus:ring-emerald-500">
                                                            <option value="normal">Normal</option>
                                                            <option value="urgent">Urgent</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 pt-1">
                                                    <button onClick={submitQuery} disabled={queryProcessing} className="inline-flex items-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 disabled:opacity-50">
                                                        {queryProcessing ? 'Submitting...' : 'Submit Query'}
                                                    </button>
                                                    <button onClick={() => { setShowQueryForm(false); setQueryErrors({}); }} className="text-sm text-gray-500 hover:text-gray-700">Cancel</button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Query List */}
                                        {queries && queries.length > 0 ? (
                                            <div className="space-y-3">
                                                {queries.map((q) => (
                                                    <Link
                                                        key={q.id}
                                                        href={route('tasks.queries.show', [task.id, q.id])}
                                                        className="block rounded-lg border border-gray-200 p-4 hover:bg-gray-50 transition"
                                                    >
                                                        <div className="flex items-start justify-between">
                                                            <div className="min-w-0 flex-1">
                                                                <div className="flex items-center gap-2">
                                                                    <h4 className="text-sm font-medium text-gray-900 truncate">{q.subject}</h4>
                                                                    {q.priority === 'urgent' && (
                                                                        <span className="inline-flex rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-700">Urgent</span>
                                                                    )}
                                                                </div>
                                                                <p className="mt-1 text-xs text-gray-500">
                                                                    Raised by {q.raised_by_name}
                                                                    {q.directed_to_name && <> · To: {q.directed_to_name}</>}
                                                                    {' · '}{q.created_at}
                                                                    {q.responses_count > 0 && <> · {q.responses_count} {q.responses_count === 1 ? 'response' : 'responses'}</>}
                                                                </p>
                                                            </div>
                                                            <span className={`ml-3 shrink-0 inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                                q.status === 'open' ? 'bg-amber-100 text-amber-800' :
                                                                q.status === 'answered' ? 'bg-blue-100 text-blue-800' :
                                                                'bg-green-100 text-green-800'
                                                            }`}>
                                                                {q.status.charAt(0).toUpperCase() + q.status.slice(1)}
                                                            </span>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        ) : !showQueryForm && (
                                            <div className="rounded-lg border-2 border-dashed border-gray-200 p-8 text-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="mx-auto h-10 w-10 text-gray-300"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg>
                                                <p className="mt-2 text-sm font-medium text-gray-500">No queries yet</p>
                                                <p className="text-xs text-gray-400">Raise a query to request information or documents.</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* RIGHT COLUMN */}
                        <div className="lg:col-span-1 space-y-6">
                            {/* Quick Actions Card */}
                            {(canMarkInProgress || canStartAndWork || canWorkOnForm || task.can_edit) && (
                                <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                                    <div className="p-5">
                                        <h3 className="text-sm font-semibold text-gray-900">Quick Actions</h3>
                                        <div className="mt-3 space-y-2">
                                            {canMarkInProgress && (
                                                <button
                                                    type="button"
                                                    onClick={markInProgress}
                                                    className="flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                                                    </svg>
                                                    Start Task
                                                </button>
                                            )}
                                            {(canMarkInProgress || canStartAndWork) && (
                                                <Link
                                                    href={route('tasks.complete', task.id)}
                                                    className="flex w-full items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                                    </svg>
                                                    Start & Work on Task
                                                </Link>
                                            )}
                                            {canWorkOnForm && (
                                                <Link
                                                    href={route('tasks.complete', task.id)}
                                                    className="flex w-full items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                                    </svg>
                                                    {task.has_draft ? 'Continue Working' : 'Work on Task'}
                                                </Link>
                                            )}
                                            {task.can_edit && (
                                                <Link
                                                    href={route('tasks.edit', task.id)}
                                                    className="flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                                    </svg>
                                                    Edit Task
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Details Card */}
                            <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                                <div className="p-5">
                                    <h3 className="text-sm font-semibold text-gray-900">Details</h3>
                                    <div className="mt-3 space-y-3">
                                        {/* Due Date */}
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4 text-gray-500">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                                                </svg>
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs text-gray-500">Due Date</p>
                                                <p className={`text-sm font-medium ${task.is_overdue ? 'text-red-600' : 'text-gray-900'}`}>
                                                    {task.due_date_display}
                                                    {task.is_overdue && <span className="ml-1 text-xs">(Overdue)</span>}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Priority */}
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4 text-gray-500">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                                                </svg>
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs text-gray-500">Priority</p>
                                                <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 capitalize ${priorityColors[task.priority]}`}>
                                                    {task.priority}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Created At */}
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4 text-gray-500">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs text-gray-500">Created At</p>
                                                <p className="text-sm font-medium text-gray-900">{task.created_at}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* People Card */}
                            <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                                <div className="p-5">
                                    <h3 className="text-sm font-semibold text-gray-900">People</h3>
                                    <div className="mt-3 space-y-4">
                                        {/* Responsible */}
                                        <div>
                                            <p className="text-xs text-gray-500 mb-2">Responsible</p>
                                            <div className="flex items-center gap-2">
                                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                                                    {getInitials(task.responsible_name)}
                                                </div>
                                                <span className="text-sm font-medium text-gray-900">{task.responsible_name}</span>
                                            </div>
                                        </div>

                                        {/* Collaborators */}
                                        <div>
                                            <p className="text-xs text-gray-500 mb-2">Collaborators</p>
                                            {task.collaborators.length > 0 ? (
                                                <div className="space-y-2">
                                                    {task.collaborators.map((collab) => (
                                                        <div key={collab.id} className="flex items-center gap-2">
                                                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-700">
                                                                {getInitials(collab.name)}
                                                            </div>
                                                            <span className="min-w-0 flex-1 truncate text-sm text-gray-700">{collab.name}</span>
                                                            <span className={`shrink-0 inline-flex rounded-full px-1.5 py-0.5 text-[10px] font-medium ${collab.can_work ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                                                                {collab.can_work ? 'Can work' : 'View only'}
                                                            </span>
                                                            {task.can_manage_collaborators && (
                                                                <div className="flex shrink-0 items-center gap-1">
                                                                    <button
                                                                        onClick={() => router.patch(route('tasks.collaborators.toggle-work', [task.id, collab.id]), { can_work: !collab.can_work }, { preserveScroll: true })}
                                                                        className={`rounded p-0.5 transition ${collab.can_work ? 'text-emerald-500 hover:text-gray-400' : 'text-gray-400 hover:text-emerald-500'}`}
                                                                        title={collab.can_work ? 'Revoke work access' : 'Grant work access'}
                                                                    >
                                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-3.5 w-3.5">
                                                                            {collab.can_work ? (
                                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                                                            ) : (
                                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 119 0v3.75M3.75 21.75h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                                                            )}
                                                                        </svg>
                                                                    </button>
                                                                    <button
                                                                        onClick={() => router.delete(route('tasks.collaborators.remove', [task.id, collab.id]), { preserveScroll: true })}
                                                                        className="rounded p-0.5 text-gray-400 hover:text-red-500 transition"
                                                                        title="Remove collaborator"
                                                                    >
                                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-3.5 w-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-gray-400">None assigned</p>
                                            )}

                                            {/* Add collaborator */}
                                            {task.can_manage_collaborators && employees && employees.length > 0 && (() => {
                                                const existingIds = [task.responsible_id, ...task.collaborators.map((c) => c.id)];
                                                const available = employees.filter((e) => !existingIds.includes(e.id));
                                                if (available.length === 0) return null;
                                                return (
                                                    <div className="mt-3">
                                                        <select
                                                            className="block w-full rounded-lg border-gray-300 text-xs shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                                                            value=""
                                                            onChange={(e) => {
                                                                if (e.target.value) {
                                                                    router.post(route('tasks.collaborators.add', task.id), { user_id: Number(e.target.value), can_work: false }, { preserveScroll: true });
                                                                }
                                                            }}
                                                        >
                                                            <option value="">Add collaborator...</option>
                                                            {available.map((emp) => (
                                                                <option key={emp.id} value={emp.id}>{emp.name}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Activity Card */}
                            <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                                <div className="p-5">
                                    <h3 className="text-sm font-semibold text-gray-900">Activity</h3>

                                    {/* Compact comment form */}
                                    <form onSubmit={submitComment} className="mt-3">
                                        <textarea
                                            value={commentForm.data.body}
                                            onChange={(e) => commentForm.setData('body', e.target.value)}
                                            className="block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                                            rows={2}
                                            placeholder="Write a comment..."
                                        />
                                        <InputError message={commentForm.errors.body} className="mt-1" />
                                        <div className="mt-2 flex justify-end">
                                            <button
                                                type="submit"
                                                disabled={commentForm.processing || !commentForm.data.body.trim()}
                                                className="inline-flex items-center rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Post
                                            </button>
                                        </div>
                                    </form>

                                    {/* Comment Timeline */}
                                    {task.comments.length > 0 ? (
                                        <div className="mt-4 space-y-3">
                                            {task.comments.map((comment) => (
                                                <div key={comment.id} className="flex gap-2.5">
                                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                                                        {comment.user_initials}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <span className="text-sm font-medium text-gray-900">{comment.user_name}</span>
                                                            <span className="text-xs text-gray-400">{comment.created_at}</span>
                                                            {comment.can_delete && (
                                                                <button
                                                                    onClick={() => deleteComment(comment.id)}
                                                                    className="text-xs text-red-400 hover:text-red-600"
                                                                >
                                                                    Delete
                                                                </button>
                                                            )}
                                                        </div>
                                                        <p className="mt-0.5 whitespace-pre-wrap text-sm text-gray-600">{comment.body}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="mt-4 rounded-lg border-2 border-dashed border-gray-200 p-4 text-center">
                                            <p className="text-xs text-gray-400">No comments yet.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
