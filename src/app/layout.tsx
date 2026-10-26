import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Zuhelth — Gym Form Checker",
    template: "%s | Zuhelth",
  },
  description:
    "A camera-first workout companion designed to help you understand your movement, one rep at a time.",
  applicationName: "Zuhelth",
};

export const viewport: Viewport = {
  themeColor: "#f4f6f1",
  width: "device-width",
  initialScale: 1,
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
