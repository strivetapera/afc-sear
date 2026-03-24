import { getStructuredPageContent } from '../data/structuredPagesData';

export function getStructuredPageStaticProps(pageKey) {
  const page = getStructuredPageContent(pageKey);

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
