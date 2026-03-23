import { InertiaLinkProps, Link } from '@inertiajs/react';
import { ReactNode } from 'react';

interface SidebarLinkProps extends InertiaLinkProps {
    active?: boolean;
    icon?: ReactNode;
}

export default function SidebarLink({
    active = false,
    icon,
    className = '',
    children,
    ...props
}: SidebarLinkProps) {
    return (
        <Link
            {...props}
            className={
                'group flex items-center rounded-md px-3 py-2 text-sm font-medium transition duration-150 ease-in-out ' +
                (active
                    ? 'border-l-4 border-emerald-400 bg-emerald-900 text-white'
                    : 'border-l-4 border-transparent text-emerald-100 hover:bg-emerald-900 hover:text-white') +
                ' ' +
                className
            }
        >
            {icon && (
                <span
                    className={
                        'mr-3 h-5 w-5 flex-shrink-0 ' +
                        (active ? 'text-emerald-300' : 'text-emerald-400 group-hover:text-emerald-200')
                    }
                >
                    {icon}
                </span>
            )}
            {children}
        </Link>
    );
}
