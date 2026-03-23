import { FormField, FormFieldType } from '@/types';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import SelectInput from '@/Components/SelectInput';
import Checkbox from '@/Components/Checkbox';

const FIELD_TYPES: { value: FormFieldType; label: string }[] = [
    { value: 'text', label: 'Text' },
    { value: 'textarea', label: 'Textarea' },
    { value: 'number', label: 'Number' },
    { value: 'date', label: 'Date' },
    { value: 'dropdown', label: 'Dropdown' },
    { value: 'checkbox', label: 'Checkbox' },
    { value: 'file', label: 'File Upload' },
    { value: 'image', label: 'Image Upload' },
];

function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '');
}

function makeUniqueName(baseName: string, existingNames: string[], currentIndex: number): string {
    if (!baseName) return '';
    let name = baseName;
    let counter = 1;
    while (existingNames.some((n, i) => i !== currentIndex && n === name)) {
        name = `${baseName}_${counter}`;
        counter++;
    }
    return name;
}

interface FormBuilderProps {
    fields: FormField[];
    onChange: (fields: FormField[]) => void;
    errors?: Record<string, string>;
}

export default function FormBuilder({ fields, onChange, errors = {} }: FormBuilderProps) {
    const addField = () => {
        onChange([
            ...fields,
            {
                name: '',
                label: '',
                type: 'text',
                required: false,
                placeholder: '',
                options: [],
            },
        ]);
    };

    const updateField = (index: number, key: keyof FormField, value: unknown) => {
        const updated = [...fields];
        updated[index] = { ...updated[index], [key]: value };

        if (key === 'label') {
            const baseName = slugify(value as string);
            const existingNames = updated.map((f) => f.name);
            updated[index].name = makeUniqueName(baseName, existingNames, index);
        }

        if (key === 'type' && value !== 'dropdown') {
            updated[index].options = [];
        }

        onChange(updated);
    };

    const removeField = (index: number) => {
        onChange(fields.filter((_, i) => i !== index));
    };

    const moveField = (index: number, direction: 'up' | 'down') => {
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= fields.length) return;

        const updated = [...fields];
        [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
        onChange(updated);
    };

    const addOption = (fieldIndex: number) => {
        const updated = [...fields];
        updated[fieldIndex] = {
            ...updated[fieldIndex],
            options: [...updated[fieldIndex].options, ''],
        };
        onChange(updated);
    };

    const updateOption = (fieldIndex: number, optionIndex: number, value: string) => {
        const updated = [...fields];
        const options = [...updated[fieldIndex].options];
        options[optionIndex] = value;
        updated[fieldIndex] = { ...updated[fieldIndex], options };
        onChange(updated);
    };

    const removeOption = (fieldIndex: number, optionIndex: number) => {
        const updated = [...fields];
        updated[fieldIndex] = {
            ...updated[fieldIndex],
            options: updated[fieldIndex].options.filter((_, i) => i !== optionIndex),
        };
        onChange(updated);
    };

    return (
        <div>
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Form Fields</h3>
                <button
                    type="button"
                    onClick={addField}
                    className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500"
                >
                    + Add Field
                </button>
            </div>

            {fields.length === 0 && (
                <p className="rounded-md border-2 border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
                    No fields added yet. Click "Add Field" to start building your form.
                </p>
            )}

            <div className="space-y-4">
                {fields.map((field, index) => (
                    <div
                        key={index}
                        className="rounded-lg border border-gray-200 bg-gray-50 p-4"
                    >
                        <div className="mb-3 flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">
                                Field #{index + 1}
                                {field.name && (
                                    <span className="ml-2 text-xs text-gray-400">
                                        ({field.name})
                                    </span>
                                )}
                            </span>
                            <div className="flex items-center space-x-1">
                                <button
                                    type="button"
                                    onClick={() => moveField(index, 'up')}
                                    disabled={index === 0}
                                    className="rounded p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                                    title="Move up"
                                >
                                    &#9650;
                                </button>
                                <button
                                    type="button"
                                    onClick={() => moveField(index, 'down')}
                                    disabled={index === fields.length - 1}
                                    className="rounded p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                                    title="Move down"
                                >
                                    &#9660;
                                </button>
                                <button
                                    type="button"
                                    onClick={() => removeField(index)}
                                    className="ml-2 rounded p-1 text-red-400 hover:text-red-600"
                                    title="Remove field"
                                >
                                    &#10005;
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div>
                                <InputLabel value="Label" />
                                <TextInput
                                    value={field.label}
                                    className="mt-1 block w-full"
                                    onChange={(e) => updateField(index, 'label', e.target.value)}
                                    placeholder="e.g. Company Name"
                                />
                                <InputError message={errors[`form_schema.${index}.label`] || errors[`form_schema.${index}.name`]} className="mt-1" />
                            </div>

                            <div>
                                <InputLabel value="Type" />
                                <SelectInput
                                    value={field.type}
                                    className="mt-1 block w-full"
                                    onChange={(e) => updateField(index, 'type', e.target.value)}
                                >
                                    {FIELD_TYPES.map((t) => (
                                        <option key={t.value} value={t.value}>
                                            {t.label}
                                        </option>
                                    ))}
                                </SelectInput>
                                <InputError message={errors[`form_schema.${index}.type`]} className="mt-1" />
                            </div>

                            {field.type !== 'checkbox' && (
                                <div>
                                    <InputLabel value="Placeholder" />
                                    <TextInput
                                        value={field.placeholder}
                                        className="mt-1 block w-full"
                                        onChange={(e) => updateField(index, 'placeholder', e.target.value)}
                                        placeholder="Optional placeholder text"
                                    />
                                </div>
                            )}

                            <div className="flex items-end pb-2">
                                <label className="flex items-center space-x-2">
                                    <Checkbox
                                        checked={field.required}
                                        onChange={(e) => updateField(index, 'required', e.target.checked)}
                                    />
                                    <span className="text-sm text-gray-700">Required</span>
                                </label>
                            </div>
                        </div>

                        {field.type === 'dropdown' && (
                            <div className="mt-3">
                                <InputLabel value="Options" />
                                {field.options.length === 0 && (
                                    <p className="mt-1 text-xs text-amber-600">
                                        Add at least one option for this dropdown.
                                    </p>
                                )}
                                <div className="mt-1 space-y-2">
                                    {field.options.map((option, optIdx) => (
                                        <div key={optIdx}>
                                            <div className="flex items-center space-x-2">
                                                <TextInput
                                                    value={option}
                                                    className="block w-full"
                                                    onChange={(e) => updateOption(index, optIdx, e.target.value)}
                                                    placeholder={`Option ${optIdx + 1}`}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeOption(index, optIdx)}
                                                    className="text-red-400 hover:text-red-600"
                                                >
                                                    &#10005;
                                                </button>
                                            </div>
                                            <InputError message={errors[`form_schema.${index}.options.${optIdx}`]} className="mt-1" />
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => addOption(index)}
                                        className="text-sm text-emerald-600 hover:text-emerald-500"
                                    >
                                        + Add Option
                                    </button>
                                </div>
                                <InputError message={errors[`form_schema.${index}.options`]} className="mt-1" />
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <InputError message={errors['form_schema']} className="mt-2" />
        </div>
    );
}
