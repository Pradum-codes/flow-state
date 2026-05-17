import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { getHealth } from "@/lib/api-client";

export async function HealthStatus() {
  let data = null;
  let errorMessage = null;

  try {
    data = await getHealth();
  } catch (error) {
    errorMessage = error.message;
  }

  if (errorMessage) {
    return (
      <Card>
        <div className="flex items-center justify-between gap-4">
          <CardTitle>Backend Health</CardTitle>
          <Badge>Disconnected</Badge>
        </div>
        <CardDescription className="mt-3">
          Could not reach API at runtime.
          {" "}
          <span className="text-white">{errorMessage}</span>
        </CardDescription>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between gap-4">
        <CardTitle>Backend Health</CardTitle>
        <Badge className="border-white bg-white text-black">Live</Badge>
      </div>
      <CardDescription className="mt-3">
        API is reachable and responding with status:
        {" "}
        <span className="text-white">{data?.status || "ok"}</span>
      </CardDescription>
    </Card>
  );
}
