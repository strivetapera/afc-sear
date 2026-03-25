"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type UserRole = 'super_admin' | 'branch_admin' | 'member' | 'visitor' | 'leader' | 'staff';

export interface PortalUser {
  id: string;
  email: string;
  name?: string;
  roles: UserRole[];
  branchId?: string;
  branchName?: string;
  personId?: string;
}

interface PortalAuthContext {
  user: PortalUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasRole: (role: UserRole | UserRole[]) => boolean;
  hasPermission: (permission: string) => boolean;
}

const PortalAuthContext = createContext<PortalAuthContext>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  hasRole: () => false,
  hasPermission: () => false,
});

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/v1`;

export function PortalAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PortalUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const response = await fetch(`${API_BASE}/me`, {
          credentials: 'include',
        });
        
        if (response.ok) {
          const data = await response.json();
          const userData = data.data;
          
          setUser({
            id: userData.id,
            email: userData.email,
            name: userData.name || userData.person?.firstName,
            roles: extractRoles(userData),
            branchId: userData.defaultBranchId || userData.person?.branchId,
            branchName: userData.branch?.name,
            personId: userData.personId || userData.person?.id,
          });
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Failed to load user:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, []);

  const hasRole = (role: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    if (user.roles.includes('super_admin')) return true;
    
    const roles = Array.isArray(role) ? role : [role];
    return roles.some(r => user.roles.includes(r));
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    if (user.roles.includes('super_admin')) return true;
    
    const rolePermissions: Record<string, string[]> = {
      branch_admin: [
        'view_branch_content',
        'manage_branch_content',
        'view_branch_members',
        'manage_branch_events',
      ],
      leader: [
        'view_branch_content',
        'view_branch_members',
        'manage_branch_events',
      ],
      staff: [
        'view_branch_content',
        'view_branch_members',
      ],
      member: [
        'view_public_content',
        'view_own_profile',
        'manage_own_registrations',
      ],
    };

    const userPermissions = user.roles.flatMap(r => rolePermissions[r] || []);
    return userPermissions.includes(permission);
  };

  return (
    <PortalAuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        hasRole,
        hasPermission,
      }}
    >
      {children}
    </PortalAuthContext.Provider>
  );
}

export function usePortalAuth() {
  return useContext(PortalAuthContext);
}

function extractRoles(userData: any): UserRole[] {
  const roles: UserRole[] = [];
  
  if (userData.userRoles) {
    for (const ur of userData.userRoles) {
      const roleKey = ur.role?.key;
      if (roleKey === 'super_admin') {
        roles.push('super_admin');
      } else if (roleKey === 'branch_admin') {
        roles.push('branch_admin');
      }
    }
  }

  const lifecycleStage = userData.person?.lifecycleStage;
  if (lifecycleStage === 'LEADER') {
    if (!roles.includes('leader')) roles.push('leader');
  } else if (lifecycleStage === 'STAFF') {
    if (!roles.includes('staff')) roles.push('staff');
  } else if (lifecycleStage === 'MEMBER') {
    if (!roles.includes('member')) roles.push('member');
  } else if (lifecycleStage === 'VISITOR') {
    if (!roles.includes('visitor')) roles.push('visitor');
  }

  if (roles.length === 0) {
    roles.push('member');
  }

  return roles;
}
