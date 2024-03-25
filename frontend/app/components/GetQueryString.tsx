"use client";

import { usePathname, useSearchParams } from "next/navigation";

export function QueryString() {
  const searchParams = useSearchParams();
  const u = searchParams.get("u");
  const decoded = atob(u || "");
  const [container, token] = decoded.split("|");
  return (
    <>
      <p>{container ? container : ""}</p>
    </>
  );
}
