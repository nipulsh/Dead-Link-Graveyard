import type { Metadata } from "next";
import { Cinzel, Roboto_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const roboto = localFont({
  src: [
    {
      path: "../public/fonts/roboto/Roboto-VariableFont_wdth,wght.ttf",
      style: "normal",
      weight: "100 900",
    },
    {
      path: "../public/fonts/roboto/Roboto-Italic-VariableFont_wdth,wght.ttf",
      style: "italic",
      weight: "100 900",
    },
  ],
  variable: "--font-roboto",
  display: "swap",
  preload: false,
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  preload: false,
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
  preload: false,
});

export const metadata: Metadata = {
  title: "Dead Link Graveyard",
  description: "Crawl a site, map links in real time, and bury broken URLs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${roboto.variable} ${cinzel.variable} ${robotoMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
