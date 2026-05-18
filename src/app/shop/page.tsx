"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ProductCard } from "@/components/shop/ProductCard";
import { ReservationModal } from "@/components/shop/ReservationModal";
import { Input } from "@/components/ui/input";
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

const allCategories = ["Sve", "Haljine", "Sakoi", "Kosulje"];
const allSizes = ["Sve", "XS", "S", "M", "L", "XL"];

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

export default function ShopPage() {
  const supabase = createClient();

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isReservationOpen, setIsReservationOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Sve");
  const [size, setSize] = useState("Sve");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      setIsLoading(true);

      const { data, error } = await supabase
        .from("products")
        .select(
          "id, name, slug, description, category, price, old_price, sizes, colors, is_featured, is_active, stock, product_images(image_url, alt_text, sort_order)"
        )
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Greska pri ucitavanju proizvoda:", error.message);
        setProducts([]);
      } else {
        setProducts((data as Product[]) ?? []);
      }

      setIsLoading(false);
    }

    loadProducts();
  }, [supabase]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.category.toLowerCase().includes(search.toLowerCase()) ||
        (product.description ?? "")
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesCategory =
        category === "Sve" || product.category === category;

      const productSizes = product.sizes ?? [];
      const matchesSize = size === "Sve" || productSizes.includes(size);

      return matchesSearch && matchesCategory && matchesSize;
    });
  }, [products, search, category, size]);

  function openReservation(product: Product) {
    setSelectedProduct(product);
    setIsReservationOpen(true);
  }

  return (
    <main className="min-h-screen bg-white">
      <section className="border-b bg-neutral-50 px-4 py-16">
        <div className="mx-auto max-w-7xl">
          <p className="mb-3 text-sm uppercase tracking-[0.3em] text-neutral-500">
            Kolekcija
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-neutral-950 md:text-6xl">
            Shop
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-neutral-600">
            Otkrij pazljivo odabrane komade za elegantan, moderan i
            minimalisticki stil.
          </p>
        </div>
      </section>

      <section className="px-4 py-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 grid gap-4 rounded-3xl border bg-white p-4 shadow-sm md:grid-cols-[1fr_auto_auto]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Pretrazi proizvode..."
                className="pl-10"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {allCategories.map((item) => (
                <Button
                  key={item}
                  type="button"
                  variant={category === item ? "default" : "outline"}
                  onClick={() => setCategory(item)}
                >
                  {item}
                </Button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              {allSizes.map((item) => (
                <Button
                  key={item}
                  type="button"
                  variant={size === item ? "default" : "outline"}
                  onClick={() => setSize(item)}
                >
                  {item}
                </Button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="rounded-3xl border bg-neutral-50 p-10 text-center text-neutral-600">
              Ucitavanje proizvoda...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="rounded-3xl border bg-neutral-50 p-10 text-center text-neutral-600">
              Nema proizvoda za odabrane filtere.
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={mapProductForCard(product)}
                  onReserve={() => openReservation(product)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {selectedProduct ? (
        <ReservationModal
          product={mapProductForCard(selectedProduct)}
          open={isReservationOpen}
          onOpenChange={setIsReservationOpen}
        />
      ) : null}
    </main>
  );
}
