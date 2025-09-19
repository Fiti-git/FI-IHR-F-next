"use client";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { useEffect } from "react";
import BottomToTop from "@/components/button/BottomToTop";
import SearchModal1 from "@/components/modal/SearchModal1";
import { usePathname } from "next/navigation";
import toggleStore from "@/store/toggleStore";
import "react-tooltip/dist/react-tooltip.css";
import "rc-slider/assets/index.css";
import NavSidebar from "@/components/sidebar/NavSidebar";
import { GoogleOAuthProvider } from '@react-oauth/google';
if (typeof window !== "undefined") {
  import("bootstrap");
}

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-dm-sans",
});

export default function RootLayout({ children }) {
  const isListingActive = toggleStore((state) => state.isListingActive);
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

  return (
    <html lang="en">
      <body className={`${dmSans.className}`}>

        <GoogleOAuthProvider clientId={'83527250157-gj5j6bn1k0bsg8peps3eqguapbbbjp15.apps.googleusercontent.com'}>
          {children}
        </GoogleOAuthProvider>

        {/* bottom to top */}
        <BottomToTop />

        {/* sidebar mobile navigation */}
        <NavSidebar />
      </body>
    </html>
  );
}
