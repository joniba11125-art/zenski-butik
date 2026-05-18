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
    <section className="bg-neutral-50 px-4 py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 text-center">
          <p className="mb-3 text-sm uppercase tracking-[0.3em] text-neutral-500">
            Recenzije
          </p>

          <h2 className="text-3xl font-semibold tracking-tight text-neutral-950 md:text-5xl">
            Sta kazu nase kupce
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-neutral-600">
            Iskustva kupaca koji vole elegantan, moderan i minimalisticki stil.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {reviews.map((review) => (
            <Card
              key={review.id}
              className="rounded-3xl border-neutral-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <CardContent className="flex h-full flex-col p-6">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div className="flex gap-1">
                    {Array.from({ length: review.rating }).map((_, index) => (
                      <Star
                        key={index}
                        className="h-4 w-4 fill-neutral-950 text-neutral-950"
                      />
                    ))}
                  </div>

                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100">
                    <Quote className="h-4 w-4 text-neutral-500" />
                  </div>
                </div>

                <p className="text-base font-medium leading-8 text-neutral-800">
                  "{review.comment}"
                </p>

                <div className="mt-6 border-t pt-4">
                  <p className="text-base font-semibold text-neutral-950">
                    {review.customer_name}
                  </p>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.25em] text-neutral-400">
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
