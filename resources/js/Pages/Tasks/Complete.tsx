import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { FormField, PageProps } from '@/types';
import { useState } from 'react';

interface TaskSummary {
    id: number;
    service_name: string;
    customer_name: string;
    instructions: string | null;
    status: string;
    due_date_display: string;
    priority: string;
}

interface Props extends PageProps {
    task: TaskSummary;
    form_schema: FormField[];
    draft_data: Record<string, any>;
    completion_schema: FormField[];
    draft_completion_data: Record<string, any>;
}

const priorityColors: Record<string, string> = {
    low: 'bg-gray-100 text-gray-700',
    medium: 'bg-blue-100 text-blue-700',
    high: 'bg-amber-100 text-amber-700',
    urgent: 'bg-red-100 text-red-700',
};

export default function Complete({ task, form_schema, draft_data, completion_schema, draft_completion_data }: Props) {
    const { flash } = usePage<PageProps>().props;
    const [formData, setFormData] = useState<Record<string, any>>(() => {
        const initial: Record<string, any> = {};
        form_schema.forEach((field) => {
            if (draft_data[field.name] !== undefined && draft_data[field.name] !== null) {
                initial[field.name] = draft_data[field.name];
            } else {
                initial[field.name] = field.type === 'checkbox' ? false : '';
            }
        });
        return initial;
    });
    const [completionFormData, setCompletionFormData] = useState<Record<string, any>>(() => {
        const initial: Record<string, any> = {};
        (completion_schema ?? []).forEach((field) => {
            if (draft_completion_data?.[field.name] !== undefined && draft_completion_data[field.name] !== null) {
                initial[field.name] = draft_completion_data[field.name];
            } else {
                initial[field.name] = field.type === 'checkbox' ? false : '';
            }
        });
        return initial;
    });
    const [files, setFiles] = useState<Record<string, File | null>>({});
    const [completionFiles, setCompletionFiles] = useState<Record<string, File | null>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);
    const [savingDraft, setSavingDraft] = useState(false);
    const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null);
    const [followupDueDate, setFollowupDueDate] = useState('');
    const [followupStartDate, setFollowupStartDate] = useState('');
    const [followupNotes, setFollowupNotes] = useState('');

    const setValue = (name: string, value: any) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };
    const setCompletionValue = (name: string, value: any) => {
        setCompletionFormData((prev) => ({ ...prev, [name]: value }));
    };

    const allSchemaFields = [...form_schema, ...(completion_schema ?? [])];

    // Check if a field is filled (works for both schemas)
    const isFieldFilledCheck = (field: FormField, data: Record<string, any>, fileMap: Record<string, File | null>): boolean => {
        const val = data[field.name];
        if (field.type === 'checkbox') return val === true;
        if (field.type === 'file' || field.type === 'image') return !!fileMap[field.name] || (typeof val === 'string' && val !== '');
        return val !== '' && val !== null && val !== undefined;
    };

    // Progress calculation across both forms
    const workFilled = form_schema.filter((f) => isFieldFilledCheck(f, formData, files)).length;
    const completionFilled = (completion_schema ?? []).filter((f) => isFieldFilledCheck(f, completionFormData, completionFiles)).length;
    const totalFields = form_schema.length + (completion_schema ?? []).length;
    const filledCount = workFilled + completionFilled;
    const progress = totalFields > 0 ? Math.round((filledCount / totalFields) * 100) : 0;

    const allRequiredFilled =
        form_schema.filter((f) => f.required).every((f) => isFieldFilledCheck(f, formData, files)) &&
        (completion_schema ?? []).filter((f) => f.required).every((f) => isFieldFilledCheck(f, completionFormData, completionFiles));

    const buildFormData = (): FormData => {
        const data = new FormData();
        form_schema.forEach((field) => {
            if (field.type === 'file' || field.type === 'image') {
                if (files[field.name]) {
                    data.append(`form_data[${field.name}]`, files[field.name]!);
                }
            } else if (field.type === 'checkbox') {
                data.append(`form_data[${field.name}]`, formData[field.name] ? '1' : '0');
            } else {
                data.append(`form_data[${field.name}]`, formData[field.name] ?? '');
            }
        });
        (completion_schema ?? []).forEach((field) => {
            if (field.type === 'file' || field.type === 'image') {
                if (completionFiles[field.name]) {
                    data.append(`completion_data[${field.name}]`, completionFiles[field.name]!);
                }
            } else if (field.type === 'checkbox') {
                data.append(`completion_data[${field.name}]`, completionFormData[field.name] ? '1' : '0');
            } else {
                data.append(`completion_data[${field.name}]`, completionFormData[field.name] ?? '');
            }
        });
        if (followupDueDate) data.append('followup_due_date', followupDueDate);
        if (followupStartDate) data.append('followup_start_date', followupStartDate);
        if (followupNotes) data.append('followup_notes', followupNotes);
        return data;
    };

    const saveDraft = () => {
        setSavingDraft(true);
        router.post(route('tasks.save-draft', task.id), buildFormData(), {
            forceFormData: true,
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                setDraftSavedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
            },
            onError: (errs) => {
                const mapped: Record<string, string> = {};
                Object.entries(errs).forEach(([key, msg]) => {
                    mapped[key.replace('form_data.', '').replace('completion_data.', 'c_')] = msg;
                });
                setErrors(mapped);
            },
            onFinish: () => setSavingDraft(false),
        });
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        router.post(route('tasks.submit-completion', task.id), buildFormData(), {
            forceFormData: true,
            onError: (errs) => {
                const mapped: Record<string, string> = {};
                Object.entries(errs).forEach(([key, msg]) => {
                    mapped[key.replace('form_data.', '').replace('completion_data.', 'c_')] = msg;
                });
                setErrors(mapped);
            },
            onFinish: () => setProcessing(false),
        });
    };

    const renderField = (field: FormField, data: Record<string, any>, setVal: (n: string, v: any) => void, fileMap: Record<string, File | null>, setFileMap: (m: Record<string, File | null>) => void) => {
        const commonClass = 'mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 text-sm';
        const isFileField = field.type === 'file' || field.type === 'image';
        const hasDraftFile = isFileField && typeof data[field.name] === 'string' && data[field.name];

        switch (field.type) {
            case 'text':
                return <TextInput type="text" className={commonClass} value={data[field.name] ?? ''} placeholder={field.placeholder} onChange={(e) => setVal(field.name, e.target.value)} />;
            case 'textarea':
                return <textarea className={commonClass} rows={3} value={data[field.name] ?? ''} placeholder={field.placeholder} onChange={(e) => setVal(field.name, e.target.value)} />;
            case 'number':
                return <TextInput type="number" className={commonClass} value={data[field.name] ?? ''} placeholder={field.placeholder} onChange={(e) => setVal(field.name, e.target.value)} />;
            case 'date':
                return <TextInput type="date" className={commonClass} value={data[field.name] ?? ''} onChange={(e) => setVal(field.name, e.target.value)} />;
            case 'dropdown':
                return (
                    <select className={commonClass} value={data[field.name] ?? ''} onChange={(e) => setVal(field.name, e.target.value)}>
                        <option value="">{field.placeholder || 'Select...'}</option>
                        {field.options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                );
            case 'checkbox':
                return (
                    <label className="mt-2 flex items-center gap-2">
                        <input type="checkbox" className="rounded border-gray-300 text-emerald-600 shadow-sm focus:ring-emerald-500" checked={!!data[field.name]} onChange={(e) => setVal(field.name, e.target.checked)} />
                        <span className="text-sm text-gray-600">{field.placeholder || field.label}</span>
                    </label>
                );
            case 'file':
            case 'image':
                return (
                    <div className="mt-1">
                        {hasDraftFile && !fileMap[field.name] && (
                            <div className="mb-2 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <span>File saved in draft</span>
                            </div>
                        )}
                        <input type="file" accept={field.type === 'image' ? 'image/*' : undefined} className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-emerald-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-emerald-700 hover:file:bg-emerald-100" onChange={(e) => { setFileMap({...fileMap, [field.name]: e.target.files?.[0] ?? null}); }} />
                    </div>
                );
            default:
                return <TextInput type="text" className={commonClass} value={data[field.name] ?? ''} placeholder={field.placeholder} onChange={(e) => setVal(field.name, e.target.value)} />;
        }
    };

    const isFieldFilled = (field: FormField): boolean => isFieldFilledCheck(field, formData, files);
    const isCompletionFieldFilled = (field: FormField): boolean => isFieldFilledCheck(field, completionFormData, completionFiles);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-2 text-sm">
                    <Link href={route('tasks.index')} className="text-gray-500 hover:text-gray-700">Tasks</Link>
                    <span className="text-gray-400">/</span>
                    <Link href={route('tasks.show', task.id)} className="text-gray-500 hover:text-gray-700">Task #{task.id}</Link>
                    <span className="text-gray-400">/</span>
                    <span className="font-medium text-gray-900">Work</span>
                </div>
            }
        >
            <Head title={`Work on Task #${task.id}`} />

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {flash?.success && (
                        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4">
                            <p className="text-sm text-green-800">{flash.success}</p>
                        </div>
                    )}
                    {flash?.error && (
                        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
                            <p className="text-sm text-red-800">{flash.error}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                        {/* RIGHT: Task Info + Progress (sticky) */}
                        <div className="lg:col-span-4 lg:order-2">
                            <div className="sticky top-24 space-y-4">
                                {/* Task Info */}
                                <div className="rounded-xl bg-white p-5 shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 text-emerald-600"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" /></svg>
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-900">Task #{task.id}</h3>
                                            <p className="text-xs text-gray-500">{task.service_name}</p>
                                        </div>
                                    </div>
                                    <div className="mt-3 space-y-1">
                                        <p className="text-xs text-gray-500">Client: <span className="font-medium text-gray-700">{task.customer_name}</span></p>
                                        <div className="flex items-center gap-2">
                                            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${priorityColors[task.priority] || ''}`}>{task.priority}</span>
                                            <span className="text-xs text-gray-400">Due {task.due_date_display}</span>
                                        </div>
                                    </div>
                                    {draftSavedAt && (
                                        <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-600">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-3.5 w-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            Draft saved at {draftSavedAt}
                                        </div>
                                    )}
                                </div>

                                {/* Instructions */}
                                {task.instructions && (
                                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
                                        <div className="flex items-start gap-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="mt-0.5 h-4 w-4 shrink-0 text-amber-600"><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" /></svg>
                                            <div>
                                                <h4 className="text-sm font-semibold text-amber-800">Instructions</h4>
                                                <p className="mt-1 whitespace-pre-wrap text-sm text-amber-700">{task.instructions}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Progress */}
                                <div className="rounded-xl bg-white p-5 shadow-sm">
                                    <h4 className="text-sm font-semibold text-gray-900">Completion Progress</h4>
                                    <div className="mt-3">
                                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                                            <span>{filledCount} of {form_schema.length} fields</span>
                                            <span className="font-medium text-gray-900">{progress}%</span>
                                        </div>
                                        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                                            <div className="h-full rounded-full bg-emerald-500 transition-all duration-300" style={{ width: `${progress}%` }} />
                                        </div>
                                    </div>
                                    <div className="mt-4 space-y-1.5">
                                        {form_schema.length > 0 && (
                                            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Work Form</p>
                                        )}
                                        {form_schema.map((field) => {
                                            const filled = isFieldFilled(field);
                                            return (
                                                <div key={field.name} className="flex items-center gap-2">
                                                    {filled ? (
                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-emerald-500"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>
                                                    ) : (
                                                        <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
                                                    )}
                                                    <span className={`text-xs ${filled ? 'text-gray-700' : 'text-gray-400'}`}>
                                                        {field.label}
                                                        {field.required && <span className="ml-0.5 text-red-400">*</span>}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                        {completion_schema && completion_schema.length > 0 && (
                                            <>
                                                <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-500 mt-3 mb-1">Completion Evidence</p>
                                                {completion_schema.map((field) => {
                                                    const filled = isCompletionFieldFilled(field);
                                                    return (
                                                        <div key={`c_${field.name}`} className="flex items-center gap-2">
                                                            {filled ? (
                                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-emerald-500"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>
                                                            ) : (
                                                                <div className="h-4 w-4 rounded-full border-2 border-amber-300" />
                                                            )}
                                                            <span className={`text-xs ${filled ? 'text-gray-700' : 'text-gray-400'}`}>
                                                                {field.label}
                                                                {field.required && <span className="ml-0.5 text-red-400">*</span>}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </>
                                        )}
                                        {/* Follow-up */}
                                        <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-500 mt-3 mb-1">Follow-up Schedule</p>
                                        <div className="flex items-center gap-2">
                                            {followupDueDate ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-emerald-500"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>
                                            ) : (
                                                <div className="h-4 w-4 rounded-full border-2 border-blue-300" />
                                            )}
                                            <span className={`text-xs ${followupDueDate ? 'text-gray-700' : 'text-gray-400'}`}>
                                                Next Due Date
                                                <span className="ml-0.5 text-gray-300">(optional)</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* LEFT: Form */}
                        <div className="lg:col-span-8 lg:order-1 space-y-6">
                            <div className="rounded-xl bg-white shadow-sm">
                                <div className="border-b border-gray-200 px-6 py-5">
                                    <h3 className="text-lg font-semibold text-gray-900">{task.service_name} Form</h3>
                                    <p className="mt-0.5 text-sm text-gray-500">Fill in all required fields and submit when ready.</p>
                                </div>

                                {form_schema.length === 0 ? (
                                    <div className="p-6">
                                        <div className="rounded-lg border-2 border-dashed border-gray-200 p-8 text-center">
                                            <p className="text-sm text-gray-500">No form is configured for this service.</p>
                                        </div>
                                    </div>
                                ) : (
                                    <form onSubmit={submit}>
                                        <div className="p-6 space-y-5">
                                            {form_schema.map((field) => (
                                                <div key={field.name}>
                                                    <InputLabel
                                                        htmlFor={field.name}
                                                        value={field.label}
                                                        className={field.required ? "after:content-['*'] after:ml-0.5 after:text-red-500" : ''}
                                                    />
                                                    {renderField(field, formData, setValue, files, setFiles)}
                                                    <InputError message={errors[field.name]} className="mt-1" />
                                                </div>
                                            ))}
                                        </div>
                                    </form>
                                )}
                            </div>

                            {/* Completion Evidence - Separate Card */}
                            {completion_schema && completion_schema.length > 0 && (
                                <div className="rounded-xl bg-white shadow-sm">
                                    <div className="border-b border-gray-200 px-6 py-5">
                                        <h3 className="text-lg font-semibold text-gray-900">Completion Evidence</h3>
                                        <p className="mt-0.5 text-sm text-gray-500">Required documents and details to complete this task.</p>
                                    </div>
                                    <div className="p-6 space-y-5">
                                        {completion_schema.map((field) => (
                                            <div key={`c_${field.name}`}>
                                                <InputLabel
                                                    htmlFor={`c_${field.name}`}
                                                    value={field.label}
                                                    className={field.required ? "after:content-['*'] after:ml-0.5 after:text-red-500" : ''}
                                                />
                                                {renderField(field, completionFormData, setCompletionValue, completionFiles, setCompletionFiles)}
                                                <InputError message={errors[`c_${field.name}`]} className="mt-1" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Follow-up Task Scheduling */}
                            <div className="rounded-xl bg-white shadow-sm">
                                <div className="border-b border-gray-200 px-6 py-5">
                                    <h3 className="text-lg font-semibold text-gray-900">Schedule Follow-up</h3>
                                    <p className="mt-0.5 text-sm text-gray-500">Optionally schedule a follow-up task (e.g., next renewal, next filing period).</p>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div>
                                            <InputLabel htmlFor="followup_due_date" value="Next Due Date" />
                                            <TextInput
                                                id="followup_due_date"
                                                type="date"
                                                className="mt-1 block w-full rounded-lg border-gray-300 text-sm shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                                                value={followupDueDate}
                                                onChange={(e) => setFollowupDueDate(e.target.value)}
                                            />
                                            <InputError message={errors['followup_due_date']} className="mt-1" />
                                            <p className="mt-1 text-xs text-gray-400">When the follow-up task is due</p>
                                        </div>
                                        <div>
                                            <InputLabel htmlFor="followup_start_date" value="Work Start Date" />
                                            <TextInput
                                                id="followup_start_date"
                                                type="date"
                                                className="mt-1 block w-full rounded-lg border-gray-300 text-sm shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                                                value={followupStartDate}
                                                onChange={(e) => setFollowupStartDate(e.target.value)}
                                            />
                                            <InputError message={errors['followup_start_date']} className="mt-1" />
                                            <p className="mt-1 text-xs text-gray-400">When work should begin (optional)</p>
                                        </div>
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="followup_notes" value="Notes" />
                                        <textarea
                                            id="followup_notes"
                                            className="mt-1 block w-full rounded-lg border-gray-300 text-sm shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                                            rows={2}
                                            placeholder="Any notes for the follow-up task..."
                                            value={followupNotes}
                                            onChange={(e) => setFollowupNotes(e.target.value)}
                                        />
                                        <InputError message={errors['followup_notes']} className="mt-1" />
                                    </div>
                                    {followupDueDate && (
                                        <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3">
                                            <p className="text-sm text-emerald-800">
                                                A new task will be created for <strong>{task.service_name}</strong> with due date <strong>{followupDueDate}</strong>, assigned to the same team.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Sticky Footer Card */}
                            <div className="sticky bottom-0 rounded-xl bg-white shadow-sm border border-gray-200">
                                <div className="px-6 py-4">
                                    <div className="flex items-center justify-between">
                                        <Link href={route('tasks.show', task.id)} className="text-sm font-medium text-gray-500 hover:text-gray-700">
                                            Back to Task
                                        </Link>
                                        <div className="flex items-center gap-3">
                                            {draftSavedAt && (
                                                <span className="hidden sm:inline text-xs text-gray-400">Saved at {draftSavedAt}</span>
                                            )}
                                            <SecondaryButton type="button" onClick={saveDraft} disabled={savingDraft}>
                                                {savingDraft ? 'Saving...' : 'Save Draft'}
                                            </SecondaryButton>
                                            <PrimaryButton type="button" onClick={submit} disabled={processing || !allRequiredFilled} title={!allRequiredFilled ? 'Fill all required fields to submit' : ''}>
                                                {processing ? 'Submitting...' : 'Submit & Complete'}
                                            </PrimaryButton>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
