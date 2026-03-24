"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Input } from '@afc-sear/ui';
import { UserPlus, Search } from 'lucide-react';
import { fetchApi } from '@/lib/api-client';

export default function PeoplePage() {
  const [people, setPeople] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    fetchApi('/admin/people')
      .then((r) => {
        setPeople(r.data ?? []);
        setFiltered(r.data ?? []);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setFiltered(people);
    } else {
      const q = query.toLowerCase();
      setFiltered(people.filter((p) =>
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
        p.email?.toLowerCase().includes(q) ||
        p.phone?.includes(q)
      ));
    }
  }, [query, people]);

  const stageVariant = (stage: string) => {
    switch (stage) {
      case 'MEMBER': case 'LEADER': case 'STAFF': return 'success';
      case 'REGULAR_ATTENDEE': return 'warning';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">People Directory</h1>
        <Button className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Add Person
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All People ({filtered.length})</CardTitle>
            <div className="flex items-center gap-2 w-72">
              <Search className="h-4 w-4 text-gray-400 shrink-0" />
              <Input
                placeholder="Search by name, email or phone..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="h-10 px-4 text-left font-medium text-muted-foreground">Name</th>
                <th className="h-10 px-4 text-left font-medium text-muted-foreground">Email</th>
                <th className="h-10 px-4 text-left font-medium text-muted-foreground">Phone</th>
                <th className="h-10 px-4 text-left font-medium text-muted-foreground">Stage</th>
                <th className="h-10 px-4 text-left font-medium text-muted-foreground">Branch</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} className="p-4 text-center text-gray-500">Loading people...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="p-4 text-center text-gray-500">No people found.</td></tr>
              ) : filtered.map((p) => (
                <tr key={p.id} className="border-b hover:bg-muted/50">
                  <td className="p-4">
                    <div className="font-medium">
                      {p.preferredName || p.firstName} {p.lastName}
                    </div>
                    {p.preferredName && (
                      <div className="text-xs text-gray-400">{p.firstName} {p.lastName}</div>
                    )}
                  </td>
                  <td className="p-4 text-gray-600">{p.email ?? '—'}</td>
                  <td className="p-4 text-gray-600">{p.phone ?? '—'}</td>
                  <td className="p-4">
                    <Badge variant={stageVariant(p.lifecycleStage)}>
                      {p.lifecycleStage?.replace(/_/g, ' ')}
                    </Badge>
                  </td>
                  <td className="p-4 text-gray-500">{p.branchId ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
