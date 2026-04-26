// pages/_app.js
import '../styles/globals.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ThemeProvider } from '../components/ThemeProvider';

export default function App({ Component, pageProps }) {
  const useDefaultWrapper = pageProps.useDefaultWrapper !== false;

  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-500">
        <Header />
        
        <main className="flex-grow">
          <Component {...pageProps} />
        </main>

        <Footer />
      </div>
    </ThemeProvider>
  );
}