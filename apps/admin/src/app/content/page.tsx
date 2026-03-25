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
import { Search, Plus, Filter, MoreHorizontal, Globe, Edit, Trash2, Eye, EyeOff, X, Check } from 'lucide-react';
import { fetchApi } from '@/lib/api-client';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function ContentPage() {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState<'publish' | 'unpublish' | 'delete' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const result = await fetchApi('/admin/content-items');
      setItems(result.data || []);
    } catch (error) {
      console.error('Failed to load content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredItems = items.filter(item => {
    const searchLower = searchQuery.toLowerCase();
    return (
      (item.title || '').toLowerCase().includes(searchLower) ||
      (item.slug || '').toLowerCase().includes(searchLower)
    );
  });

  const getStatusVariant = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'PUBLISHED': return 'success';
      case 'DRAFT': return 'default';
      case 'IN_REVIEW': return 'warning';
      case 'ARCHIVED': return 'danger';
      default: return 'default';
    }
  };

  const openActionModal = (item: any, type: 'publish' | 'unpublish' | 'delete') => {
    setSelectedItem(item);
    setActionType(type);
    setIsActionModalOpen(true);
  };

  const handleAction = async () => {
    if (!selectedItem || !actionType) return;
    setIsProcessing(true);

    try {
      if (actionType === 'publish') {
        await fetchApi(`/admin/content-items/${selectedItem.id}/publish`, { 
          method: 'POST',
          body: JSON.stringify({ published: true }) 
        });
      } else if (actionType === 'unpublish') {
        await fetchApi(`/admin/content-items/${selectedItem.id}`, { 
          method: 'PATCH', 
          body: JSON.stringify({ status: 'DRAFT' }) 
        });
      } else if (actionType === 'delete') {
        await fetchApi(`/admin/content-items/${selectedItem.id}`, { method: 'DELETE' });
      }
      await loadContent();
      setIsActionModalOpen(false);
    } catch (error) {
      console.error(`Failed to ${actionType}:`, error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getActionConfig = () => {
    switch (actionType) {
      case 'publish':
        return {
          title: 'Publish Content',
          description: `Make "${selectedItem?.title}" visible to the public?`,
          confirmText: 'Publish',
          variant: 'success' as const,
          icon: <Eye className="h-6 w-6 text-green-600" />
        };
      case 'unpublish':
        return {
          title: 'Unpublish Content',
          description: `Hide "${selectedItem?.title}" from public view?`,
          confirmText: 'Unpublish',
          variant: 'warning' as const,
          icon: <EyeOff className="h-6 w-6 text-amber-600" />
        };
      case 'delete':
        return {
          title: 'Delete Content',
          description: `Permanently delete "${selectedItem?.title}"? This action cannot be undone.`,
          confirmText: 'Delete',
          variant: 'danger' as const,
          icon: <Trash2 className="h-6 w-6 text-red-600" />
        };
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Content Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage pages, news articles, and site content
          </p>
        </div>
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
            <div className="flex items-center gap-3">
              <CardTitle>Content Library</CardTitle>
              <Badge variant="default">{filteredItems.length} items</Badge>
            </div>
            <div className="flex w-full max-w-sm items-center space-x-2">
              <Input 
                placeholder="Search content..." 
                className="h-9" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
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
                    <td colSpan={5} className="p-8 text-center text-muted-foreground">Loading library...</td>
                  </tr>
                ) : filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                      {searchQuery ? 'No content matches your search.' : 'No content found.'}
                    </td>
                  </tr>
                ) : filteredItems.map((item) => (
                  <tr key={item.id} className="border-b transition-colors hover:bg-muted/50">
                    <td className="p-4 align-middle">
                      <div className="flex flex-col">
                        <span className="font-medium">{item.title}</span>
                        <span className="text-xs text-muted-foreground">/{item.slug}</span>
                      </div>
                    </td>
                    <td className="p-4 align-middle">
                      <Badge variant="default">{item.contentType?.name || 'Page'}</Badge>
                    </td>
                    <td className="p-4 align-middle">
                      <Badge variant={getStatusVariant(item.status)}>{item.status?.replace('_', ' ')}</Badge>
                    </td>
                    <td className="p-4 align-middle text-muted-foreground">
                      {new Date(item.updatedAt || item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 align-middle text-right">
                      <div className="flex justify-end gap-1">
                        {item.status === 'PUBLISHED' ? (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            title="Unpublish"
                            onClick={() => openActionModal(item, 'unpublish')}
                          >
                            <EyeOff className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            title="Publish"
                            onClick={() => openActionModal(item, 'publish')}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        <Link href={`/content/${item.id}`}>
                          <Button variant="ghost" size="sm" title="Edit">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        {item.visibility === 'PUBLIC' && (
                          <Button variant="ghost" size="sm" title="View">
                            <Globe className="h-4 w-4" />
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          title="Delete"
                          onClick={() => openActionModal(item, 'delete')}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
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

      {/* Action Confirmation Modal */}
      <AnimatePresence>
        {isActionModalOpen && selectedItem && getActionConfig() && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setIsActionModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-background rounded-2xl shadow-2xl border border-border z-50 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                    {getActionConfig()?.icon}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{getActionConfig()?.title}</h2>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setIsActionModalOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <p className="text-muted-foreground mb-6">
                {getActionConfig()?.description}
              </p>

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1" 
                  onClick={() => setIsActionModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  variant={actionType === 'delete' ? 'destructive' : 'primary'}
                  className="flex-1" 
                  onClick={handleAction}
                  isLoading={isProcessing}
                >
                  {getActionConfig()?.confirmText}
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
