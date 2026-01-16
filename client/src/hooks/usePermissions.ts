import { useState, useEffect } from 'react';
import { apiService } from '../utils/api';

export const usePermissions = () => {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserPermissions = async () => {
      try {
        if (apiService.isAuthenticated()) {
          const userData = localStorage.getItem('user');
          if (userData) {
            const user = JSON.parse(userData);
            if (user.permissions && user.permissions.length > 0) {
              setPermissions(user.permissions);
            }
          }
          try {
            const response = await apiService.getUserPermissions();
            if (response.permissions && response.permissions.length > 0) {
              setPermissions(response.permissions);
              const updatedUser = { ...JSON.parse(userData), permissions: response.permissions };
              localStorage.setItem('user', JSON.stringify(updatedUser));
            }
          } catch (apiError) {
            console.warn('Failed to refresh permissions from API:', apiError);
          }
        } else {
          setPermissions([]);
        }
      } catch (error) {
        console.error('Error loading permissions:', error);
        setPermissions([]);
      } finally {
        setLoading(false);
      }
    };

    loadUserPermissions();
  }, []);

  const hasPermission = (permission: string) => {
    return permissions.includes(permission);
  };

  const hasAnyPermission = (permissionsList: string[]) => {
    return permissionsList.some(permission => permissions.includes(permission));
  };

  const canAccessPage = (pagePermission: string) => {
    return hasPermission(pagePermission);
  };

  return {
    permissions,
    loading,
    hasPermission,
    hasAnyPermission,
    canAccessPage,
  };
};