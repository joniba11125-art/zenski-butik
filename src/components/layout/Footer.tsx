import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-neutral-950 text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-4 lg:px-8">
        <div className="md:col-span-2">
          <p className="text-sm font-semibold tracking-[0.24em]">
            ZENSKI BUTIK
          </p>
          <p className="mt-4 max-w-md text-sm leading-6 text-neutral-300">
            Moderan online butik za zene koje vole cist, elegantan i premium
            stil. Pazljivo birana kolekcija za svaki dan i posebne prilike.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold">Navigacija</h3>
          <div className="mt-4 flex flex-col gap-3 text-sm text-neutral-300">
            <Link href="/" className="transition hover:text-white">
              Pocetna
            </Link>
            <Link href="/shop" className="transition hover:text-white">
              Shop
            </Link>
            <Link href="/#about" className="transition hover:text-white">
              O nama
            </Link>
            <Link href="/#contact" className="transition hover:text-white">
              Kontakt
            </Link>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold">Kontakt</h3>
          <div className="mt-4 flex flex-col gap-3 text-sm text-neutral-300">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <span>+387 61 000 000</span>
            </div>

            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span>info@zenskibutik.com</span>
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>Bosna i Hercegovina</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="flex h-4 w-4 items-center justify-center text-sm">
                @
              </span>
              <span>@zenski.butik</span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-neutral-800 px-4 py-5 text-center text-xs text-neutral-400">
        © 2026 Zenski Butik. Sva prava zadrzana.
      </div>
    </footer>
  );
}
