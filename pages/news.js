// pages/news.js
import React from 'react';

export default function News() {
  return (
    <div className="py-8 px-4 md:py-10 md:px-8 w-11/12 max-w-[800px] mx-auto">
      <h1 className="text-3xl text-center font-bold mb-6 text-gray-900">Latest News</h1>
      <ul className="list-none p-0">
        <li className="bg-gray-100 p-6 mb-4 rounded">
          <h2 className="text-xl font-semibold mb-2 text-gray-900">New Church Building Project</h2>
          <p className="text-base leading-relaxed  text-gray-700">We are excited to announce the commencement of our new church building project. Stay tuned for updates!</p>
           <p className="font-italic text-gray-600 mt-2">Published: June 10, 2024</p>
        </li>
        <li className="bg-gray-100 p-6 mb-4 rounded">
          <h2 className="text-xl font-semibold mb-2  text-gray-900">Successful Outreach Event</h2>
          <p className="text-base leading-relaxed  text-gray-700">Our recent community outreach event was a great success. We thank all the volunteers for their support!</p>
          <p className="font-italic text-gray-600 mt-2">Published: May 25, 2024</p>
        </li>
          <li className="bg-gray-100 p-6 mb-4 rounded">
           <h2 className="text-xl font-semibold mb-2 text-gray-900">Upcoming Leadership Conference</h2>
           <p className="text-base leading-relaxed text-gray-700">Register now for our leadership conference in August, aimed at developing better church leadership.</p>
           <p className="font-italic text-gray-600 mt-2">Published: April 20, 2024</p>
        </li>
        {/* Add more news items here */}
      </ul>
    </div>
  );
}