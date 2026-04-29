import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import TextInput from '@/Components/TextInput';
import { Head, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useState } from 'react';

interface MeetingRow {
    id: number;
    date: string;
    date_display: string;
    title: string;
    meeting_type: string | null;
    location: string;
    description: string;
    timing: string;
    organizer: string;
    participants: string[];
}

interface Props extends PageProps {
    meetings: MeetingRow[];
    filters: { month: string; search: string | null };
    month_label: string;
}

function meetingTypeBadge(type: string | null) {
    if (type === 'internal') return 'bg-blue-100 text-blue-800';
    if (type === 'external') return 'bg-purple-100 text-purple-800';
    return 'bg-gray-100 text-gray-600';
}

export default function MyMeetings({ meetings, filters, month_label }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');

    function applyFilters(overrides: Record<string, string | null> = {}) {
        const params: Record<string, string> = {};
        const merged = { month: filters.month, search, ...overrides };
        Object.entries(merged).forEach(([k, v]) => {
            if (v) params[k] = v;
        });
        router.get(route('admin.reports.my-meetings'), params, { preserveState: true, preserveScroll: true });
    }

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">My Meetings</h2>}>
            <Head title="My Meetings" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Filters */}
                    <div className="mb-6 flex flex-wrap items-end gap-4 rounded-lg bg-white p-4 shadow">
                        <div className="w-48">
                            <label className="mb-1 block text-xs font-medium text-gray-600">Month</label>
                            <input
                                type="month"
                                value={filters.month}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                                onChange={(e) => applyFilters({ month: e.target.value })}
                            />
                        </div>
                        <div className="min-w-[200px] flex-1">
                            <label className="mb-1 block text-xs font-medium text-gray-600">Search</label>
                            <TextInput
                                value={search}
                                className="block w-full"
                                placeholder="Title, location, description..."
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && applyFilters({ search })}
                            />
                        </div>
                        <div>
                            <button
                                onClick={() => applyFilters({ search })}
                                className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                            >
                                Filter
                            </button>
                        </div>
                        <div className="ml-auto text-sm text-gray-500">
                            {month_label} · <span className="font-semibold text-gray-700">{meetings.length} meetings</span>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-hidden rounded-lg bg-white shadow">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">#</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Date</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Time</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Title</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Type</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Location</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Organizer</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Participants</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {meetings.map((m, i) => (
                                        <tr key={m.id} className="hover:bg-gray-50">
                                            <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{i + 1}</td>
                                            <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">{m.date_display}</td>
                                            <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{m.timing}</td>
                                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{m.title}</td>
                                            <td className="whitespace-nowrap px-4 py-3 text-sm">
                                                {m.meeting_type ? (
                                                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${meetingTypeBadge(m.meeting_type)}`}>
                                                        {m.meeting_type}
                                                    </span>
                                                ) : <span className="text-gray-400">-</span>}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-500">{m.location}</td>
                                            <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{m.organizer}</td>
                                            <td className="px-4 py-3 text-sm">
                                                {m.participants.length > 0 ? (
                                                    <div className="flex flex-wrap gap-1">
                                                        {m.participants.map((p) => (
                                                            <span key={p} className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">
                                                                {p}
                                                            </span>
                                                        ))}
                                                    </div>
                                                ) : <span className="text-gray-400">-</span>}
                                            </td>
                                        </tr>
                                    ))}
                                    {meetings.length === 0 && (
                                        <tr><td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-400">No meetings in {month_label}.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
