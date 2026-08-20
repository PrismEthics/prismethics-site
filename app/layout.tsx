import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { headers } from "next/headers";
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

const productionHosts = new Set([
  "prismethics.com",
  "www.prismethics.com",
  "prismethics-workbench.eamonmontgomery.chatgpt.site",
]);

function metadataOrigin(hostHeader: string | null) {
  const requestedHost = hostHeader?.split(",")[0]?.trim().toLowerCase();
  const isLocal = requestedHost === "localhost:4174" || requestedHost === "localhost:3000";
  const host = isLocal || (requestedHost && productionHosts.has(requestedHost))
    ? requestedHost
    : "prismethics.com";

  return `${isLocal ? "http" : "https"}://${host}`;
}

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const socialImage = new URL("/og-prismethics-v3.png", metadataOrigin(host)).toString();

  return {
    title: {
      default: "PrismEthics — Thinking that carries forward",
      template: "%s · PrismEthics",
    },
    description:
      "A place to work through difficult questions, keep what changed, and return without losing the thread.",
    openGraph: {
      title: "PrismEthics — Thinking that carries forward",
      description:
        "Work through difficult questions, keep what changed, and return without losing the thread.",
      type: "website",
      images: [{ url: socialImage, width: 1680, height: 945, alt: "A white beam revealing a spectrum as it passes through a transparent prism" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "PrismEthics — Thinking that carries forward",
      description: "A place to work through difficult questions and return without losing the thread.",
      images: [socialImage],
    },
    icons: {
      icon: "/favicon.svg",
      shortcut: "/favicon.svg",
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${sans.variable}`}>{children}</body>
    </html>
  );
}
