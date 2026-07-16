"use client";

import { LocateFixed } from "lucide-react";
import { useActionState, useState } from "react";
import { createCafe, type ActionState } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const IDLE: ActionState = { status: "idle" };

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: React.ReactNode;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

export function CafeForm() {
  const [state, formAction, pending] = useActionState(createCafe, IDLE);
  const [coords, setCoords] = useState<{ lat: string; lng: string }>({
    lat: "",
    lng: "",
  });
  const [locating, setLocating] = useState(false);

  const fieldErrors = state.status === "error" ? state.fieldErrors : {};

  function useMyLocation() {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: pos.coords.latitude.toFixed(6),
          lng: pos.coords.longitude.toFixed(6),
        });
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <Field id="name" label="Café name" error={fieldErrors.name?.[0]}>
        <Input id="name" name="name" placeholder="e.g. Café La Cima" />
      </Field>

      <Field
        id="area"
        label="Neighborhood / city"
        error={fieldErrors.area?.[0]}
      >
        <Input
          id="area"
          name="area"
          placeholder="e.g. San Benito, San Salvador"
        />
      </Field>

      <Field
        id="address"
        label={
          <>
            Address{" "}
            <span className="font-normal text-muted-foreground">
              (optional)
            </span>
          </>
        }
        error={fieldErrors.address?.[0]}
      >
        <Input id="address" name="address" placeholder="Street, plaza, mall…" />
      </Field>

      <Card size="sm">
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-2 font-mono text-xs uppercase tracking-[0.12em]">
            Location on the map
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={useMyLocation}
              disabled={locating}
            >
              <LocateFixed />
              {locating ? "Locating…" : "I'm at the café"}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3">
          <Field id="lat" label="Latitude" error={fieldErrors.lat?.[0]}>
            <Input
              id="lat"
              name="lat"
              inputMode="decimal"
              placeholder="13.6989"
              value={coords.lat}
              onChange={(e) =>
                setCoords((c) => ({ ...c, lat: e.target.value }))
              }
            />
          </Field>
          <Field id="lng" label="Longitude" error={fieldErrors.lng?.[0]}>
            <Input
              id="lng"
              name="lng"
              inputMode="decimal"
              placeholder="-89.1914"
              value={coords.lng}
              onChange={(e) =>
                setCoords((c) => ({ ...c, lng: e.target.value }))
              }
            />
          </Field>
        </CardContent>
      </Card>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id="wifiName"
          label={
            <>
              Wi-Fi network{" "}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
            </>
          }
          error={fieldErrors.wifiName?.[0]}
        >
          <Input
            id="wifiName"
            name="wifiName"
            placeholder="e.g. CafeLaCima_Guest"
          />
        </Field>
        <Field
          id="wifiPassword"
          label={
            <>
              Wi-Fi password{" "}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
            </>
          }
          error={fieldErrors.wifiPassword?.[0]}
        >
          <Input
            id="wifiPassword"
            name="wifiPassword"
            placeholder="Ask the barista ☕"
          />
        </Field>
      </div>

      {state.status === "error" ? (
        <p className="text-sm text-destructive">{state.message}</p>
      ) : null}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Adding…" : "Add café to the map"}
      </Button>
    </form>
  );
}
