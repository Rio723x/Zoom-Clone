import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zoom",
  description: "Video Conferencing, Web Conferencing, Webinars",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
