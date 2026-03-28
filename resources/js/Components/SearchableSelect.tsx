import { useEffect, useRef, useState } from 'react';

interface Option {
    id: number;
    name: string;
}

interface Props {
    options: Option[];
    value: string | number;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export default function SearchableSelect({ options, value, onChange, placeholder = 'Search...', className = '' }: Props) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const ref = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const selected = options.find((o) => String(o.id) === String(value));

    const filtered = options.filter((o) =>
        o.name.toLowerCase().includes(search.toLowerCase())
    );

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    useEffect(() => {
        if (open && inputRef.current) {
            inputRef.current.focus();
        }
    }, [open]);

    return (
        <div ref={ref} className={`relative ${className}`}>
            <button
                type="button"
                onClick={() => { setOpen(!open); setSearch(''); }}
                className="mt-1 flex w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-left text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
                <span className={selected ? 'text-gray-900' : 'text-gray-400'}>
                    {selected?.name || placeholder}
                </span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`h-4 w-4 text-gray-400 transition ${open ? 'rotate-180' : ''}`}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
            </button>

            {open && (
                <div className="absolute z-50 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg">
                    <div className="border-b border-gray-100 p-2">
                        <input
                            ref={inputRef}
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Type to search..."
                            className="w-full rounded border-gray-300 px-2.5 py-1.5 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                        />
                    </div>
                    <ul className="max-h-48 overflow-y-auto py-1">
                        <li>
                            <button
                                type="button"
                                onClick={() => { onChange(''); setOpen(false); }}
                                className="w-full px-3 py-1.5 text-left text-sm text-gray-400 hover:bg-gray-50"
                            >
                                {placeholder}
                            </button>
                        </li>
                        {filtered.length > 0 ? (
                            filtered.map((o) => (
                                <li key={o.id}>
                                    <button
                                        type="button"
                                        onClick={() => { onChange(String(o.id)); setOpen(false); setSearch(''); }}
                                        className={`w-full px-3 py-1.5 text-left text-sm hover:bg-emerald-50 hover:text-emerald-700 ${String(o.id) === String(value) ? 'bg-emerald-50 font-medium text-emerald-700' : 'text-gray-700'}`}
                                    >
                                        {o.name}
                                    </button>
                                </li>
                            ))
                        ) : (
                            <li className="px-3 py-2 text-sm text-gray-400">No results</li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}
