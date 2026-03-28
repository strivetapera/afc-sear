"use client";

import React, { useState } from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  Button, 
  Input
} from '@afc-sear/ui';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/lib/api-client';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { contentTemplateOptions, type ContentTemplateKey } from '@/lib/content-templates';

export default function NewContentPage() {
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    summary: '',
    contentTypeKey: 'page', // Default
    visibility: 'PUBLIC',
    templateKey: 'standard_page' as ContentTemplateKey,
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await fetchApi('/admin/content-items', {
        method: 'POST',
        body: JSON.stringify({
          title: formData.title,
          slug: formData.slug,
          summary: formData.summary,
          contentTypeKey: formData.contentTypeKey,
          visibility: formData.visibility,
        }),
      });
      router.push(`/content/${result.data.id}?template=${formData.templateKey}`);
    } catch (error) {
      console.error('Failed to create content:', error);
      alert('Failed to create content item');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/content">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Create Content</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Initial Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-medium">Editing Template</label>
              <div className="grid gap-3 md:grid-cols-2">
                {contentTemplateOptions.map((option) => {
                  const selected = formData.templateKey === option.key;
                  return (
                    <button
                      key={option.key}
                      type="button"
                      className={`rounded-2xl border p-4 text-left transition-colors ${
                        selected
                          ? 'border-primary bg-primary/5'
                          : 'border-border bg-background hover:border-primary/30'
                      }`}
                      onClick={() =>
                        setFormData((current) => ({
                          ...current,
                          templateKey: option.key,
                          ...(option.key === 'home_page' && !current.slug
                            ? { slug: 'home', title: current.title || 'Home' }
                            : {}),
                        }))
                      }
                    >
                      <p className="font-semibold">{option.label}</p>
                      <p className="mt-2 text-sm text-muted-foreground">{option.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-4">
              <Input 
                label="Public Title" 
                value={formData.title} 
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
              />
              <Input 
                label="URL Slug" 
                value={formData.slug} 
                onChange={(e) => setFormData({...formData, slug: e.target.value})}
                placeholder="e.g. about-us"
                required
              />
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Content Type</label>
                <select 
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  value={formData.contentTypeKey}
                  onChange={(e) => setFormData({...formData, contentTypeKey: e.target.value})}
                >
                  <option value="page">Standard Page</option>
                  <option value="news">News Article</option>
                  <option value="event">Event Announcement</option>
                  <option value="lesson">Sunday School Lesson</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Summary (Optional)</label>
                <textarea 
                  className="flex min-h-[80px] w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  value={formData.summary}
                  onChange={(e) => setFormData({...formData, summary: e.target.value})}
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-4">
              <Link href="/content">
                <Button variant="outline">Cancel</Button>
              </Link>
              <Button type="submit" isLoading={isLoading} className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Initialize Draft
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
