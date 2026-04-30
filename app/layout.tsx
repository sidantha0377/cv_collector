import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavBar from "./NavBar"



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      >
      <body className="min-h-full flex flex-col"
      suppressHydrationWarning >
        <NavBar/>
        {children}

      </body>
    </html>
  );
}
