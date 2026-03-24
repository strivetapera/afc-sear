import Link from 'next/link';

export default function AboutSection({ content }) {
  return (
    <section className="bg-black py-12 md:py-16">
      <div className="container mx-auto w-11/12 max-w-[1200px] px-6 text-center md:text-left">
        <h2 className="mb-6 text-3xl font-semibold md:text-4xl">{content.title}</h2>

        <div className="mx-auto max-w-prose space-y-4 text-base leading-relaxed md:mx-0 md:max-w-none md:text-lg">
          {content.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        <div className="mt-8">
          <Link
            href={content.cta.href}
            className="inline-block rounded bg-gold px-8 py-3 font-semibold text-black [text-shadow:1px_1px_1px_rgba(0,0,0,0.2)] transition-colors duration-200 ease-in-out hover:bg-opacity-85 focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 focus:ring-offset-black"
          >
            {content.cta.label}
          </Link>
        </div>
      </div>
    </section>
  );
}
