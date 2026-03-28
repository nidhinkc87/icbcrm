import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

interface Option { id: number; name: string; }

interface Props {
    document_types: Option[];
    services: Option[];
    employees: Option[];
}

export default function Create({ document_types, services, employees }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        document_type_id: '',
        trigger_days_before: '30',
        action: 'notify_only',
        service_id: '',
        assignment_strategy: 'last_employee',
        assigned_employee_id: '',
        notify_customer: true,
        notify_admin: true,
        priority: 'medium',
        is_active: true,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('admin.expiry-rules.store'));
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Create Expiry Rule</h2>}>
            <Head title="Create Expiry Rule" />

            <div className="py-12">
                <div className="max-w-3xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white p-6 shadow-sm sm:rounded-lg">
                        <form onSubmit={submit}>
                            {/* Basic */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="sm:col-span-2">
                                    <InputLabel htmlFor="name" value="Rule Name *" />
                                    <TextInput id="name" value={data.name} className="mt-1 block w-full" onChange={(e) => setData('name', e.target.value)} required />
                                    <InputError message={errors.name} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="document_type_id" value="Document Type *" />
                                    <select id="document_type_id" value={data.document_type_id} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500" onChange={(e) => setData('document_type_id', e.target.value)} required>
                                        <option value="">Select Document Type</option>
                                        {document_types.map((dt) => <option key={dt.id} value={dt.id}>{dt.name}</option>)}
                                    </select>
                                    <InputError message={errors.document_type_id} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="trigger_days_before" value="Trigger (days before expiry) *" />
                                    <TextInput id="trigger_days_before" type="number" min="0" max="365" value={data.trigger_days_before} className="mt-1 block w-full" onChange={(e) => setData('trigger_days_before', e.target.value)} required />
                                    <InputError message={errors.trigger_days_before} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="priority" value="Priority *" />
                                    <select id="priority" value={data.priority} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500" onChange={(e) => setData('priority', e.target.value)}>
                                        {['low', 'medium', 'high', 'urgent'].map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                                    </select>
                                    <InputError message={errors.priority} className="mt-2" />
                                </div>
                            </div>

                            {/* Action */}
                            <h3 className="mt-8 border-t border-gray-200 pt-6 text-lg font-medium text-gray-900">Action</h3>
                            <div className="mt-4 space-y-3">
                                <label className="flex items-center gap-2">
                                    <input type="radio" name="action" className="border-gray-300 text-emerald-600 focus:ring-emerald-500" checked={data.action === 'notify_only'} onChange={() => setData('action', 'notify_only')} />
                                    <span className="text-sm text-gray-700">Notify Only</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <input type="radio" name="action" className="border-gray-300 text-emerald-600 focus:ring-emerald-500" checked={data.action === 'auto_create_task'} onChange={() => setData('action', 'auto_create_task')} />
                                    <span className="text-sm text-gray-700">Auto-Create Task</span>
                                </label>
                            </div>

                            {data.action === 'auto_create_task' && (
                                <div className="mt-4">
                                    <InputLabel htmlFor="service_id" value="Service for Task *" />
                                    <select id="service_id" value={data.service_id} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500" onChange={(e) => setData('service_id', e.target.value)} required>
                                        <option value="">Select Service</option>
                                        {services.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                    <InputError message={errors.service_id} className="mt-2" />
                                </div>
                            )}

                            {/* Assignment */}
                            <h3 className="mt-8 border-t border-gray-200 pt-6 text-lg font-medium text-gray-900">Assignment Strategy</h3>
                            <div className="mt-4 space-y-3">
                                {([
                                    ['last_employee', 'Last Employee (who completed the service for this customer)'],
                                    ['admin', 'Admin'],
                                    ['specific_employee', 'Specific Employee'],
                                ] as const).map(([val, label]) => (
                                    <label key={val} className="flex items-center gap-2">
                                        <input type="radio" name="assignment_strategy" className="border-gray-300 text-emerald-600 focus:ring-emerald-500" checked={data.assignment_strategy === val} onChange={() => setData('assignment_strategy', val)} />
                                        <span className="text-sm text-gray-700">{label}</span>
                                    </label>
                                ))}
                            </div>

                            {data.assignment_strategy === 'specific_employee' && (
                                <div className="mt-4">
                                    <InputLabel htmlFor="assigned_employee_id" value="Assign To *" />
                                    <select id="assigned_employee_id" value={data.assigned_employee_id} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500" onChange={(e) => setData('assigned_employee_id', e.target.value)} required>
                                        <option value="">Select Employee</option>
                                        {employees.map((emp) => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
                                    </select>
                                    <InputError message={errors.assigned_employee_id} className="mt-2" />
                                </div>
                            )}

                            {/* Notifications */}
                            <h3 className="mt-8 border-t border-gray-200 pt-6 text-lg font-medium text-gray-900">Notifications</h3>
                            <div className="mt-4 space-y-3">
                                <label className="flex items-center gap-2">
                                    <input type="checkbox" className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" checked={data.notify_customer} onChange={(e) => setData('notify_customer', e.target.checked)} />
                                    <span className="text-sm text-gray-700">Notify Customer</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <input type="checkbox" className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" checked={data.notify_admin} onChange={(e) => setData('notify_admin', e.target.checked)} />
                                    <span className="text-sm text-gray-700">Notify Admin</span>
                                </label>
                            </div>

                            {/* Active */}
                            <div className="mt-6">
                                <label className="flex items-center gap-2">
                                    <input type="checkbox" className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" checked={data.is_active} onChange={(e) => setData('is_active', e.target.checked)} />
                                    <span className="text-sm font-medium text-gray-700">Active</span>
                                </label>
                            </div>

                            <div className="mt-8 flex items-center justify-end space-x-4 border-t border-gray-200 pt-6">
                                <Link href={route('admin.expiry-rules.index')} className="rounded-md text-sm text-gray-600 underline hover:text-gray-900">Cancel</Link>
                                <PrimaryButton disabled={processing}>Create Rule</PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
