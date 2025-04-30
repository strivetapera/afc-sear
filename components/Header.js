// components/Header.js
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import OffCanvasMenu from './OffCanvasMenu'; // Import the new component

// NavLink component remains the same
const NavLink = ({ href, children, onClick }) => (
    <li>
        <Link
            href={href}
            className="text-gold text-lg relative transition-all hover:text-[rgba(255,215,0,0.8)] hover:border-b-[2px] hover:border-b-gold pb-[0.4rem]  before:content-[''] before:absolute before:left-0 before:right-0 before:bottom-[-3px] before:h-[2px] before:bg-[rgba(255,215,0,0.5)]"
            onClick={onClick}
        >
            {children}
        </Link>
    </li>
);

// Simple Menu Icon SVG (Example)
const MenuIcon = (props) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-8 h-8" // Adjust size as needed
        {...props}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
);


const Header = () => {
    // State for the OffCanvasMenu
    const [isOffCanvasOpen, setIsOffCanvasOpen] = useState(false);
    const offCanvasButtonRef = useRef(null); // Ref for the trigger button

    // Function to toggle the OffCanvasMenu
    const toggleOffCanvas = () => {
        setIsOffCanvasOpen(!isOffCanvasOpen);
    };

    // Optional: Close OffCanvas if window resizes larger (desktop view)
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768 && isOffCanvasOpen) { // 768px is Tailwind's default 'md' breakpoint
                setIsOffCanvasOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isOffCanvasOpen]);


    return (
        <> {/* Use Fragment to render Header and OffCanvasMenu side-by-side */}
            <header className="bg-black text-gold py-4 fixed top-0 left-0 w-full z-30 transition transform shadow-md"> {/* Use z-30 */}
                <div className="container mx-auto flex items-center justify-between w-11/12 max-w-[1200px]">
                    {/* Logo */}
                    <div className="flex items-center">
                        <div className="bg-black rounded-full p-1 mr-6"> {/* Changed back to cream background for logo */}
                            <Link href="/" className="inline-block hover:opacity-90">
                                <Image
                                    src="/images/jesus-light.png"
                                    alt="Apostolic Faith Church SEAR Logo"
                                    width={180}
                                    height={90}
                                    priority
                                />
                            </Link>
                        </div>
                    </div>

                    {/* Desktop Navigation & Off-Canvas Trigger */}
                    <div className="flex items-center">
                        {/* Desktop Navigation (Hidden on mobile) */}
                        <nav className="hidden md:block mr-4"> {/* Add margin-right */}
                            <ul className="flex flex-row gap-6 items-center"> {/* Ensure items-center if needed */}
                                <NavLink href="/">Home</NavLink>
                                <NavLink href="/about">About</NavLink>
                                {/* <NavLink href="/ministries">Ministries</NavLink> <-- REMOVED */}
                                <NavLink href="/live-webcast">Live Webcast</NavLink> {/* <-- ADDED */}
                                <NavLink href="/news">News</NavLink>
                                <NavLink href="/events">Events</NavLink>
                                {/* Add other top-level links if desired */}
                            </ul>
                        </nav>

                        {/* Off-Canvas Trigger Button */}
                        <button
                            ref={offCanvasButtonRef}
                            className="relative p-2 text-gold hover:text-opacity-80 focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 focus:ring-offset-black rounded" // Added focus styles
                            onClick={toggleOffCanvas}
                            aria-haspopup="dialog" // Use dialog role for the target panel
                            aria-expanded={isOffCanvasOpen}
                            aria-label="Open Menu" // Clearer label
                            aria-controls="offcanvas-menu" // Optional: ID of the menu panel
                        >
                           <MenuIcon aria-hidden="true"/> {/* Use the Menu Icon component */}
                        </button>
                    </div>
                </div>
            </header>

            {/* Render the OffCanvasMenu - Ensure its z-index is higher (e.g., z-40, z-50) */}
            {/* NOTE: You might also want to remove/change "Ministries" inside OffCanvasMenu.js */}
            <OffCanvasMenu
                isOpen={isOffCanvasOpen}
                onClose={toggleOffCanvas}
                id="offcanvas-menu" // Added ID for aria-controls
            />
        </>
    );
};

export default Header;