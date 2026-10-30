import type { Metadata, Viewport } from "next";
import { Figtree, Fraunces, Shantell_Sans } from "next/font/google";
import { Curtain } from "@/components/layout/Curtain";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { WhatsAppBar } from "@/components/layout/WhatsAppBar";
import { Reveal } from "@/components/motion/Reveal";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { PawTrail } from "@/components/effects/PawTrail";
import { PupJourneyHost } from "@/components/teddy/PupJourneyHost";
import { PupLife } from "@/components/teddy/PupLife";
import { site, siteUrl } from "@/lib/site";
import "./globals.css";

const figtree = Figtree({ subsets: ["latin"], variable: "--font-figtree", display: "swap" });
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  axes: ["SOFT", "WONK", "opsz"],
  display: "swap",
});
const shantell = Shantell_Sans({
  subsets: ["latin"],
  variable: "--font-shantell",
  axes: ["BNCE", "INFM"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${site.name} — Premium teacup puppies in Dubai`,
    template: `%s · ${site.name}`,
  },
  description:
    "Meet your new best friend in our Dubai showroom, or order a rare miniature breed from trusted breeders worldwide.",
  // A rebuild for a hiring assignment: keep it out of search results so it never competes with the real site.
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#fffdf8",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${figtree.variable} ${fraunces.variable} ${shantell.variable}`}>
      <body>
        <SmoothScroll>
          <Curtain />
          <a
            href="#main"
            className="sr-only-focusable fixed left-4 top-4 z-[100] rounded-full bg-cocoa px-5 py-3 font-semibold text-milk"
          >
            Skip to content
          </a>
          <Header />
          <main id="main" tabIndex={-1} className="relative pt-[var(--header-h)] outline-none">
            {children}
            <PupJourneyHost />
          </main>
          <Footer />
          <WhatsAppBar />
          <Reveal />
          <PupLife />
          <PawTrail />
        </SmoothScroll>
      </body>
    </html>
  );
}
