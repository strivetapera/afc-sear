// pages/about.js
import React from 'react';

export default function About() {
  return (
    // Container for the about page content
    <div className="py-12 md:py-16"> {/* Increased vertical padding */}
      <div className="container mx-auto px-6 w-11/12 max-w-[900px]"> {/* Consistent container */}

        {/* Page Title: Uses main h1 style (Gold) */}
        <h1 className="text-3xl md:text-4xl text-center font-bold mb-8 md:mb-12">
          About Us
        </h1>

        {/* Using prose for consistent typography */}
        <div className="prose prose-invert max-w-none mx-auto text-lg leading-relaxed space-y-6">

          {/* Introductory Paragraphs */}
          <p>
            The Apostolic Faith Church SEAR (Southern & Eastern Africa Region) is a global
            Christian organization dedicated to spreading the gospel of Jesus Christ,
            fostering spiritual growth, and serving our communities. We are committed
            to the teachings of the Bible and believe in the power of prayer and the
            Holy Spirit. Our mission is to reach all people with the love of Christ
            and help them develop a personal relationship with Him.
          </p>
          <p>
            Our vision is to be a church that is welcoming, inclusive, and impactful
            in the lives of individuals, families, and communities. We strive to create
            an environment where people can encounter God, find community, and be
            empowered to live out their faith in practical ways.
          </p>

          {/* Mission Section */}
          <div className="mt-10 pt-6 border-t border-gray-700">
            <h2 className="!text-gold !mb-4 !mt-0">
              Our Mission
            </h2>
            <p className="italic text-xl mb-6">
              The mission of the Apostolic Faith Church is to spread the Gospel of Jesus Christ.
            </p>
            <h3 className="!text-gold !text-lg font-semibold !mb-3">
              We Accomplish This As We:
            </h3>
            <ul className="list-none pl-0 space-y-4">
               <li className="pl-4 border-l-4 border-gold">
                 <strong className="text-gold">PRAY:</strong> We make prayer the basis of every ministry and encourage communion with God as the way we grow to spiritual maturity in Him.
               </li>
               <li className="pl-4 border-l-4 border-gold">
                 <strong className="text-gold">PREACH:</strong> We emphasize the original Pentecostal doctrines of salvation, sanctification, and the baptism of the Holy Spirit, continually striving to develop fully committed disciples of Jesus Christ.
               </li>
               <li className="pl-4 border-l-4 border-gold">
                  <strong className="text-gold">PUBLISH:</strong> We publish the Gospel through the written word, the spoken word, and through our personal lives, daily looking for opportunities to spread the message, &quot;Ye must be born again.&quot;
               </li>
            </ul>
          </div>


          {/* Existing Paragraphs */}
          <p>
            We have established a number of local churches throughout the Southern and Eastern
            Africa region to provide spiritual guidance, conduct worship services, and
            build lasting relationships within the body of Christ.
          </p>
          <p>
            Our Church is led by a team of dedicated pastors and leaders who provide
            spiritual direction, guidance and serve the church community. We invite you
            to join us in our mission to impact the world for Christ.
          </p>

          {/* --- UPDATED: Core Doctrines Section --- */}
          <h2 className="!text-gold !mb-4 !mt-10"> {/* Changed heading text */}
            Our Core Doctrines
          </h2>
          {/* Use prose list styling - maybe split into columns if long */}
          <ul className="list-disc list-inside columns-1 md:columns-2 md:gap-x-8"> {/* Use standard list, try 2 columns on medium+ screens */}
            <li>The Divine Trinity</li>
            <li>Repentance</li>
            <li>Salvation</li>
            <li>Sanctification</li>
            <li>The Baptism of the Holy Ghost</li>
            <li>Divine Healing</li>
            <li>The Second Coming of Jesus</li>
            <li>The Great Tribulation</li>
            <li>Christ&apos;s Millennial Reign</li>
            <li>The Great White Throne Judgment</li>
            <li>The New Heaven and the New Earth</li>
            <li>Eternal Heaven and Eternal Hell</li>
            <li>Marriage is for Life</li>
            <li>Water Baptism</li>
            <li>Restitution</li>
            <li>The Lord&apos;s Supper</li>
            <li>Washing the Disciple&apos;s Feet</li>
          </ul>
          {/* --- END: Core Doctrines Section --- */}

          {/* Motto Section */}
           <div className="mt-10 pt-6 border-t border-gray-700 text-center">
              <h3 className="!text-gold !text-lg font-semibold uppercase tracking-wider !mb-3">
                 Our Motto
              </h3>
              <blockquote className="italic text-xl border-l-4 border-gold pl-4 inline-block text-left max-w-md">
                 &quot;Earnestly contend for the faith which was once delivered unto the saints.&quot;
                 <footer className="text-base not-italic text-cream/80 mt-2 block">
                   - Jude 3
                 </footer>
              </blockquote>
           </div>

        </div> {/* End prose container */}
      </div> {/* End page container */}
    </div> // End page wrapper
  );
}