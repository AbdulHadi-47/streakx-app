"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function BillingActivation() {
  const router = useRouter();
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setSeconds((value) => value + 2);
      router.refresh();
    }, 2000);
    const timeout = window.setTimeout(() => window.clearInterval(interval), 20000);
    return () => { window.clearInterval(interval); window.clearTimeout(timeout); };
  }, [router]);

  return <p className="activation-status" role="status">{seconds < 20 ? "Confirming your subscription…" : "Confirmation is taking longer than usual. You can safely refresh this page."}</p>;
}
