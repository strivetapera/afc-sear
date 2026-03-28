"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BookOpen, Edit, Eye } from "lucide-react";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from "@afc-sear/ui";
import { fetchApi } from "@/lib/api-client";

const PUBLIC_WEB_URL = process.env.NEXT_PUBLIC_WEB_URL || "http://localhost:3000";

function formatDate(value?: string | null) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function LessonsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadLessons() {
      try {
        const response = await fetchApi("/admin/content-items");
        setItems(response.data ?? []);
      } catch (error) {
        console.error("Failed to load lessons:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadLessons();
  }, []);

  const lessons = useMemo(
    () => items.filter((item) => item.contentTypeKey === "lesson"),
    [items]
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lessons</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Review and manage lesson content without leaving the admin portal.
          </p>
        </div>
        <Link href="/content/new">
          <Button className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            New Lesson
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lesson Library</CardTitle>
            <Badge variant="default">{lessons.length} lessons</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Updated</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                      Loading lessons...
                    </td>
                  </tr>
                ) : lessons.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                      No lesson content has been created yet.
                    </td>
                  </tr>
                ) : (
                  lessons.map((lesson) => (
                    <tr key={lesson.id} className="border-b last:border-0">
                      <td className="px-4 py-4">
                        <div className="font-medium">{lesson.title}</div>
                        <div className="text-xs text-muted-foreground">/{lesson.slug}</div>
                      </td>
                      <td className="px-4 py-4">
                        <Badge variant={lesson.status === "PUBLISHED" ? "success" : "default"}>
                          {lesson.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 text-muted-foreground">
                        {formatDate(lesson.updatedAt || lesson.createdAt)}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-2">
                          <Link href={`/content/${lesson.id}`}>
                            <Button size="sm" variant="outline">
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </Button>
                          </Link>
                          <Link href={`${PUBLIC_WEB_URL}/${lesson.slug}`} target="_blank" rel="noreferrer">
                            <Button size="sm" variant="ghost">
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
