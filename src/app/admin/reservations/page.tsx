"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, LogOut, RefreshCcw, ShoppingBag } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Reservation = {
  id: string;
  product_id: string | null;
  product_name: string;
  selected_size: string | null;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  message: string | null;
  status: string;
  created_at: string;
};

const statusOptions = ["novo", "kontaktirano", "zavrseno"];

export default function AdminReservationsPage() {
  const router = useRouter();
  const supabase = createClient();

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [updatingId, setUpdatingId] = useState("");

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

  async function loadReservations() {
    setIsLoading(true);
    setErrorMessage("");

    const isAdmin = await checkAdmin();

    if (!isAdmin) {
      return;
    }

    const { data, error } = await supabase
      .from("reservations")
      .select(
        "id, product_id, product_name, selected_size, first_name, last_name, phone, email, message, status, created_at"
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Greska pri ucitavanju rezervacija:", error.message);
      setErrorMessage("Rezervacije se nisu ucitale.");
      setReservations([]);
      setIsLoading(false);
      return;
    }

    setReservations((data as Reservation[]) ?? []);
    setIsLoading(false);
  }

  async function updateReservationStatus(reservationId: string, status: string) {
    setUpdatingId(reservationId);
    setErrorMessage("");

    const { error } = await supabase
      .from("reservations")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", reservationId);

    if (error) {
      console.error("Greska pri promjeni statusa:", error.message);
      setErrorMessage("Status nije promijenjen. Pokusaj ponovo.");
      setUpdatingId("");
      return;
    }

    setReservations((currentReservations) =>
      currentReservations.map((reservation) =>
        reservation.id === reservationId
          ? { ...reservation, status }
          : reservation
      )
    );

    setUpdatingId("");
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  useEffect(() => {
    loadReservations();
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
              Rezervacije
            </h1>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={loadReservations}>
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
          <div className="mb-6 grid gap-4 md:grid-cols-3">
            <Card className="rounded-3xl">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Sve rezervacije</CardTitle>
                <ShoppingBag className="h-5 w-5 text-neutral-500" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold">
                  {reservations.length}
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-3xl">
              <CardHeader>
                <CardTitle className="text-base">Nove</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold">
                  {
                    reservations.filter(
                      (reservation) => reservation.status === "novo"
                    ).length
                  }
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-3xl">
              <CardHeader>
                <CardTitle className="text-base">Zavrsene</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold">
                  {
                    reservations.filter(
                      (reservation) => reservation.status === "zavrseno"
                    ).length
                  }
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="rounded-3xl">
            <CardHeader>
              <CardTitle>Inbox rezervacija</CardTitle>
            </CardHeader>

            <CardContent>
              {isLoading ? (
                <div className="rounded-2xl bg-neutral-50 p-6 text-center text-neutral-600">
                  Ucitavanje rezervacija...
                </div>
              ) : errorMessage ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
                  {errorMessage}
                </div>
              ) : reservations.length === 0 ? (
                <div className="rounded-2xl bg-neutral-50 p-6 text-center text-neutral-600">
                  Jos nema rezervacija.
                </div>
              ) : (
                <div className="space-y-4">
                  {reservations.map((reservation) => (
                    <div
                      key={reservation.id}
                      className="rounded-3xl border bg-white p-5"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-lg font-semibold text-neutral-950">
                              {reservation.product_name}
                            </h2>

                            <span className="rounded-full bg-neutral-950 px-3 py-1 text-xs text-white">
                              {reservation.status}
                            </span>
                          </div>

                          <p className="mt-2 text-sm text-neutral-600">
                            Kupac: {reservation.first_name}{" "}
                            {reservation.last_name}
                          </p>

                          <p className="mt-1 text-sm text-neutral-600">
                            Velicina: {reservation.selected_size ?? "-"}
                          </p>

                          <p className="mt-1 text-sm text-neutral-600">
                            Telefon: {reservation.phone}
                          </p>

                          <p className="mt-1 text-sm text-neutral-600">
                            Email: {reservation.email}
                          </p>

                          <p className="mt-1 text-sm text-neutral-600">
                            Datum:{" "}
                            {new Date(
                              reservation.created_at
                            ).toLocaleDateString("bs-BA")}
                          </p>

                          {reservation.message ? (
                            <div className="mt-4 rounded-2xl bg-neutral-50 p-4 text-sm leading-6 text-neutral-700">
                              {reservation.message}
                            </div>
                          ) : null}
                        </div>

                        <div className="flex flex-wrap gap-2 lg:justify-end">
                          {statusOptions.map((status) => (
                            <Button
                              key={status}
                              type="button"
                              size="sm"
                              variant={
                                reservation.status === status
                                  ? "default"
                                  : "outline"
                              }
                              disabled={updatingId === reservation.id}
                              onClick={() =>
                                updateReservationStatus(reservation.id, status)
                              }
                            >
                              {updatingId === reservation.id ? "..." : status}
                            </Button>
                          ))}
                        </div>
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
