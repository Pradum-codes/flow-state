"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export default function AppRouteError({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="grid gap-6">
      <Card>
        <CardTitle>Page Error</CardTitle>
        <CardDescription className="mt-2">
          We could not load this view right now.
        </CardDescription>
        <div className="mt-4">
          <Button onClick={reset}>Retry</Button>
        </div>
      </Card>
    </div>
  );
}
