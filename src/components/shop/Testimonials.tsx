"use client";

import { useEffect, useState } from "react";
import { Quote, Star } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";

type Review = {
  id: string;
  customer_name: string;
  rating: number;
  comment: string;
};

const fallbackReviews: Review[] = [
  {
    id: "fallback-1",
    customer_name: "Amina",
    rating: 5,
    comment:
      "Predivni komadi, kvalitet je odlican i sve izgleda jako elegantno.",
  },
  {
    id: "fallback-2",
    customer_name: "Lejla",
    rating: 5,
    comment:
      "Narudzba je prosla brzo, a komunikacija je bila profesionalna i ljubazna.",
  },
  {
    id: "fallback-3",
    customer_name: "Sara",
    rating: 5,
    comment:
      "Minimalisticki stil koji se lako kombinuje. Sigurno cu opet kupovati.",
  },
];

export function Testimonials() {
  const supabase = createClient();
  const [reviews, setReviews] = useState<Review[]>(fallbackReviews);

  useEffect(() => {
    async function loadReviews() {
      const { data, error } = await supabase
        .from("reviews")
        .select("id, customer_name, rating, comment")
        .eq("is_approved", true)
        .order("created_at", { ascending: false })
        .limit(6);

      if (error) {
        console.error("Greska pri ucitavanju recenzija:", error.message);
        setReviews(fallbackReviews);
        return;
      }

      if (data && data.length > 0) {
        setReviews(data as Review[]);
      }
    }

    loadReviews();
  }, [supabase]);

  return (
    <section className="bg-neutral-50 px-4 py-10 md:py-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-7 text-center">
          <p className="mb-2 text-xs uppercase tracking-[0.3em] text-neutral-500">
            Recenzije
          </p>

          <h2 className="text-2xl font-semibold tracking-tight text-neutral-950 md:text-5xl">
            Šta kažu naši kupci
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-sm text-neutral-600 md:text-base">
            Iskustva kupaca koji vole elegantan, moderan i minimalistički stil.
          </p>
        </div>

        <div className="grid gap-3 md:gap-5 md:grid-cols-3">
          {reviews.map((review) => (
            <Card
              key={review.id}
              className="rounded-2xl border-neutral-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md md:rounded-3xl"
            >
              <CardContent className="flex h-full flex-col p-4 md:p-6">
                <div className="mb-3 flex items-center justify-between gap-4">
                  <div className="flex gap-1">
                    {Array.from({ length: review.rating }).map((_, index) => (
                      <Star
                        key={index}
                        className="h-3.5 w-3.5 fill-neutral-950 text-neutral-950 md:h-4 md:w-4"
                      />
                    ))}
                  </div>

                  <div className="hidden h-9 w-9 items-center justify-center rounded-full bg-neutral-100 md:flex">
                    <Quote className="h-4 w-4 text-neutral-500" />
                  </div>
                </div>

                <p className="line-clamp-2 text-sm font-medium leading-6 text-neutral-800 md:line-clamp-none md:text-base md:leading-8">
                  "{review.comment}"
                </p>

                <div className="mt-3 border-t pt-3 md:mt-4">
                  <p className="text-sm font-semibold text-neutral-950 md:text-base">
                    {review.customer_name}
                  </p>
                  <p className="mt-0.5 text-[10px] uppercase tracking-[0.22em] text-neutral-400 md:mt-1 md:text-[11px]">
                    Kupac
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

