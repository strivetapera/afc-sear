import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { offCanvasSections } from '../lib/siteNavigation';

const OffCanvasMenu = ({ isOpen, onClose, triggerRef }) => {
    const menuRef = useRef(null);
    const closeButtonRef = useRef(null);

    useEffect(() => {
        const handleEsc = (e) => (e.key === 'Escape' && isOpen) && onClose();
        document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    useEffect(() => {
        if (isOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = 'unset';
        return () => (document.body.style.overflow = 'unset');
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex justify-end">
                    {/* Premium Gaussian Blur Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-background/95 backdrop-blur-sm cursor-pointer"
                    />

                    {/* Glassmorphic Menu Panel */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="relative w-full max-w-sm h-full bg-background border-l border-foreground/5 shadow-premium flex flex-col"
                    >
                        {/* Header Space */}
                        <div className="p-8 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-16 h-16 transition-transform duration-500 overflow-hidden flex items-center justify-center">
                                    <img 
                                        src="/images/jesus-light.png" 
                                        alt="Logo" 
                                        className="w-full h-full object-contain" 
                                    />
                                </div>
                                <span className="text-lg font-black tracking-tighter uppercase text-foreground">Menu</span>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.1, rotate: 90 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={onClose}
                                className="w-10 h-10 flex items-center justify-center rounded-xl bg-foreground/5 border border-foreground/10 text-foreground"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </motion.button>
                        </div>

                        {/* Navigation Content */}
                        <nav className="flex-1 overflow-y-auto p-8 pt-0">
                            {offCanvasSections.map((section, idx) => (
                                <motion.div 
                                    key={section.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 * idx }}
                                    className="mb-12"
                                >
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-accent mb-6">
                                        {section.title}
                                    </h3>
                                    <ul className="space-y-4">
                                        {section.links.map((link) => (
                                            <li key={link.href}>
                                                <Link
                                                    href={link.href}
                                                    onClick={onClose}
                                                    className="group flex items-center justify-between text-2xl font-bold tracking-tight text-foreground/60 hover:text-foreground transition-all"
                                                >
                                                    <span>{link.label}</span>
                                                    <motion.span 
                                                        initial={{ opacity: 0, x: -10 }}
                                                        whileHover={{ opacity: 1, x: 0 }}
                                                        className="text-accent text-sm italic font-medium"
                                                    >
                                                        Visit →
                                                    </motion.span>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </motion.div>
                            ))}
                        </nav>

                        {/* Footer Branding */}
                        <div className="p-8 border-t border-border/50 bg-muted/20">
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1">APOSTOLIC FAITH MISSION</p>
                            <p className="text-[10px] font-black italic text-accent uppercase tracking-widest">Graceful Modernism v3.0</p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default OffCanvasMenu;
