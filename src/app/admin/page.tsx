"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  LogOut,
  MessageSquare,
  Package,
  RefreshCcw,
  ShoppingBag,
  User,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type DashboardStats = {
  productsCount: number;
  reservationsCount: number;
  newReservationsCount: number;
  reviewsCount: number;
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const supabase = createClient();

  const [adminEmail, setAdminEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [stats, setStats] = useState<DashboardStats>({
    productsCount: 0,
    reservationsCount: 0,
    newReservationsCount: 0,
    reviewsCount: 0,
  });

  async function checkAdmin() {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      router.push("/admin/login");
      return false;
    }

    setAdminEmail(user.email ?? "");

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

  async function loadStats() {
    setIsLoading(true);
    setErrorMessage("");

    const isAdmin = await checkAdmin();

    if (!isAdmin) {
      return;
    }

    const [
      productsResult,
      reservationsResult,
      newReservationsResult,
      reviewsResult,
    ] = await Promise.all([
      supabase
        .from("products")
        .select("id", { count: "exact", head: true }),
      supabase
        .from("reservations")
        .select("id", { count: "exact", head: true }),
      supabase
        .from("reservations")
        .select("id", { count: "exact", head: true })
        .eq("status", "novo"),
      supabase
        .from("reviews")
        .select("id", { count: "exact", head: true }),
    ]);

    if (
      productsResult.error ||
      reservationsResult.error ||
      newReservationsResult.error ||
      reviewsResult.error
    ) {
      console.error("Greska pri ucitavanju statistike:", {
        productsError: productsResult.error?.message,
        reservationsError: reservationsResult.error?.message,
        newReservationsError: newReservationsResult.error?.message,
        reviewsError: reviewsResult.error?.message,
      });

      setErrorMessage("Statistika se nije ucitala.");
      setIsLoading(false);
      return;
    }

    setStats({
      productsCount: productsResult.count ?? 0,
      reservationsCount: reservationsResult.count ?? 0,
      newReservationsCount: newReservationsResult.count ?? 0,
      reviewsCount: reviewsResult.count ?? 0,
    });

    setIsLoading(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <main className="min-h-screen bg-neutral-50">
      <section className="border-b bg-white px-4 py-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-neutral-500">
              Zenski butik
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-950">
              Admin dashboard
            </h1>

            {adminEmail ? (
              <p className="mt-1 text-sm text-neutral-600">
                Prijavljen: {adminEmail}
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={loadStats}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Osvjezi
            </Button>

            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Odjava
            </Button>
          </div>
        </div>
      </section>

      <section className="px-4 py-8">
        <div className="mx-auto max-w-7xl">
          {errorMessage ? (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {errorMessage}
            </div>
          ) : null}

          <div className="mb-6 grid gap-4 md:grid-cols-4">
            <Card className="rounded-3xl">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Proizvodi</CardTitle>
                <Package className="h-5 w-5 text-neutral-500" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold">
                  {isLoading ? "..." : stats.productsCount}
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-3xl">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Rezervacije</CardTitle>
                <ShoppingBag className="h-5 w-5 text-neutral-500" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold">
                  {isLoading ? "..." : stats.reservationsCount}
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-3xl">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Nove</CardTitle>
                <ShoppingBag className="h-5 w-5 text-neutral-500" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold">
                  {isLoading ? "..." : stats.newReservationsCount}
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-3xl">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Recenzije</CardTitle>
                <MessageSquare className="h-5 w-5 text-neutral-500" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold">
                  {isLoading ? "..." : stats.reviewsCount}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card className="rounded-3xl border-neutral-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100">
                  <Package className="h-6 w-6 text-neutral-950" />
                </div>
                <CardTitle>Proizvodi</CardTitle>
              </CardHeader>

              <CardContent>
                <p className="mb-6 text-sm leading-6 text-neutral-600">
                  Dodaj, uredi, obrisi, aktiviraj i izdvoji proizvode.
                </p>

                <Button asChild className="w-full rounded-full">
                  <Link href="/admin/products">Otvori proizvode</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-neutral-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100">
                  <ShoppingBag className="h-6 w-6 text-neutral-950" />
                </div>
                <CardTitle>Rezervacije</CardTitle>
              </CardHeader>

              <CardContent>
                <p className="mb-6 text-sm leading-6 text-neutral-600">
                  Pregledaj nove rezervacije i mijenjaj statuse narudzbi.
                </p>

                <Button asChild className="w-full rounded-full">
                  <Link href="/admin/reservations">Otvori rezervacije</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-neutral-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100">
                  <MessageSquare className="h-6 w-6 text-neutral-950" />
                </div>
                <CardTitle>Recenzije</CardTitle>
              </CardHeader>

              <CardContent>
                <p className="mb-6 text-sm leading-6 text-neutral-600">
                  Dodaj, uredi, sakrij ili odobri recenzije kupaca.
                </p>

                <Button asChild className="w-full rounded-full">
                  <Link href="/admin/reviews">Otvori recenzije</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6 rounded-3xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Admin nalog</CardTitle>
              <User className="h-5 w-5 text-neutral-500" />
            </CardHeader>

            <CardContent>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm text-neutral-500">Trenutni admin</p>
                  <p className="mt-1 font-medium text-neutral-950">
                    {adminEmail || "Ucitavanje..."}
                  </p>
                </div>

                <Button variant="outline" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Odjava
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
