import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DangerButton from '@/Components/DangerButton';
import DataTable, { Column } from '@/Components/DataTable';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import TaskCard from '@/Components/Tasks/TaskCard';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Paginated, PageProps } from '@/types';
import { useState } from 'react';

type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
type TaskStatus = 'pending' | 'in_progress' | 'completed';

interface TaskRow {
    id: number;
    service_name: string;
    client_name: string;
    responsible_name: string;
    priority: TaskPriority;
    status: TaskStatus;
    due_date: string;
    created_at: string;
    is_overdue: boolean;
}

interface BoardTask {
    id: number;
    service_name: string;
    client_name: string;
    responsible_name: string;
    priority: TaskPriority;
    due_date: string;
    is_overdue: boolean;
}

interface Props extends PageProps {
    tasks: Paginated<TaskRow>;
    filters: {
        status: string | null;
        search?: string | null;
        sort?: string;
        direction?: string;
        per_page?: number;
        view?: string;
        [key: string]: unknown;
    };
    counts: {
        all: number;
        pending: number;
        in_progress: number;
        completed: number;
    };
    can_create: boolean;
    board_tasks?: {
        pending: BoardTask[];
        in_progress: BoardTask[];
        completed: BoardTask[];
    } | null;
}

const priorityRowBorder: Record<TaskPriority, string> = {
    low: 'border-l-gray-300',
    medium: 'border-l-blue-400',
    high: 'border-l-amber-400',
    urgent: 'border-l-red-500',
};

const priorityBadge: Record<TaskPriority, string> = {
    low: 'bg-gray-100 text-gray-700',
    medium: 'bg-blue-100 text-blue-700',
    high: 'bg-amber-100 text-amber-700',
    urgent: 'bg-red-100 text-red-700',
};

const statusBadge: Record<TaskStatus, string> = {
    pending: 'bg-amber-100 text-amber-700',
    in_progress: 'bg-blue-100 text-blue-700',
    completed: 'bg-emerald-100 text-emerald-700',
};

const statusLabel: Record<TaskStatus, string> = {
    pending: 'Pending',
    in_progress: 'In Progress',
    completed: 'Completed',
};

