import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavBar from "./NavBar"
import { getSessionRole } from "@/lib/actions/auth";


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const role = await getSessionRole();
  return (
    <html
      lang="en"
      >
      <body className="min-h-full flex flex-col"
      suppressHydrationWarning >
         <NavBar role={role} />
        {children}

      </body>
    </html>
  );
}
