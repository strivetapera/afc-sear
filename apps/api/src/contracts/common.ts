export type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

export type AuthScope = 'public' | 'member' | 'admin' | 'service';

export interface ApiRouteContract {
  method: HttpMethod;
  path: string;
  summary: string;
  auth: AuthScope;
  requestType?: string;
  responseType: string;
}

export interface ServiceBoundary {
  domain: string;
  responsibilities: string[];
  ownedTables: string[];
  publishedEvents: string[];
  consumedEvents: string[];
}

export interface PaginationQuery {
  page?: number;
  pageSize?: number;
  sort?: string;
  filter?: Record<string, string | number | boolean>;
}

export interface ApiEnvelope<T> {
  data: T;
  meta?: Record<string, unknown>;
}
