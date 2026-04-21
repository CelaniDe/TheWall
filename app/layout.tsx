import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Global Wall",
  description: "A simple anonymous opinion wall",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}