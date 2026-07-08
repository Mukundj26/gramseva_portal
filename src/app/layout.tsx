import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";

export const metadata: Metadata = {
  title: "GramVikas Portal - Digital Panchayat Hub 🌾",
  description: "Empowering villages through transparency, digital services, and AI-powered agricultural crop advisors.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="font-sans antialiased min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100"
      >
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}

