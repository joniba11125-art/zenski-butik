"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ProductCard } from "@/components/shop/ProductCard";
import { ReservationModal } from "@/components/shop/ReservationModal";
import { Button } from "@/components/ui/button";

type ProductImage = {
  image_url: string;
  alt_text: string | null;
  sort_order: number | null;
};

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string;
  price: number;
  old_price: number | null;
  sizes: string[] | null;
  colors: string[] | null;
  is_featured: boolean | null;
  is_active: boolean | null;
  stock: number | null;
  product_images: ProductImage[];
};

function mapProductForCard(product: Product) {
  const firstImage = product.product_images?.[0];

  return {
    id: product.id,
    name: product.name,
    category: product.category,
    price: product.price,
    oldPrice: product.old_price ?? undefined,
    description: product.description ?? "",
    image: firstImage?.image_url ?? "/placeholder.png",
    sizes: product.sizes ?? [],
    isNew: false,
  };
}

export function FeaturedProducts() {
  const supabase = createClient();

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isReservationOpen, setIsReservationOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadFeaturedProducts() {
      setIsLoading(true);

      const { data, error } = await supabase
        .from("products")
        .select(
          "id, name, slug, description, category, price, old_price, sizes, colors, is_featured, is_active, stock, product_images(image_url, alt_text, sort_order)"
        )
        .eq("is_active", true)
        .eq("is_featured", true)
        .order("created_at", { ascending: false })
        .limit(3);

      if (error) {
        console.error("Greska pri ucitavanju izdvojenih proizvoda:", error.message);
        setProducts([]);
        setIsLoading(false);
        return;
      }

      if (data && data.length > 0) {
        setProducts(data as Product[]);
        setIsLoading(false);
        return;
      }

      const { data: fallbackData, error: fallbackError } = await supabase
        .from("products")
        .select(
          "id, name, slug, description, category, price, old_price, sizes, colors, is_featured, is_active, stock, product_images(image_url, alt_text, sort_order)"
        )
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(3);

      if (fallbackError) {
        console.error(
          "Greska pri ucitavanju proizvoda za pocetnu:",
          fallbackError.message
        );
        setProducts([]);
      } else {
        setProducts((fallbackData as Product[]) ?? []);
      }

      setIsLoading(false);
    }

    loadFeaturedProducts();
  }, [supabase]);

  function openReservation(product: Product) {
    setSelectedProduct(product);
    setIsReservationOpen(true);
  }

  return (
    <section className="bg-white px-4 py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-3 text-sm uppercase tracking-[0.3em] text-neutral-500">
              Izdvojeno
            </p>

            <h2 className="text-3xl font-semibold tracking-tight text-neutral-950 md:text-5xl">
              Najtrazeniji komadi
            </h2>

            <p className="mt-4 max-w-2xl text-neutral-600">
              Odabrani proizvodi za moderan, elegantan i minimalisticki stil.
            </p>
          </div>

          <Button asChild variant="outline" className="rounded-full">
            <Link href="/shop">
              Pogledaj sve
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="rounded-3xl border bg-neutral-50 p-10 text-center text-neutral-600">
            Ucitavanje proizvoda...
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-3xl border bg-neutral-50 p-10 text-center text-neutral-600">
            Trenutno nema izdvojenih proizvoda.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={mapProductForCard(product)}
                onReserve={() => openReservation(product)}
              />
            ))}
          </div>
        )}
      </div>

      {selectedProduct ? (
        <ReservationModal
          product={mapProductForCard(selectedProduct)}
          open={isReservationOpen}
          onOpenChange={setIsReservationOpen}
        />
      ) : null}
    </section>
  );
}
