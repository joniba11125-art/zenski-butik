import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: {
    default: "Dress Me Up Boutique | Elegantna moda za svaki dan",
    template: "%s | Dress Me Up Boutique",
  },
  description:
    "Dress Me Up Boutique Tuzla - elegantna i svecana moda za svaki dan. Butik na adresi Irac, Rudarska 50, Tuzla.",
  keywords: [
    "Dress Me Up Boutique",
    "butik Tuzla",
    "zenska odjeca Tuzla",
    "elegantna moda",
    "svecana moda",
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
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
