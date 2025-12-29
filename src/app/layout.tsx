import type { Metadata } from "next";
import { AppLayout } from "@/components/AppLayout";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "User Portal - Next.js + shadcn/ui",
  description: "A modern user portal built with Next.js, Tailwind CSS, and shadcn/ui components",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased" suppressHydrationWarning={true}>
        <CurrencyProvider defaultCurrency="USD">
          <AppLayout>{children}</AppLayout>
        </CurrencyProvider>
      </body>
    </html>
  );
}
