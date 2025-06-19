import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Script from "next/script";
import PopupProvider from "@/context/PopupContext";

export const metadata: Metadata = {
  title: "Luna",
  description: "Created with Luna",
  generator: "Luna Drone",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <PopupProvider>
          <AuthProvider>{children}</AuthProvider>
        </PopupProvider>
      </body>
    </html>
  );
}
