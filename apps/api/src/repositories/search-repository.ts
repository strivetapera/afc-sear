import { PrismaClient } from '@prisma/client';

/**
 * SearchRepository handles indexing and querying of platform data
 * intended for use with Meilisearch or similar instant search engines.
 */
export class SearchRepository {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Mock implementation of Meilisearch indexing.
   * In a real production environment, this would push to the Meilisearch API.
   */
  async indexContentItem(id: string) {
    const item = await this.prisma.contentItem.findUnique({
      where: { id },
      include: { categories: true }
    });

    if (!item) return;

    console.log(`[Search] Indexing ContentItem: ${item.title}`);
    // Example Meilisearch push:
    // await meili.index('content').addDocuments([{
    //   id: item.id,
    //   title: item.title,
    //   content: item.content,
    //   category: item.category.name,
    //   slug: item.slug
    // }]);
  }

  async indexEvent(id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: { venue: true }
    });

    if (!event) return;

    console.log(`[Search] Indexing Event: ${event.title}`);
  }

  /**
   * Performs a global search across multiple indexes
   */
  async search(query: string, limit = 10) {
    // In production: return await meili.search(query, { limit });
    
    // Fallback/Draft implementation using Prisma ILIKE (or similar)
    const [content, events, people] = await Promise.all([
      this.prisma.contentItem.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { summary: { contains: query, mode: 'insensitive' } }
          ]
        },
        take: limit
      }),
      this.prisma.event.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { summary: { contains: query, mode: 'insensitive' } }
          ]
        },
        take: limit
      }),
      this.prisma.person.findMany({
        where: {
          OR: [
            { firstName: { contains: query, mode: 'insensitive' } },
            { lastName: { contains: query, mode: 'insensitive' } }
          ]
        },
        take: limit
      })
    ]);

    return {
      content,
      events,
      people
    };
  }
}
