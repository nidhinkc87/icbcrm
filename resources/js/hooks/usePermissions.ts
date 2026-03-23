import { usePage } from '@inertiajs/react';
import { PageProps } from '@/types';

export function usePermissions() {
    const { auth } = usePage<PageProps>().props;
    const user = auth.user;

    return {
        hasRole: (role: string) => user.roles.includes(role),
        hasPermission: (permission: string) => user.permissions.includes(permission),
        hasAnyRole: (...roles: string[]) => roles.some((r) => user.roles.includes(r)),
        hasAnyPermission: (...permissions: string[]) =>
            permissions.some((p) => user.permissions.includes(p)),
        isAdmin: user.roles.includes('admin'),
        isEmployee: user.roles.includes('employee'),
        isClient: user.roles.includes('client'),
    };
}
