import { FormField } from '@/types';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import SelectInput from '@/Components/SelectInput';
import Checkbox from '@/Components/Checkbox';

interface DynamicFormRendererProps {
    schema: FormField[];
    data: Record<string, unknown>;
    setFieldData: (key: string, value: unknown) => void;
    errors: Record<string, string>;
}

export default function DynamicFormRenderer({
    schema,
    data,
    setFieldData,
    errors,
}: DynamicFormRendererProps) {
    const renderField = (field: FormField) => {
        const value = data[field.name] ?? '';
        const errorKey = `fields.${field.name}`;
        const isFullWidth = ['textarea', 'file', 'image'].includes(field.type);

        return (
            <div key={field.name} className={isFullWidth ? 'sm:col-span-2' : ''}>
                {field.type === 'checkbox' ? (
                    <label className="flex items-center space-x-2">
                        <Checkbox
                            checked={!!value}
                            onChange={(e) => setFieldData(field.name, e.target.checked)}
                        />
                        <span className="text-sm font-medium text-gray-700">
                            {field.label}
                            {field.required && <span className="text-red-500"> *</span>}
                        </span>
                    </label>
                ) : (
                    <>
                        <InputLabel
                            value={field.label + (field.required ? ' *' : '')}
                        />

                        {field.type === 'textarea' && (
                            <textarea
                                value={value as string}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                                rows={4}
                                placeholder={field.placeholder}
                                onChange={(e) => setFieldData(field.name, e.target.value)}
                            />
                        )}

                        {field.type === 'dropdown' && (
                            <SelectInput
                                value={value as string}
                                className="mt-1 block w-full"
                                onChange={(e) => setFieldData(field.name, e.target.value)}
                            >
                                <option value="">
                                    {field.placeholder || 'Select...'}
                                </option>
                                {field.options.map((opt) => (
                                    <option key={opt} value={opt}>
                                        {opt}
                                    </option>
                                ))}
                            </SelectInput>
                        )}

                        {(field.type === 'file' || field.type === 'image') && (
                            <input
                                type="file"
                                accept={field.type === 'image' ? 'image/*' : undefined}
                                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-emerald-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-emerald-700 hover:file:bg-emerald-100"
                                onChange={(e) => setFieldData(field.name, e.target.files?.[0] ?? null)}
                            />
                        )}

                        {['text', 'number', 'date'].includes(field.type) && (
                            <TextInput
                                type={field.type}
                                value={value as string}
                                className="mt-1 block w-full"
                                placeholder={field.placeholder}
                                onChange={(e) => setFieldData(field.name, e.target.value)}
                            />
                        )}
                    </>
                )}

                <InputError message={errors[errorKey]} className="mt-1" />
            </div>
        );
    };

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {schema.map(renderField)}
        </div>
    );
}
