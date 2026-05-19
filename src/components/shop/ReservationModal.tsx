"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type ReservationProduct = {
  id: string;
  product_code?: string | null;
  name: string;
  category: string;
  price: number;
  oldPrice?: number;
  description: string;
  image: string;
  sizes: string[];
};

type ReservationModalProps = {
  product: ReservationProduct;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const reservationSchema = z.object({
  firstName: z.string().min(2, "Ime mora imati najmanje 2 karaktera."),
  lastName: z.string().min(2, "Prezime mora imati najmanje 2 karaktera."),
  phone: z.string().min(6, "Telefon mora imati najmanje 6 karaktera."),
  email: z.string().email("Unesi ispravan email."),
  message: z.string().optional(),
});

type ReservationFormValues = z.infer<typeof reservationSchema>;

function formatPhoneNumber(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 10);

  if (digits.length <= 3) {
    return digits;
  }

  if (digits.length <= 5) {
    return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  }

  if (digits.length <= 7) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
  }

  return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(
    5,
    7
  )}-${digits.slice(7)}`;
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value
  );
}

export function ReservationModal({
  product,
  open,
  onOpenChange,
}: ReservationModalProps) {
  const supabase = createClient();

  const [selectedSize, setSelectedSize] = useState(product.sizes[0] ?? "");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<ReservationFormValues>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      message: "",
    },
  });

  async function sendReservationEmail(values: ReservationFormValues) {
    const response = await fetch("/api/reservations/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        productCode: product.product_code ?? null,
        productName: product.name,
        selectedSize: selectedSize || null,
        firstName: values.firstName,
        lastName: values.lastName,
        phone: values.phone,
        email: values.email,
        message: values.message || null,
      }),
    });

    if (!response.ok) {
      throw new Error("Email nije poslan.");
    }
  }

  async function onSubmit(values: ReservationFormValues) {
    setSuccessMessage("");
    setErrorMessage("");

    const payload = {
      product_id: isUuid(product.id) ? product.id : null,
      product_code: product.product_code ?? null,
      product_name: product.name,
      selected_size: selectedSize || null,
      first_name: values.firstName,
      last_name: values.lastName,
      phone: values.phone,
      email: values.email,
      message: values.message || null,
      status: "novo",
    };

    const { error } = await supabase.from("reservations").insert(payload);

    if (error) {
      console.error("Greska pri slanju rezervacije:", error.message);
      setErrorMessage(
        "Rezervacija nije poslana. Provjeri podatke i pokusaj ponovo."
      );
      return;
    }

    try {
      await sendReservationEmail(values);
      setSuccessMessage(
        "Rezervacija je poslana. Potvrda je poslana na email."
      );
    } catch (emailError) {
      console.error("Greska pri slanju emaila:", emailError);
      setSuccessMessage(
        "Rezervacija je poslana, ali email potvrda trenutno nije poslana."
      );
    }

    reset();
  }

  function closeModal(value: boolean) {
    onOpenChange(value);

    if (!value) {
      setSuccessMessage("");
      setErrorMessage("");
      reset();
      setSelectedSize(product.sizes[0] ?? "");
    }
  }

  return (
    <Dialog open={open} onOpenChange={closeModal}>
      <DialogContent className="max-w-xl rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Rezerviši proizvod</DialogTitle>
          <DialogDescription>
            Popuni podatke i poslat ćemo ti potvrdu rezervacije.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-2xl bg-neutral-50 p-4">
          <p className="text-sm uppercase tracking-[0.25em] text-neutral-500">
            Proizvod
          </p>
          <p className="mt-1 text-lg font-semibold text-neutral-950">
            {product.name}
          </p>
          <p className="text-sm text-neutral-600">
            {product.price.toFixed(2)} KM
          </p>
        </div>

        {product.sizes.length > 0 ? (
          <div>
            <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-neutral-500">
              Velicina
            </p>

            <div className="flex flex-wrap gap-2">
              {product.sizes.map((size) => (
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
        ) : null}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">Ime</label>
              <Input placeholder="Unesi ime" {...register("firstName")} />
              {errors.firstName ? (
                <p className="mt-1 text-sm text-red-600">
                  {errors.firstName.message}
                </p>
              ) : null}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Prezime</label>
              <Input placeholder="Unesi prezime" {...register("lastName")} />
              {errors.lastName ? (
                <p className="mt-1 text-sm text-red-600">
                  {errors.lastName.message}
                </p>
              ) : null}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">Telefon</label>
              <Input
                placeholder="061-23-45-67"
                {...register("phone")}
                onChange={(event) => {
                  const formattedPhone = formatPhoneNumber(event.target.value);
                  setValue("phone", formattedPhone, {
                    shouldValidate: true,
                    shouldDirty: true,
                  });
                }}
              />
              {errors.phone ? (
                <p className="mt-1 text-sm text-red-600">
                  {errors.phone.message}
                </p>
              ) : null}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Email</label>
              <Input placeholder="email@example.com" {...register("email")} />
              {errors.email ? (
                <p className="mt-1 text-sm text-red-600">
                  {errors.email.message}
                </p>
              ) : null}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Poruka opcionalno
            </label>
            <Textarea
              placeholder="Npr. zanima me dostupnost, Dostava ili preuzimanje..."
              rows={4}
              {...register("message")}
            />
          </div>

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
            type="submit"
            className="w-full rounded-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Slanje...
              </>
            ) : (
              "Pošalji rezervaciju"
            )}
          </Button>

          <p className="text-center text-xs leading-5 text-neutral-500">
            Nakon što pošaljete rezervaciju, kontaktirat ćemo vas za potvrdu
            narudžbe putem telefona ili emaila.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}





