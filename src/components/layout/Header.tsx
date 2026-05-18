"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, ShoppingBag, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const navigation = [
  { name: "Pocetna", href: "/" },
  { name: "Shop", href: "/shop" },
  { name: "O nama", href: "/#about" },
  { name: "Kontakt", href: "/#contact" },
];

const socialLinks = [
  {
    name: "Instagram",
    label: "IG",
    href: "https://www.instagram.com/dressmeup_boutique_/",
  },
  {
    name: "Facebook",
    label: "FB",
    href: "https://www.facebook.com/p/Dress-Me-Up-61564424618405/",
  },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-neutral-950 text-sm font-semibold text-white">
            DMU
          </div>

          <div>
            <p className="text-xl font-semibold leading-none tracking-tight text-neutral-950">
              Dress Me Up
            </p>
            <p className="mt-1 text-xs text-neutral-500">
              Boutique Tuzla
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-neutral-700 md:flex">
          {navigation.map((item) => (
            <Link key={item.name} href={item.href} className="hover:text-black">
              {item.name}
            </Link>
          ))}

          <div className="h-5 w-px bg-neutral-200" />

          {socialLinks.map((item) => (
            <a
              key={item.name}
              href={item.href}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border px-3 py-1 text-xs font-semibold text-neutral-700 hover:border-neutral-950 hover:text-neutral-950"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Button asChild className="rounded-full">
            <Link href="/shop">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Kolekcija
            </Link>
          </Button>
        </div>

        <button
          type="button"
          className="rounded-full border p-2 md:hidden"
          onClick={() => setIsOpen((current) => !current)}
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {isOpen ? (
        <div className="border-t bg-white px-4 py-5 md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-base font-medium text-neutral-800"
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}

            <div className="flex gap-2 pt-2">
              {socialLinks.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border px-4 py-2 text-sm font-semibold"
                >
                  {item.label}
                </a>
              ))}
            </div>

            <Button asChild className="mt-2 rounded-full">
              <Link href="/shop" onClick={() => setIsOpen(false)}>
                Pogledaj kolekciju
              </Link>
            </Button>
          </div>
        </div>
      ) : null}
    </header>
  );
}
