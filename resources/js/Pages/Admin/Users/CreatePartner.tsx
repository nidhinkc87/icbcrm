import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, router } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

interface Props {
    roles: string[];
    customers: { id: number; name: string }[];
}

export default function CreatePartner({ roles, customers }: Props) {
    const [data, setData] = useState({
        name: '',
        email: '',
        type: 'partner' as const,
        phone: '',
        company: '',
        customer_ids: [] as number[],
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

    const setField = (key: string, value: string) => setData({ ...data, [key]: value });

    const toggleCustomer = (id: number) => {
        setData((prev) => ({
            ...prev,
            customer_ids: prev.customer_ids.includes(id)
                ? prev.customer_ids.filter((cid) => cid !== id)
                : [...prev.customer_ids, id],
        }));
    };

    const [customerSearch, setCustomerSearch] = useState('');

    const filteredCustomers = customers.filter((c) =>
        c.name.toLowerCase().includes(customerSearch.toLowerCase()),
    );

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        setProcessing(true);

        router.post(route('admin.users.store'), data, {
            onError: (errs) => setErrors(errs),
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Create Partner</h2>}>
            <Head title="Create Partner" />

            <div className="py-6">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white p-6 shadow sm:rounded-lg">
                        <form onSubmit={submit} className="space-y-6">
                            <h3 className="text-lg font-medium text-gray-900">Partner Details</h3>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <InputLabel htmlFor="name" value="Name *" />
                                    <TextInput
                                        id="name"
                                        value={data.name}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setField('name', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.name} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="email" value="Email *" />
                                    <TextInput
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setField('email', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.email} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="phone" value="Phone" />
                                    <TextInput
                                        id="phone"
                                        value={data.phone}
                                        className="mt-1 block w-full"
                                        placeholder="+971 5x xxx xxxx"
                                        onChange={(e) => setField('phone', e.target.value)}
                                    />
                                    <InputError message={errors.phone} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="company" value="Company / Agency" />
                                    <TextInput
                                        id="company"
                                        value={data.company}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setField('company', e.target.value)}
                                    />
                                    <InputError message={errors.company} className="mt-2" />
                                </div>
                            </div>

                            {/* Assign Customers */}
                            <h3 className="mt-6 border-t border-gray-200 pt-6 text-lg font-medium text-gray-900">
                                Assign Customers
                            </h3>
                            <p className="text-sm text-gray-500">Select customers this partner will manage.</p>

                            <TextInput
                                value={customerSearch}
                                className="mt-2 block w-full"
                                placeholder="Search customers..."
                                onChange={(e) => setCustomerSearch(e.target.value)}
                            />

                            <div className="mt-3 max-h-60 overflow-y-auto rounded-md border border-gray-200">
                                {filteredCustomers.length === 0 && (
                                    <p className="px-4 py-3 text-sm text-gray-400">No customers found.</p>
                                )}
                                {filteredCustomers.map((c) => (
                                    <label
                                        key={c.id}
                                        className="flex cursor-pointer items-center gap-3 border-b border-gray-100 px-4 py-2 hover:bg-gray-50 last:border-0"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={data.customer_ids.includes(c.id)}
                                            onChange={() => toggleCustomer(c.id)}
                                            className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                        />
                                        <span className="text-sm text-gray-700">{c.name}</span>
                                    </label>
                                ))}
                            </div>

                            {data.customer_ids.length > 0 && (
                                <p className="text-sm text-gray-500">{data.customer_ids.length} customer(s) selected</p>
                            )}

                            <div className="flex items-center gap-4 pt-4">
                                <PrimaryButton disabled={processing}>
                                    {processing ? 'Creating...' : 'Create Partner'}
                                </PrimaryButton>
                                <Link
                                    href={route('admin.users.index', { role: 'partner' })}
                                    className="text-sm text-gray-600 underline hover:text-gray-900"
                                >
                                    Cancel
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
