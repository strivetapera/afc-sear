// components/OffCanvasMenu.js
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { offCanvasSections } from '../lib/siteNavigation';

// Basic focusable elements selector
const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), textarea:not([disabled]), input[type="text"]:not([disabled]), input[type="radio"]:not([disabled]), input[type="checkbox"]:not([disabled]), select:not([disabled])';

const OffCanvasMenu = ({ isOpen, onClose, triggerRef }) => {
    const menuRef = useRef(null);
    const closeButtonRef = useRef(null);
    const previousIsOpen = useRef(false);

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

    useEffect(() => {
        if (previousIsOpen.current && !isOpen) {
            triggerRef?.current?.focus();
        }

        previousIsOpen.current = isOpen;
    }, [isOpen, triggerRef]);

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
                className={`fixed inset-0 bg-black transition-opacity duration-300 ease-in-out z-40 ${
                    isOpen ? 'visible opacity-60' : 'invisible opacity-0 pointer-events-none'
                }`}
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Menu Panel */}
            <div
                ref={menuRef}
                className={`fixed top-0 left-0 h-full w-80 max-w-[90%] bg-black text-cream shadow-xl transition-all duration-300 ease-in-out z-50 transform ${
                    isOpen
                      ? 'visible translate-x-0'
                      : 'invisible -translate-x-full pointer-events-none'
                }`}
                role="dialog"
                aria-modal="true"
                aria-labelledby="offcanvas-title"
                aria-hidden={!isOpen}
                id="offcanvas-menu"
                inert={isOpen ? undefined : ''}
            >
                <div className="flex justify-between items-center p-4 border-b border-gray-700">
                    <h2 id="offcanvas-title" className="text-xl font-semibold text-gold">
                        Menu
                    </h2>
                    <button
                        ref={closeButtonRef}
                        onClick={onClose}
                        className="text-cream hover:text-gold text-3xl p-1 -mr-1 leading-none focus:outline-none focus:ring-2 focus:ring-gold rounded"
                        aria-label="Close Menu"
                    >
                        ×
                    </button>
                </div>

                <nav className="p-4 overflow-y-auto h-[calc(100%-70px)]" role="navigation" aria-label="Main menu">
                    {offCanvasSections.map((section, index) => (
                      <div key={section.id}>
                        {index > 0 ? <hr className="border-gray-700 my-4" /> : null}
                        <div className="mb-6">
                          <h3 className="font-bold text-gold mb-2 text-lg" id={`nav-section-${section.id}`}>
                            {section.title}
                          </h3>
                          <ul className="space-y-3 ml-2" aria-labelledby={`nav-section-${section.id}`}>
                            {section.links.map((link) => (
                              <li key={link.href}>
                                <Link
                                  href={link.href}
                                  className="block rounded px-1 -mx-1 hover:underline focus:outline-none focus:ring-1 focus:ring-gold"
                                  onClick={onClose}
                                >
                                  {link.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                </nav>
            </div>
        </>
    );
};

export default OffCanvasMenu;
