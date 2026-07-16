"use client";

import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { CafeCard } from "@/components/cafe-card";
import { CafeMap } from "@/components/cafe-map";
import { CafeSheet } from "@/components/cafe-sheet";
import { CommandMenu } from "@/components/command-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import type { CafeFull } from "@/db/queries";

/**
 * Client shell for the home screen. The full dataset (cafés + reviews) is
 * already here, so selecting a café — from the list, a map pin, or ⌘K —
 * opens the drawer instantly with zero fetches.
 */
export function CafeExplorer({
  cafes,
  deviceId,
}: {
  cafes: CafeFull[];
  deviceId: string | null;
}) {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);

  // Derived from props so a revalidation (new review) flows straight in.
  const selected = cafes.find((c) => c.slug === selectedSlug) ?? null;

  function select(slug: string) {
    setSelectedSlug(slug);
    setSheetOpen(true);
  }

  return (
    <div className="flex h-dvh flex-col">
      <header className="flex items-center justify-between gap-3 border-b bg-background px-4 py-3">
        <div className="shrink-0">
          <h1 className="font-mono text-sm font-semibold tracking-tight">
            sv<span className="text-muted-foreground">.</span>cafe
          </h1>
          <p className="mt-0.5 hidden font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground sm:block">
            Work-friendly cafés · El Salvador
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="text-muted-foreground sm:w-56 sm:justify-between"
            onClick={() => setCmdOpen(true)}
          >
            <span className="flex items-center gap-2">
              <Search />
              <span className="hidden sm:inline">Search cafés…</span>
            </span>
            <Kbd className="hidden sm:inline-flex">⌘K</Kbd>
          </Button>
          <ThemeToggle />
          <Button asChild>
            <Link href="/cafes/new">
              <Plus />
              <span className="hidden sm:inline">Add café</span>
            </Link>
          </Button>
        </div>
      </header>

      {/* Mobile: map on top, list scrolls under it. Desktop: list sidebar + full map. */}
      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <div className="h-[44dvh] shrink-0 border-b md:order-2 md:h-auto md:flex-1 md:border-b-0">
          <CafeMap
            cafes={cafes}
            selectedSlug={sheetOpen ? selectedSlug : null}
            onSelect={select}
          />
        </div>

        <main className="flex-1 space-y-3 overflow-y-auto p-4 md:order-1 md:w-[400px] md:flex-none md:border-r">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            {cafes.length} café{cafes.length === 1 ? "" : "s"} on the map
          </p>
          {cafes.map((cafe) => (
            <CafeCard
              key={cafe.id}
              cafe={cafe}
              selected={sheetOpen && cafe.slug === selectedSlug}
              onSelect={() => select(cafe.slug)}
            />
          ))}
          {cafes.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No cafés yet —{" "}
              <Link href="/cafes/new" className="underline underline-offset-4">
                add the first one
              </Link>
              .
            </p>
          ) : null}
        </main>
      </div>

      <CafeSheet
        cafe={selected}
        deviceId={deviceId}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
      <CommandMenu
        cafes={cafes}
        open={cmdOpen}
        onOpenChange={setCmdOpen}
        onSelectCafe={select}
      />
    </div>
  );
}
