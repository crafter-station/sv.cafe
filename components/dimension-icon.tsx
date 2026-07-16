import { Coffee, Plug, Users, Wifi, type LucideIcon } from "lucide-react";
import type { RatingDimension } from "@/lib/ratings";

export const DIMENSION_ICONS: Record<RatingDimension, LucideIcon> = {
  wifi: Wifi,
  coffee: Coffee,
  outlets: Plug,
  meetings: Users,
};
