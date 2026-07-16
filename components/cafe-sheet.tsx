"use client";

import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { CafeDetails } from "@/components/cafe-details";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { CafeFull } from "@/db/queries";
import { useIsMobile } from "@/hooks/use-is-mobile";

/**
 * Drawer-first café details, midday style: a bottom drawer on mobile, a
 * floating right sheet on desktop. Data is already on the client, so it
 * opens instantly — the /cafes/[slug] page stays for deep links.
 */
export function CafeSheet({
  cafe,
  deviceId,
  open,
  onOpenChange,
}: {
  cafe: CafeFull | null;
  deviceId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const isMobile = useIsMobile();

  const permalink = cafe ? (
    <Button asChild variant="outline" size="sm" className="w-full">
      <Link href={`/cafes/${cafe.slug}`}>
        <ExternalLink />
        Open full page
      </Link>
    </Button>
  ) : null;

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[90dvh]">
          <DrawerHeader className="sr-only">
            <DrawerTitle>{cafe?.name ?? "Café"}</DrawerTitle>
            <DrawerDescription>Café details</DrawerDescription>
          </DrawerHeader>
          {cafe ? (
            <div className="overflow-y-auto px-4 pb-8 pt-2">
              <CafeDetails cafe={cafe} deviceId={deviceId} />
              <div className="mt-4">{permalink}</div>
            </div>
          ) : null}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="gap-0 p-0 sm:max-w-[480px] md:inset-y-4 md:right-4 md:h-auto md:border"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>{cafe?.name ?? "Café"}</SheetTitle>
          <SheetDescription>Café details</SheetDescription>
        </SheetHeader>
        {cafe ? (
          <div className="min-h-0 flex-1 overflow-y-auto p-5">
            <CafeDetails cafe={cafe} deviceId={deviceId} />
            <div className="mt-4">{permalink}</div>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
