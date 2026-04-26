import StructuredPageContent from '../components/StructuredPageContent';
import { getStructuredPageStaticProps } from '../lib/structuredPageUtils';

export default function MinisterResourcesPage({ page }) {
  return <StructuredPageContent page={page} />;
}

export function getStaticProps() {
  return getStructuredPageStaticProps('ministerResources');
}
