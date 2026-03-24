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
import { Search, Plus, Filter, MoreHorizontal, Globe, Clock, FileEdit } from 'lucide-react';
import { fetchApi } from '@/lib/api-client';
import Link from 'next/link';

export default function ContentPage() {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadContent() {
      try {
        const result = await fetchApi('/admin/content-items');
        setItems(result.data || []);
      } catch (error) {
        console.error('Failed to load content:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadContent();
  }, []);

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'published': return 'success';
      case 'draft': return 'default';
      case 'in_review': return 'warning';
      case 'archived': return 'danger';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Content Management</h1>
        <Link href="/content/new">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Item
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Content Library</CardTitle>
            <div className="flex w-full max-w-sm items-center space-x-2">
              <Input placeholder="Search content..." className="h-9" />
              <Button size="sm" variant="ghost">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead>
                <tr className="border-b transition-colors hover:bg-muted/50">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Title</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Type</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Last Updated</th>
                  <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-gray-500">Loading library...</td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-gray-500">No content found.</td>
                  </tr>
                ) : items.map((item) => (
                  <tr key={item.id} className="border-b transition-colors hover:bg-muted/50">
                    <td className="p-4 align-middle">
                      <div className="flex flex-col">
                        <span className="font-medium">{item.title}</span>
                        <span className="text-xs text-gray-400">/{item.slug}</span>
                      </div>
                    </td>
                    <td className="p-4 align-middle">
                      <Badge variant="default">{item.contentType?.name || 'Unknown'}</Badge>
                    </td>
                    <td className="p-4 align-middle">
                      <Badge variant={getStatusVariant(item.status)}>{item.status}</Badge>
                    </td>
                    <td className="p-4 align-middle text-gray-500">
                      {new Date(item.updatedAt || item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 align-middle text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" title="Edit">
                          <FileEdit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" title="View Public">
                          <Globe className="h-4 w-4" />
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
