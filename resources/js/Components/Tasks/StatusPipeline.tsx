type TaskStatus = 'pending' | 'in_progress' | 'completed';

interface StatusPipelineProps {
    currentStatus: TaskStatus;
    counts?: { pending: number; in_progress: number; completed: number };
    showCounts?: boolean;
}

const stages: { key: TaskStatus; label: string }[] = [
    { key: 'pending', label: 'Pending' },
    { key: 'in_progress', label: 'In Progress' },
    { key: 'completed', label: 'Completed' },
];

const stageOrder: Record<TaskStatus, number> = { pending: 0, in_progress: 1, completed: 2 };

export default function StatusPipeline({ currentStatus, counts, showCounts }: StatusPipelineProps) {
    const currentIdx = stageOrder[currentStatus];

    return (
        <div className="flex items-center justify-between w-full max-w-md mx-auto">
            {stages.map((stage, i) => {
                const isCompleted = i < currentIdx;
                const isCurrent = i === currentIdx;
                const isFuture = i > currentIdx;

                return (
                    <div key={stage.key} className="flex items-center flex-1 last:flex-none">
                        <div className="flex flex-col items-center">
                            <div
                                className={`flex items-center justify-center h-9 w-9 rounded-full text-sm font-semibold transition-all ${
                                    isCompleted
                                        ? 'bg-emerald-600 text-white'
                                        : isCurrent
                                            ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                                            : 'bg-gray-200 text-gray-400'
                                }`}
                            >
                                {isCompleted ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-4 w-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                    </svg>
                                ) : i === 0 ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                ) : i === 1 ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                )}
                            </div>
                            <span className={`mt-1.5 text-xs font-medium ${isFuture ? 'text-gray-400' : 'text-gray-700'}`}>
                                {stage.label}
                            </span>
                            {showCounts && counts && (
                                <span className="text-xs text-gray-400">{counts[stage.key]}</span>
                            )}
                        </div>
                        {i < stages.length - 1 && (
                            <div className={`flex-1 h-0.5 mx-2 mb-6 ${i < currentIdx ? 'bg-emerald-500' : 'bg-gray-200'}`} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
