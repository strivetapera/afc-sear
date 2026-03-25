import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import OffCanvasMenu from './OffCanvasMenu';
import { topNavLinks } from '../lib/siteNavigation';
import { useTheme } from './ThemeProvider';

const Header = () => {
    const [isOffCanvasOpen, setIsOffCanvasOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { theme, toggleTheme } = useTheme();
    const offCanvasButtonRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleOffCanvas = () => setIsOffCanvasOpen(!isOffCanvasOpen);
    const closeOffCanvas = () => setIsOffCanvasOpen(false);

    return (
        <motion.header 
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
                scrolled 
                ? 'py-4 bg-background/90 backdrop-blur-xl border-b border-foreground/5 shadow-premium' 
                : 'py-8 bg-transparent'
            }`}
        >
            <div className="container mx-auto px-6 max-w-7xl flex items-center justify-between">
                {/* Premium Round Logo Integration */}
                <Link href="/" className="group relative flex items-center focus:outline-none">
                    <div className={`transition-all duration-500 flex items-center justify-center ${scrolled ? 'w-20 h-20' : 'w-28 h-28'} -translate-y-2`}>
                        <div className="absolute inset-0 bg-background/80 backdrop-blur-md rounded-full border border-foreground/5 shadow-premium opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <img 
                            src="/images/jesus-light.png" 
                            alt="Logo" 
                            className="relative z-10 w-full h-full object-contain drop-shadow-2xl" 
                        />
                    </div>
                    <div className={`flex flex-col ml-4 transition-all duration-500 ${scrolled ? 'translate-x-0' : 'translate-x-2'}`}>
                        <span className={`text-lg font-black tracking-tighter uppercase leading-none transition-colors duration-500 ${scrolled ? 'text-foreground' : 'text-white'}`}>
                            APOSTOLIC FAITH MISSION
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent/80">Southern & Eastern Africa Region</span>
                    </div>
                </Link>

                <div className="flex items-center gap-8">
                    {/* Desktop Navigation */}
                    <nav className="hidden lg:block">
                        <ul className="flex items-center gap-10" suppressHydrationWarning>
                            {topNavLinks.map((link) => (
                                <li key={link.href}>
                                    <Link 
                                        href={link.href}
                                        className={`text-sm font-bold uppercase tracking-[0.2em] transition-all relative group py-2 ${
                                            scrolled 
                                            ? 'text-foreground/80 hover:text-foreground' 
                                            : 'text-white/70 hover:text-white'
                                        }`}
                                    >
                                        {link.label}
                                        <motion.span 
                                            className="absolute bottom-0 left-0 w-0 h-0.5 bg-accent transition-all group-hover:w-full" 
                                        />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    {/* Theme Toggle Button */}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={toggleTheme}
                        className={`w-12 h-12 flex items-center justify-center rounded-xl border transition-all duration-300 ${
                            scrolled
                            ? 'bg-foreground/5 border-foreground/10 text-foreground hover:bg-accent hover:text-accent-foreground'
                            : 'bg-white/5 border-white/10 text-white hover:bg-white/20'
                        }`}
                        aria-label="Toggle Theme"
                    >
                        {theme === 'dark' ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M16.243 16.243l.707.707M7.757 7.757l.707.707M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                            </svg>
                        )}
                    </motion.button>

                    {/* Minimalist Menu Toggle */}
                    <motion.button
                        ref={offCanvasButtonRef}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={toggleOffCanvas}
                        className={`relative w-12 h-12 flex flex-col items-center justify-center gap-1.5 rounded-xl border transition-all duration-300 ${
                            scrolled
                            ? 'bg-foreground/5 border-foreground/10 text-foreground hover:bg-accent hover:text-accent-foreground hover:border-accent'
                            : 'bg-white/5 border-white/10 text-white hover:bg-white/20'
                        }`}
                        aria-label="Toggle Menu"
                    >
                        <span className={`w-6 h-0.5 bg-current rounded-full transition-transform ${isOffCanvasOpen ? 'rotate-45 translate-y-2' : ''}`} />
                        <span className={`w-6 h-0.5 bg-current rounded-full transition-opacity ${isOffCanvasOpen ? 'opacity-0' : ''}`} />
                        <span className={`w-6 h-0.5 bg-current rounded-full transition-transform ${isOffCanvasOpen ? '-rotate-45 -translate-y-2' : ''}`} />
                    </motion.button>
                </div>
            </div>

            <AnimatePresence>
                {isOffCanvasOpen && (
                    <OffCanvasMenu
                        isOpen={isOffCanvasOpen}
                        onClose={closeOffCanvas}
                        triggerRef={offCanvasButtonRef}
                    />
                )}
            </AnimatePresence>
        </motion.header>
    );
};

export default Header;
