import { CafeExplorer } from "@/components/cafe-explorer";
import { listCafesWithReviews } from "@/db/queries";
import { getDeviceId } from "@/lib/device";

export default async function HomePage() {
  const [cafes, deviceId] = await Promise.all([
    listCafesWithReviews(),
    getDeviceId(),
  ]);
  return <CafeExplorer cafes={cafes} deviceId={deviceId} />;
}
