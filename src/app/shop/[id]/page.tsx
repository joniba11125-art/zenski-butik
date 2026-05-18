"use client";

import { use, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Check, Heart } from "lucide-react";
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
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value
  );
}

export default function ProductDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const supabase = createClient();

  const [product, setProduct] = useState<Product | null>(null);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [isReservationOpen, setIsReservationOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProduct() {
      setIsLoading(true);

      const productKey = getLegacySlug(resolvedParams.id);

      let query = supabase
        .from("products")
        .select(
          "id, name, slug, description, category, price, old_price, sizes, colors, is_featured, is_active, stock, product_images(image_url, alt_text, sort_order)"
        )
        .eq("is_active", true);

      if (isUuid(productKey)) {
        query = query.eq("id", productKey);
      } else {
        query = query.eq("slug", productKey);
      }

      const { data, error } = await query.single();

      if (error || !data) {
        console.error("Greska pri ucitavanju proizvoda:", error?.message);
        setProduct(null);
        setIsLoading(false);
        return;
      }

      const loadedProduct = data as Product;
      setProduct(loadedProduct);

      const firstImage = loadedProduct.product_images?.[0]?.image_url ?? "";
      setSelectedImage(firstImage);

      const firstSize = loadedProduct.sizes?.[0] ?? "";
      setSelectedSize(firstSize);

      const { data: similarData, error: similarError } = await supabase
        .from("products")
        .select(
          "id, name, slug, description, category, price, old_price, sizes, colors, is_featured, is_active, stock, product_images(image_url, alt_text, sort_order)"
        )
        .eq("is_active", true)
        .eq("category", loadedProduct.category)
        .neq("id", loadedProduct.id)
        .limit(3);

      if (similarError) {
        console.error(
          "Greska pri ucitavanju slicnih proizvoda:",
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

  if (isLoading) {
    return (
      <main className="min-h-screen bg-white px-4 py-16">
        <div className="mx-auto max-w-7xl rounded-3xl border bg-neutral-50 p-10 text-center text-neutral-600">
          Ucitavanje proizvoda...
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-white px-4 py-16">
        <div className="mx-auto max-w-3xl rounded-3xl border bg-neutral-50 p-10 text-center">
          <h1 className="text-3xl font-semibold text-neutral-950">
            Proizvod nije pronadjen
          </h1>
          <p className="mt-3 text-neutral-600">
            Proizvod koji trazis ne postoji ili vise nije aktivan.
          </p>
          <Button asChild className="mt-6">
            <Link href="/shop">Nazad na shop</Link>
          </Button>
        </div>
      </main>
    );
  }

  const cardProduct = mapProductForCard(product);
  const mainImage = selectedImage || cardProduct.image;

  return (
    <main className="min-h-screen bg-white">
      <section className="px-4 py-8">
        <div className="mx-auto max-w-7xl">
          <Button asChild variant="ghost" className="mb-6">
            <Link href="/shop">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Nazad na shop
            </Link>
          </Button>

          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <div className="overflow-hidden rounded-3xl bg-neutral-100">
                <Image
                  src={mainImage}
                  alt={product.name}
                  width={900}
                  height={1100}
                  className="h-[520px] w-full object-cover"
                  priority
                />
              </div>

              {images.length > 1 ? (
                <div className="mt-4 grid grid-cols-4 gap-3">
                  {images.map((image) => (
                    <button
                      key={image.image_url}
                      type="button"
                      onClick={() => setSelectedImage(image.image_url)}
                      className="overflow-hidden rounded-2xl border bg-neutral-100"
                    >
                      <Image
                        src={image.image_url}
                        alt={image.alt_text ?? product.name}
                        width={220}
                        height={260}
                        className="h-28 w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="flex flex-col justify-center">
              <Badge className="mb-4 w-fit" variant="secondary">
                {product.category}
              </Badge>

              <h1 className="text-4xl font-semibold tracking-tight text-neutral-950 md:text-5xl">
                {product.name}
              </h1>

              <div className="mt-5 flex items-center gap-3">
                <p className="text-2xl font-semibold text-neutral-950">
                  {product.price.toFixed(2)} KM
                </p>

                {product.old_price ? (
                  <p className="text-lg text-neutral-400 line-through">
                    {product.old_price.toFixed(2)} KM
                  </p>
                ) : null}
              </div>

              <p className="mt-6 max-w-xl text-base leading-8 text-neutral-600">
                {product.description}
              </p>

              <div className="mt-8">
                <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-neutral-500">
                  Velicina
                </p>

                <div className="flex flex-wrap gap-2">
                  {(product.sizes ?? []).map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={
                        selectedSize === size
                          ? "rounded-full bg-neutral-950 px-5 py-2 text-sm text-white"
                          : "rounded-full border px-5 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                      }
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-8 space-y-3 text-sm text-neutral-600">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-neutral-950" />
                  Dostupno za rezervaciju
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-neutral-950" />
                  Kontaktiramo kupca nakon rezervacije
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-neutral-950" />
                  Premium minimalisticki stil
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button
                  size="lg"
                  className="rounded-full px-8"
                  onClick={() => setIsReservationOpen(true)}
                >
                  Rezervisi proizvod
                </Button>

                <Button size="lg" variant="outline" className="rounded-full">
                  <Heart className="mr-2 h-4 w-4" />
                  Sacuvaj
                </Button>
              </div>
            </div>
          </div>

          {similarProducts.length > 0 ? (
            <div className="mt-20">
              <h2 className="mb-6 text-3xl font-semibold text-neutral-950">
                Slicni proizvodi
              </h2>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {similarProducts.map((similarProduct) => (
                  <ProductCard
                    key={similarProduct.id}
                    product={mapProductForCard(similarProduct)}
                    onReserve={() => setIsReservationOpen(true)}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <ReservationModal
        product={cardProduct}
        open={isReservationOpen}
        onOpenChange={setIsReservationOpen}
      />
    </main>
  );
}
