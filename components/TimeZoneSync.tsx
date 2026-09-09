"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { saveDetectedTimeZone } from "@/app/actions/timezone";
import { formatTimeZoneName } from "@/lib/timezone";

const subscribe = () => () => {};

export default function TimeZoneSync({ savedTimeZone }: { savedTimeZone: string }) {
  const router = useRouter();
  const attempted = useRef(false);
  const detectedTimeZone = useSyncExternalStore(
    subscribe,
    () => Intl.DateTimeFormat().resolvedOptions().timeZone || savedTimeZone,
    () => savedTimeZone,
  );
  const label = formatTimeZoneName(detectedTimeZone);

  useEffect(() => {
    const detected = detectedTimeZone;
    if (!detected) return;
    if (detected === savedTimeZone || attempted.current) return;
    attempted.current = true;
    void saveDetectedTimeZone(detected).then((result) => {
      if (result.success) router.refresh();
    });
  }, [detectedTimeZone, router, savedTimeZone]);

  return <span className="time-zone-label" title={`Your day follows ${label}`}>{label}</span>;
}
