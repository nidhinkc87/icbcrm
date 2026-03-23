import { PropsWithChildren } from 'react';
import { usePermissions } from '@/hooks/usePermissions';

interface CanProps {
    permission?: string;
    role?: string;
}

export default function Can({ permission, role, children }: PropsWithChildren<CanProps>) {
    const { hasPermission, hasRole } = usePermissions();

    if (permission && !hasPermission(permission)) return null;
    if (role && !hasRole(role)) return null;

    return <>{children}</>;
}
