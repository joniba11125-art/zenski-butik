"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  BarChart3,
  ClipboardList,
  LogOut,
  MessageSquare,
  Package,
  RefreshCcw,
  Settings,
  ShoppingBag,
  User,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { StaffSelector } from "@/components/admin/StaffSelector";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type DashboardStats = {
  productsCount: number;
  reservationsCount: number;
  newReservationsCount: number;
  reviewsCount: number;
};

const quickLinks = [
  {
    title: "Proizvodi",
    description: "Dodaj, uredi, obriši i izdvoji artikle.",
    href: "/admin/products",
    icon: Package,
  },
  {
    title: "Rezervacije",
    description: "Pregled narudžbi, statusi i kontakt kupaca.",
    href: "/admin/reservations",
    icon: ShoppingBag,
  },
  {
    title: "Recenzije",
    description: "Upravljanje recenzijama kupaca.",
    href: "/admin/reviews",
    icon: MessageSquare,
  },
  {
    title: "Postavke",
    description: "Početna slika, radnice i osnovne postavke.",
    href: "/admin/settings",
    icon: Settings,
  },
  {
    title: "Dnevni izvještaj",
    description: "Aktivnosti radnica i dnevne napomene.",
    href: "/admin/daily-report",
    icon: ClipboardList,
  },
];

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
      supabase.from("products").select("id", { count: "exact", head: true }),
      supabase.from("reservations").select("id", { count: "exact", head: true }),
      supabase
        .from("reservations")
        .select("id", { count: "exact", head: true })
        .eq("status", "novo"),
      supabase.from("reviews").select("id", { count: "exact", head: true }),
    ]);

    if (
      productsResult.error ||
      reservationsResult.error ||
      newReservationsResult.error ||
      reviewsResult.error
    ) {
      setErrorMessage("Statistika se nije učitala.");
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
    <main className="min-h-screen bg-transparent">
      <section className="border-b border-white/10 bg-[#061537] px-4 py-7 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-white/60">
              Dress Me Up
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white md:text-4xl">
              Admin dashboard
            </h1>

            {adminEmail ? (
              <p className="mt-2 text-sm text-white/65">
                Prijavljen: {adminEmail}
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              className="border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white"
              onClick={loadStats}
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              Osvježi
            </Button>

            <Button
              variant="outline"
              className="border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white"
              onClick={handleLogout}
            >
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

          <div className="mb-6 grid gap-6 lg:grid-cols-[1fr_360px]">
            <Card className="rounded-[2rem] border-0 bg-white shadow-sm">
              <CardContent className="p-7 md:p-8">
                <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#061537] text-white">
                      <BarChart3 className="h-6 w-6" />
                    </div>

                    <h2 className="text-2xl font-semibold text-neutral-950">
                      Pregled sistema
                    </h2>

                    <p className="mt-3 max-w-2xl text-sm leading-7 text-neutral-600">
                      Ovdje pratiš proizvode, rezervacije, recenzije, radnice i
                      dnevne aktivnosti butika.
                    </p>
                  </div>

                  <Button asChild className="rounded-full">
                    <Link href="/admin/reservations">
                      Otvori rezervacije
                    </Link>
                  </Button>
                </div>

                <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-3xl bg-neutral-50 p-5">
                    <p className="text-sm text-neutral-500">Proizvodi</p>
                    <p className="mt-2 text-3xl font-semibold text-neutral-950">
                      {isLoading ? "..." : stats.productsCount}
                    </p>
                  </div>

                  <div className="rounded-3xl bg-neutral-50 p-5">
                    <p className="text-sm text-neutral-500">Rezervacije</p>
                    <p className="mt-2 text-3xl font-semibold text-neutral-950">
                      {isLoading ? "..." : stats.reservationsCount}
                    </p>
                  </div>

                  <div className="rounded-3xl bg-blue-50 p-5">
                    <p className="text-sm text-blue-700">Nove rezervacije</p>
                    <p className="mt-2 text-3xl font-semibold text-blue-900">
                      {isLoading ? "..." : stats.newReservationsCount}
                    </p>
                  </div>

                  <div className="rounded-3xl bg-neutral-50 p-5">
                    <p className="text-sm text-neutral-500">Recenzije</p>
                    <p className="mt-2 text-3xl font-semibold text-neutral-950">
                      {isLoading ? "..." : stats.reviewsCount}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[2rem] border-0 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="h-5 w-5 text-neutral-500" />
                  Admin nalog
                </CardTitle>
              </CardHeader>

              <CardContent>
                <p className="text-sm text-neutral-500">Trenutni admin</p>
                <p className="mt-1 break-all font-medium text-neutral-950">
                  {adminEmail || "Učitavanje..."}
                </p>

                <Button
                  variant="outline"
                  className="mt-6 w-full rounded-full"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Odjava
                </Button>
              </CardContent>
            </Card>
          </div>

          <StaffSelector />

          <div className="mt-6">
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-white/50">
                  Navigacija
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  Brzi pristup
                </h2>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              {quickLinks.map((item) => {
                const Icon = item.icon;

                return (
                  <Card
                    key={item.href}
                    className="rounded-[1.75rem] border-0 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    <CardHeader>
                      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100">
                        <Icon className="h-6 w-6 text-neutral-950" />
                      </div>

                      <CardTitle>{item.title}</CardTitle>
                    </CardHeader>

                    <CardContent>
                      <p className="mb-6 min-h-12 text-sm leading-6 text-neutral-600">
                        {item.description}
                      </p>

                      <Button asChild className="w-full rounded-full">
                        <Link href={item.href}>Otvori</Link>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
