"use client";

import { useActionState, useEffect, useState } from "react";
import { createReview, type ActionState } from "@/app/actions";
import { StarInput } from "@/components/star-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Review } from "@/db/schema";
import { computeFingerprint } from "@/lib/fingerprint";
import { RATING_DIMENSIONS } from "@/lib/ratings";

const IDLE: ActionState = { status: "idle" };

/**
 * Create — or, when this device already reviewed the café, edit — a review.
 * Identity is anonymous: an httpOnly device cookie with a client fingerprint
 * as recovery fallback (sent as a hidden field).
 */
export function ReviewForm({
  cafeId,
  existingReview,
}: {
  cafeId: string;
  existingReview: Review | null;
}) {
  const [state, formAction, pending] = useActionState(createReview, IDLE);
  const [fingerprint, setFingerprint] = useState("");
  const editing = existingReview != null;
  // Bump to clear the star pickers after a successful *first* submit (text
  // inputs reset automatically — React 19 resets forms after actions).
  const [resetKey, setResetKey] = useState(0);

  useEffect(() => {
    computeFingerprint().then(setFingerprint).catch(() => {});
  }, []);

  useEffect(() => {
    if (state.status === "success" && !editing) setResetKey((k) => k + 1);
  }, [state, editing]);

  const fieldErrors = state.status === "error" ? state.fieldErrors : {};

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="cafeId" value={cafeId} />
      <input type="hidden" name="fingerprint" value={fingerprint} />

      <div className="space-y-3">
        {RATING_DIMENSIONS.map((d) => (
          <StarInput
            key={d.key}
            name={d.key}
            label={d.label}
            hint={d.hint}
            error={fieldErrors[d.key]?.[0]}
            resetKey={resetKey}
            defaultValue={existingReview?.[d.key] ?? 0}
          />
        ))}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="author">Your name</Label>
        <Input
          id="author"
          name="author"
          placeholder="e.g. Marcela"
          defaultValue={existingReview?.author ?? ""}
        />
        {fieldErrors.author?.[0] ? (
          <p className="text-xs text-destructive">{fieldErrors.author[0]}</p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="comment">
          Comment{" "}
          <span className="font-normal text-muted-foreground">(optional)</span>
        </Label>
        <Textarea
          id="comment"
          name="comment"
          rows={3}
          placeholder="Wi-Fi speed, best table, noise level…"
          defaultValue={existingReview?.comment ?? ""}
        />
      </div>

      {state.status === "error" ? (
        <p className="text-sm text-destructive">{state.message}</p>
      ) : null}
      {state.status === "success" ? (
        <p className="font-mono text-xs uppercase tracking-[0.08em] text-muted-foreground">
          {state.updated ? "Review updated ✓" : "Thanks — your review is live ☕"}
        </p>
      ) : null}

      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending
          ? editing
            ? "Updating…"
            : "Publishing…"
          : editing
            ? "Update your review"
            : "Publish review"}
      </Button>
    </form>
  );
}
