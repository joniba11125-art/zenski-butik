import Link from "next/link";
import { Clock, MapPin, PackageCheck, RotateCcw } from "lucide-react";
import { FaFacebookF, FaInstagram } from "react-icons/fa";

export function Footer() {
  return (
    <footer id="contact" className="border-t bg-neutral-950 px-4 py-12 text-white">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <Link href="/" className="text-2xl font-semibold tracking-tight">
            Dress Me Up
          </Link>

          <p className="mt-4 max-w-md text-sm leading-7 text-neutral-300">
            Dress Me Up Boutique je butik iz Tuzle za elegantnu i svečanu modu
            za svaki dan.
          </p>

          <div className="mt-6 grid gap-3 text-sm text-neutral-300 sm:grid-cols-2">
            <div className="rounded-2xl bg-white/5 p-4">
              <PackageCheck className="mb-2 h-5 w-5 text-white" />
              <p className="font-medium text-white">Brza pošta BiH</p>
              <p className="mt-1 text-neutral-400">Dostava 11,00 KM</p>
            </div>

            <div className="rounded-2xl bg-white/5 p-4">
              <RotateCcw className="mb-2 h-5 w-5 text-white" />
              <p className="font-medium text-white">Zamjene</p>
              <p className="mt-1 text-neutral-400">
                Zamjene u roku od 24h. Povrate ne radimo.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em]">
            Navigacija
          </h3>

          <div className="space-y-3 text-sm text-neutral-300">
            <Link href="/" className="block hover:text-white">
              Početna
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
            Butik
          </h3>

          <div className="space-y-4 text-sm text-neutral-300">
            <div className="flex gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
              <span>Irac, Rudarska 50, Tuzla</span>
            </div>

            <div className="flex gap-3">
              <Clock className="mt-0.5 h-4 w-4 shrink-0" />
              <span>Radno vrijeme: 10:00-18:00h</span>
            </div>

            <p className="text-neutral-400">
              Isporuka 1-3 radna dana. Dozvoljeno otvaranje paketa.
            </p>

            <div className="flex flex-wrap gap-2 pt-2">
              <a
                href="https://www.instagram.com/dressmeup_boutique_/"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white hover:border-white"
              >
                <FaInstagram className="h-4 w-4" />
              </a>

              <a
                href="https://www.facebook.com/p/Dress-Me-Up-61564424618405/"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white hover:border-white"
              >
                <FaFacebookF className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-7xl">
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
          <iframe
            title="Dress Me Up Boutique lokacija"
            src="https://www.google.com/maps?q=44.53864828988611,18.655821338677246&z=17&output=embed"
            className="h-72 w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-neutral-400">
            Lokacija: Irac, Rudarska 50, Tuzla
          </p>

          <a
            href="https://www.google.com/maps?q=44.53864828988611,18.655821338677246"
            target="_blank"
            rel="noreferrer"
            className="w-fit rounded-full border border-white/15 px-5 py-2 text-sm font-semibold text-white hover:border-white"
          >
            Otvori u Google Maps
          </a>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-7xl border-t border-white/10 pt-6 text-sm text-neutral-500">
        © {new Date().getFullYear()} Dress Me Up Boutique. Demo webshop.
      </div>
    </footer>
  );
}

