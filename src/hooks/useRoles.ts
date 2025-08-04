import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export type AppRole = 'user' | 'moderator' | 'admin' | 'super_admin';

interface UserRole {
  role: AppRole;
}

export const useRoles = () => {
  const [userRoles, setUserRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchUserRoles = async () => {
      if (!user) {
        setUserRoles([]);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        if (error) throw error;

        const roles = data?.map((item: UserRole) => item.role) || [];
        setUserRoles(roles);
      } catch (error) {
        console.error('Error fetching user roles:', error);
        setUserRoles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRoles();
  }, [user]);

  const hasRole = (role: AppRole): boolean => {
    return userRoles.includes(role);
  };

  const hasAnyRole = (roles: AppRole[]): boolean => {
    return roles.some(role => userRoles.includes(role));
  };

  const isAdmin = (): boolean => {
    return hasAnyRole(['admin', 'super_admin']);
  };

  const canManageProjects = (): boolean => {
    return hasAnyRole(['admin', 'super_admin', 'moderator']);
  };

  const canManageUsers = (): boolean => {
    return hasAnyRole(['admin', 'super_admin']);
  };

  return {
    userRoles,
    loading,
    hasRole,
    hasAnyRole,
    isAdmin,
    canManageProjects,
    canManageUsers
  };
};