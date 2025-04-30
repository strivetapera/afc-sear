// components/Footer.js
const Footer = () => {
  return (
    <footer className="bg-cream text-black py-8 text-center">
      <div className="container mx-auto flex flex-col items-center w-11/12 max-w-[1200px]">
          <nav className="mb-6">
           <ul className="flex justify-center flex-col md:flex-row gap-6">
            <li><a href="#" className="text-black text-lg relative transition-colors hover:text-maroon focus:text-maroon focus:outline-none pb-[0.4rem] before:content-[''] before:absolute before:left-0 before:right-0 before:bottom-[-3px] before:h-[2px] before:bg-maroon hover:border-b-2 hover:border-b-maroon">Contact Us</a></li>
              <li><a href="#" className="text-black text-lg relative transition-colors hover:text-maroon focus:text-maroon focus:outline-none pb-[0.4rem] before:content-[''] before:absolute before:left-0 before:right-0 before:bottom-[-3px] before:h-[2px] before:bg-maroon hover:border-b-2 hover:border-b-maroon">Privacy Policy</a></li>
               <li><a href="#" className="text-black text-lg relative transition-colors hover:text-maroon focus:text-maroon focus:outline-none pb-[0.4rem] before:content-[''] before:absolute before:left-0 before:right-0 before:bottom-[-3px] before:h-[2px] before:bg-maroon hover:border-b-2 hover:border-b-maroon">Terms of Use</a></li>
           </ul>
          </nav>
        <p className="text-sm mt-4 opacity-80">
          © {new Date().getFullYear()} Apostolic Faith Church SEAR. All rights
          reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;