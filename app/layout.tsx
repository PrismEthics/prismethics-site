import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";

const display = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const sans = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "PrismEthics — Thinking that carries forward",
    template: "%s · PrismEthics",
  },
  description:
    "A structured workbench for consequential thinking, durable continuity, and human-directed judgment.",
  openGraph: {
    title: "PrismEthics — Thinking that carries forward",
    description:
      "Structure consequential work, preserve what changed, and return without losing the thread.",
    type: "website",
    images: [{ url: "/og-prismethics-v3.png", width: 1680, height: 945, alt: "A white beam revealing a spectrum as it passes through a transparent prism" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "PrismEthics — Thinking that carries forward",
    description: "A structured workbench for consequential thinking and durable continuity.",
    images: ["/og-prismethics-v3.png"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${sans.variable}`}>{children}</body>
    </html>
  );
}
