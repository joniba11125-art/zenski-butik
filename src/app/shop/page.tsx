"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ProductCard } from "@/components/shop/ProductCard";
import { ReservationModal } from "@/components/shop/ReservationModal";

type ProductImage = {
  image_url: string;
  alt_text: string | null;
  sort_order: number | null;
};

type Product = {
  id: string;
  product_code: string | null;
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

const priceOptions = [
  { label: "Sve cijene", value: "all" },
  { label: "Do 50 KM", value: "0-50" },
  { label: "50 - 100 KM", value: "50-100" },
  { label: "100 - 150 KM", value: "100-150" },
  { label: "Preko 150 KM", value: "150-plus" },
];

function mapProductForCard(product: Product) {
  const firstImage = product.product_images?.[0];

  return {
    id: product.id,
    product_code: product.product_code,
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

function matchesPriceRange(price: number, range: string) {
  if (range === "all") {
    return true;
  }

  if (range === "0-50") {
    return price <= 50;
  }

  if (range === "50-100") {
    return price >= 50 && price <= 100;
  }

  if (range === "100-150") {
    return price >= 100 && price <= 150;
  }

  if (range === "150-plus") {
    return price >= 150;
  }

  return true;
}

export default function ShopPage() {
  const supabase = createClient();

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isReservationOpen, setIsReservationOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSize, setSelectedSize] = useState("all");
  const [selectedColor, setSelectedColor] = useState("all");
  const [selectedPriceRange, setSelectedPriceRange] = useState("all");

  useEffect(() => {
    async function loadProducts() {
      setIsLoading(true);

      const { data, error } = await supabase
        .from("products")
        .select(
          "id, product_code, name, slug, description, category, price, old_price, sizes, colors, is_featured, is_active, stock, product_images(image_url, alt_text, sort_order)"
        )
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Greška pri učitavanju proizvoda:", error.message);
        setProducts([]);
        setIsLoading(false);
        return;
      }

      setProducts((data as Product[]) ?? []);
      setIsLoading(false);
    }

    loadProducts();
  }, [supabase]);

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(products.map((product) => product.category).filter(Boolean))
    );

    return uniqueCategories.sort();
  }, [products]);

  const sizes = useMemo(() => {
    const uniqueSizes = Array.from(
      new Set(products.flatMap((product) => product.sizes ?? []))
    );

    const sizeOrder = ["XS", "S", "M", "L", "XL", "XXL"];

    return uniqueSizes.sort((a, b) => {
      const indexA = sizeOrder.indexOf(a);
      const indexB = sizeOrder.indexOf(b);

      if (indexA === -1 && indexB === -1) {
        return a.localeCompare(b);
      }

      if (indexA === -1) {
        return 1;
      }

      if (indexB === -1) {
        return -1;
      }

      return indexA - indexB;
    });
  }, [products]);

  const colors = useMemo(() => {
    const uniqueColors = Array.from(
      new Set(products.flatMap((product) => product.colors ?? []))
    );

    return uniqueColors.sort();
  }, [products]);

  const filteredProducts = useMemo(() => {
    const cleanSearch = searchTerm.toLowerCase().trim();

    return products.filter((product) => {
      const matchesSearch =
        !cleanSearch ||
        product.name.toLowerCase().includes(cleanSearch) ||
        product.category.toLowerCase().includes(cleanSearch) ||
        (product.description ?? "").toLowerCase().includes(cleanSearch) ||
        (product.product_code ?? "").toLowerCase().includes(cleanSearch);

      const matchesCategory =
        selectedCategory === "all" || product.category === selectedCategory;

      const matchesSize =
        selectedSize === "all" || (product.sizes ?? []).includes(selectedSize);

      const matchesColor =
        selectedColor === "all" ||
        (product.colors ?? []).includes(selectedColor);

      const matchesPrice = matchesPriceRange(
        product.price,
        selectedPriceRange
      );

      return (
        matchesSearch &&
        matchesCategory &&
        matchesSize &&
        matchesColor &&
        matchesPrice
      );
    });
  }, [
    products,
    searchTerm,
    selectedCategory,
    selectedSize,
    selectedColor,
    selectedPriceRange,
  ]);

  function openReservation(product: Product) {
    setSelectedProduct(product);
    setIsReservationOpen(true);
  }

  function resetFilters() {
    setSearchTerm("");
    setSelectedCategory("all");
    setSelectedSize("all");
    setSelectedColor("all");
    setSelectedPriceRange("all");
  }

  return (
    <main className="min-h-screen bg-[#fffaf0]">
      <section className="relative overflow-hidden border-b border-white/10 bg-[#061537] px-4 py-16 text-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[-8%] top-[-30%] h-80 w-80 rounded-full bg-[#d4af37]/25 blur-3xl" />
          <div className="absolute right-[-10%] top-[10%] h-96 w-96 rounded-full bg-[#d4af37]/15 blur-3xl" />
          <div className="absolute left-10 top-12 h-32 w-32 rotate-45 border border-[#d4af37]/20" />
          <div className="absolute right-24 bottom-10 h-44 w-44 rotate-45 border border-[#d4af37]/15" />
        </div>

        <div className="relative mx-auto max-w-7xl">
          <p className="mb-3 text-sm uppercase tracking-[0.35em] text-amber-200/80">
            Dress Me Up Boutique
          </p>

          <h1 className="text-4xl font-semibold tracking-tight text-white md:text-6xl">
            Shop kolekcija
          </h1>

          <p className="mt-4 max-w-2xl text-neutral-200">
            Pretraži elegantne i svečane komade, filtriraj po kategoriji,
            veličini, boji i cijeni.
          </p>
        </div>
      </section>

      <section className="relative overflow-hidden px-4 py-10">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[-10%] top-[-20%] h-80 w-80 rounded-full bg-[#d4af37]/15 blur-3xl" />
          <div className="absolute right-[-10%] bottom-[-30%] h-96 w-96 rounded-full bg-[#d4af37]/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl">
          <div className="mb-8 rounded-[2rem] border bg-white/95 p-4 shadow-sm backdrop-blur">
            <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr_auto]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Pretraži proizvode..."
                  className="h-12 w-full rounded-full border bg-white pl-11 pr-4 text-sm outline-none focus:border-neutral-950"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(event) => setSelectedCategory(event.target.value)}
                className="h-12 rounded-full border bg-white px-4 text-sm outline-none focus:border-neutral-950"
              >
                <option value="all">Sve kategorije</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              <select
                value={selectedSize}
                onChange={(event) => setSelectedSize(event.target.value)}
                className="h-12 rounded-full border bg-white px-4 text-sm outline-none focus:border-neutral-950"
              >
                <option value="all">Sve veličine</option>
                {sizes.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>

              <select
                value={selectedColor}
                onChange={(event) => setSelectedColor(event.target.value)}
                className="h-12 rounded-full border bg-white px-4 text-sm outline-none focus:border-neutral-950"
              >
                <option value="all">Sve boje</option>
                {colors.map((color) => (
                  <option key={color} value={color}>
                    {color}
                  </option>
                ))}
              </select>

              <select
                value={selectedPriceRange}
                onChange={(event) => setSelectedPriceRange(event.target.value)}
                className="h-12 rounded-full border bg-white px-4 text-sm outline-none focus:border-neutral-950"
              >
                {priceOptions.map((priceOption) => (
                  <option key={priceOption.value} value={priceOption.value}>
                    {priceOption.label}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-neutral-950 px-5 text-sm font-semibold text-white hover:bg-neutral-800"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Reset
              </button>
            </div>
          </div>

          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-neutral-600">
              Prikazano:{" "}
              <span className="font-semibold text-neutral-950">
                {filteredProducts.length}
              </span>{" "}
              proizvoda
            </p>

            <p className="text-sm text-neutral-500">
              Filteri: kategorija, veličina, boja i cijena
            </p>
          </div>

          {isLoading ? (
            <div className="rounded-3xl border bg-white p-10 text-center text-neutral-600">
              Učitavanje proizvoda...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="rounded-3xl border bg-white p-10 text-center text-neutral-600">
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
