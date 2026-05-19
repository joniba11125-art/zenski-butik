"use client";

import { use, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  MapPin,
  PackageCheck,
  RotateCcw,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

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

function getLegacySlug(value: string) {
  if (value === "1") {
    return "elegantna-bez-haljina";
  }

  if (value === "2") {
    return "crni-oversized-sako";
  }

  if (value === "3") {
    return "bijela-basic-kosulja";
  }

  return value;
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value
  );
}

export default function ProductDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const supabase = createClient();

  const [product, setProduct] = useState<Product | null>(null);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [selectedReservationProduct, setSelectedReservationProduct] =
    useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [isReservationOpen, setIsReservationOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProduct() {
      setIsLoading(true);

      const productKey = getLegacySlug(resolvedParams.id);

      const { data, error } = await supabase
        .from("products")
        .select(
          "id, product_code, name, slug, description, category, price, old_price, sizes, colors, is_featured, is_active, stock, product_images(image_url, alt_text, sort_order)"
        )
        .eq("is_active", true)
        .or(`id.eq.${productKey},slug.eq.${productKey}`)
        .limit(1);

      if (error || !data || data.length === 0) {
        console.error("Greška pri učitavanju proizvoda:", error?.message);
        setProduct(null);
        setIsLoading(false);
        return;
      }

      const loadedProduct = data[0] as Product;

      setProduct(loadedProduct);
      setSelectedReservationProduct(loadedProduct);
      setSelectedImage(loadedProduct.product_images?.[0]?.image_url ?? "");
      setSelectedSize(loadedProduct.sizes?.[0] ?? "");

      const { data: similarData, error: similarError } = await supabase
        .from("products")
        .select(
          "id, product_code, name, slug, description, category, price, old_price, sizes, colors, is_featured, is_active, stock, product_images(image_url, alt_text, sort_order)"
        )
        .eq("is_active", true)
        .eq("category", loadedProduct.category)
        .neq("id", loadedProduct.id)
        .limit(3);

      if (similarError) {
        console.error(
          "Greška pri učitavanju sličnih proizvoda:",
          similarError.message
        );
        setSimilarProducts([]);
      } else {
        setSimilarProducts((similarData as Product[]) ?? []);
      }

      setIsLoading(false);
    }

    loadProduct();
  }, [resolvedParams.id, supabase]);

  const images = useMemo(() => {
    if (!product) {
      return [];
    }

    return product.product_images
      .slice()
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  }, [product]);

  function openReservation(targetProduct: Product) {
    setSelectedReservationProduct(targetProduct);
    setIsReservationOpen(true);
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#fffaf0] px-4 py-16">
        <div className="mx-auto max-w-7xl rounded-3xl border bg-white p-10 text-center text-neutral-600">
          Učitavanje proizvoda...
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-[#fffaf0] px-4 py-16">
        <div className="mx-auto max-w-3xl rounded-3xl border bg-white p-10 text-center">
          <h1 className="text-3xl font-semibold text-neutral-950">
            Proizvod nije pronađen
          </h1>
          <p className="mt-3 text-neutral-600">
            Proizvod koji tražiš ne postoji ili više nije aktivan.
          </p>
          <Button asChild className="mt-6 rounded-full">
            <Link href="/shop">Nazad na shop</Link>
          </Button>
        </div>
      </main>
    );
  }

  const cardProduct = mapProductForCard(product);
  const mainImage = selectedImage || cardProduct.image;

  return (
    <main className="min-h-screen bg-[#fffaf0]">
      <section className="relative overflow-hidden bg-[#061537] px-4 py-8 text-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[-8%] top-[-30%] h-80 w-80 rounded-full bg-[#d4af37]/25 blur-3xl" />
          <div className="absolute right-[-10%] top-[10%] h-96 w-96 rounded-full bg-[#d4af37]/15 blur-3xl" />
          <div className="absolute left-10 top-12 h-32 w-32 rotate-45 border border-[#d4af37]/20" />
          <div className="absolute right-24 bottom-10 h-44 w-44 rotate-45 border border-[#d4af37]/15" />
        </div>

        <div className="relative mx-auto max-w-7xl">
          <Button asChild variant="ghost" className="mb-6 text-white hover:bg-white/10 hover:text-white">
            <Link href="/shop">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Nazad na shop
            </Link>
          </Button>

          <p className="text-sm uppercase tracking-[0.35em] text-amber-200/80">
            Dress Me Up Boutique
          </p>

          <h1 className="mt-3 max-w-4xl text-4xl font-semibold tracking-tight text-white md:text-6xl">
            {product.name}
          </h1>
        </div>
      </section>

      <section className="px-4 py-10">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <div className="relative overflow-hidden rounded-[2rem] border bg-white shadow-xl">
                <Image
                  src={mainImage}
                  alt={product.name}
                  width={1000}
                  height={1200}
                  className="h-[560px] w-full object-cover md:h-[720px]"
                  priority
                />

                <div className="absolute left-5 top-5 rounded-full bg-white/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#b8912f] shadow-sm backdrop-blur">
                  {product.category}
                </div>
              </div>

              {images.length > 1 ? (
                <div className="mt-4 grid grid-cols-4 gap-3">
                  {images.map((image) => (
                    <button
                      key={image.image_url}
                      type="button"
                      onClick={() => setSelectedImage(image.image_url)}
                      className={
                        selectedImage === image.image_url
                          ? "overflow-hidden rounded-2xl border-2 border-[#d4af37] bg-white p-1"
                          : "overflow-hidden rounded-2xl border bg-white p-1"
                      }
                    >
                      <Image
                        src={image.image_url}
                        alt={image.alt_text ?? product.name}
                        width={240}
                        height={280}
                        className="h-28 w-full rounded-xl object-cover"
                      />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="lg:sticky lg:top-28 lg:self-start">
              <div className="rounded-[2rem] border bg-white p-7 shadow-sm md:p-8">
                <Badge className="mb-4 w-fit bg-[#061537] text-white hover:bg-[#061537]">
                  {product.category}
                </Badge>

                <h2 className="text-3xl font-semibold tracking-tight text-neutral-950 md:text-5xl">
                  {product.name}
                </h2>

                <div className="mt-5 flex flex-wrap items-end gap-3">
                  <p className="text-4xl font-bold text-neutral-950">
                    {product.price.toFixed(0)} KM
                  </p>

                  {product.old_price ? (
                    <p className="pb-1 text-xl text-neutral-400 line-through">
                      {product.old_price.toFixed(0)} KM
                    </p>
                  ) : null}
                </div>

                <p className="mt-6 text-base leading-8 text-neutral-600">
                  {product.description ||
                    "Elegantni komad iz Dress Me Up kolekcije, pažljivo odabran za moderan i svečan stil."}
                </p>

                <div className="mt-8">
                  <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-neutral-500">
                    Veličina
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {(product.sizes ?? []).map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={
                          selectedSize === size
                            ? "min-w-12 rounded-full bg-neutral-950 px-5 py-2.5 text-sm font-semibold text-white"
                            : "min-w-12 rounded-full border bg-white px-5 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                        }
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {product.colors && product.colors.length > 0 ? (
                  <div className="mt-8">
                    <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-neutral-500">
                      Boje
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {product.colors.map((color) => (
                        <span
                          key={color}
                          className="rounded-full border bg-neutral-50 px-4 py-2 text-sm font-medium text-neutral-700"
                        >
                          {color}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border bg-[#fffaf0] p-4">
                    <PackageCheck className="mb-3 h-5 w-5 text-[#b8912f]" />
                    <p className="text-sm font-semibold text-neutral-950">
                      Dostava 11,00 KM
                    </p>
                    <p className="mt-1 text-xs leading-5 text-neutral-500">
                      Isporuka 1-3 radna dana.
                    </p>
                  </div>

                  <div className="rounded-2xl border bg-[#fffaf0] p-4">
                    <RotateCcw className="mb-3 h-5 w-5 text-[#b8912f]" />
                    <p className="text-sm font-semibold text-neutral-950">
                      Zamjena 24h
                    </p>
                    <p className="mt-1 text-xs leading-5 text-neutral-500">
                      Povrate ne radimo.
                    </p>
                  </div>

                  <div className="rounded-2xl border bg-[#fffaf0] p-4">
                    <MapPin className="mb-3 h-5 w-5 text-[#b8912f]" />
                    <p className="text-sm font-semibold text-neutral-950">
                      Butik Tuzla
                    </p>
                    <p className="mt-1 text-xs leading-5 text-neutral-500">
                      Irac, Rudarska 50.
                    </p>
                  </div>

                  <div className="rounded-2xl border bg-[#fffaf0] p-4">
                    <Sparkles className="mb-3 h-5 w-5 text-[#b8912f]" />
                    <p className="text-sm font-semibold text-neutral-950">
                      Premium stil
                    </p>
                    <p className="mt-1 text-xs leading-5 text-neutral-500">
                      Elegantno i svečano.
                    </p>
                  </div>
                </div>

                <div className="mt-8 space-y-3 text-sm text-neutral-600">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-[#b8912f]" />
                    Nakon rezervacije butik vas kontaktira za potvrdu narudžbe.
                  </div>

                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-[#b8912f]" />
                    Dozvoljeno otvaranje paketa pri dostavi.
                  </div>
                </div>

                <div className="mt-8">
                  <Button
                    size="lg"
                    className="w-full rounded-full px-8"
                    onClick={() => openReservation(product)}
                  >
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Rezerviši proizvod
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {similarProducts.length > 0 ? (
            <div className="mt-20">
              <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="mb-2 text-sm uppercase tracking-[0.3em] text-[#b8912f]">
                    Slično
                  </p>
                  <h2 className="text-3xl font-semibold text-neutral-950 md:text-4xl">
                    Možda ti se svidi
                  </h2>
                </div>

                <Button asChild variant="outline" className="rounded-full">
                  <Link href="/shop">Pogledaj sve</Link>
                </Button>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {similarProducts.map((similarProduct) => (
                  <ProductCard
                    key={similarProduct.id}
                    product={mapProductForCard(similarProduct)}
                    onReserve={() => openReservation(similarProduct)}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {selectedReservationProduct ? (
        <ReservationModal
          product={mapProductForCard(selectedReservationProduct)}
          open={isReservationOpen}
          onOpenChange={setIsReservationOpen}
        />
      ) : null}
    </main>
  );
}



