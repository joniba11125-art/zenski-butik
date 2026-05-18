import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: {
    default: "Zenski Butik | Elegantna zenska odjeca",
    template: "%s | Zenski Butik",
  },
  description:
    "Moderan online butik za zensku odjecu. Haljine, sakoi, kosulje i elegantni komadi za svaki dan.",
  keywords: [
    "zenski butik",
    "zenska odjeca",
    "haljine",
    "sakoi",
    "kosulje",
    "online butik",
    "moda",
  ],
  openGraph: {
    title: "Zenski Butik",
    description:
      "Moderan online butik za zensku odjecu. Elegantni komadi za svaki dan.",
    type: "website",
    locale: "bs_BA",
    siteName: "Zenski Butik",
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
