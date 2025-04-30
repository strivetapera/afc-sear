// components/OffCanvasMenu.js
import Link from 'next/link';
import { useEffect, useRef } from 'react';

// Basic focusable elements selector
const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), textarea:not([disabled]), input[type="text"]:not([disabled]), input[type="radio"]:not([disabled]), input[type="checkbox"]:not([disabled]), select:not([disabled])';

const OffCanvasMenu = ({ isOpen, onClose }) => {
    const menuRef = useRef(null);
    const closeButtonRef = useRef(null); // Ref for the close button

    // Close on Escape key
    useEffect(() => {
        const handleEsc = (event) => {
            if (event.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        document.addEventListener('keydown', handleEsc);
        return () => {
            document.removeEventListener('keydown', handleEsc);
        };
    }, [isOpen, onClose]);

    // Focus Trapping
    useEffect(() => {
        if (isOpen && menuRef.current && closeButtonRef.current) {
            const focusableElements = menuRef.current.querySelectorAll(FOCUSABLE_SELECTOR);
            // Ensure elements exist before accessing them
            if (focusableElements.length === 0) return;

            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            // Focus the close button initially when opening
            closeButtonRef.current.focus();

            const handleTabKeyPress = (event) => {
                if (event.key !== 'Tab') {
                    return;
                }

                // Check if focusableElements still has items (might change if content loads async)
                if (focusableElements.length === 0) return;

                if (event.shiftKey) { // Shift + Tab
                    if (document.activeElement === firstElement) {
                        lastElement.focus();
                        event.preventDefault();
                    }
                } else { // Tab
                    if (document.activeElement === lastElement) {
                        firstElement.focus();
                        event.preventDefault();
                    }
                }
            };

            const menuElement = menuRef.current; // Capture current ref value
            menuElement.addEventListener('keydown', handleTabKeyPress);

            return () => {
                // Use the captured value for removal
                menuElement?.removeEventListener('keydown', handleTabKeyPress);
            };
        }
    }, [isOpen]); // Rerun when isOpen changes

    // Prevent body scroll when menu is open
    useEffect(() => {
        const originalOverflow = document.body.style.overflow;
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = originalOverflow; // Restore original on close
        }
        // Cleanup function to restore original overflow when component unmounts
        return () => {
             document.body.style.overflow = originalOverflow;
        };
    }, [isOpen]);

    return (
        <>
            {/* Overlay */}
            <div
                className={`fixed inset-0 bg-black transition-opacity duration-300 ease-in-out z-40 ${ // Uses z-40
                    isOpen ? 'opacity-60 visible' : 'opacity-0 invisible'
                }`}
                onClick={onClose}
                aria-hidden="true" // Hide from screen readers when not visible
            />

            {/* Menu Panel */}
            <div
                ref={menuRef}
                className={`fixed top-0 left-0 h-full w-80 max-w-[90%] bg-black text-cream shadow-xl transition-transform duration-300 ease-in-out z-50 transform ${ // Uses z-50
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
                role="dialog"
                aria-modal="true"
                aria-labelledby="offcanvas-title" // Use label for the title
                aria-hidden={!isOpen} // Hide from screen readers when closed
                id="offcanvas-menu" // Added ID for aria-controls
            >
                <div className="flex justify-between items-center p-4 border-b border-gray-700">
                    <h2 id="offcanvas-title" className="text-xl font-semibold text-gold">
                        Menu
                    </h2>
                    <button
                        ref={closeButtonRef} // Assign ref to close button
                        onClick={onClose}
                        className="text-cream hover:text-gold text-3xl p-1 -mr-1 leading-none focus:outline-none focus:ring-2 focus:ring-gold rounded" // Added focus style
                        aria-label="Close Menu"
                    >
                        × {/* Simple close icon */}
                    </button>
                </div>

                {/* Navigation Content */}
                <nav className="p-4 overflow-y-auto h-[calc(100%-70px)]" role="navigation" aria-label="Main menu">
                    {/* Optional: Main Nav Links for Mobile Consistency */}
                     <div className="mb-6">
                        <h3 className="font-bold text-gold mb-2 text-lg" id="nav-section-main">Navigation</h3>
                        <ul className="space-y-3 ml-2" aria-labelledby="nav-section-main">
                            <li><Link href="/" className="block hover:underline focus:outline-none focus:ring-1 focus:ring-gold rounded px-1 -mx-1" onClick={onClose}>Home</Link></li>
                            <li><Link href="/about" className="block hover:underline focus:outline-none focus:ring-1 focus:ring-gold rounded px-1 -mx-1" onClick={onClose}>About</Link></li>
                            {/* <li><Link href="/ministries" className="block hover:underline focus:outline-none focus:ring-1 focus:ring-gold rounded px-1 -mx-1" onClick={onClose}>Ministries</Link></li> <-- REMOVED */}
                            <li><Link href="/live-webcast" className="block hover:underline focus:outline-none focus:ring-1 focus:ring-gold rounded px-1 -mx-1" onClick={onClose}>Live Webcast</Link></li> {/* <-- ADDED */}
                            <li><Link href="/news" className="block hover:underline focus:outline-none focus:ring-1 focus:ring-gold rounded px-1 -mx-1" onClick={onClose}>News</Link></li>
                            <li><Link href="/events" className="block hover:underline focus:outline-none focus:ring-1 focus:ring-gold rounded px-1 -mx-1" onClick={onClose}>Events</Link></li>
                        </ul>
                    </div>
                    <hr className="border-gray-700 my-4"/>


                    {/* Categories from old Mega Menu */}
                    <div className="mb-6">
                         <h3 className="font-bold text-gold mb-2 text-lg" id="nav-section-churches">Our Churches</h3>
                        <ul className="space-y-3 ml-2" aria-labelledby="nav-section-churches">
                            <li><Link href="/our-faith" className="block hover:underline focus:outline-none focus:ring-1 focus:ring-gold rounded px-1 -mx-1" onClick={onClose}>Our Faith</Link></li>
                            <li><Link href="/our-churches-map-of-locations" className="block hover:underline focus:outline-none focus:ring-1 focus:ring-gold rounded px-1 -mx-1" onClick={onClose}>Map of Locations</Link></li>
                            <li><Link href="/portland" className="block hover:underline focus:outline-none focus:ring-1 focus:ring-gold rounded px-1 -mx-1" onClick={onClose}>Portland Church</Link></li>
                            <li><Link href="/camp-meeting" className="block hover:underline focus:outline-none focus:ring-1 focus:ring-gold rounded px-1 -mx-1" onClick={onClose}>Camp Meeting</Link></li>
                            <li><Link href="/calendar" className="block hover:underline focus:outline-none focus:ring-1 focus:ring-gold rounded px-1 -mx-1" onClick={onClose}>Calendar</Link></li>
                            <li><Link href="/world-report" className="block hover:underline focus:outline-none focus:ring-1 focus:ring-gold rounded px-1 -mx-1" onClick={onClose}>World Report</Link></li>
                            <li><Link href="/video-archive" className="block hover:underline focus:outline-none focus:ring-1 focus:ring-gold rounded px-1 -mx-1" onClick={onClose}>Media Center</Link></li>
                        </ul>
                    </div>

                     <div className="mb-6">
                         <h3 className="font-bold text-gold mb-2 text-lg" id="nav-section-resources">Library Resources</h3>
                        <ul className="space-y-3 ml-2" aria-labelledby="nav-section-resources">
                            <li><Link href="/apostolic-faith-magazine" className="block hover:underline focus:outline-none focus:ring-1 focus:ring-gold rounded px-1 -mx-1" onClick={onClose}>Apostolic Faith Magazine</Link></li>
                            <li><Link href="/library/curriculum" className="block hover:underline focus:outline-none focus:ring-1 focus:ring-gold rounded px-1 -mx-1" onClick={onClose}>Curriculum</Link></li>
                            <li><Link href="/daily-devotional-daybreak" className="block hover:underline focus:outline-none focus:ring-1 focus:ring-gold rounded px-1 -mx-1" onClick={onClose}>Daily Devotional</Link></li>
                            <li><Link href="/library/doctrinal-resources" className="block hover:underline focus:outline-none focus:ring-1 focus:ring-gold rounded px-1 -mx-1" onClick={onClose}>Doctrinal Resources</Link></li>
                            <li><Link href="/library/foreign-languages" className="block hover:underline focus:outline-none focus:ring-1 focus:ring-gold rounded px-1 -mx-1" onClick={onClose}>Foreign Languages</Link></li>
                            <li><Link href="/library/historical-materials" className="block hover:underline focus:outline-none focus:ring-1 focus:ring-gold rounded px-1 -mx-1" onClick={onClose}>Historical Materials</Link></li>
                            <li><Link href="/music-resources" className="block hover:underline focus:outline-none focus:ring-1 focus:ring-gold rounded px-1 -mx-1" onClick={onClose}>Music Resources</Link></li>
                            <li><Link href="/library/this-weeks-lessons" className="block hover:underline focus:outline-none focus:ring-1 focus:ring-gold rounded px-1 -mx-1" onClick={onClose}>This Week&apos;s Lessons</Link></li>
                        </ul>
                    </div>

                    <div className="mb-6">
                         <h3 className="font-bold text-gold mb-2 text-lg" id="nav-section-services">Accounts & Services</h3>
                         <ul className="space-y-3 ml-2" aria-labelledby="nav-section-services">
                            <li><Link href="/minister-resources" className="block hover:underline focus:outline-none focus:ring-1 focus:ring-gold rounded px-1 -mx-1" onClick={onClose}>Ministers</Link></li>
                            <li><Link href="/rentals" className="block hover:underline focus:outline-none focus:ring-1 focus:ring-gold rounded px-1 -mx-1" onClick={onClose}>Rentals</Link></li>
                            <li><Link href="/safety" className="block hover:underline focus:outline-none focus:ring-1 focus:ring-gold rounded px-1 -mx-1" onClick={onClose}>Safety</Link></li>
                            <li><Link href="/tithings-offerings" className="block hover:underline focus:outline-none focus:ring-1 focus:ring-gold rounded px-1 -mx-1" onClick={onClose}>Tithes & Offerings</Link></li>
                            <li><Link href="/subscriptions-hq" className="block hover:underline focus:outline-none focus:ring-1 focus:ring-gold rounded px-1 -mx-1" onClick={onClose}>Subscriptions</Link></li>
                            <li><Link href="/app" className="block hover:underline focus:outline-none focus:ring-1 focus:ring-gold rounded px-1 -mx-1" onClick={onClose}>Download our App</Link></li>
                        </ul>
                    </div>

                     {/* Extra links if needed */}
                     <hr className="border-gray-700 my-4"/>
                     <div className="mb-6">
                         <h3 className="font-bold text-gold mb-2 text-lg sr-only" id="nav-section-other">Other Links</h3> {/* Added sr-only for accessibility */}
                        <ul className="space-y-3 ml-2" aria-labelledby="nav-section-other">
                             {/* Removed duplicate Live Webcast link from here as it's now in main nav */}
                            <li>
                                <Link href="/contact" className="block hover:underline focus:outline-none focus:ring-1 focus:ring-gold rounded px-1 -mx-1" onClick={onClose}>
                                    Contact
                                </Link>
                            </li>
                        </ul>
                    </div>
                </nav>
            </div>
        </>
    );
};

export default OffCanvasMenu;