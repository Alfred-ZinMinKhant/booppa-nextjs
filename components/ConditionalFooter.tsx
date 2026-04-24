"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";

const STANDALONE = ["/government"];

export default function ConditionalFooter() {
  const pathname = usePathname();
  if (STANDALONE.some((r) => pathname?.startsWith(r))) return null;
  return <Footer />;
}
