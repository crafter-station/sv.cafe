import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CafeDetails } from "@/components/cafe-details";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { getCafeBySlug } from "@/db/queries";
import { getDeviceId } from "@/lib/device";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cafe = await getCafeBySlug(slug);
  return {
    title: cafe ? `${cafe.name} — sv.cafe` : "Café not found — sv.cafe",
    description: cafe
      ? `Wi-Fi, coffee, outlets and meeting ratings for ${cafe.name} (${cafe.area}).`
      : undefined,
  };
}

export default async function CafePage({ params }: Props) {
  const { slug } = await params;
  const [cafe, deviceId] = await Promise.all([
    getCafeBySlug(slug),
    getDeviceId(),
  ]);
  if (!cafe) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 pb-16">
      <header className="sticky top-0 z-10 -mx-4 flex items-center justify-between border-b bg-background/90 px-4 py-2 backdrop-blur">
        <Button asChild variant="ghost" size="sm">
          <Link href="/">
            <ArrowLeft />
            Back to map
          </Link>
        </Button>
        <ThemeToggle />
      </header>

      <div className="mt-6">
        <CafeDetails cafe={cafe} deviceId={deviceId} />
      </div>
    </div>
  );
}
