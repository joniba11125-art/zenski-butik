"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ImagePlus,
  Loader2,
  Pencil,
  Plus,
  RefreshCcw,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

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
  created_at: string;
};

type ProductImage = {
  id: string;
  product_id: string;
  image_url: string;
  alt_text: string | null;
  sort_order: number | null;
};

type PreviewImage = {
  id: string;
  url: string;
  file: File | null;
  existingImageId: string | null;
};

const categoryOptions = [
  "Haljine",
  "Sakoi",
  "Kosulje",
  "Kompleti",
  "Hlace",
  "Suknje",
  "Jakne",
];

const sizeOptions = ["XS", "S", "M", "L", "XL"];

const colorOptions = [
  "Crna",
  "Bijela",
  "Bez",
  "Siva",
  "Smedja",
  "Roza",
  "Crvena",
  "Plava",
  "Zelena",
  "Zuta",
  "Narandzasta",
  "Ljubicasta",
  "Bordo",
  "Maslinasta",
  "Tamnoplava",
  "Krem",
  "Zlatna",
  "Srebrna",
  "Sareni dezen",
];

function createSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function createSafeFileName(fileName: string) {
  const extension = fileName.split(".").pop() || "jpg";
  const baseName = fileName
    .replace(/\.[^/.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${baseName}-${Date.now()}.${extension}`;
}

function getStoragePathFromPublicUrl(url: string) {
  const marker = "/storage/v1/object/public/product-images/";
  const markerIndex = url.indexOf(marker);

  if (markerIndex === -1) {
    return "";
  }

  return decodeURIComponent(url.slice(markerIndex + marker.length));
}

export default function AdminProductsPage() {
  const router = useRouter();
  const supabase = createClient();

  const [products, setProducts] = useState<Product[]>([]);
  const [productImages, setProductImages] = useState<ProductImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [editingProductId, setEditingProductId] = useState("");
  const [deletingProductId, setDeletingProductId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [name, setName] = useState("");
  const [category, setCategory] = useState("Haljine");
  const [price, setPrice] = useState("");
  const [oldPrice, setOldPrice] = useState("");
  const [stock, setStock] = useState("1");
  const [selectedSizes, setSelectedSizes] = useState<string[]>(["S", "M"]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [previewImages, setPreviewImages] = useState<PreviewImage[]>([]);

  async function checkAdmin() {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      router.push("/admin/login");
      return false;
    }

    const { data: adminData, error: adminError } = await supabase
      .from("admins")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (adminError || !adminData) {
      router.push("/admin/login");
      return false;
    }

    return true;
  }

  async function deleteImagesFromStorage(images: ProductImage[]) {
    const paths = images
      .map((image) => getStoragePathFromPublicUrl(image.image_url))
      .filter(Boolean);

    if (paths.length === 0) {
      return;
    }

    const { error } = await supabase.storage
      .from("product-images")
      .remove(paths);

    if (error) {
      console.error("Greška pri brisanju slika iz Storage:", error.message);
    }
  }

  async function loadProducts() {
    setIsLoading(true);
    setErrorMessage("");

    const isAdmin = await checkAdmin();

    if (!isAdmin) {
      return;
    }

    const { data, error } = await supabase
      .from("products")
      .select(
        "id, product_code, name, slug, description, category, price, old_price, sizes, colors, is_featured, is_active, stock, created_at"
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Greška pri učitavanju proizvoda:", error.message);
      setErrorMessage("Proizvodi se nisu učitali.");
      setProducts([]);
      setIsLoading(false);
      return;
    }

    const loadedProducts = (data as Product[]) ?? [];
    const productIds = loadedProducts.map((product) => product.id);

    if (productIds.length > 0) {
      const { data: imagesData, error: imagesError } = await supabase
        .from("product_images")
        .select("id, product_id, image_url, alt_text, sort_order")
        .in("product_id", productIds)
        .order("sort_order", { ascending: true });

      if (imagesError) {
        console.error("Greška pri učitavanju slika:", imagesError.message);
        setProductImages([]);
      } else {
        setProductImages((imagesData as ProductImage[]) ?? []);
      }
    } else {
      setProductImages([]);
    }

    setProducts(loadedProducts);
    setIsLoading(false);
  }

  function resetForm() {
    setEditingProductId("");
    setName("");
    setCategory("Haljine");
    setPrice("");
    setOldPrice("");
    setStock("1");
    setSelectedSizes(["S", "M"]);
    setSelectedColors([]);
    setDescription("");
    setPreviewImages([]);
    setErrorMessage("");
    setSuccessMessage("");
  }

  function startEditProduct(product: Product) {
    const images = getProductImages(product.id);

    setEditingProductId(product.id);
    setName(product.name);
    setCategory(product.category);
    setPrice(String(product.price));
    setOldPrice(product.old_price ? String(product.old_price) : "");
    setStock(product.stock ? String(product.stock) : "0");
    setSelectedSizes(product.sizes ?? []);
    setSelectedColors(product.colors ?? []);
    setDescription(product.description ?? "");
    setPreviewImages(
      images.map((image) => ({
        id: image.id,
        url: image.image_url,
        file: null,
        existingImageId: image.id,
      }))
    );
    setErrorMessage("");
    setSuccessMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function toggleValue(
    value: string,
    currentValues: string[],
    setValues: (values: string[]) => void
  ) {
    if (currentValues.includes(value)) {
      setValues(currentValues.filter((item) => item !== value));
      return;
    }

    setValues([...currentValues, value]);
  }

  function handleSelectImages(files: FileList | null) {
    if (!files) {
      return;
    }

    const newImages = Array.from(files).map((file) => ({
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      url: URL.createObjectURL(file),
      file,
      existingImageId: null,
    }));

    setPreviewImages((currentImages) => [...currentImages, ...newImages]);
  }

  function removePreviewImage(imageId: string) {
    setPreviewImages((currentImages) =>
      currentImages.filter((image) => image.id !== imageId)
    );
  }

  async function uploadOneImage(productId: string, image: PreviewImage) {
    if (!image.file) {
      return image.url;
    }

    const safeFileName = createSafeFileName(image.file.name);
    const filePath = `${productId}/${safeFileName}`;

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(filePath, image.file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      console.error("Greška pri uploadu slike:", uploadError.message);
      throw new Error("Slika nije uploadovana.");
    }

    const { data } = supabase.storage
      .from("product-images")
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  async function syncProductImages(productId: string) {
    const existingImages = getProductImages(productId);
    const keptExistingIds = previewImages
      .map((image) => image.existingImageId)
      .filter(Boolean);

    const imagesToDelete = existingImages.filter(
      (image) => !keptExistingIds.includes(image.id)
    );

    if (imagesToDelete.length > 0) {
      await deleteImagesFromStorage(imagesToDelete);

      const { error: deleteError } = await supabase
        .from("product_images")
        .delete()
        .in(
          "id",
          imagesToDelete.map((image) => image.id)
        );

      if (deleteError) {
        console.error("Greška pri brisanju slika iz baze:", deleteError.message);
      }
    }

    for (let index = 0; index < previewImages.length; index++) {
      const image = previewImages[index];
      const finalImageUrl = await uploadOneImage(productId, image);

      if (image.existingImageId) {
        const { error: updateError } = await supabase
          .from("product_images")
          .update({
            image_url: finalImageUrl,
            alt_text: name,
            sort_order: index + 1,
          })
          .eq("id", image.existingImageId);

        if (updateError) {
          console.error("Greška pri izmjeni slike:", updateError.message);
        }
      } else {
        const { error: insertError } = await supabase
          .from("product_images")
          .insert({
            product_id: productId,
            image_url: finalImageUrl,
            alt_text: name,
            sort_order: index + 1,
          });

        if (insertError) {
          console.error("Greška pri dodavanju slike:", insertError.message);
        }
      }
    }
  }

  async function handleSubmitProduct(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (editingProductId) {
      await handleUpdateProduct();
      return;
    }

    await handleAddProduct();
  }

  async function handleAddProduct() {
    setErrorMessage("");
    setSuccessMessage("");
    setIsSaving(true);

    const isAdmin = await checkAdmin();

    if (!isAdmin) {
      setIsSaving(false);
      return;
    }

    const slug = createSlug(name);

    if (!slug) {
      setErrorMessage("Unesi ispravan naziv proizvoda.");
      setIsSaving(false);
      return;
    }

    const priceNumber = Number(price);
    const oldPriceNumber = oldPrice ? Number(oldPrice) : null;
    const stockNumber = stock ? Number(stock) : 0;

    if (!priceNumber || priceNumber <= 0) {
      setErrorMessage("Unesi ispravnu cijenu.");
      setIsSaving(false);
      return;
    }

    if (selectedSizes.length === 0) {
      setErrorMessage("Odaberi bar jednu velicinu.");
      setIsSaving(false);
      return;
    }

    const { data: newProduct, error: productError } = await supabase
      .from("products")
      .insert({
        name,
        slug,
        description,
        category,
        price: priceNumber,
        old_price: oldPriceNumber,
        sizes: selectedSizes,
        colors: selectedColors,
        stock: stockNumber,
        is_active: true,
        is_featured: false,
      })
      .select("id")
      .single();

    if (productError || !newProduct) {
      console.error("Greška pri dodavanju proizvoda:", productError?.message);
      setErrorMessage(
        "Proizvod nije dodan. Mozda vec postoji proizvod sa istim nazivom."
      );
      setIsSaving(false);
      return;
    }

    try {
      await syncProductImages(newProduct.id);
    } catch (error) {
      setErrorMessage("Proizvod je dodan, ali neke slike nisu uploadovane.");
    }

    resetForm();
    setSuccessMessage("Proizvod je dodan.");

    await loadProducts();
    setIsSaving(false);
  }

  async function handleUpdateProduct() {
    setErrorMessage("");
    setSuccessMessage("");
    setIsSaving(true);

    const isAdmin = await checkAdmin();

    if (!isAdmin) {
      setIsSaving(false);
      return;
    }

    const slug = createSlug(name);

    if (!slug) {
      setErrorMessage("Unesi ispravan naziv proizvoda.");
      setIsSaving(false);
      return;
    }

    const priceNumber = Number(price);
    const oldPriceNumber = oldPrice ? Number(oldPrice) : null;
    const stockNumber = stock ? Number(stock) : 0;

    if (!priceNumber || priceNumber <= 0) {
      setErrorMessage("Unesi ispravnu cijenu.");
      setIsSaving(false);
      return;
    }

    if (selectedSizes.length === 0) {
      setErrorMessage("Odaberi bar jednu velicinu.");
      setIsSaving(false);
      return;
    }

    const { error: productError } = await supabase
      .from("products")
      .update({
        name,
        slug,
        description,
        category,
        price: priceNumber,
        old_price: oldPriceNumber,
        sizes: selectedSizes,
        colors: selectedColors,
        stock: stockNumber,
        updated_at: new Date().toISOString(),
      })
      .eq("id", editingProductId);

    if (productError) {
      console.error("Greška pri izmjeni proizvoda:", productError.message);
      setErrorMessage(
        "Proizvod nije izmijenjen. Mozda vec postoji proizvod sa istim nazivom."
      );
      setIsSaving(false);
      return;
    }

    try {
      await syncProductImages(editingProductId);
    } catch (error) {
      setErrorMessage("Proizvod je izmijenjen, ali neke slike nisu uploadovane.");
    }

    resetForm();
    setSuccessMessage("Proizvod je izmijenjen.");

    await loadProducts();
    setIsSaving(false);
  }

  async function toggleProductFeatured(product: Product) {
    setErrorMessage("");
    setSuccessMessage("");

    const { error } = await supabase
      .from("products")
      .update({
        is_featured: !product.is_featured,
        updated_at: new Date().toISOString(),
      })
      .eq("id", product.id);

    if (error) {
      console.error("Greška pri promjeni izdvojenog proizvoda:", error.message);
      setErrorMessage("Izdvojeni status nije promijenjen.");
      return;
    }

    setProducts((currentProducts) =>
      currentProducts.map((item) =>
        item.id === product.id
          ? { ...item, is_featured: !product.is_featured }
          : item
      )
    );
  }

  async function toggleProductActive(product: Product) {
    setErrorMessage("");
    setSuccessMessage("");

    const { error } = await supabase
      .from("products")
      .update({
        is_active: !product.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", product.id);

    if (error) {
      console.error("Greška pri promjeni statusa proizvoda:", error.message);
      setErrorMessage("Status proizvoda nije promijenjen.");
      return;
    }

    setProducts((currentProducts) =>
      currentProducts.map((item) =>
        item.id === product.id
          ? { ...item, is_active: !product.is_active }
          : item
      )
    );
  }

  async function deleteProduct(product: Product) {
    const confirmed = window.confirm(
      `Da li sigurno želiš obrisati proizvod: ${product.name}?`
    );

    if (!confirmed) {
      return;
    }

    setDeletingProductId(product.id);
    setErrorMessage("");
    setSuccessMessage("");

    const isAdmin = await checkAdmin();

    if (!isAdmin) {
      setDeletingProductId("");
      return;
    }

    const imagesForProduct = getProductImages(product.id);

    await deleteImagesFromStorage(imagesForProduct);

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", product.id);

    if (error) {
      console.error("Greška pri brisanju proizvoda:", error.message);
      setErrorMessage("Proizvod nije obrisan. Pokušaj ponovo.");
      setDeletingProductId("");
      return;
    }

    if (editingProductId === product.id) {
      resetForm();
    }

    setProducts((currentProducts) =>
      currentProducts.filter((item) => item.id !== product.id)
    );

    setProductImages((currentImages) =>
      currentImages.filter((image) => image.product_id !== product.id)
    );

    setSuccessMessage("Proizvod i slike su obrisani.");
    setDeletingProductId("");
  }

  function getProductImages(productId: string) {
    return productImages
      .filter((image) => image.product_id === productId)
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  }

  function getFirstProductImage(productId: string) {
    return getProductImages(productId)[0];
  }

  const filteredProducts = products.filter((product) => {
    const searchValue = searchTerm.toLowerCase().trim();

    if (!searchValue) {
      return true;
    }

    return (
      product.name.toLowerCase().includes(searchValue) ||
      product.category.toLowerCase().includes(searchValue) ||
      (product.product_code ?? "").toLowerCase().includes(searchValue)
    );
  });

  useEffect(() => {
    loadProducts();
  }, []);

  return (
    <main className="admin-products-page min-h-screen bg-transparent">
      <section className="border-b border-white/10 bg-[#061537] px-4 py-6 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <Button asChild variant="ghost" className="mb-3 px-0 text-white hover:bg-white/10 hover:text-white">
              <Link href="/admin">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Nazad na dashboard
              </Link>
            </Button>

            <p className="text-sm uppercase tracking-[0.3em] text-white/60">
              Admin
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
              Proizvodi
            </h1>
          </div>

          <Button variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white" onClick={loadProducts}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Osvježi
          </Button>
        </div>
      </section>

      <section className="px-4 py-8">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[420px_1fr]">
          <Card className="rounded-3xl border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">
                {editingProductId ? "Uredi proizvod" : "Dodaj proizvod"}
              </CardTitle>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmitProduct} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Naziv
                  </label>
                  <Input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Npr. Satenska haljina"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Kategorija
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {categoryOptions.map((item) => (
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
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Cijena KM
                    </label>
                    <Input
                      value={price}
                      onChange={(event) => setPrice(event.target.value)}
                      placeholder="89.90"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Stara cijena
                    </label>
                    <Input
                      value={oldPrice}
                      onChange={(event) => setOldPrice(event.target.value)}
                      placeholder="119.90"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Zaliha
                  </label>
                  <Input
                    value={stock}
                    onChange={(event) => setStock(event.target.value)}
                    placeholder="10"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Velicine
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {sizeOptions.map((item) => (
                      <Button
                        key={item}
                        type="button"
                        variant={
                          selectedSizes.includes(item) ? "default" : "outline"
                        }
                        onClick={() =>
                          toggleValue(item, selectedSizes, setSelectedSizes)
                        }
                      >
                        {item}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Boje
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {colorOptions.map((item) => (
                      <Button
                        key={item}
                        type="button"
                        variant={
                          selectedColors.includes(item) ? "default" : "outline"
                        }
                        onClick={() =>
                          toggleValue(item, selectedColors, setSelectedColors)
                        }
                      >
                        {item}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Slike
                  </label>

                  <div className="rounded-2xl border bg-neutral-50 p-4">
                    {previewImages.length > 0 ? (
                      <div className="mb-4 grid grid-cols-2 gap-3">
                        {previewImages.map((image, index) => (
                          <div
                            key={image.id}
                            className="relative overflow-hidden rounded-2xl border bg-white"
                          >
                            <img
                              src={image.url}
                              alt={`Slika ${index + 1}`}
                              className="h-32 w-full object-cover"
                            />

                            <div className="absolute left-2 top-2 rounded-full bg-white px-2 py-1 text-xs font-medium text-neutral-800">
                              {index === 0 ? "Glavna" : `Slika ${index + 1}`}
                            </div>

                            <button
                              type="button"
                              onClick={() => removePreviewImage(image.id)}
                              className="absolute right-2 top-2 rounded-full bg-white p-1 text-neutral-800 shadow-sm"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : null}

                    <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed bg-white p-6 text-center">
                      <ImagePlus className="mb-2 h-6 w-6 text-neutral-500" />
                      <span className="text-sm font-medium text-neutral-800">
                        Klikni za upload slika
                      </span>
                      <span className="mt-1 text-xs text-neutral-500">
                        Mozes odabrati vise slika odjednom
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(event) => {
                          handleSelectImages(event.target.files);
                          event.target.value = "";
                        }}
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Opis
                  </label>
                  <Textarea
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="Kratak opis proizvoda..."
                    rows={4}
                  />
                </div>

                {successMessage ? (
                  <div className="rounded-2xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                    {successMessage}
                  </div>
                ) : null}

                {errorMessage ? (
                  <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {errorMessage}
                  </div>
                ) : null}

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    type="submit"
                    className="w-full rounded-full"
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Spremanje...
                      </>
                    ) : editingProductId ? (
                      <>
                        <Pencil className="mr-2 h-4 w-4" />
                        Sačuvaj izmjene
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Dodaj proizvod
                      </>
                    )}
                  </Button>

                  {editingProductId ? (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full rounded-full"
                      onClick={resetForm}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Odustani
                    </Button>
                  ) : null}
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-0 shadow-sm">
            <CardHeader className="space-y-4">
              <CardTitle className="text-xl">Lista proizvoda</CardTitle>

              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Pretraži po nazivu, kategoriji ili šifri artikla..."
              />
            </CardHeader>

            <CardContent>
              {isLoading ? (
                <div className="rounded-2xl bg-neutral-50 p-6 text-center text-neutral-600">
                  učitavanje proizvoda...
                </div>
              ) : products.length === 0 ? (
                <div className="rounded-2xl bg-neutral-50 p-6 text-center text-neutral-600">
                  Još nema proizvoda.
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredProducts.map((product) => {
                    const image = getFirstProductImage(product.id);
                    const imageCount = getProductImages(product.id).length;

                    return (
                      <div
                        key={product.id}
                        className="grid gap-4 rounded-3xl border bg-white p-4 md:grid-cols-[90px_1fr_auto]"
                      >
                        <div className="h-24 overflow-hidden rounded-2xl bg-neutral-100">
                          {image ? (
                            <img
                              src={image.image_url}
                              alt={image.alt_text ?? product.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-xs text-neutral-400">
                              Nema slike
                            </div>
                          )}
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-lg font-semibold text-neutral-950">
                              {product.name}
                            </h2>
                            <span
                              className={
                                product.is_active
                                  ? "rounded-full bg-green-100 px-3 py-1 text-xs text-green-700"
                                  : "rounded-full bg-neutral-200 px-3 py-1 text-xs text-neutral-700"
                              }
                            >
                              {product.is_active ? "Aktivan" : "Sakriven"}
                            </span>
                          </div>

                          <p className="mt-1 text-sm text-neutral-600">
                            {product.category} / {product.price.toFixed(2)} KM
                          </p>

                          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
                            Šifra: {product.product_code ?? "-"}
                          </p>

                          <p className="mt-2 line-clamp-2 text-sm text-neutral-500">
                            {product.description ?? "Bez opisa"}
                          </p>

                          <p className="mt-2 text-xs text-neutral-500">
                            Velicine: {(product.sizes ?? []).join(", ") || "-"}
                          </p>

                          <p className="mt-1 text-xs text-neutral-500">
                            Boje: {(product.colors ?? []).join(", ") || "-"}
                          </p>

                          <p className="mt-1 text-xs text-neutral-500">
                            Slike: {imageCount}
                          </p>
                        </div>

                        <div className="flex flex-col gap-2 md:items-end md:justify-center">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => startEditProduct(product)}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Uredi
                          </Button>

                          <Button
                            type="button"
                            variant={product.is_featured ? "default" : "outline"}
                            onClick={() => toggleProductFeatured(product)}
                          >
                            {product.is_featured ? "Skini izdvojeno" : "Izdvoji"}
                          </Button>

                          <Button
                            type="button"
                            variant={product.is_active ? "outline" : "default"}
                            onClick={() => toggleProductActive(product)}
                          >
                            {product.is_active ? "Sakrij" : "Aktiviraj"}
                          </Button>

                          <Button
                            type="button"
                            variant="outline"
                            disabled={deletingProductId === product.id}
                            onClick={() => deleteProduct(product)}
                            className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
                          >
                            {deletingProductId === product.id ? (
                              "Brisanje..."
                            ) : (
                              <>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Obriši
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}




