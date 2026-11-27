"use client";

import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/site-header";

export function ScrollSpyHeader({ ids }: { ids: string[] }) {
  const [active, setActive] = useState("");
  const key = ids.join("|");
  useEffect(() => {
    const els = key
      .split("|")
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [key]);
  return <SiteHeader active={active} />;
}
