import PageShell from '../components/PageShell';
import { format, parseISO } from 'date-fns';
import { newsItems, newsPage } from '../data/newsData';
import { getNewsFeedFromPlatform } from '../lib/platformPublicApi';

export default function News({ items, metadata }) {
  return (
    <PageShell
      eyebrow={metadata.eyebrow}
      title={metadata.title}
      lead={metadata.lead}
    >
      <ul className="not-prose list-none space-y-4 p-0">
        {items.map((item) => (
          <li key={item.id} className="rounded-2xl border border-gold/20 bg-white/5 p-6">
            <div className="mb-3 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-gold/75">
              <span>{item.category}</span>
              <span className="text-cream/50">{item.location}</span>
            </div>
            <h2 className="mb-2 text-xl font-semibold text-gold">{item.title}</h2>
            <p className="text-cream/85">{item.summary}</p>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-cream/60">
              <span>Published: {format(parseISO(item.publishedAt), 'MMMM d, yyyy')}</span>
              <span>Status: {item.status}</span>
            </div>
          </li>
        ))}
      </ul>
    </PageShell>
  );
}

export async function getStaticProps() {
  const fallbackItems = [...newsItems].sort(
    (a, b) => parseISO(b.publishedAt).getTime() - parseISO(a.publishedAt).getTime()
  );
  const { metadata, items } = await getNewsFeedFromPlatform(newsPage, fallbackItems);

  return {
    props: {
      items,
      metadata,
    },
  };
}
