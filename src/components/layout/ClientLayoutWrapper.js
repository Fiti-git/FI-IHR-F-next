"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import BottomToTop from "@/components/button/BottomToTop";
import NavSidebar from "@/components/sidebar/NavSidebar";

export default function ClientLayoutWrapper({ children }) {
  const path = usePathname();

  // wow js
  useEffect(() => {
    const WOW = require("@/utils/wow");
    const wow = new WOW.default({
      mobile: false,
      live: false,
    });
    wow.init();
  }, [path]);

  // bootstrap import
  useEffect(() => {
    import("bootstrap");
  }, []);

  return (
    <>
      {children}
      {/* bottom to top */}
      <BottomToTop />
      {/* sidebar mobile navigation */}
      <NavSidebar />
    </>
  );
}
