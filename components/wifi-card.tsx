"use client";

import { Check, Copy, Eye, EyeOff, Wifi } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * Community-shared Wi-Fi credentials: network name always visible, password
 * behind a tap-to-reveal (it's shared knowledge, not a secret — the mask just
 * avoids shoulder-surfing screenshots).
 */
export function WifiCard({
  wifiName,
  wifiPassword,
}: {
  wifiName: string | null;
  wifiPassword: string | null;
}) {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  async function copyPassword() {
    if (!wifiPassword) return;
    await navigator.clipboard.writeText(wifiPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.12em]">
          <Wifi className="size-3.5" />
          Wi-Fi
        </CardTitle>
        {!wifiName ? (
          <CardDescription>
            No Wi-Fi info yet — ask the barista and add it!
          </CardDescription>
        ) : null}
      </CardHeader>

      {wifiName ? (
        <CardContent className="space-y-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
              Network
            </p>
            <p className="mt-1 font-mono text-sm">{wifiName}</p>
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
              Password
            </p>
            {wifiPassword ? (
              <div className="mt-1 flex items-center gap-2">
                <code className="flex h-8 flex-1 items-center border bg-background px-3 font-mono text-sm">
                  {revealed
                    ? wifiPassword
                    : "•".repeat(Math.max(wifiPassword.length, 8))}
                </code>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setRevealed((r) => !r)}
                  aria-label={revealed ? "Hide password" : "Reveal password"}
                >
                  {revealed ? <EyeOff /> : <Eye />}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={copyPassword}
                  aria-label="Copy password"
                >
                  {copied ? <Check className="text-green-600" /> : <Copy />}
                </Button>
              </div>
            ) : (
              <p className="mt-1 text-sm text-muted-foreground">
                Open network — no password
              </p>
            )}
          </div>
        </CardContent>
      ) : null}
    </Card>
  );
}
