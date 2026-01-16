import React from 'react';
import { Navigate } from 'react-router-dom';
import { usePermissions } from '../../hooks/usePermissions';

interface RouteGuardProps {
  children: React.ReactNode;
  permission?: string;
  permissions?: string[];
  requireAll?: boolean;
  fallbackPath?: string;
}

const RouteGuard: React.FC<RouteGuardProps> = ({
  children,
  permission,
  permissions,
  requireAll = false,
  fallbackPath = '/dashboard'
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

  if (!hasAccess) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};

export default RouteGuard;