"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  LogOut,
  Mail,
  Phone,
  RefreshCcw,
  Search,
  ShoppingBag,
  Trash2,
  UserRound,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Reservation = {
  id: string;
  product_id: string | null;
  product_code: string | null;
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

const statusOptions = [
  { value: "sve", label: "Sve" },
  { value: "novo", label: "Novo" },
  { value: "kontaktirano", label: "Kontaktirano" },
  { value: "zavrseno", label: "Završeno" },
];

function getStatusLabel(status: string) {
  if (status === "novo") return "Novo";
  if (status === "kontaktirano") return "Kontaktirano";
  if (status === "zavrseno") return "Završeno";
  return status;
}

function getStatusBadgeClass(status: string) {
  if (status === "novo") {
    return "bg-blue-50 text-blue-700 ring-blue-100";
  }

  if (status === "kontaktirano") {
    return "bg-amber-50 text-amber-800 ring-amber-100";
  }

  if (status === "zavrseno") {
    return "bg-green-50 text-green-700 ring-green-100";
  }

  return "bg-neutral-50 text-neutral-700 ring-neutral-100";
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("bs-BA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString("bs-BA", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminReservationsPage() {
  const router = useRouter();
  const supabase = createClient();

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [updatingId, setUpdatingId] = useState("");
  const [deletingId, setDeletingId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("sve");

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
        "id, product_id, product_code, product_name, selected_size, first_name, last_name, phone, email, message, status, created_at"
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Greška pri učitavanju rezervacija:", error.message);
      setErrorMessage("Rezervacije se nisu učitale.");
      setReservations([]);
      setIsLoading(false);
      return;
    }

    setReservations((data as Reservation[]) ?? []);
    setIsLoading(false);
  }

  function getSelectedStaff() {
    const savedStaff = window.localStorage.getItem("dressmeup_selected_staff");

    if (!savedStaff) {
      return null;
    }

    try {
      return JSON.parse(savedStaff) as { id: string; name: string };
    } catch {
      return null;
    }
  }

  async function createActivityLog(reservation: Reservation, status: string) {
    const selectedStaff = getSelectedStaff();

    if (!selectedStaff) {
      return;
    }

    const { error } = await supabase.from("staff_activity_logs").insert({
      staff_member_id: selectedStaff.id,
      staff_member_name: selectedStaff.name,
      action_type: "reservation_status_changed",
      reservation_id: reservation.id,
      product_code: reservation.product_code,
      product_name: reservation.product_name,
      customer_name: `${reservation.first_name} ${reservation.last_name}`,
      note: `${selectedStaff.name} je promijenila status rezervacije ${
        reservation.product_code ?? ""
      } na ${getStatusLabel(status)}.`,
    });

    if (error) {
      console.error("Greška pri upisu aktivnosti:", error.message);
    }
  }

  async function updateReservationStatus(reservationId: string, status: string) {
    setUpdatingId(reservationId);
    setErrorMessage("");

    const reservationForLog = reservations.find(
      (reservation) => reservation.id === reservationId
    );

    const { error } = await supabase
      .from("reservations")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", reservationId);

    if (error) {
      console.error("Greška pri promjeni statusa:", error.message);
      setErrorMessage("Status nije promijenjen. Pokušaj ponovo.");
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

    if (reservationForLog) {
      await createActivityLog(reservationForLog, status);
    }

    setUpdatingId("");
  }

  async function deleteReservation(reservation: Reservation) {
    const confirmed = window.confirm(
      `Da li sigurno želiš obrisati rezervaciju za: ${reservation.product_name}?`
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(reservation.id);
    setErrorMessage("");

    const isAdmin = await checkAdmin();

    if (!isAdmin) {
      setDeletingId("");
      return;
    }

    const { error } = await supabase
      .from("reservations")
      .delete()
      .eq("id", reservation.id);

    if (error) {
      console.error("Greška pri brisanju rezervacije:", error.message);
      setErrorMessage("Rezervacija nije obrisana. Pokušaj ponovo.");
      setDeletingId("");
      return;
    }

    setReservations((currentReservations) =>
      currentReservations.filter((item) => item.id !== reservation.id)
    );

    setDeletingId("");
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  const filteredReservations = useMemo(() => {
    const cleanSearch = searchTerm.toLowerCase().trim();

    return reservations.filter((reservation) => {
      const matchesStatus =
        statusFilter === "sve" || reservation.status === statusFilter;

      const matchesSearch =
        !cleanSearch ||
        reservation.product_name.toLowerCase().includes(cleanSearch) ||
        (reservation.product_code ?? "").toLowerCase().includes(cleanSearch) ||
        `${reservation.first_name} ${reservation.last_name}`
          .toLowerCase()
          .includes(cleanSearch) ||
        reservation.phone.toLowerCase().includes(cleanSearch) ||
        reservation.email.toLowerCase().includes(cleanSearch);

      return matchesStatus && matchesSearch;
    });
  }, [reservations, searchTerm, statusFilter]);

  useEffect(() => {
    loadReservations();
  }, []);

  return (
    <main className="min-h-screen bg-[#101827]">
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
              Rezervacije
            </h1>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white" onClick={loadReservations}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Osvježi
            </Button>

            <Button variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Odjava
            </Button>
          </div>
        </div>
      </section>

      <section className="px-4 py-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-5 grid gap-4 md:grid-cols-4">
            <Card className="rounded-3xl border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm text-neutral-500">
                  Sve rezervacije
                </CardTitle>
                <ShoppingBag className="h-5 w-5 text-neutral-400" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold">{reservations.length}</p>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm text-neutral-500">Nove</CardTitle>
                <Clock3 className="h-5 w-5 text-blue-500" />
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

            <Card className="rounded-3xl border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm text-neutral-500">
                  Kontaktirano
                </CardTitle>
                <Phone className="h-5 w-5 text-amber-600" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold">
                  {
                    reservations.filter(
                      (reservation) => reservation.status === "kontaktirano"
                    ).length
                  }
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm text-neutral-500">
                  Završene
                </CardTitle>
                <CheckCircle2 className="h-5 w-5 text-green-600" />
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

          <Card className="mb-5 rounded-3xl border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                  <input
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Pretraži po kupcu, telefonu, emailu, proizvodu ili šifri..."
                    className="h-12 w-full rounded-full border bg-white pl-11 pr-4 text-sm outline-none focus:border-neutral-950"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  {statusOptions.map((status) => (
                    <button
                      key={status.value}
                      type="button"
                      onClick={() => setStatusFilter(status.value)}
                      className={
                        statusFilter === status.value
                          ? "rounded-full bg-neutral-950 px-4 py-2 text-sm font-semibold text-white"
                          : "rounded-full border bg-white px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
                      }
                    >
                      {status.label}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {errorMessage ? (
            <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {errorMessage}
            </div>
          ) : null}

          {isLoading ? (
            <div className="rounded-3xl bg-white p-10 text-center text-neutral-600 shadow-sm">
              Učitavanje rezervacija...
            </div>
          ) : filteredReservations.length === 0 ? (
            <div className="rounded-3xl bg-white p-10 text-center text-neutral-600 shadow-sm">
              Nema rezervacija za odabrane filtere.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredReservations.map((reservation) => (
                <div
                  key={reservation.id}
                  className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-neutral-200/70"
                >
                  <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-start">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${getStatusBadgeClass(
                            reservation.status
                          )}`}
                        >
                          {getStatusLabel(reservation.status)}
                        </span>

                        {reservation.product_code ? (
                          <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-700">
                            {reservation.product_code}
                          </span>
                        ) : null}

                        <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-500">
                          {formatDate(reservation.created_at)} u{" "}
                          {formatTime(reservation.created_at)}
                        </span>
                      </div>

                      <h2 className="mt-4 text-xl font-semibold text-neutral-950">
                        {reservation.product_name}
                      </h2>

                      <div className="mt-4 grid gap-3 text-sm text-neutral-600 md:grid-cols-2 xl:grid-cols-4">
                        <div className="rounded-2xl bg-neutral-50 p-3">
                          <div className="mb-1 flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-neutral-400">
                            <UserRound className="h-3.5 w-3.5" />
                            Kupac
                          </div>
                          <p className="font-medium text-neutral-950">
                            {reservation.first_name} {reservation.last_name}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-neutral-50 p-3">
                          <div className="mb-1 flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-neutral-400">
                            <Phone className="h-3.5 w-3.5" />
                            Telefon
                          </div>
                          <p className="font-medium text-neutral-950">
                            {reservation.phone}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-neutral-50 p-3">
                          <div className="mb-1 flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-neutral-400">
                            <Mail className="h-3.5 w-3.5" />
                            Email
                          </div>
                          <p className="break-all font-medium text-neutral-950">
                            {reservation.email}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-neutral-50 p-3">
                          <div className="mb-1 text-xs uppercase tracking-[0.15em] text-neutral-400">
                            Veličina
                          </div>
                          <p className="font-medium text-neutral-950">
                            {reservation.selected_size ?? "-"}
                          </p>
                        </div>
                      </div>

                      {reservation.message ? (
                        <div className="mt-3 rounded-2xl border border-amber-100 bg-amber-50/60 p-4 text-sm leading-6 text-neutral-700">
                          <span className="font-semibold text-neutral-950">
                            Napomena kupca:
                          </span>{" "}
                          {reservation.message}
                        </div>
                      ) : null}
                    </div>

                    <div className="flex flex-wrap gap-2 lg:w-48 lg:flex-col">
                      {statusOptions
                        .filter((status) => status.value !== "sve")
                        .map((status) => (
                          <Button
                            key={status.value}
                            type="button"
                            size="sm"
                            variant={
                              reservation.status === status.value
                                ? "default"
                                : "outline"
                            }
                            disabled={updatingId === reservation.id}
                            onClick={() =>
                              updateReservationStatus(
                                reservation.id,
                                status.value
                              )
                            }
                            className="rounded-full lg:w-full"
                          >
                            {updatingId === reservation.id
                              ? "..."
                              : status.label}
                          </Button>
                        ))}

                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={deletingId === reservation.id}
                        onClick={() => deleteReservation(reservation)}
                        className="rounded-full border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800 lg:w-full"
                      >
                        {deletingId === reservation.id ? (
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
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

