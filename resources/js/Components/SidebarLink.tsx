import { InertiaLinkProps, Link } from '@inertiajs/react';
import { ReactNode } from 'react';

interface SidebarLinkProps extends InertiaLinkProps {
    active?: boolean;
    icon?: ReactNode;
    variant?: 'default' | 'sub';
}

export default function SidebarLink({
    active = false,
    icon,
    variant = 'default',
    className = '',
    children,
    ...props
}: SidebarLinkProps) {
    const isSub = variant === 'sub';

    const baseClasses = isSub
        ? 'group flex items-center rounded-md px-3 py-1.5 text-[13px] font-medium transition duration-150 ease-in-out '
        : 'group flex items-center rounded-md px-3 py-2 text-sm font-medium transition duration-150 ease-in-out border-l-4 ';

    const activeClasses = isSub
        ? 'bg-emerald-800/60 text-emerald-200'
        : 'border-emerald-400 bg-emerald-900 text-white';

    const inactiveClasses = isSub
        ? 'text-emerald-300/70 hover:bg-emerald-800/40 hover:text-emerald-200'
        : 'border-transparent text-emerald-100 hover:bg-emerald-900 hover:text-white';

    const iconActiveClasses = isSub ? 'text-emerald-300' : 'text-emerald-300';
    const iconInactiveClasses = isSub ? 'text-emerald-500 group-hover:text-emerald-300' : 'text-emerald-400 group-hover:text-emerald-200';
    const iconSize = isSub ? 'mr-2.5 h-4 w-4 flex-shrink-0 ' : 'mr-3 h-5 w-5 flex-shrink-0 ';

    return (
        <Link
            {...props}
            className={baseClasses + (active ? activeClasses : inactiveClasses) + ' ' + className}
        >
            {icon && (
                <span className={iconSize + (active ? iconActiveClasses : iconInactiveClasses)}>
                    {icon}
                </span>
            )}
            {children}
            {isSub && active && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-400" />
            )}
        </Link>
    );
}
