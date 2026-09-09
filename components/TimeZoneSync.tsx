"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { saveDetectedTimeZone } from "@/app/actions/timezone";
import { formatTimeZoneName } from "@/lib/timezone";

export default function TimeZoneSync({ savedTimeZone }: { savedTimeZone: string }) {
  const router = useRouter();
  const attempted = useRef(false);
  const label = formatTimeZoneName(savedTimeZone);

  useEffect(() => {
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!detected) return;
    if (detected === savedTimeZone || attempted.current) return;
    attempted.current = true;
    void saveDetectedTimeZone(detected).then((result) => {
      if (result.success) router.refresh();
    });
  }, [router, savedTimeZone]);

  return <span className="time-zone-label" title={`Your day follows ${label}`}>{label}</span>;
}
