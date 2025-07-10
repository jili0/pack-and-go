"use client";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Widget from "./Widget";

export default function WidgetWrapper() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [collapsed, setCollapsed] = useState(!isHome);

  useEffect(() => {
    setCollapsed(!isHome);
  }, [isHome]);

  return <Widget defaultCollapsed={collapsed} />;
}
