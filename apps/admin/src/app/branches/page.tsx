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
import { MapPin, Plus, Building, Users, ExternalLink } from 'lucide-react';
import { fetchApi } from '@/lib/api-client';

export default function BranchesPage() {
  const [branches, setBranches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadBranches() {
      try {
        const result = await fetchApi('/admin/branches');
        setBranches(result.data || []);
      } catch (error) {
        console.error('Failed to load branches:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadBranches();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Branches & Ministries</h1>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Branch
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <p className="col-span-full text-center text-gray-500 py-12">Loading branches...</p>
        ) : branches.length === 0 ? (
          <p className="col-span-full text-center text-gray-500 py-12">No branches configured yet.</p>
        ) : branches.map((branch) => (
          <Card key={branch.id} className="overflow-hidden">
            <CardHeader className="bg-gray-50/50 border-b pb-4">
              <div className="flex items-center justify-between">
                <Badge variant={branch.isPublic ? 'success' : 'default'}>
                  {branch.isPublic ? 'Public' : 'Internal'}
                </Badge>
                <Badge variant="default">{branch.type}</Badge>
              </div>
              <CardTitle className="mt-2 text-xl">{branch.name}</CardTitle>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {[branch.city, branch.countryName].filter(Boolean).join(', ') || 'Location details pending'}
              </p>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Ministries
                </span>
                <span className="font-medium">{branch.ministryCount || 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Estimated Members
                </span>
                <span className="font-medium">--</span>
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1 gap-2">
                  Manage
                </Button>
                <Button variant="ghost" size="sm" title="View Branch Site">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Regional Hubs</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 italic">Regional management view is being initialized...</p>
        </CardContent>
      </Card>
    </div>
  );
}
