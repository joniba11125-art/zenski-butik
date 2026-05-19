"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ImagePlus, Loader2, RefreshCcw, UserPlus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type StaffMember = {
  id: string;
  name: string;
  is_active: boolean | null;
  created_at: string;
};

function createSafeFileName(fileName: string) {
  const extension = fileName.split(".").pop() || "jpg";
  const baseName = fileName
    .replace(/\.[^/.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `hero-${baseName}-${Date.now()}.${extension}`;
}

function getStoragePathFromPublicUrl(url: string) {
  const marker = "/storage/v1/object/public/product-images/";
  const markerIndex = url.indexOf(marker);

  if (markerIndex === -1) {
    return "";
  }

  return decodeURIComponent(url.slice(markerIndex + marker.length));
}

export default function AdminSettingsPage() {
  const router = useRouter();
  const supabase = createClient();

  const [heroImageUrl, setHeroImageUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [newStaffName, setNewStaffName] = useState("");
  const [staffMessage, setStaffMessage] = useState("");

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

  async function loadSettings() {
    setIsLoading(true);
    setErrorMessage("");

    const isAdmin = await checkAdmin();

    if (!isAdmin) {
      return;
    }

    const { data, error } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "hero_image_url")
      .single();

    if (error) {
      console.error("Greška pri učitavanju postavki:", error.message);
      setErrorMessage("Postavke se nisu učitale.");
      setIsLoading(false);
      return;
    }

    setHeroImageUrl(data?.value ?? "");
    setPreviewUrl(data?.value ?? "");
    setSelectedFile(null);

    const { data: staffData, error: staffError } = await supabase
      .from("staff_members")
      .select("id, name, is_active, created_at")
      .order("created_at", { ascending: false });

    if (staffError) {
      console.error("Greška pri učitavanju radnica:", staffError.message);
      setStaffMembers([]);
    } else {
      setStaffMembers((staffData as StaffMember[]) ?? []);
    }

    setIsLoading(false);
  }

  async function deleteOldHeroImage(oldImageUrl: string, newImageUrl: string) {
    if (!oldImageUrl || oldImageUrl === newImageUrl) {
      return;
    }

    const oldPath = getStoragePathFromPublicUrl(oldImageUrl);

    if (!oldPath) {
      return;
    }

    if (!oldPath.startsWith("hero/")) {
      return;
    }

    const { error } = await supabase.storage
      .from("product-images")
      .remove([oldPath]);

    if (error) {
      console.error("Greška pri brisanju stare hero slike:", error.message);
    }
  }

  async function uploadHeroImage() {
    if (!selectedFile) {
      return heroImageUrl;
    }

    const safeFileName = createSafeFileName(selectedFile.name);
    const filePath = `hero/${safeFileName}`;

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(filePath, selectedFile, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      console.error("Greška pri uploadu hero slike:", uploadError.message);
      throw new Error("Slika nije uploadovana.");
    }

    const { data } = supabase.storage
      .from("product-images")
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  async function saveSettings() {
    setIsSaving(true);
    setSuccessMessage("");
    setErrorMessage("");

    const isAdmin = await checkAdmin();

    if (!isAdmin) {
      setIsSaving(false);
      return;
    }

    try {
      const oldHeroImageUrl = heroImageUrl;
      const finalImageUrl = await uploadHeroImage();

      const { error } = await supabase.from("site_settings").upsert({
        key: "hero_image_url",
        value: finalImageUrl,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        console.error("Greška pri čuvanju postavki:", error.message);
        setErrorMessage("Postavke nisu sačuvane.");
        setIsSaving(false);
        return;
      }

      if (selectedFile) {
        await deleteOldHeroImage(oldHeroImageUrl, finalImageUrl);
      }

      setHeroImageUrl(finalImageUrl);
      setPreviewUrl(finalImageUrl);
      setSelectedFile(null);
      setSuccessMessage("Početna slika je sačuvana.");
    } catch (error) {
      console.error("Greška pri spremanju:", error);
      setErrorMessage("Slika nije uploadovana.");
    }

    setIsSaving(false);
  }

  async function addStaffMember() {
    setStaffMessage("");
    setErrorMessage("");

    const isAdmin = await checkAdmin();

    if (!isAdmin) {
      return;
    }

    const cleanName = newStaffName.trim();

    if (!cleanName) {
      setStaffMessage("Unesi ime radnice.");
      return;
    }

    const { error } = await supabase.from("staff_members").insert({
      name: cleanName,
      is_active: true,
    });

    if (error) {
      console.error("Greška pri dodavanju radnice:", error.message);
      setStaffMessage("Radnica nije dodana.");
      return;
    }

    setNewStaffName("");
    setStaffMessage("Radnica je dodana.");
    await loadSettings();
  }

  async function toggleStaffMember(staff: StaffMember) {
    setStaffMessage("");
    setErrorMessage("");

    const isAdmin = await checkAdmin();

    if (!isAdmin) {
      return;
    }

    const { error } = await supabase
      .from("staff_members")
      .update({
        is_active: !staff.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", staff.id);

    if (error) {
      console.error("Greška pri promjeni statusa radnice:", error.message);
      setStaffMessage("Status radnice nije promijenjen.");
      return;
    }

    setStaffMembers((currentStaff) =>
      currentStaff.map((item) =>
        item.id === staff.id ? { ...item, is_active: !staff.is_active } : item
      )
    );
  }

  useEffect(() => {
    loadSettings();
  }, []);

  return (
    <main className="min-h-screen bg-neutral-50">
      <section className="border-b bg-white px-4 py-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <Button asChild variant="ghost" className="mb-3 px-0">
              <Link href="/admin">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Nazad na dashboard
              </Link>
            </Button>

            <p className="text-sm uppercase tracking-[0.3em] text-neutral-500">
              Admin
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-950">
              Postavke sajta
            </h1>
          </div>

          <Button variant="outline" onClick={loadSettings}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Osvježi
          </Button>
        </div>
      </section>

      <section className="px-4 py-8">
        <div className="mx-auto max-w-4xl">
          <Card className="rounded-3xl">
            <CardHeader>
              <CardTitle>Početna hero slika</CardTitle>
            </CardHeader>

            <CardContent className="space-y-5">
              {isLoading ? (
                <div className="rounded-2xl bg-neutral-50 p-6 text-center text-neutral-600">
                  Učitavanje postavki...
                </div>
              ) : (
                <>
                  {previewUrl ? (
                    <div className="relative overflow-hidden rounded-3xl bg-neutral-100">
                      <Image
                        src={previewUrl}
                        alt="Početna hero slika"
                        width={1200}
                        height={800}
                        className="h-80 w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="rounded-3xl bg-neutral-100 p-10 text-center text-neutral-500">
                      Nema slike.
                    </div>
                  )}

                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed bg-neutral-50 p-8 text-center">
                    <ImagePlus className="mb-3 h-8 w-8 text-neutral-500" />
                    <span className="text-sm font-medium text-neutral-900">
                      Klikni za upload nove početne slike
                    </span>
                    <span className="mt-1 text-xs text-neutral-500">
                      Preporuka: horizontalna slika, dobra rezolucija
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(event) => {
                        const file = event.target.files?.[0] ?? null;
                        setSelectedFile(file);

                        if (file) {
                          setPreviewUrl(URL.createObjectURL(file));
                        }
                      }}
                    />
                  </label>

                  {successMessage ? (
                    <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                      {successMessage}
                    </div>
                  ) : null}

                  {errorMessage ? (
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                      {errorMessage}
                    </div>
                  ) : null}

                  <Button
                    type="button"
                    className="w-full rounded-full"
                    disabled={isSaving}
                    onClick={saveSettings}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Spremanje...
                      </>
                    ) : (
                      "Sačuvaj početnu sliku"
                    )}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="mt-6 rounded-3xl">
            <CardHeader>
              <CardTitle>Radnice</CardTitle>
            </CardHeader>

            <CardContent className="space-y-5">
              <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                <input
                  value={newStaffName}
                  onChange={(event) => setNewStaffName(event.target.value)}
                  placeholder="Ime radnice, npr. Emina"
                  className="h-11 rounded-full border bg-white px-4 text-sm outline-none focus:border-neutral-950"
                />

                <Button
                  type="button"
                  className="rounded-full"
                  onClick={addStaffMember}
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Dodaj radnicu
                </Button>
              </div>

              {staffMessage ? (
                <div className="rounded-2xl border bg-neutral-50 p-4 text-sm text-neutral-700">
                  {staffMessage}
                </div>
              ) : null}

              {staffMembers.length === 0 ? (
                <div className="rounded-2xl bg-neutral-50 p-6 text-center text-neutral-600">
                  Još nema dodanih radnica.
                </div>
              ) : (
                <div className="space-y-3">
                  {staffMembers.map((staff) => (
                    <div
                      key={staff.id}
                      className="flex flex-col gap-3 rounded-2xl border bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="font-medium text-neutral-950">
                          {staff.name}
                        </p>
                        <p className="mt-1 text-xs text-neutral-500">
                          {staff.is_active ? "Aktivna" : "Sakrivena"}
                        </p>
                      </div>

                      <Button
                        type="button"
                        variant={staff.is_active ? "outline" : "default"}
                        className="rounded-full"
                        onClick={() => toggleStaffMember(staff)}
                      >
                        {staff.is_active ? "Sakrij" : "Aktiviraj"}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}

