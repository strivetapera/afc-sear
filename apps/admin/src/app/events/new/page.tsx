"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Input } from '@afc-sear/ui';
import { ArrowLeft, Save } from 'lucide-react';
import { fetchApi } from '@/lib/api-client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { eventTemplateOptions, type EventTemplateKey } from '@/lib/event-templates';
import { EventRegistrationSettings } from '@/components/EventRegistrationSettings';
import {
  applyConferenceRegistrationDefaults,
  createDefaultRegistrationFieldState,
  createDefaultRegistrationPolicyState,
  registrationFieldStateToSchema,
  registrationInventoryStateToApi,
  registrationPolicyStateToApi,
  type RegistrationFieldState,
  type RegistrationInventoryState,
  type RegistrationPolicyState,
} from '@/lib/event-registration';

export default function NewEventPage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [templateKey, setTemplateKey] = useState<EventTemplateKey>('service');
  const [fieldState, setFieldState] = useState<RegistrationFieldState>(() => createDefaultRegistrationFieldState('SERVICE'));
  const [policyState, setPolicyState] = useState<RegistrationPolicyState>(() =>
    createDefaultRegistrationPolicyState({ eventType: 'SERVICE', title: '', slug: '' })
  );
  const [inventoryState, setInventoryState] = useState<RegistrationInventoryState[]>([]);

  const [form, setForm] = useState({
    title: '',
    slug: '',
    summary: '',
    eventType: 'SERVICE',
    visibility: 'PUBLIC',
    registrationMode: 'OPEN',
  });

  const applyTemplate = (key: EventTemplateKey) => {
    const template = eventTemplateOptions.find((option) => option.key === key);
    if (!template) {
      return;
    }

    setTemplateKey(key);
    setForm((current) => {
      const nextForm = {
        ...current,
        eventType: template.defaults.eventType,
        visibility: template.defaults.visibility,
        registrationMode: template.defaults.registrationMode,
        summary: current.summary || template.defaults.summary,
      };

      if (template.defaults.eventType === 'CONFERENCE') {
        const defaults = applyConferenceRegistrationDefaults({
          title: nextForm.title,
          slug: nextForm.slug,
        });
        setFieldState(defaults.fields);
        setPolicyState(defaults.policy);
      } else {
        setFieldState(createDefaultRegistrationFieldState(template.defaults.eventType));
        setPolicyState(
          createDefaultRegistrationPolicyState({
            eventType: template.defaults.eventType,
            title: nextForm.title,
            slug: nextForm.slug,
          })
        );
      }

      return nextForm;
    });
  };

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
      ...(field === 'title' && !prev.slug
        ? { slug: value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') }
        : {}),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.slug) {
      setError('Title and slug are required.');
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      const result = await fetchApi('/admin/events', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          registrationFormSchema: registrationFieldStateToSchema(fieldState),
          registrationPolicy: registrationPolicyStateToApi(policyState),
          registrationInventory: registrationInventoryStateToApi(inventoryState),
        }),
      });
      router.push(`/events/${result.data.id}`);
    } catch (err: any) {
      setError(err.message ?? 'Failed to create event.');
    } finally {
      setIsSaving(false);
    }
  };

  const selectClass = "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

  return (
    <div className="space-y-8 max-w-2xl">
      <div className="flex items-center gap-4">
        <Link href="/events">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Create Event</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Event Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="space-y-3">
              <label className="text-sm font-medium">Event Template</label>
              <div className="grid gap-3 md:grid-cols-2">
                {eventTemplateOptions.map((option) => {
                  const selected = templateKey === option.key;
                  return (
                    <button
                      key={option.key}
                      type="button"
                      className={`rounded-2xl border p-4 text-left transition-colors ${
                        selected
                          ? 'border-primary bg-primary/5'
                          : 'border-border bg-background hover:border-primary/30'
                      }`}
                      onClick={() => applyTemplate(option.key)}
                    >
                      <p className="font-semibold">{option.label}</p>
                      <p className="mt-2 text-sm text-muted-foreground">{option.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Title *</label>
              <Input
                value={form.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="e.g. Regional Camp Meeting 2026"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Slug *</label>
              <Input
                value={form.slug}
                onChange={(e) => handleChange('slug', e.target.value)}
                placeholder="e.g. regional-camp-meeting-2026"
              />
              <p className="text-xs text-gray-400">URL-friendly identifier. Auto-generated from title.</p>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Summary</label>
              <Input
                value={form.summary}
                onChange={(e) => handleChange('summary', e.target.value)}
                placeholder="Short description of the event"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Event Type</label>
                <select
                  className={selectClass}
                  value={form.eventType}
                  onChange={(e) => handleChange('eventType', e.target.value)}
                >
                  <option value="SERVICE">Service</option>
                  <option value="CONFERENCE">Conference</option>
                  <option value="CONCERT">Concert</option>
                  <option value="MEETING">Meeting</option>
                  <option value="WORKSHOP">Workshop</option>
                  <option value="SOCIAL">Social</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Visibility</label>
                <select
                  className={selectClass}
                  value={form.visibility}
                  onChange={(e) => handleChange('visibility', e.target.value)}
                >
                  <option value="PUBLIC">Public</option>
                  <option value="MEMBER">Members Only</option>
                  <option value="BRANCH">Branch Only</option>
                  <option value="PRIVATE">Private</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Registration</label>
                <select
                  className={selectClass}
                  value={form.registrationMode}
                  onChange={(e) => handleChange('registrationMode', e.target.value)}
                >
                  <option value="OPEN">Open</option>
                  <option value="MEMBER_ONLY">Members Only</option>
                  <option value="INVITATION_ONLY">Invitation Only</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <EventRegistrationSettings
          fieldState={fieldState}
          policyState={policyState}
          inventoryState={inventoryState}
          onFieldStateChange={setFieldState}
          onPolicyStateChange={setPolicyState}
          onInventoryStateChange={setInventoryState}
        />

        <div className="flex justify-end gap-3">
          <Link href="/events"><Button variant="outline" type="button">Cancel</Button></Link>
          <Button type="submit" disabled={isSaving} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            {isSaving ? 'Saving...' : 'Create Event'}
          </Button>
        </div>
      </form>
    </div>
  );
}
