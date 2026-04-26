import StructuredPageContent from '../components/StructuredPageContent';
import { getStructuredPageStaticProps } from '../lib/structuredPageUtils';

export default function TermsOfUsePage({ page }) {
  return <StructuredPageContent page={page} />;
}

export function getStaticProps() {
  return getStructuredPageStaticProps('termsOfUse');
}
