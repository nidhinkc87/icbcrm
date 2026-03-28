import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SearchableSelect from '@/Components/SearchableSelect';
import SelectInput from '@/Components/SelectInput';
import TextInput from '@/Components/TextInput';
import { Head, Link, router } from '@inertiajs/react';
import { FormEventHandler, useState, useRef } from 'react';

interface Option { id: number; name: string; }
interface Props { services: Option[]; customers: Option[]; employees: Option[]; }

export default function Create({ services, customers, employees }: Props) {
    const [data, setData] = useState({ service_id: '', customer_id: '', responsible_id: '', due_date: '', priority: 'medium', instructions: '' });
    const [collaboratorIds, setCollaboratorIds] = useState<number[]>([]);
    const [attachments, setAttachments] = useState<File[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const setField = (key: string, value: string) => setData((prev) => ({ ...prev, [key]: value }));
    const availableCollaborators = employees.filter((e) => String(e.id) !== data.responsible_id && !collaboratorIds.includes(e.id));
    const addCollaborator = (id: number) => { if (id && !collaboratorIds.includes(id)) setCollaboratorIds((prev) => [...prev, id]); };
    const removeCollaborator = (id: number) => setCollaboratorIds((prev) => prev.filter((cid) => cid !== id));

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        setProcessing(true);
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => formData.append(key, value));
        collaboratorIds.forEach((id, index) => formData.append(`collaborator_ids[${index}]`, String(id)));
        attachments.forEach((file, index) => formData.append(`attachments[${index}]`, file));
        router.post(route('tasks.store'), formData, { forceFormData: true, onError: (errs) => setErrors(errs), onFinish: () => setProcessing(false) });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-2 text-sm">
                    <Link href={route('tasks.index')} className="text-gray-500 hover:text-gray-700">Tasks</Link>
                    <span className="text-gray-400">/</span>
                    <span className="font-medium text-gray-900">Create Task</span>
                </div>
            }
        >
            <Head title="Create Task" />

            <div className="py-8">
                <div className="max-w-4xl px-4 sm:px-6 lg:px-8">
                    <div className="rounded-xl bg-white shadow-sm">
                        <div className="border-b border-gray-200 px-6 py-5">
                            <h2 className="text-lg font-semibold text-gray-900">Create New Task</h2>
                            <p className="mt-0.5 text-sm text-gray-500">Fill in the task details below to assign work.</p>
                        </div>

                        <form onSubmit={submit}>
                            {/* Section 1: Task Assignment */}
                            <div className="border-b border-gray-100 px-6 py-6">
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">1</div>
                                    <h3 className="text-base font-semibold text-gray-900">Task Assignment</h3>
                                </div>
                                <div className="grid grid-cols-1 gap-x-6 gap-y-4 pl-11 sm:grid-cols-2">
                                    <div>
                                        <InputLabel value="Service *" />
                                        <SearchableSelect options={services} value={data.service_id} onChange={(val) => setField('service_id', val)} placeholder="Select Service" />
                                        <InputError message={errors.service_id} className="mt-1" />
                                    </div>
                                    <div>
                                        <InputLabel value="Customer *" />
                                        <SearchableSelect options={customers} value={data.customer_id} onChange={(val) => setField('customer_id', val)} placeholder="Select Customer" />
                                        <InputError message={errors.customer_id} className="mt-1" />
                                    </div>
                                    <div>
                                        <InputLabel value="Responsible Person *" />
                                        <SearchableSelect options={employees} value={data.responsible_id} onChange={(val) => { setField('responsible_id', val); setCollaboratorIds((prev) => prev.filter((id) => id !== Number(val))); }} placeholder="Select Employee" />
                                        <InputError message={errors.responsible_id} className="mt-1" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="due_date" value="Due Date *" />
                                        <TextInput id="due_date" type="date" value={data.due_date} className="mt-1 block w-full" onChange={(e) => setField('due_date', e.target.value)} />
                                        <InputError message={errors.due_date} className="mt-1" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="priority" value="Priority *" />
                                        <SelectInput id="priority" value={data.priority} className="mt-1 block w-full" onChange={(e) => setField('priority', e.target.value)}>
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                            <option value="urgent">Urgent</option>
                                        </SelectInput>
                                        <InputError message={errors.priority} className="mt-1" />
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Instructions */}
                            <div className="border-b border-gray-100 px-6 py-6">
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">2</div>
                                    <h3 className="text-base font-semibold text-gray-900">Instructions</h3>
                                    <span className="text-xs text-gray-400">(Optional)</span>
                                </div>
                                <div className="pl-11">
                                    <textarea
                                        id="instructions"
                                        value={data.instructions}
                                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 text-sm"
                                        rows={4}
                                        placeholder="Provide instructions or notes for the assignee..."
                                        onChange={(e) => setField('instructions', e.target.value)}
                                    />
                                    <InputError message={errors.instructions} className="mt-1" />
                                </div>
                            </div>

                            {/* Section 3: Collaborators */}
                            <div className="border-b border-gray-100 px-6 py-6">
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">3</div>
                                    <h3 className="text-base font-semibold text-gray-900">Collaborators</h3>
                                    <span className="text-xs text-gray-400">(Optional)</span>
                                </div>
                                <div className="pl-11">
                                    {collaboratorIds.length > 0 && (
                                        <div className="mb-3 flex flex-wrap gap-2">
                                            {collaboratorIds.map((id) => {
                                                const emp = employees.find((e) => e.id === id);
                                                const initials = emp?.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) ?? '';
                                                return (
                                                    <div key={id} className="flex items-center gap-2 rounded-lg bg-gray-50 border border-gray-200 px-3 py-1.5">
                                                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-700">{initials}</div>
                                                        <span className="text-sm text-gray-700">{emp?.name}</span>
                                                        <button type="button" onClick={() => removeCollaborator(id)} className="text-gray-400 hover:text-red-500">&times;</button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                    {availableCollaborators.length > 0 && (
                                        <SelectInput className="block w-full sm:w-64" value="" onChange={(e) => { addCollaborator(Number(e.target.value)); e.target.value = ''; }}>
                                            <option value="">Add collaborator...</option>
                                            {availableCollaborators.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
                                        </SelectInput>
                                    )}
                                    <InputError message={errors.collaborator_ids} className="mt-1" />
                                </div>
                            </div>

                            {/* Section 4: Attachments */}
                            <div className="px-6 py-6">
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">4</div>
                                    <h3 className="text-base font-semibold text-gray-900">Attachments</h3>
                                    <span className="text-xs text-gray-400">(Optional)</span>
                                </div>
                                <div className="pl-11">
                                    {attachments.length > 0 && (
                                        <div className="mb-3 space-y-2">
                                            {attachments.map((file, index) => (
                                                <div key={index} className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4 shrink-0 text-gray-400"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                                                    <span className="min-w-0 flex-1 truncate text-sm text-gray-700">{file.name}</span>
                                                    <span className="shrink-0 text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(1)} MB</span>
                                                    <button type="button" onClick={() => setAttachments((prev) => prev.filter((_, i) => i !== index))} className="shrink-0 text-gray-400 hover:text-red-500">&times;</button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="cursor-pointer rounded-lg border-2 border-dashed border-gray-300 p-6 text-center transition-colors hover:border-emerald-400 hover:bg-emerald-50/30"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="mx-auto h-8 w-8 text-gray-300"><path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" /></svg>
                                        <p className="mt-2 text-sm text-gray-500">Click to browse files</p>
                                        <p className="mt-1 text-xs text-gray-400">PDF, images, Office docs. Max 20MB each.</p>
                                    </div>
                                    <input ref={fileInputRef} type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx" className="hidden" onChange={(e) => { if (e.target.files) setAttachments((prev) => [...prev, ...Array.from(e.target.files!)]); e.target.value = ''; }} />
                                    <InputError message={errors.attachments} className="mt-1" />
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="rounded-b-xl border-t border-gray-200 bg-gray-50 px-6 py-4">
                                <div className="flex items-center justify-end gap-3">
                                    <Link href={route('tasks.index')} className="text-sm font-medium text-gray-500 hover:text-gray-700">Cancel</Link>
                                    <PrimaryButton disabled={processing}>{processing ? 'Creating...' : 'Create Task'}</PrimaryButton>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
