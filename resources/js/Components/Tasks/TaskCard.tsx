import { Link } from '@inertiajs/react';

type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

interface TaskCardData {
    id: number;
    service_name: string;
    client_name: string;
    responsible_name: string;
    priority: TaskPriority;
    due_date: string;
    is_overdue: boolean;
}

const priorityBorder: Record<TaskPriority, string> = {
    low: 'border-l-gray-300',
    medium: 'border-l-blue-400',
    high: 'border-l-amber-400',
    urgent: 'border-l-red-500',
};

const priorityDot: Record<TaskPriority, string> = {
    low: 'bg-gray-400',
    medium: 'bg-blue-500',
    high: 'bg-amber-500',
    urgent: 'bg-red-500',
};

export default function TaskCard({ task }: { task: TaskCardData }) {
    const initials = task.responsible_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return (
        <Link
            href={route('tasks.show', task.id)}
            className={`block rounded-lg border border-gray-200 border-l-4 ${priorityBorder[task.priority]} bg-white p-4 shadow-sm transition hover:shadow-md`}
        >
            <div className="flex items-start gap-2">
                <div className={`mt-1 h-2 w-2 shrink-0 rounded-full ${priorityDot[task.priority]}`} />
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">{task.service_name}</p>
                    <p className="mt-0.5 text-xs text-gray-500 truncate">{task.client_name}</p>
                </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-700">
                        {initials}
                    </div>
                    <span className="text-xs text-gray-500 truncate">{task.responsible_name}</span>
                </div>
                <span className={`text-xs ${task.is_overdue ? 'font-medium text-red-600' : 'text-gray-400'}`}>
                    {task.due_date}
                    {task.is_overdue && ' !'}
                </span>
            </div>
        </Link>
    );
}
