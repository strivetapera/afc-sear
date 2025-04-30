// pages/_app.js
import '../styles/globals.css';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function App({ Component, pageProps }) {
  // You can keep this logic if some pages truly need different fundamental layout
  // but often it's better to handle variations within the page/layout itself.
  // For this fix, we assume the main area generally needs the padding and background.
  const useDefaultWrapper = pageProps.useDefaultWrapper !== false;

  return (
    <>
      <Header /> {/* Renders fixed header AND OffCanvasMenu */}

      {/* 
        Main content area wrapper.
        Apply padding-top here to offset the fixed header.
        Apply background color here consistently.
      */}
      <main
        className="bg-black pt-[var(--header-padding)] md:pt-[var(--header-padding-small)]" // Tailwind arbitrary values for CSS vars
      >
        {/*
          Render the actual page component inside the main tag.
          The conditional wrapper div is likely no longer needed if it was just for bg-black.
          If the wrapper div had other structural purposes, you might place it inside <main>.
        */}
        {useDefaultWrapper ? (
          <Component {...pageProps} />
        ) : (
          // If a page *specifically* shouldn't have the default padding/styles applied
          // by <main>, you might need more complex logic or handle it in the page itself.
          // For now, we assume all pages go inside the padded main area.
          <Component {...pageProps} />
        )}
      </main>

      <Footer /> {/* Footer is outside the main padded area */}
    </>
  );
}