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
      <div className="not-prose max-w-4xl">
        <ul className="list-none space-y-8 p-0">
          {items.map((item) => (
            <li key={item.id} className="rounded-3xl border border-foreground/5 bg-card/30 p-8 backdrop-blur-md transition-all hover:scale-[1.01] hover:bg-card/50">
              <div className="mb-4 flex flex-wrap gap-4 text-[10px] font-black uppercase tracking-[0.3em] text-accent">
                <span className="bg-accent/10 py-1 px-3 rounded-full border border-accent/20">{item.category}</span>
                <span className="py-1 px-2 text-muted-foreground/60">{item.location}</span>
              </div>
              <h2 className="mb-3 text-2xl md:text-3xl font-bold text-foreground italic heading-premium">{item.title}</h2>
              <p className="text-muted-foreground text-lg leading-relaxed font-medium">{item.summary}</p>
              <div className="mt-8 pt-6 border-t border-foreground/5 flex flex-wrap items-center justify-between gap-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
                <span>{format(parseISO(item.publishedAt), 'MMMM d, yyyy')}</span>
                <span className="italic">{item.status}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
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
