import type { Metadata } from "next";
import type { ReactNode } from "react";
import { CartProvider } from "@/components/cart";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lethargic Gardens | House Plant, Vegetable, Fruit & Hemp Seeds",
  description:
    "Lethargic Gardens: house plant, vegetable, fruit and hemp seeds for the unhurried gardener. Order online, pick up in store, and shop slow-living merch.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#070a08" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..700;1,9..144,300..600&family=Inter:wght@300..700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-ink text-white antialiased">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
