import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { CafeForm } from "@/components/cafe-form";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Add a café — sv.cafe",
  description: "Put a work-friendly café in El Salvador on the map.",
};

export default function NewCafePage() {
  return (
    <div className="mx-auto max-w-lg px-4 pb-16">
      <header className="sticky top-0 z-10 -mx-4 flex items-center justify-between border-b bg-background/90 px-4 py-2 backdrop-blur">
        <Button asChild variant="ghost" size="sm">
          <Link href="/">
            <ArrowLeft />
            Back to map
          </Link>
        </Button>
        <ThemeToggle />
      </header>

      <h1 className="mt-6 text-xl font-semibold tracking-tight">Add a café</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Know a great spot to work from? Put it on the map — reviews and Wi-Fi
        details help everyone.
      </p>

      <div className="mt-6">
        <CafeForm />
      </div>
    </div>
  );
}
