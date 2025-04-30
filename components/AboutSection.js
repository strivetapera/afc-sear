// components/AboutSection.js
import Link from 'next/link'; // Import Link for the button

const AboutSection = () => {
    return (
      <section className="py-12 md:py-16 bg-black"> {/* Consistent padding */}
        {/* Consistent container */}
        <div className="container mx-auto px-6 w-11/12 max-w-[1200px] text-center md:text-left">

          {/* Heading: Inherits Gold color */}
          <h2 className="text-3xl md:text-4xl font-semibold mb-6">
            About Our Church
          </h2>

          {/*
            Paragraphs: Inherit Cream color.
            Using text directly here instead of prose for simpler section styling.
            Added a second paragraph for more context, matching the /about page intro.
          */}
          <div className="space-y-4 text-base md:text-lg leading-relaxed max-w-prose md:max-w-none mx-auto md:mx-0">
             <p>
               The Apostolic Faith Church SEAR (Southern & Eastern Africa Region) is a global
               Christian organization dedicated to spreading the gospel of Jesus Christ,
               fostering spiritual growth, and serving our communities. We are committed
               to the teachings of the Bible and believe in the power of prayer and the
               Holy Spirit.
             </p>
             <p>
               Our mission is to reach all people with the love of Christ, help them
               develop a personal relationship with Him, and build a welcoming, impactful
               faith community focused on spiritual growth and practical living.
             </p>
           </div>


          {/* Call to Action Button - Uncommented and linked */}
  
          <div className="mt-8">
            <Link
              href="/about"
              className="inline-block bg-gold text-black [text-shadow:1px_1px_1px_rgba(0,0,0,0.2)] font-semibold py-3 px-8 rounded hover:bg-opacity-85 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 focus:ring-offset-black"
              // ^-- Added arbitrary text-shadow utility
            >
              Learn More About Us
            </Link>
          </div>
        </div>
      </section>
    );
  };

export default AboutSection;