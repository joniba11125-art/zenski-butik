import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-neutral-950 px-4 py-12 text-white">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <Link href="/" className="text-2xl font-semibold tracking-tight">
            Dress Me Up
          </Link>

          <p className="mt-4 max-w-md text-sm leading-7 text-neutral-300">
            Dress Me Up Boutique je butik iz Tuzle za elegantnu i svecanu modu
            za svaki dan.
          </p>

          <p className="mt-4 text-sm text-neutral-400">
            Brza posta BiH: 11,00 KM. Isporuka 1/3 radna dana. Dozvoljeno
            otvaranje paketa.
          </p>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em]">
            Navigacija
          </h3>

          <div className="space-y-3 text-sm text-neutral-300">
            <Link href="/" className="block hover:text-white">
              Pocetna
            </Link>
            <Link href="/shop" className="block hover:text-white">
              Shop
            </Link>
            <Link href="/#about" className="block hover:text-white">
              O nama
            </Link>
            <Link href="/#contact" className="block hover:text-white">
              Kontakt
            </Link>
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em]">
            Kontakt
          </h3>

          <div className="space-y-4 text-sm text-neutral-300">
            <div className="flex gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
              <span>Irac, Rudarska 50, Tuzla</span>
            </div>

            <div className="flex gap-3">
              <Phone className="mt-0.5 h-4 w-4 shrink-0" />
              <span>Telefon nije naveden</span>
            </div>

            <div className="flex gap-3">
              <Mail className="mt-0.5 h-4 w-4 shrink-0" />
              <span>Email nije naveden</span>
            </div>

            <div className="flex gap-3">
              <span className="mt-0.5 shrink-0">@</span>
              <span>dressmeup_boutique_</span>
            </div>

            <p>Radno vrijeme: 10:00-18:00h</p>
            <p>Zamjene u roku od 24h. Povrate ne radimo.</p>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-7xl border-t border-white/10 pt-6 text-sm text-neutral-500">
        © {new Date().getFullYear()} Dress Me Up Boutique. All rights reserved.
      </div>
    </footer>
  );
}
