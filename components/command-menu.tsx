"use client";

import { Coffee, Moon, Plus, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ScoreBadge } from "@/components/score-badge";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import type { CafeFull } from "@/db/queries";
import { overallScore } from "@/lib/ratings";

/** ⌘K palette — jump to any café or fire quick actions, all client-side. */
export function CommandMenu({
  cafes,
  open,
  onOpenChange,
  onSelectCafe,
}: {
  cafes: CafeFull[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectCafe: (slug: string) => void;
}) {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onOpenChange]);

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Search"
      description="Search cafés and actions"
    >
      <Command>
        <CommandInput placeholder="Search cafés, neighborhoods…" />
        <CommandList>
        <CommandEmpty>No cafés found.</CommandEmpty>
        <CommandGroup heading="Cafés">
          {cafes.map((cafe) => (
            <CommandItem
              key={cafe.id}
              value={`${cafe.name} ${cafe.area}`}
              onSelect={() => {
                onOpenChange(false);
                onSelectCafe(cafe.slug);
              }}
            >
              <Coffee className="text-muted-foreground" />
              <span className="truncate">{cafe.name}</span>
              <span className="truncate text-muted-foreground">
                {cafe.area}
              </span>
              <span className="ml-auto">
                <ScoreBadge score={overallScore(cafe.ratings)} />
              </span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Actions">
          <CommandItem
            value="add cafe new"
            onSelect={() => {
              onOpenChange(false);
              router.push("/cafes/new");
            }}
          >
            <Plus className="text-muted-foreground" />
            Add a café
          </CommandItem>
          <CommandItem
            value="toggle theme dark light"
            onSelect={() => {
              setTheme(resolvedTheme === "dark" ? "light" : "dark");
            }}
          >
            {resolvedTheme === "dark" ? (
              <Sun className="text-muted-foreground" />
            ) : (
              <Moon className="text-muted-foreground" />
            )}
            Toggle theme
          </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
