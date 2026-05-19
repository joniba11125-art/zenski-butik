"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

const fallbackHeroImage =
  "https://images.unsplash.com/photo-1496747611176-843222e1e57c";

export function Hero() {
  const supabase = createClient();
  const [heroImageUrl, setHeroImageUrl] = useState(fallbackHeroImage);

  useEffect(() => {
    async function loadHeroImage() {
      const { data, error } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "hero_image_url")
        .single();

      if (error || !data?.value) {
        setHeroImageUrl(fallbackHeroImage);
        return;
      }

      setHeroImageUrl(data.value);
    }

    loadHeroImage();
  }, [supabase]);

  return (
    <section className="relative overflow-hidden bg-[#061537] px-4 py-12 md:py-16">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-8%] top-[-20%] h-96 w-96 rounded-full bg-[#d4af37]/25 blur-3xl" />
        <div className="absolute right-[-10%] top-[10%] h-[520px] w-[520px] rounded-full bg-[#d4af37]/15 blur-3xl" />
        <div className="absolute bottom-[-25%] left-[35%] h-96 w-96 rounded-full bg-white/10 blur-3xl" />

        <div className="absolute left-10 top-12 h-40 w-40 rotate-45 border border-[#d4af37]/20" />
        <div className="absolute right-20 bottom-16 h-56 w-56 rotate-45 border border-[#d4af37]/15" />
        <div className="absolute left-[48%] top-20 h-24 w-24 rotate-45 border border-white/10" />
      </div>

      <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div className="rounded-[2rem] border border-white/15 bg-white/95 p-7 shadow-2xl backdrop-blur md:p-10">
          <p className="mb-4 text-sm uppercase tracking-[0.35em] text-[#b8912f]">
            Dress Me Up Boutique
          </p>

          <h1 className="text-5xl font-semibold tracking-tight text-neutral-950 md:text-7xl">
            Elegantna moda za svaki dan
          </h1>

          <p className="mt-6 max-w-xl text-base leading-8 text-neutral-600">
            Otkrij pažljivo biranu kolekciju elegantnih i svečanih komada za
            svaki dan, posebne prilike i sofisticiran ženski stil.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="rounded-full">
              <Link href="/shop">
                Pogledaj kolekciju
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>

            <Button asChild size="lg" variant="outline" className="rounded-full">
              <Link href="/#contact">Lokacija butika</Link>
            </Button>
          </div>

          <div className="mt-10 grid max-w-xl grid-cols-3 gap-6 border-t pt-6">
            <div>
              <p className="text-2xl font-semibold text-neutral-950">50+</p>
              <p className="mt-1 text-xs text-neutral-500">Proizvoda</p>
            </div>

            <div>
              <p className="text-2xl font-semibold text-neutral-950">24h</p>
              <p className="mt-1 text-xs text-neutral-500">Zamjene</p>
            </div>

            <div>
              <p className="text-2xl font-semibold text-neutral-950">11 KM</p>
              <p className="mt-1 text-xs text-neutral-500">Dostava</p>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-4 rounded-[2.5rem] bg-[#d4af37]/20 blur-2xl" />

          <div className="relative overflow-hidden rounded-[2rem] border border-white/20 bg-neutral-100 shadow-2xl">
            <Image
              src={heroImageUrl}
              alt="Dress Me Up Boutique kolekcija"
              width={900}
              height={1100}
              priority
              className="h-[520px] w-full object-cover md:h-[680px]"
            />
          </div>

          <div className="absolute bottom-6 left-6 rounded-3xl border border-white/40 bg-white/90 p-5 shadow-xl backdrop-blur">
            <p className="mb-2 text-xs uppercase tracking-[0.25em] text-[#b8912f]">
              Nova kolekcija
            </p>
            <p className="text-xl font-semibold text-neutral-950">
              Dress Me Up
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
