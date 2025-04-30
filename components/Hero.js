// components/Hero.js
import Image from 'next/image';

const Hero = () => {
  return (
    // Add z-0 here
    <div className="relative w-full h-[500px] overflow-hidden group z-0">
      {/* Dark Overlay */}
      {/* z-10 is now relative to the parent's z-0 */}
      <div className="absolute inset-0 bg-black/40 z-10"></div>

      {/* Background Image (behaves like z-auto/0 within its context) */}
      <Image
        src="/images/church-hero.jpg"
        alt="Congregation inside the Apostolic Faith Church"
        layout="fill"
        objectFit="cover"
        objectPosition="center"
        quality={75}
        priority
        className="transition-transform duration-700 group-hover:scale-105"
      />

      {/* Bottom Gradient */}
      {/* z-20 is relative to the parent's z-0 */}
      <div className="absolute bottom-0 left-0 w-full h-1/4 bg-gradient-to-t from-black/60 to-transparent z-20"></div>

      {/* Text Content Container */}
      {/* z-30 is relative to the parent's z-0 */}
      <div className="absolute inset-0 flex items-center justify-end z-30">
        {/* Text Box */}
        <div className="px-6 md:pr-12 max-w-xl lg:max-w-2xl text-right text-cream slide-fade-in">
           {/* Using paragraph for "Welcome to" */}
           <p className="text-2xl sm:text-3xl lg:text-4xl font-semibold leading-tight mb-1 outline-text-maroon">
             Welcome to
          </p>

          {/* Using H1 for the main title */}
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold mb-2 outline-text-maroon">
            The Apostolic Faith Church
          </h1>

          {/* Using paragraph for the tagline */}
          <p className="text-base sm:text-lg lg:text-xl outline-text-maroon">
            Southern & Eastern Africa Region
          </p>
        </div>
      </div>
    </div>
  );
};

export default Hero;