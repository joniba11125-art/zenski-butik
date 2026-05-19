"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  Pencil,
  Plus,
  RefreshCcw,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Review = {
  id: string;
  customer_name: string;
  rating: number;
  comment: string;
  is_approved: boolean | null;
  created_at: string;
};

const ratingOptions = [1, 2, 3, 4, 5];

export default function AdminReviewsPage() {
  const router = useRouter();
  const supabase = createClient();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState("");
  const [deletingReviewId, setDeletingReviewId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [customerName, setCustomerName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isApproved, setIsApproved] = useState(true);

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

  async function loadReviews() {
    setIsLoading(true);
    setErrorMessage("");

    const isAdmin = await checkAdmin();

    if (!isAdmin) {
      return;
    }

    const { data, error } = await supabase
      .from("reviews")
      .select("id, customer_name, rating, comment, is_approved, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Greška pri učitavanju recenzija:", error.message);
      setErrorMessage("Recenzije se nisu učitale.");
      setReviews([]);
      setIsLoading(false);
      return;
    }

    setReviews((data as Review[]) ?? []);
    setIsLoading(false);
  }

  function resetForm() {
    setEditingReviewId("");
    setCustomerName("");
    setRating(5);
    setComment("");
    setIsApproved(true);
    setErrorMessage("");
    setSuccessMessage("");
  }

  function startEditReview(review: Review) {
    setEditingReviewId(review.id);
    setCustomerName(review.customer_name);
    setRating(review.rating);
    setComment(review.comment);
    setIsApproved(Boolean(review.is_approved));
    setErrorMessage("");
    setSuccessMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleSubmitReview(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (editingReviewId) {
      await updateReview();
      return;
    }

    await addReview();
  }

  async function addReview() {
    setIsSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    const isAdmin = await checkAdmin();

    if (!isAdmin) {
      setIsSaving(false);
      return;
    }

    if (!customerName.trim() || !comment.trim()) {
      setErrorMessage("Unesi ime kupca i komentar.");
      setIsSaving(false);
      return;
    }

    const { error } = await supabase.from("reviews").insert({
      customer_name: customerName.trim(),
      rating,
      comment: comment.trim(),
      is_approved: isApproved,
    });

    if (error) {
      console.error("Greška pri dodavanju recenzije:", error.message);
      setErrorMessage("Recenzija nije dodana.");
      setIsSaving(false);
      return;
    }

    resetForm();
    setSuccessMessage("Recenzija je dodana.");
    await loadReviews();
    setIsSaving(false);
  }

  async function updateReview() {
    setIsSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    const isAdmin = await checkAdmin();

    if (!isAdmin) {
      setIsSaving(false);
      return;
    }

    if (!customerName.trim() || !comment.trim()) {
      setErrorMessage("Unesi ime kupca i komentar.");
      setIsSaving(false);
      return;
    }

    const { error } = await supabase
      .from("reviews")
      .update({
        customer_name: customerName.trim(),
        rating,
        comment: comment.trim(),
        is_approved: isApproved,
        updated_at: new Date().toISOString(),
      })
      .eq("id", editingReviewId);

    if (error) {
      console.error("Greška pri izmjeni recenzije:", error.message);
      setErrorMessage("Recenzija nije izmijenjena.");
      setIsSaving(false);
      return;
    }

    resetForm();
    setSuccessMessage("Recenzija je izmijenjena.");
    await loadReviews();
    setIsSaving(false);
  }

  async function toggleReviewApproved(review: Review) {
    setErrorMessage("");
    setSuccessMessage("");

    const { error } = await supabase
      .from("reviews")
      .update({
        is_approved: !review.is_approved,
        updated_at: new Date().toISOString(),
      })
      .eq("id", review.id);

    if (error) {
      console.error("Greška pri promjeni statusa recenzije:", error.message);
      setErrorMessage("Status recenzije nije promijenjen.");
      return;
    }

    setReviews((currentReviews) =>
      currentReviews.map((item) =>
        item.id === review.id
          ? { ...item, is_approved: !review.is_approved }
          : item
      )
    );
  }

  async function deleteReview(review: Review) {
    const confirmed = window.confirm(
      `Da li sigurno želiš obrisati recenziju od: ${review.customer_name}?`
    );

    if (!confirmed) {
      return;
    }

    setDeletingReviewId(review.id);
    setErrorMessage("");
    setSuccessMessage("");

    const isAdmin = await checkAdmin();

    if (!isAdmin) {
      setDeletingReviewId("");
      return;
    }

    const { error } = await supabase
      .from("reviews")
      .delete()
      .eq("id", review.id);

    if (error) {
      console.error("Greška pri brisanju recenzije:", error.message);
      setErrorMessage("Recenzija nije obrisana.");
      setDeletingReviewId("");
      return;
    }

    if (editingReviewId === review.id) {
      resetForm();
    }

    setReviews((currentReviews) =>
      currentReviews.filter((item) => item.id !== review.id)
    );

    setSuccessMessage("Recenzija je obrisana.");
    setDeletingReviewId("");
  }

  useEffect(() => {
    loadReviews();
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
              Recenzije
            </h1>
          </div>

          <Button variant="outline" onClick={loadReviews}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Osvježi
          </Button>
        </div>
      </section>

      <section className="px-4 py-8">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[420px_1fr]">
          <Card className="rounded-3xl">
            <CardHeader>
              <CardTitle>
                {editingReviewId ? "Uredi recenziju" : "Dodaj recenziju"}
              </CardTitle>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Ime kupca
                  </label>
                  <Input
                    value={customerName}
                    onChange={(event) => setCustomerName(event.target.value)}
                    placeholder="Npr. Amra K."
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Ocjena
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {ratingOptions.map((item) => (
                      <Button
                        key={item}
                        type="button"
                        variant={rating === item ? "default" : "outline"}
                        onClick={() => setRating(item)}
                      >
                        {item}
                        <Star className="ml-1 h-4 w-4" />
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Status
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant={isApproved ? "default" : "outline"}
                      onClick={() => setIsApproved(true)}
                    >
                      Odobrena
                    </Button>

                    <Button
                      type="button"
                      variant={!isApproved ? "default" : "outline"}
                      onClick={() => setIsApproved(false)}
                    >
                      Sakrivena
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Komentar
                  </label>
                  <Textarea
                    value={comment}
                    onChange={(event) => setComment(event.target.value)}
                    placeholder="Npr. Prelijep kvalitet i brza komunikacija..."
                    rows={5}
                    required
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
                    ) : editingReviewId ? (
                      <>
                        <Pencil className="mr-2 h-4 w-4" />
                        Sačuvaj izmjene
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Dodaj recenziju
                      </>
                    )}
                  </Button>

                  {editingReviewId ? (
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

          <Card className="rounded-3xl">
            <CardHeader>
              <CardTitle>Lista recenzija</CardTitle>
            </CardHeader>

            <CardContent>
              {isLoading ? (
                <div className="rounded-2xl bg-neutral-50 p-6 text-center text-neutral-600">
                  učitavanje recenzija...
                </div>
              ) : reviews.length === 0 ? (
                <div className="rounded-2xl bg-neutral-50 p-6 text-center text-neutral-600">
                  Još nema recenzija.
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className="grid gap-4 rounded-3xl border bg-white p-4 md:grid-cols-[1fr_auto]"
                    >
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-lg font-semibold text-neutral-950">
                            {review.customer_name}
                          </h2>

                          <span
                            className={
                              review.is_approved
                                ? "rounded-full bg-green-100 px-3 py-1 text-xs text-green-700"
                                : "rounded-full bg-neutral-200 px-3 py-1 text-xs text-neutral-700"
                            }
                          >
                            {review.is_approved ? "Odobrena" : "Sakrivena"}
                          </span>
                        </div>

                        <div className="mt-2 flex gap-1">
                          {Array.from({ length: review.rating }).map(
                            (_, index) => (
                              <Star
                                key={index}
                                className="h-4 w-4 fill-neutral-950 text-neutral-950"
                              />
                            )
                          )}
                        </div>

                        <p className="mt-3 text-sm leading-6 text-neutral-600">
                          {review.comment}
                        </p>

                        <p className="mt-2 text-xs text-neutral-500">
                          {new Date(review.created_at).toLocaleDateString(
                            "bs-BA"
                          )}
                        </p>
                      </div>

                      <div className="flex flex-col gap-2 md:items-end md:justify-center">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => startEditReview(review)}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Uredi
                        </Button>

                        <Button
                          type="button"
                          variant={review.is_approved ? "outline" : "default"}
                          onClick={() => toggleReviewApproved(review)}
                        >
                          {review.is_approved ? "Sakrij" : "Odobri"}
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          disabled={deletingReviewId === review.id}
                          onClick={() => deleteReview(review)}
                          className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
                        >
                          {deletingReviewId === review.id ? (
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

