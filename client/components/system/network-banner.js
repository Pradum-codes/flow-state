"use client";

import { useEffect, useState } from "react";

export function NetworkBanner() {
  const [online, setOnline] = useState(() => {
    if (typeof navigator === "undefined") return true;
    return navigator.onLine;
  });

  useEffect(() => {
    function onOnline() {
      setOnline(true);
    }

    function onOffline() {
      setOnline(false);
    }

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  if (online) return null;

  return (
    <div role="status" aria-live="polite" className="border-b border-amber-500/60 bg-amber-500/15 px-4 py-2 text-xs text-amber-200">
      You are offline. Changes may fail to sync until connection is restored.
    </div>
  );
}
