"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type ProductCardProps = {
  product: {
    id: string;
    name: string;
    price: number;
    category: string;
    description: string;
    sizes: string[];
    image: string;
    isNew: boolean;
  };
  onReserve?: () => void;
};

export function ProductCard({ product, onReserve }: ProductCardProps) {
  return (
    <div className="group overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <Link href={`/shop/${product.id}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-neutral-100">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          />

          {product.isNew ? (
            <div className="absolute left-4 top-4">
              <Badge className="bg-white text-black hover:bg-white">Novo</Badge>
            </div>
          ) : null}
        </div>
      </Link>

      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">
              {product.category}
            </p>

            <Link href={`/shop/${product.id}`}>
              <h3 className="mt-2 text-base font-semibold text-black transition hover:text-neutral-600">
                {product.name}
              </h3>
            </Link>
          </div>

          <p className="text-sm font-semibold text-black">{product.price} KM</p>
        </div>

        <p className="mt-3 line-clamp-2 text-sm leading-6 text-neutral-600">
          {product.description}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {product.sizes.map((size) => (
            <span
              key={size}
              className="rounded-full border border-neutral-200 px-3 py-1 text-xs text-neutral-700"
            >
              {size}
            </span>
          ))}
        </div>

        <Button className="mt-5 w-full gap-2" onClick={onReserve}>
          <ShoppingBag className="h-4 w-4" />
          Rezervisi
        </Button>
      </div>
    </div>
  );
}
