import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DangerButton from '@/Components/DangerButton';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Paginated, PageProps } from '@/types';
import { useState } from 'react';

interface RuleRow {
    id: number;
    name: string;
    document_type_id: number;
    trigger_days_before: number;
    action: string;
    service_id: number | null;
    assignment_strategy: string;
    assigned_employee_id: number | null;
    notify_customer: boolean;
    notify_admin: boolean;
    priority: string;
    is_active: boolean;
    document_type?: { id: number; name: string };
    service_ids: number[] | null;
    service_names: string[];
    assigned_employee?: { id: number; name: string } | null;
}

interface Props extends PageProps {
    rules: Paginated<RuleRow>;
}

const priorityBadge = (priority: string) => {
    const styles: Record<string, string> = {
        low: 'bg-gray-100 text-gray-800',
        medium: 'bg-blue-100 text-blue-800',
        high: 'bg-orange-100 text-orange-800',
        urgent: 'bg-red-100 text-red-800',
    };
    return (
        <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${styles[priority] || 'bg-gray-100 text-gray-800'}`}>
            {priority}
        </span>
    );
};

const actionLabel = (action: string) => {
    return action === 'auto_create_task' ? 'Auto Create Task' : 'Notify Only';
};

const strategyLabel = (strategy: string) => {
    const labels: Record<string, string> = {
        last_employee: 'Last Employee',
        admin: 'Admin',
        specific_employee: 'Specific Employee',
    };
    return labels[strategy] || strategy;
};

export default function Index({ rules }: Props) {
    const { flash } = usePage<PageProps>().props;
    const [confirmingDeletion, setConfirmingDeletion] = useState(false);
    const [ruleToDelete, setRuleToDelete] = useState<RuleRow | null>(null);

    const confirmDelete = (rule: RuleRow) => {
        setRuleToDelete(rule);
        setConfirmingDeletion(true);
    };

    const deleteRule = () => {
        if (ruleToDelete) {
            router.delete(route('admin.expiry-rules.destroy', ruleToDelete.id), {
                onSuccess: () => {
                    setConfirmingDeletion(false);
                    setRuleToDelete(null);
                },
            });
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Expiry Action Rules
                </h2>
            }
        >
            <Head title="Expiry Action Rules" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {flash?.success && (
                        <div className="mb-4 rounded-md bg-green-50 p-4">
                            <p className="text-sm text-green-800">{flash.success}</p>
                        </div>
                    )}

                    <div className="mb-4 flex justify-end">
                        <Link
                            href={route('admin.expiry-rules.create')}
                            className="inline-flex items-center rounded-md border border-transparent bg-emerald-600 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition duration-150 ease-in-out hover:bg-emerald-700 focus:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 active:bg-emerald-900"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="-ml-0.5 mr-2 h-4 w-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            Create Rule
                        </Link>
                    </div>

                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Document Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Trigger</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Action</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Service</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Assignment</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Priority</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Active</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {rules.data.length === 0 && (
                                        <tr>
                                            <td colSpan={9} className="px-6 py-8 text-center text-sm text-gray-500">
                                                No expiry rules found. Create one to get started.
                                            </td>
                                        </tr>
                                    )}
                                    {rules.data.map((rule) => (
                                        <tr key={rule.id} className="hover:bg-gray-50">
                                            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                                                {rule.name}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                                                {rule.document_type?.name || '-'}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                                                {rule.trigger_days_before} days
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                                                {actionLabel(rule.action)}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                                                {rule.service_names?.length > 0 ? rule.service_names.join(', ') : '-'}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                                                {strategyLabel(rule.assignment_strategy)}
                                                {rule.assigned_employee && (
                                                    <span className="ml-1 text-gray-500">({rule.assigned_employee.name})</span>
                                                )}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm">
                                                {priorityBadge(rule.priority)}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm">
                                                <span
                                                    className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                                                        rule.is_active
                                                            ? 'bg-emerald-100 text-emerald-800'
                                                            : 'bg-gray-100 text-gray-800'
                                                    }`}
                                                >
                                                    {rule.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm">
                                                <div className="flex items-center space-x-2">
                                                    <Link
                                                        href={route('admin.expiry-rules.edit', rule.id)}
                                                        className="rounded p-1 text-gray-400 transition hover:bg-emerald-50 hover:text-emerald-600"
                                                        title="Edit"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                                        </svg>
                                                    </Link>
                                                    <button
                                                        onClick={() => confirmDelete(rule)}
                                                        className="rounded p-1 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                                                        title="Delete"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {rules.last_page > 1 && (
                            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-6 py-4">
                                <div className="text-sm text-gray-700">
                                    Showing <span className="font-medium">{(rules.current_page - 1) * rules.per_page + 1}</span> to{' '}
                                    <span className="font-medium">{Math.min(rules.current_page * rules.per_page, rules.total)}</span> of{' '}
                                    <span className="font-medium">{rules.total}</span> results
                                </div>
                                <div className="flex space-x-1">
                                    {rules.links.map((link, index) => (
                                        <Link
                                            key={index}
                                            href={link.url || '#'}
                                            className={`relative inline-flex items-center rounded-md px-3 py-2 text-sm font-medium ${
                                                link.active
                                                    ? 'z-10 bg-emerald-600 text-white'
                                                    : link.url
                                                      ? 'text-gray-500 hover:bg-gray-50'
                                                      : 'cursor-not-allowed text-gray-300'
                                            }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                            preserveScroll
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Modal show={confirmingDeletion} onClose={() => setConfirmingDeletion(false)}>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900">
                        Delete Expiry Rule
                    </h2>
                    <p className="mt-1 text-sm text-gray-600">
                        Are you sure you want to delete <strong>{ruleToDelete?.name}</strong>? This action cannot be undone.
                    </p>
                    <div className="mt-6 flex justify-end space-x-3">
                        <SecondaryButton onClick={() => setConfirmingDeletion(false)}>
                            Cancel
                        </SecondaryButton>
                        <DangerButton onClick={deleteRule}>
                            Delete Rule
                        </DangerButton>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
