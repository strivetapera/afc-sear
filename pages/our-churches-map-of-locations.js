// pages/our-churches-map-of-locations.js
import PageShell from '../components/PageShell';
import { getLocationsDirectoryFromPlatform } from '../lib/platformLocationsApi';

const OurChurchesMap = ({ contacts, groupedLocations, metadata, overview }) => {
  return (
    <PageShell
      eyebrow={metadata.eyebrow}
      title={metadata.title}
      lead={metadata.lead}
      actions={[
        { href: '/contact', label: 'Request A Local Contact' },
        { href: '/events', label: 'See Regional Schedule', variant: 'secondary' },
      ]}
    >
      <p>{overview.intro}</p>
      <p className="mt-4">
        <strong>{groupedLocations.reduce((count, group) => count + group.locations.length, 0)}</strong>{' '}
        branch listings from the older Zimbabwe website are now visible again while the broader
        regional map is still being rebuilt.
      </p>

      <div className="not-prose mt-8 grid gap-4 md:grid-cols-2">
        {contacts.map((contact) => (
          <div key={contact.id} className="rounded-2xl border border-gold/20 bg-white/5 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold/70">
              {contact.label}
            </p>
            <p className="mt-2 text-lg font-semibold text-cream">
              {contact.href ? (
                <a href={contact.href} target="_blank" rel="noreferrer">
                  {contact.value}
                </a>
              ) : (
                contact.value
              )}
            </p>
            <p className="mt-2 text-sm leading-6 text-cream/70">{contact.note}</p>
          </div>
        ))}
      </div>

      <div className="not-prose mt-10 space-y-8">
        {groupedLocations.map((group) => (
          <section key={group.country}>
            <h2 className="mb-4 text-2xl font-semibold text-gold">{group.country}</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {group.locations.map((location) => (
                <article
                  key={location.id}
                  className="rounded-2xl border border-gold/20 bg-white/5 p-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-semibold text-cream">
                        {location.congregation}
                      </h3>
                      <p className="mt-1 text-sm uppercase tracking-[0.2em] text-gold/70">
                        {location.city}
                      </p>
                    </div>
                    {location.livestream ? (
                      <span className="rounded-full border border-gold/40 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-gold">
                        Online Access
                      </span>
                    ) : null}
                  </div>

                  <p className="mt-4 text-sm leading-6 text-cream/80">{location.address}</p>

                  <p className="mt-4 text-sm text-cream/85">
                    Pastor: <span className="font-semibold text-cream">{location.pastor}</span>
                  </p>

                  <div className="mt-5">
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gold/75">
                      Usual Service Times
                    </p>
                    <ul className="mt-3 space-y-2 text-sm leading-6 text-cream/80">
                      {location.serviceTimes.map((serviceTime) => (
                        <li key={serviceTime}>{serviceTime}</li>
                      ))}
                    </ul>
                  </div>

                  <p className="mt-5 text-sm text-cream/80">
                    Contact: <span className="font-semibold text-cream">{location.contact}</span>
                  </p>
                  <p className="mt-3 text-sm leading-6 text-cream/65">{location.notes}</p>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>

      <p className="mt-8">{overview.contactPrompt}</p>
    </PageShell>
  );
};

export default OurChurchesMap;

export async function getStaticProps() {
  const directory = await getLocationsDirectoryFromPlatform();

  return {
    props: {
      contacts: directory.contacts,
      groupedLocations: directory.groupedLocations,
      metadata: directory.metadata,
      overview: directory.overview,
    },
  };
}
