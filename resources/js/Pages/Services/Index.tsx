import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';

interface ServiceItem {
    id: number;
    name: string;
    description: string | null;
}

interface Props extends PageProps {
    services: ServiceItem[];
}

export default function Index({ services }: Props) {
    const { flash } = usePage<PageProps>().props;

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Services
                </h2>
            }
        >
            <Head title="Services" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {flash?.success && (
                        <div className="mb-4 rounded-md bg-green-50 p-4">
                            <p className="text-sm text-green-800">{flash.success}</p>
                        </div>
                    )}

                    {services.length === 0 ? (
                        <div className="rounded-md bg-white p-12 text-center shadow-sm">
                            <p className="text-gray-500">No services available at the moment.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {services.map((service) => (
                                <div
                                    key={service.id}
                                    className="overflow-hidden rounded-lg bg-white shadow-sm"
                                >
                                    <div className="p-6">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            {service.name}
                                        </h3>
                                        {service.description && (
                                            <p className="mt-2 text-sm text-gray-600">
                                                {service.description}
                                            </p>
                                        )}
                                        <div className="mt-4">
                                            <Link
                                                href={route('services.submit', service.id)}
                                                className="inline-flex items-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                                            >
                                                Fill Form
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
