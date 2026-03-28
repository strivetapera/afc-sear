"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Eye, Plus, Save, Trash2 } from "lucide-react";
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from "@afc-sear/ui";
import { fetchApi } from "@/lib/api-client";
import {
  buildContentBodyFromTemplateForm,
  contentTemplateOptions,
  createContentTemplateForm,
  parseContentBodyToTemplateForm,
  type ContentTemplateForm,
} from "@/lib/content-templates";

interface PageProps {
  params: Promise<{ id: string }>;
}

const selectClass =
  "flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";
const PUBLIC_WEB_URL = process.env.NEXT_PUBLIC_WEB_URL || "http://localhost:3000";

export default function ContentEditPage({ params }: PageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { id } = React.use(params);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    summary: "",
    visibility: "PUBLIC",
    status: "DRAFT",
    contentTypeKey: "page",
  });
  const [templateForm, setTemplateForm] = useState<ContentTemplateForm>(
    createContentTemplateForm("standard_page"),
  );

  useEffect(() => {
    async function load() {
      try {
        const result = await fetchApi(`/admin/content-items/${id}`);
        const item = result.data;
        const requestedTemplate = searchParams.get("template");
        const parsedTemplate =
          !item.body && requestedTemplate === "home_page"
            ? createContentTemplateForm("home_page")
            : parseContentBodyToTemplateForm({
                slug: item.slug ?? "",
                body: item.body ?? {},
              });
        setForm({
          title: item.title ?? "",
          slug: item.slug ?? "",
          summary: item.summary ?? "",
          visibility: item.visibility ?? "PUBLIC",
          status: item.status ?? "DRAFT",
          contentTypeKey: item.contentTypeKey ?? "page",
        });
        setTemplateForm(parsedTemplate);
      } catch (err: any) {
        setError(err.message ?? "Failed to load content item.");
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, [id, searchParams]);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      const parsedBody = buildContentBodyFromTemplateForm({
        templateForm,
        title: form.title,
      });
      await fetchApi(`/admin/content-items/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          title: form.title,
          summary: form.summary,
          visibility: form.visibility,
          status: form.status,
          body: parsedBody,
        }),
      });
      router.refresh();
    } catch (err: any) {
      setError(err.message ?? "Failed to save content item.");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    setIsSaving(true);
    setError(null);

    try {
      await fetchApi(`/admin/content-items/${id}/publish`, {
        method: "POST",
        body: JSON.stringify({ published: true }),
      });
      router.refresh();
    } catch (err: any) {
      setError(err.message ?? "Failed to publish content item.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${form.title}"? This cannot be undone.`)) {
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await fetchApi(`/admin/content-items/${id}`, { method: "DELETE" });
      router.push("/content");
    } catch (err: any) {
      setError(err.message ?? "Failed to delete content item.");
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading content item...</p>;
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/content">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Content</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Update public copy using guided template fields.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Link href={`${PUBLIC_WEB_URL}/${form.slug}`} target="_blank" rel="noreferrer">
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
          </Link>
          <Button variant="outline" size="sm" onClick={handleDelete} disabled={isSaving}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
          <Button size="sm" onClick={handlePublish} disabled={isSaving}>
            Publish
          </Button>
          <Button size="sm" onClick={handleSave} isLoading={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Card>
        <CardHeader>
          <CardTitle>Content Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Title"
            value={form.title}
            onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
          />
          <Input label="Slug" value={form.slug} disabled />
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Summary</label>
            <textarea
              className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={form.summary}
              onChange={(event) => setForm((current) => ({ ...current, summary: event.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Visibility</label>
              <select
                className={selectClass}
                value={form.visibility}
                onChange={(event) => setForm((current) => ({ ...current, visibility: event.target.value }))}
              >
                <option value="PUBLIC">Public</option>
                <option value="MEMBER">Members</option>
                <option value="BRANCH">Branch</option>
                <option value="MINISTRY">Ministry</option>
                <option value="PRIVATE">Private</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Status</label>
              <select
                className={selectClass}
                value={form.status}
                onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
              >
                <option value="DRAFT">Draft</option>
                <option value="IN_REVIEW">In Review</option>
                <option value="APPROVED">Approved</option>
                <option value="PUBLISHED">Published</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Editing Template</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Template Type</label>
            <select
              className={selectClass}
              value={templateForm.templateKey}
              onChange={(event) =>
                setTemplateForm((current) => {
                  const nextTemplate = event.target.value as ContentTemplateForm["templateKey"];
                  const nextDefaults = createContentTemplateForm(nextTemplate);
                  return {
                    ...nextDefaults,
                    eyebrow: current.eyebrow || nextDefaults.eyebrow,
                    lead: current.lead || nextDefaults.lead,
                    organizationName: current.organizationName || nextDefaults.organizationName,
                    regionName: current.regionName || nextDefaults.regionName,
                    welcomeMessage: current.welcomeMessage || nextDefaults.welcomeMessage,
                    welcomeLead: current.welcomeLead || nextDefaults.welcomeLead,
                    imageAlt: current.imageAlt || nextDefaults.imageAlt,
                    primaryActionLabel: current.primaryActionLabel || nextDefaults.primaryActionLabel,
                    primaryActionHref: current.primaryActionHref || nextDefaults.primaryActionHref,
                    secondaryActionLabel: current.secondaryActionLabel || nextDefaults.secondaryActionLabel,
                    secondaryActionHref: current.secondaryActionHref || nextDefaults.secondaryActionHref,
                    aboutTitle: current.aboutTitle || nextDefaults.aboutTitle,
                    aboutParagraphsText: current.aboutParagraphsText || nextDefaults.aboutParagraphsText,
                    sections: current.sections.length ? current.sections : nextDefaults.sections,
                  };
                })
              }
            >
              {contentTemplateOptions.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="text-sm text-muted-foreground">
              {
                contentTemplateOptions.find((option) => option.key === templateForm.templateKey)
                  ?.description
              }
            </p>
          </div>

          {templateForm.templateKey === "home_page" ? (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  label="Hero Label"
                  value={templateForm.eyebrow}
                  onChange={(event) =>
                    setTemplateForm((current) => ({ ...current, eyebrow: event.target.value }))
                  }
                />
                <Input
                  label="Image Alt Text"
                  value={templateForm.imageAlt}
                  onChange={(event) =>
                    setTemplateForm((current) => ({ ...current, imageAlt: event.target.value }))
                  }
                />
                <Input
                  label="Organisation Name"
                  value={templateForm.organizationName}
                  onChange={(event) =>
                    setTemplateForm((current) => ({
                      ...current,
                      organizationName: event.target.value,
                    }))
                  }
                />
                <Input
                  label="Region Name"
                  value={templateForm.regionName}
                  onChange={(event) =>
                    setTemplateForm((current) => ({ ...current, regionName: event.target.value }))
                  }
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Welcome Message</label>
                <textarea
                  className="flex min-h-[110px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={templateForm.welcomeMessage}
                  onChange={(event) =>
                    setTemplateForm((current) => ({
                      ...current,
                      welcomeMessage: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Welcome Introduction</label>
                <textarea
                  className="flex min-h-[130px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={templateForm.welcomeLead}
                  onChange={(event) =>
                    setTemplateForm((current) => ({ ...current, welcomeLead: event.target.value }))
                  }
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  label="Primary Button Label"
                  value={templateForm.primaryActionLabel}
                  onChange={(event) =>
                    setTemplateForm((current) => ({
                      ...current,
                      primaryActionLabel: event.target.value,
                    }))
                  }
                />
                <Input
                  label="Primary Button Link"
                  value={templateForm.primaryActionHref}
                  onChange={(event) =>
                    setTemplateForm((current) => ({
                      ...current,
                      primaryActionHref: event.target.value,
                    }))
                  }
                />
                <Input
                  label="Secondary Button Label"
                  value={templateForm.secondaryActionLabel}
                  onChange={(event) =>
                    setTemplateForm((current) => ({
                      ...current,
                      secondaryActionLabel: event.target.value,
                    }))
                  }
                />
                <Input
                  label="Secondary Button Link"
                  value={templateForm.secondaryActionHref}
                  onChange={(event) =>
                    setTemplateForm((current) => ({
                      ...current,
                      secondaryActionHref: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="grid gap-4">
                <Input
                  label="Information Section Title"
                  value={templateForm.aboutTitle}
                  onChange={(event) =>
                    setTemplateForm((current) => ({ ...current, aboutTitle: event.target.value }))
                  }
                />
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">
                    Information Paragraphs
                  </label>
                  <textarea
                    className="flex min-h-[160px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={templateForm.aboutParagraphsText}
                    onChange={(event) =>
                      setTemplateForm((current) => ({
                        ...current,
                        aboutParagraphsText: event.target.value,
                      }))
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Put each paragraph on a new line.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  label="Top Label"
                  value={templateForm.eyebrow}
                  onChange={(event) =>
                    setTemplateForm((current) => ({ ...current, eyebrow: event.target.value }))
                  }
                />
                <Input
                  label="Main Action Label"
                  value={templateForm.primaryActionLabel}
                  onChange={(event) =>
                    setTemplateForm((current) => ({
                      ...current,
                      primaryActionLabel: event.target.value,
                    }))
                  }
                />
                <Input
                  label="Main Action Link"
                  value={templateForm.primaryActionHref}
                  onChange={(event) =>
                    setTemplateForm((current) => ({
                      ...current,
                      primaryActionHref: event.target.value,
                    }))
                  }
                />
                <Input
                  label="Secondary Action Label"
                  value={templateForm.secondaryActionLabel}
                  onChange={(event) =>
                    setTemplateForm((current) => ({
                      ...current,
                      secondaryActionLabel: event.target.value,
                    }))
                  }
                />
                <Input
                  label="Secondary Action Link"
                  value={templateForm.secondaryActionHref}
                  onChange={(event) =>
                    setTemplateForm((current) => ({
                      ...current,
                      secondaryActionHref: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Intro Text</label>
                <textarea
                  className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={templateForm.lead}
                  onChange={(event) =>
                    setTemplateForm((current) => ({ ...current, lead: event.target.value }))
                  }
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Page Sections</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={() =>
                      setTemplateForm((current) => ({
                        ...current,
                        sections: [
                          ...current.sections,
                          { heading: "", paragraphsText: "", listText: "" },
                        ],
                      }))
                    }
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Section
                  </Button>
                </div>

                <div className="space-y-6">
                  {templateForm.sections.map((section, index) => (
                    <div key={`section-${index}`} className="rounded-xl border border-border p-4 space-y-4">
                      <Input
                        label={`Section ${index + 1} Heading`}
                        value={section.heading}
                        onChange={(event) =>
                          setTemplateForm((current) => ({
                            ...current,
                            sections: current.sections.map((entry, sectionIndex) =>
                              sectionIndex === index
                                ? { ...entry, heading: event.target.value }
                                : entry,
                            ),
                          }))
                        }
                      />
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium">Paragraphs</label>
                        <textarea
                          className="flex min-h-[110px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          value={section.paragraphsText}
                          onChange={(event) =>
                            setTemplateForm((current) => ({
                              ...current,
                              sections: current.sections.map((entry, sectionIndex) =>
                                sectionIndex === index
                                  ? { ...entry, paragraphsText: event.target.value }
                                  : entry,
                              ),
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium">Bullet List</label>
                        <textarea
                          className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          value={section.listText}
                          onChange={(event) =>
                            setTemplateForm((current) => ({
                              ...current,
                              sections: current.sections.map((entry, sectionIndex) =>
                                sectionIndex === index
                                  ? { ...entry, listText: event.target.value }
                                  : entry,
                              ),
                            }))
                          }
                        />
                        <p className="text-xs text-muted-foreground">
                          Put each bullet point on a new line.
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
