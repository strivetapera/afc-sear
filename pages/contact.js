import PageShell from '../components/PageShell';
import {
  contactChannels,
  contactNextSteps,
  contactPage,
  ministryContacts,
} from '../data/contactData';

function renderValue(item) {
  if (!item.href) {
    return <p className="mt-2 text-lg font-semibold text-cream">{item.value}</p>;
  }

  return (
    <p className="mt-2 text-lg font-semibold text-cream">
      <a href={item.href} target={item.href.startsWith('http') ? '_blank' : undefined} rel={item.href.startsWith('http') ? 'noreferrer' : undefined}>
        {item.value}
      </a>
    </p>
  );
}

export default function ContactPage({ metadata, channels, ministries, nextSteps }) {
  return (
    <PageShell
      eyebrow={metadata.eyebrow}
      title={metadata.title}
      lead={metadata.lead}
      actions={[
        { href: '/our-churches-map-of-locations', label: 'Find A Church' },
        { href: '/events', label: 'See Upcoming Services', variant: 'secondary' },
      ]}
    >
      <div className="not-prose grid gap-4 md:grid-cols-3">
        {channels.map((channel) => (
          <div key={channel.id} className="rounded-2xl border border-gold/20 bg-white/5 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold/70">
              {channel.label}
            </p>
            {renderValue(channel)}
            <p className="mt-3 text-sm leading-6 text-cream/70">{channel.note}</p>
          </div>
        ))}
      </div>

      <h2>Ministry-specific help</h2>
      <div className="not-prose mt-4 grid gap-4 md:grid-cols-3">
        {ministries.map((ministry) => (
          <div key={ministry.id} className="rounded-2xl border border-gold/20 bg-white/5 p-5">
            <h3 className="text-lg font-semibold text-cream">{ministry.title}</h3>
            <p className="mt-3 text-sm leading-6 text-cream/75">{ministry.description}</p>
            <p className="mt-4 text-sm font-semibold text-gold">{ministry.destination}</p>
          </div>
        ))}
      </div>

      <h2>Best next step today</h2>
      <ol>
        {nextSteps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
    </PageShell>
  );
}

export async function getStaticProps() {
  return {
    props: {
      metadata: contactPage,
      channels: contactChannels,
      ministries: ministryContacts,
      nextSteps: contactNextSteps,
    },
  };
}
