import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: {
    default: "Dress Me Up Boutique | Elegantna moda za svaki dan",
    template: "%s | Dress Me Up Boutique",
  },
  description:
    "Dress Me Up Boutique Tuzla - elegantna i svečana moda za svaki dan. Butik na adresi Irac, Rudarska 50, Tuzla.",
  keywords: [
    "Dress Me Up Boutique",
    "butik Tuzla",
    "ženska odjeća Tuzla",
    "elegantna moda",
    "svečana moda",
    "haljine",
    "kompleti",
    "boutique",
  ],
  openGraph: {
    title: "Dress Me Up Boutique",
    description:
      "Elegantna moda za svaki dan. Butik Irac, Rudarska 50, Tuzla.",
    type: "website",
    locale: "bs_BA",
    siteName: "Dress Me Up Boutique",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bs">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
