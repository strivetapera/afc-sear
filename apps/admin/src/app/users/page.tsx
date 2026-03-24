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
import { Search, UserPlus, MoreHorizontal, UserCheck, Shield } from 'lucide-react';
import { fetchApi } from '@/lib/api-client';

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUsers() {
      try {
        const result = await fetchApi('/admin/people'); // This endpoint exists and returns people/users
        setUsers(result.data || []);
      } catch (error) {
        console.error('Failed to load users:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadUsers();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Members & Users</h1>
        <Button className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Add Person
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Directory</CardTitle>
            <div className="flex w-full max-w-sm items-center space-x-2">
              <Input placeholder="Search members..." className="h-9" />
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
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground whitespace-nowrap">Name</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground whitespace-nowrap">Email / Phone</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground whitespace-nowrap">Branch</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground whitespace-nowrap">Status</th>
                  <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-gray-500">Loading members...</td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-gray-500">No members found.</td>
                  </tr>
                ) : users.map((user) => (
                  <tr key={user.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <td className="p-4 align-middle font-medium">{user.firstName} {user.lastName}</td>
                    <td className="p-4 align-middle">
                      <div className="flex flex-col">
                        <span>{user.email || 'N/A'}</span>
                        <span className="text-xs text-gray-400">{user.phone || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="p-4 align-middle">{user.branch?.name || 'Central'}</td>
                    <td className="p-4 align-middle">
                      <Badge variant="success">{user.lifecycleStage}</Badge>
                    </td>
                    <td className="p-4 align-middle text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" title="Assign Role">
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
    </div>
  );
}
