"use client";

import "mapbox-gl/dist/mapbox-gl.css";
import type { FeatureCollection, Point } from "geojson";
import mapboxgl from "mapbox-gl";
import { useTheme } from "next-themes";
import { useEffect, useRef } from "react";
import type { CafeWithRatings } from "@/db/queries";
import { env } from "@/env";
import { useIsMobile } from "@/hooks/use-is-mobile";
import {
  overallScore,
  scoreTier,
  TIER_COLORS,
  type ScoreTier,
} from "@/lib/ratings";

mapboxgl.accessToken = env.NEXT_PUBLIC_MAPBOX_TOKEN;

const SOURCE_ID = "cafes";
const SAN_SALVADOR: [number, number] = [-89.224, 13.694];
const SV_BOUNDS: [[number, number], [number, number]] = [
  [-90.35, 12.9],
  [-87.5, 14.55],
];

const TIERS = Object.keys(TIER_COLORS) as ScoreTier[];

/**
 * Sharp square pin, midday style — score-tier fill with a theme-matched
 * hairline frame. Drawn on canvas at 2x for crisp rendering.
 */
function squarePin(fill: string, frame: string): ImageData {
  const size = 28;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new ImageData(size, size);
  ctx.fillStyle = frame;
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = fill;
  ctx.fillRect(3, 3, size - 6, size - 6);
  return ctx.getImageData(0, 0, size, size);
}

function toFeatureCollection(
  cafes: CafeWithRatings[],
): FeatureCollection<Point, { slug: string; name: string; tier: ScoreTier }> {
  return {
    type: "FeatureCollection",
    features: cafes.map((c) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [c.lng, c.lat] },
      properties: {
        slug: c.slug,
        name: c.name,
        tier: scoreTier(overallScore(c.ratings)),
      },
    })),
  };
}

export function CafeMap({
  cafes,
  selectedSlug,
  onSelect,
}: {
  cafes: CafeWithRatings[];
  selectedSlug: string | null;
  onSelect: (slug: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const loadedRef = useRef(false);
  const isMobile = useIsMobile();
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme === "dark";
  const styleUrl =
    env.NEXT_PUBLIC_MAP_STYLE_URL ??
    (dark ? "mapbox://styles/mapbox/dark-v11" : "mapbox://styles/mapbox/light-v11");

  const data = toFeatureCollection(cafes);
  const dataRef = useRef(data);
  dataRef.current = data;
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  // (Re)create the map when the basemap style changes (theme switch).
  useEffect(() => {
    if (!containerRef.current) return;
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: styleUrl,
      center: SAN_SALVADOR,
      zoom: 11.4,
      maxBounds: SV_BOUNDS,
      minZoom: 7.5,
      maxZoom: 18,
      attributionControl: false,
    });
    mapRef.current = map;

    map.addControl(new mapboxgl.AttributionControl({ compact: true }), "bottom-right");
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");
    map.addControl(
      new mapboxgl.GeolocateControl({ trackUserLocation: false, showUserHeading: false }),
      "top-right",
    );

    map.on("load", () => {
      const frame = dark ? "#0d0d0d" : "#ffffff";
      for (const tier of TIERS) {
        map.addImage(`pin-${tier}`, squarePin(TIER_COLORS[tier], frame), {
          pixelRatio: 2,
        });
      }

      map.addSource(SOURCE_ID, { type: "geojson", data: dataRef.current });

      map.addLayer({
        id: "cafe-points",
        type: "symbol",
        source: SOURCE_ID,
        layout: {
          "icon-image": ["concat", "pin-", ["get", "tier"]],
          "icon-size": ["interpolate", ["linear"], ["zoom"], 9, 0.7, 13, 1, 16, 1.25],
          "icon-allow-overlap": true,
        },
      });
      map.addLayer({
        id: "cafe-labels",
        type: "symbol",
        source: SOURCE_ID,
        minzoom: 12,
        layout: {
          "text-field": ["get", "name"],
          "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
          "text-size": 11,
          "text-offset": [0, 1.1],
          "text-anchor": "top",
          "text-optional": true,
        },
        paint: {
          "text-color": dark ? "#a3a3a3" : "#525252",
          "text-halo-color": dark ? "rgba(13,13,13,0.9)" : "rgba(255,255,255,0.9)",
          "text-halo-width": 1,
        },
      });

      map.on("click", "cafe-points", (e) => {
        const slug = e.features?.[0]?.properties?.slug;
        if (typeof slug === "string") onSelectRef.current(slug);
      });
      map.on("mouseenter", "cafe-points", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "cafe-points", () => {
        map.getCanvas().style.cursor = "";
      });

      loadedRef.current = true;
    });

    return () => {
      map.remove();
      mapRef.current = null;
      loadedRef.current = false;
    };
  }, [styleUrl, dark]);

  // Refresh pins when server data changes (e.g. after adding a café).
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !loadedRef.current) return;
    (map.getSource(SOURCE_ID) as mapboxgl.GeoJSONSource | undefined)?.setData(data);
  }, [data]);

  // Glide to the selected café, padded so the drawer/sheet doesn't cover it.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedSlug) return;
    const cafe = cafes.find((c) => c.slug === selectedSlug);
    if (!cafe) return;
    map.easeTo({
      center: [cafe.lng, cafe.lat],
      zoom: Math.max(map.getZoom(), 13.5),
      padding: isMobile ? { bottom: 320 } : { right: 440 },
      duration: 700,
      essential: true,
    });
  }, [selectedSlug, cafes, isMobile]);

  return <div ref={containerRef} className="h-full w-full" />;
}
