import Image from "next/image";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-sans">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start text-center sm:text-left">
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-black dark:text-white">
          Apostolic Faith Church
        </h1>
        <p className="text-xl sm:text-2xl text-zinc-600 dark:text-zinc-400 max-w-2xl">
          Restoring the original Church of the Apostles with a modern platform for faith, growth, and community.
        </p>
        
        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <a
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-black text-white dark:bg-white dark:text-black gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
            href="/services"
          >
            Join a Service
          </a>
          <a
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:min-w-44"
            href="/about"
          >
            Learn Our History
          </a>
        </div>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        <p className="text-sm text-zinc-500">© {new Date().getFullYear()} Apostolic Faith Church. All rights reserved.</p>
      </footer>
    </div>
  );
}