export default function Index({ tasks, filters, counts, can_create, board_tasks }: Props) {
    const { flash } = usePage<PageProps>().props;
    const [confirmingDelete, setConfirmingDelete] = useState(false);
    const [deletingTaskId, setDeletingTaskId] = useState<number | null>(null);
    const [deleting, setDeleting] = useState(false);

    const currentView = filters.view || 'list';
    const currentStatus = filters.status || null;

    const switchView = (mode: string) => {
        router.get(
            route('tasks.index'),
            { ...filters, view: mode },
            { preserveState: true, preserveScroll: true },
        );
    };

    const filterByStatus = (value: string | null) => {
        const params: Record<string, string> = { view: currentView };
        if (value) {
            params.status = value;
        }
        router.get(route('tasks.index'), params, { preserveState: true });
    };

    const openDeleteModal = (taskId: number) => {
        setDeletingTaskId(taskId);
        setConfirmingDelete(true);
    };

    const closeDeleteModal = () => {
        setConfirmingDelete(false);
        setDeletingTaskId(null);
    };

    const confirmDelete = () => {
        if (!deletingTaskId) return;
        setDeleting(true);
        router.delete(route('tasks.destroy', deletingTaskId), {
            onFinish: () => {
                setDeleting(false);
                closeDeleteModal();
            },
        });
    };

    const statusPills: { label: string; value: string | null; countKey: keyof typeof counts }[] = [
        { label: 'All', value: null, countKey: 'all' },
        { label: 'Pending', value: 'pending', countKey: 'pending' },
        { label: 'In Progress', value: 'in_progress', countKey: 'in_progress' },
        { label: 'Completed', value: 'completed', countKey: 'completed' },
    ];

    const pillCountBg: Record<string, string> = {
        all: 'bg-gray-200/70',
        pending: 'bg-amber-200/70',
        in_progress: 'bg-blue-200/70',
        completed: 'bg-emerald-200/70',
    };

    const columns: Column<TaskRow>[] = [
        {
            key: 'service_name',
            label: 'Service',
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div className={`h-8 w-1 shrink-0 rounded-full ${
                        row.priority === 'low' ? 'bg-gray-300' :
                        row.priority === 'medium' ? 'bg-blue-400' :
                        row.priority === 'high' ? 'bg-amber-400' :
                        'bg-red-500'
                    }`} />
                    <span className="font-medium text-gray-900">{row.service_name}</span>
                </div>
            ),
        },
        {
            key: 'client_name',
            label: 'Client',
            render: (row) => <span className="text-gray-700">{row.client_name}</span>,
        },
        {
            key: 'responsible_name',
            label: 'Responsible',
            render: (row) => <span className="text-gray-700">{row.responsible_name}</span>,
        },
        {
            key: 'priority',
            label: 'Priority',
            sortable: true,
            render: (row) => (
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${priorityBadge[row.priority]}`}>
                    {row.priority}
                </span>
            ),
        },
        {
            key: 'status',
            label: 'Status',
            sortable: true,
            render: (row) => (
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadge[row.status]}`}>
                    {statusLabel[row.status]}
                </span>
            ),
        },
        {
            key: 'due_date',
            label: 'Due Date',
            sortable: true,
            render: (row) => (
                <span className={row.is_overdue ? 'font-medium text-red-600' : 'text-gray-700'}>
                    {row.due_date}
                    {row.is_overdue && (
                        <svg className="ml-1 inline h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                        </svg>
                    )}
                </span>
            ),
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (row) => (
                <div className="flex items-center gap-2">
                    <Link
                        href={route('tasks.show', row.id)}
                        className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-emerald-600"
                        title="View task"
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.64 0 8.577 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.64 0-8.577-3.007-9.963-7.178z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </Link>
                    <button
                        onClick={() => openDeleteModal(row.id)}
                        className="rounded-lg p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                        title="Delete task"
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                    </button>
                </div>
            ),
        },
    ];

    const boardColumns: { key: string; label: string; dotColor: string; tasks: BoardTask[] }[] = [
        {
            key: 'pending',
            label: 'Pending',
            dotColor: 'bg-amber-400',
            tasks: board_tasks?.pending ?? [],
        },
        {
            key: 'in_progress',
            label: 'In Progress',
            dotColor: 'bg-blue-400',
            tasks: board_tasks?.in_progress ?? [],
        },
        {
            key: 'completed',
            label: 'Completed',
            dotColor: 'bg-emerald-400',
            tasks: board_tasks?.completed ?? [],
        },
    ];

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">Tasks</h2>
            }
        >
            <Head title="Tasks" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
                    {/* Flash Messages */}
                    {flash?.success && (
                        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                            <div className="flex items-center gap-3">
                                <svg className="h-5 w-5 shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-sm font-medium text-emerald-800">{flash.success}</p>
                            </div>
                        </div>
                    )}
                    {flash?.error && (
                        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                            <div className="flex items-center gap-3">
                                <svg className="h-5 w-5 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                                </svg>
                                <p className="text-sm font-medium text-red-800">{flash.error}</p>
                            </div>
                        </div>
                    )}

                    {/* Stat Cards */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        {/* Pending */}
                        <div className="rounded-xl border border-gray-200 border-b-4 border-b-amber-400 bg-white p-5 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Pending</p>
                                    <p className="mt-1 text-3xl font-bold text-gray-900">{counts.pending}</p>
                                </div>
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50">
                                    <svg className="h-6 w-6 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* In Progress */}
                        <div className="rounded-xl border border-gray-200 border-b-4 border-b-blue-400 bg-white p-5 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">In Progress</p>
                                    <p className="mt-1 text-3xl font-bold text-gray-900">{counts.in_progress}</p>
                                </div>
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                                    <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182M2.985 19.644l3.181-3.183" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Completed */}
                        <div className="rounded-xl border border-gray-200 border-b-4 border-b-emerald-400 bg-white p-5 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Completed</p>
                                    <p className="mt-1 text-3xl font-bold text-gray-900">{counts.completed}</p>
                                </div>
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">
                                    <svg className="h-6 w-6 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filter Bar */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-wrap items-center gap-2">
                            {statusPills.map((pill) => (
                                <button
                                    key={pill.label}
                                    onClick={() => filterByStatus(pill.value)}
                                    className={`inline-flex items-center rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                                        (pill.value === null && currentStatus === null) ||
                                        pill.value === currentStatus
                                            ? 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-600/20'
                                            : 'bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50'
                                    }`}
                                >
                                    {pill.label}
                                    <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-xs ${pillCountBg[pill.countKey]}`}>
                                        {counts[pill.countKey]}
                                    </span>
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center gap-3">
                            {/* View Toggle */}
                            <div className="inline-flex rounded-lg bg-gray-100 p-0.5">
                                <button
                                    onClick={() => switchView('list')}
                                    className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition ${
                                        currentView === 'list'
                                            ? 'bg-white shadow-sm text-gray-900'
                                            : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                                    </svg>
                                    List
                                </button>
                                <button
                                    onClick={() => switchView('board')}
                                    className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition ${
                                        currentView === 'board'
                                            ? 'bg-white shadow-sm text-gray-900'
                                            : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 4.5v15m6-15v15m-10.875 0h15.75c.621 0 1.125-.504 1.125-1.125V5.625c0-.621-.504-1.125-1.125-1.125H4.125C3.504 4.5 3 5.004 3 5.625v12.75c0 .621.504 1.125 1.125 1.125z" />
                                    </svg>
                                    Board
                                </button>
                            </div>

                            {/* Create Task Button */}
                            {can_create && (
                                <Link
                                    href={route('tasks.create')}
                                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                                >
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                    </svg>
                                    Create Task
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* List View */}
                    {currentView === 'list' && (
                        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                            <DataTable<TaskRow>
                                data={tasks}
                                columns={columns}
                                filters={filters}
                                routeName="tasks.index"
                                routeParams={{ status: filters.status, view: 'list' }}
                            />
                        </div>
                    )}

                    {/* Board View */}
                    {currentView === 'board' && (
                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                            {boardColumns.map((col) => (
                                <div key={col.key} className="rounded-xl bg-gray-50/80 p-3">
                                    <div className="mb-3 flex items-center gap-2 px-1">
                                        <div className={`h-2.5 w-2.5 rounded-full ${col.dotColor}`} />
                                        <h3 className="text-sm font-semibold text-gray-700">{col.label}</h3>
                                        <span className="ml-auto rounded-full bg-gray-200/80 px-2 py-0.5 text-xs font-medium text-gray-600">
                                            {col.tasks.length}
                                        </span>
                                    </div>
                                    <div className="space-y-2.5">
                                        {col.tasks.length === 0 && (
                                            <div className="rounded-lg border-2 border-dashed border-gray-200 px-4 py-8 text-center">
                                                <p className="text-sm text-gray-400">No tasks</p>
                                            </div>
                                        )}
                                        {col.tasks.map((task) => (
                                            <TaskCard key={task.id} task={task} />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <Modal show={confirmingDelete} onClose={closeDeleteModal} maxWidth="md">
                <div className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100">
                            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Delete Task</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Are you sure you want to delete this task? This action cannot be undone. All attachments, comments, and related data will be permanently removed.
                            </p>
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton onClick={closeDeleteModal} disabled={deleting}>
                            Cancel
                        </SecondaryButton>
                        <DangerButton onClick={confirmDelete} disabled={deleting}>
                            {deleting ? 'Deleting...' : 'Delete Task'}
                        </DangerButton>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
