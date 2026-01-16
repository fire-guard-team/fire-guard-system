import React from 'react';
import { usePermissions } from '../../hooks/usePermissions';

interface PermissionGuardProps {
  children: React.ReactNode;
  permission?: string;
  permissions?: string[];
  fallback?: React.ReactNode;
  requireAll?: boolean;
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  permission,
  permissions,
  fallback = null,
  requireAll = false
}) => {
  const { hasPermission, hasAnyPermission, loading } = usePermissions();

  if (loading) {
    return <div>Loading...</div>;
  }

  let hasAccess = false;

  if (permission) {
    hasAccess = hasPermission(permission);
  } else if (permissions) {
    if (requireAll) {
      hasAccess = permissions.every(perm => hasPermission(perm));
    } else {
      hasAccess = hasAnyPermission(permissions);
    }
  } else {
    hasAccess = true;
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
};

export default PermissionGuard;