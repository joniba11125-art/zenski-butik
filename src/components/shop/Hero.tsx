import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-neutral-50">
      <div className="mx-auto grid min-h-[720px] max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div className="relative z-10">
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-neutral-500">
            Premium zenska moda
          </p>

          <h1 className="mt-6 max-w-2xl text-5xl font-semibold tracking-tight text-black sm:text-6xl lg:text-7xl">
            Elegancija za svaki dan
          </h1>

          <p className="mt-6 max-w-xl text-base leading-8 text-neutral-600">
            Otkrij pazljivo biranu kolekciju modernih komada za zene koje vole
            cist, luksuzan i minimalisticki stil.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/shop" className="gap-2">
                Pogledaj kolekciju
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>

            <Button asChild size="lg" variant="outline">
              <Link href="/#about">Saznaj vise</Link>
            </Button>
          </div>

          <div className="mt-12 grid max-w-md grid-cols-3 gap-6 border-t border-neutral-200 pt-8">
            <div>
              <p className="text-2xl font-semibold text-black">50+</p>
              <p className="mt-1 text-xs text-neutral-500">Proizvoda</p>
            </div>

            <div>
              <p className="text-2xl font-semibold text-black">24h</p>
              <p className="mt-1 text-xs text-neutral-500">Rezervacija</p>
            </div>

            <div>
              <p className="text-2xl font-semibold text-black">100%</p>
              <p className="mt-1 text-xs text-neutral-500">Premium stil</p>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-neutral-200 shadow-2xl">
            <Image
              src="https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=1400&auto=format&fit=crop"
              alt="Zenska modna kolekcija"
              fill
              priority
              className="object-cover"
              sizes="(min-width: 1024px) 50vw, 100vw"
            />
          </div>

          <div className="absolute -bottom-6 -left-6 hidden rounded-3xl bg-white p-5 shadow-xl sm:block">
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
              Nova kolekcija
            </p>
            <p className="mt-2 text-xl font-semibold text-black">
              Minimal luxury
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
