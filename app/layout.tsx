import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "Ixie",
  description: "Your AI Story Generator",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossOrigin="anonymous"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Monomakh&family=Zain:ital,wght@0,200;0,300;0,400;0,700;0,800;0,900;1,300;1,400&display=swap"
            rel="stylesheet"
          />
        </head>
        <body
          className="font-zain text-zain-base antialiased"
          style={
            {
              "--font-monomakh": '"Monomakh", serif',
              "--font-zain": '"Zain", serif',
            } as any
          }
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
