"use client";

import { useEffect, useState } from "react";
import { ShoppingBag, X } from "lucide-react";
import Link from "next/link";

const promoMessages = [
  "Rezerviši svoj omiljeni komad prije nego nestane.",
  "Nova kolekcija je dostupna - pronađi svoj favorit.",
  "Elegantni komadi za svaki dan i posebne prilike.",
  "Posjeti Dress Me Up Boutique na Iracu u Tuzli.",
  "Dostava brzom poštom širom BiH.",
  "Zamjene su moguće u roku od 24h.",
];

export function PromoPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const firstTimer = window.setTimeout(() => {
      setIsVisible(true);
    }, 60000);

    const intervalTimer = window.setInterval(() => {
      setMessageIndex((currentIndex) => {
        return (currentIndex + 1) % promoMessages.length;
      });

      setIsVisible(true);
    }, 300000);

    return () => {
      window.clearTimeout(firstTimer);
      window.clearInterval(intervalTimer);
    };
  }, []);

  useEffect(() => {
    if (!isVisible) {
      return;
    }

    const hideTimer = window.setTimeout(() => {
      setIsVisible(false);
    }, 12000);

    return () => {
      window.clearTimeout(hideTimer);
    };
  }, [isVisible, messageIndex]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-5 right-5 z-[60] w-[calc(100%-2.5rem)] max-w-sm">
      <div className="rounded-3xl border border-[#d4af37]/30 bg-white p-4 shadow-2xl">
        <div className="flex gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#061537] text-white">
            <ShoppingBag className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-semibold text-neutral-950">
                Dress Me Up Boutique
              </p>

              <button
                type="button"
                onClick={() => setIsVisible(false)}
                className="rounded-full p-1 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-950"
                aria-label="Zatvori popup"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-1 text-sm leading-6 text-neutral-600">
              {promoMessages[messageIndex]}
            </p>

            <Link
              href="/shop"
              className="mt-3 inline-flex rounded-full bg-neutral-950 px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800"
            >
              Pogledaj kolekciju
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}


