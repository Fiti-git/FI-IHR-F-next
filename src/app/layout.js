import { DM_Sans } from "next/font/google";
import "./globals.css";
import "react-tooltip/dist/react-tooltip.css";
import "rc-slider/assets/index.css";
import { GoogleOAuthProvider } from '@react-oauth/google';
import ClientLayoutWrapper from "@/components/layout/ClientLayoutWrapper";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-dm-sans",
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${dmSans.className}`} suppressHydrationWarning>
        <GoogleOAuthProvider clientId={'83527250157-gj5j6bn1k0bsg8peps3eqguapbbbjp15.apps.googleusercontent.com'}>
          <ClientLayoutWrapper>
            {children}
          </ClientLayoutWrapper>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
