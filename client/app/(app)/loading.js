import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AppLoading() {
  return (
    <div className="grid gap-4">
      <Card>
        <Skeleton className="h-6 w-40" />
        <Skeleton className="mt-3 h-4 w-80 max-w-full" />
      </Card>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card><Skeleton className="h-18 w-full" /></Card>
        <Card><Skeleton className="h-18 w-full" /></Card>
        <Card><Skeleton className="h-18 w-full" /></Card>
        <Card><Skeleton className="h-18 w-full" /></Card>
      </div>
    </div>
  );
}
