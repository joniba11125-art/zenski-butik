import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";

type ProductCardProps = {
  product: {
    id: string;
    slug?: string;
    product_code?: string | null;
    name: string;
    price: number;
    oldPrice?: number;
    category: string;
    description: string;
    sizes: string[];
    image: string;
    isNew: boolean;
  };
  onReserve: () => void;
};

export function ProductCard({ product, onReserve }: ProductCardProps) {
  const productHref = `/shop/${product.slug || product.id}`;
  return (
    <div className="group overflow-hidden rounded-[1.75rem] border border-neutral-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <Link href={productHref} className="block">
        <div className="relative overflow-hidden bg-neutral-100">
          <Image
            src={product.image}
            alt={product.name}
            width={700}
            height={900}
            className="h-[520px] w-full object-cover transition duration-500 group-hover:scale-105"
          />

          {product.isNew ? (
            <div className="absolute left-4 top-4 rounded-full bg-neutral-950 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white">
              Novo
            </div>
          ) : null}
        </div>
      </Link>

      <div className="p-6">
        <div className="mb-3 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.28em] text-[#b8912f]">
              {product.category}
            </p>

            <Link href={productHref}>
              <h3 className="mt-2 text-xl font-semibold leading-snug text-neutral-950 transition hover:text-[#b8912f]">
                {product.name}
              </h3>
            </Link>
          </div>

          <div className="shrink-0 text-right">
            <p className="text-xl font-bold text-neutral-950">
              {product.price.toFixed(0)} KM
            </p>

            {product.oldPrice ? (
              <p className="mt-1 text-sm text-neutral-400 line-through">
                {product.oldPrice.toFixed(0)} KM
              </p>
            ) : null}
          </div>
        </div>

        {product.description ? (
          <p className="line-clamp-2 min-h-12 text-sm leading-6 text-neutral-600">
            {product.description}
          </p>
        ) : (
          <p className="line-clamp-2 min-h-12 text-sm leading-6 text-neutral-400">
            Elegantni komad iz Dress Me Up kolekcije.
          </p>
        )}

        <div className="mt-5 flex flex-wrap gap-2">
          {product.sizes.map((size) => (
            <span
              key={size}
              className="min-w-10 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-center text-xs font-medium text-neutral-700"
            >
              {size}
            </span>
          ))}
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto]">
          <Button
            type="button"
            className="rounded-full"
            onClick={onReserve}
          >
            <ShoppingBag className="mr-2 h-4 w-4" />
            Rezerviši
          </Button>

          <Button asChild variant="outline" className="rounded-full">
            <Link href={productHref}>
              <Tag className="mr-2 h-4 w-4" />
              Detalji
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}


