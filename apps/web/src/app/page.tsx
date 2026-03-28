import { HomePageClient } from "@/components/HomePageClient";

function getApiOrigin() {
  return (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/api\/v1\/?$/, "");
}

export default async function Home() {
  const response = await fetch(`${getApiOrigin()}/api/v1/public/pages/home`, { cache: "no-store" });
  const payload = response.ok ? await response.json() : null;
  const content = payload?.data?.body ?? null;

  return <HomePageClient content={content} />;
}
