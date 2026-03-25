"use client";

import React, { useEffect, useState } from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  Button, 
  Badge,
  Input
} from '@afc-sear/ui';
import { Search, UserPlus, MoreHorizontal, Shield, X, Check } from 'lucide-react';
import { fetchApi } from '@/lib/api-client';
import { motion, AnimatePresence } from 'framer-motion';

const ROLES = [
  { key: 'super_admin', name: 'Super Admin', description: 'Full platform access' },
  { key: 'branch_admin', name: 'Branch Admin', description: 'Branch-level management' },
  { key: 'editor', name: 'Editor', description: 'Content management' },
];

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  useEffect(() => {
    async function loadUsers() {
      try {
        const result = await fetchApi('/admin/users');
        setUsers(result.data || []);
      } catch (error) {
        console.error('Failed to load users:', error);
        try {
          const result = await fetchApi('/admin/people');
          setUsers(result.data || []);
        } catch (err) {
          console.error('Fallback also failed:', err);
        }
      } finally {
        setIsLoading(false);
      }
    }
    loadUsers();
  }, []);

  const filteredUsers = users.filter(user => {
    const searchLower = searchQuery.toLowerCase();
    return (
      (user.name || '').toLowerCase().includes(searchLower) ||
      (user.email || '').toLowerCase().includes(searchLower) ||
      (user.person?.firstName || '').toLowerCase().includes(searchLower) ||
      (user.person?.lastName || '').toLowerCase().includes(searchLower)
    );
  });

  const openAssignModal = (user: any) => {
    setSelectedUser(user);
    setSelectedRoles(user.roles?.map((r: any) => r.key) || []);
    setIsAssignModalOpen(true);
  };

  const toggleRole = (roleKey: string) => {
    setSelectedRoles(prev => 
      prev.includes(roleKey) 
        ? prev.filter(r => r !== roleKey)
        : [...prev, roleKey]
    );
  };

  const handleAssignRoles = async () => {
    if (!selectedUser) return;
    setIsSaving(true);
    
    try {
      for (const roleKey of selectedRoles) {
        if (!selectedUser.roles?.some((r: any) => r.key === roleKey)) {
          await fetchApi('/admin/identity/assign-role', {
            method: 'POST',
            body: JSON.stringify({ userId: selectedUser.id, roleKey }),
          });
        }
      }
      
      const result = await fetchApi('/admin/users');
      setUsers(result.data || []);
      setIsAssignModalOpen(false);
    } catch (error) {
      console.error('Failed to assign roles:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const getRoleBadgeVariant = (roleKey: string): "danger" | "warning" | "default" | "gold" | "success" | "premium" | undefined => {
    switch (roleKey) {
      case 'super_admin': return 'danger';
      case 'branch_admin': return 'warning';
      case 'editor': return 'default';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage user accounts and role assignments
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Add User
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CardTitle>User Directory</CardTitle>
              <Badge variant="default">{filteredUsers.length} users</Badge>
            </div>
            <div className="flex w-full max-w-sm items-center space-x-2">
              <Input 
                placeholder="Search users..." 
                className="h-9" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button size="sm" variant="ghost">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead>
                <tr className="border-b transition-colors hover:bg-muted/50">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground whitespace-nowrap">User</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground whitespace-nowrap">Roles</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground whitespace-nowrap">Branch</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground whitespace-nowrap">Status</th>
                  <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-muted-foreground">Loading users...</td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                      {searchQuery ? 'No users match your search.' : 'No users found.'}
                    </td>
                  </tr>
                ) : filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b transition-colors hover:bg-muted/50">
                    <td className="p-4 align-middle">
                      <div className="flex flex-wrap gap-1">
                        {user.roles?.length > 0 ? (
                          user.roles.map((role: any) => (
                            <Badge key={role.key} variant={getRoleBadgeVariant(role.key)} className="text-xs">
                              {role.name}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground">No roles</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 align-middle">
                      {user.branch?.name || user.defaultBranchId || '-'}
                    </td>
                    <td className="p-4 align-middle">
                      <Badge variant={user.isActive ? 'success' : 'danger'}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="p-4 align-middle text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          title="Manage Roles"
                          onClick={() => openAssignModal(user)}
                        >
                          <Shield className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Role Assignment Modal */}
      <AnimatePresence>
        {isAssignModalOpen && selectedUser && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setIsAssignModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-background rounded-2xl shadow-2xl border border-border z-50 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold">Assign Roles</h2>
                  <p className="text-sm text-muted-foreground">
                    {selectedUser.name || selectedUser.email}
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setIsAssignModalOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="space-y-3 mb-6">
                {ROLES.map((role) => {
                  const isSelected = selectedRoles.includes(role.key);
                  return (
                    <button
                      key={role.key}
                      onClick={() => toggleRole(role.key)}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                        isSelected 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-muted-foreground/30'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {isSelected && (
                              <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                                <Check className="h-3 w-3 text-primary-foreground" />
                              </div>
                            )}
                            {role.name}
                          </div>
                          <div className="text-sm text-muted-foreground">{role.description}</div>
                        </div>
                        <Badge variant={getRoleBadgeVariant(role.key)}>
                          {role.key}
                        </Badge>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1" 
                  onClick={() => setIsAssignModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  variant="primary" 
                  className="flex-1" 
                  onClick={handleAssignRoles}
                  isLoading={isSaving}
                >
                  Save Roles
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
