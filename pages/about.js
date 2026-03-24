import StructuredPageContent from '../components/StructuredPageContent';
import { getStructuredPageContent } from '../data/structuredPagesData';
import { getStructuredPageFromPlatform } from '../lib/platformPublicApi';

export default function About({ page }) {
  return <StructuredPageContent page={page} />;
}

export async function getStaticProps() {
  const fallbackPage = getStructuredPageContent('about');
  const page = await getStructuredPageFromPlatform('about', fallbackPage);

  if (!page) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      page,
    },
  };
}
