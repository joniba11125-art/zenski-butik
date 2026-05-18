"use client";

import Link from "next/link";
import { ShoppingBag, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function Header() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    {
      label: "Pocetna",
      href: "/",
    },
    {
      label: "Shop",
      href: "/shop",
    },
    {
      label: "O nama",
      href: "/#about",
    },
    {
      label: "Kontakt",
      href: "/#contact",
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-200 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-white">
            <ShoppingBag className="h-4 w-4" />
          </div>

          <div className="leading-tight">
            <p className="text-sm font-semibold tracking-[0.24em] text-black">
              Dress Me Up
            </p>
            <p className="text-xs text-neutral-500">Premium fashion</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-neutral-700 transition hover:text-black"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:block">
          <Button asChild>
            <Link href="/shop">Pogledaj kolekciju</Link>
          </Button>
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md p-2 text-neutral-700 transition hover:bg-neutral-100 md:hidden"
          onClick={() => setIsOpen((value) => !value)}
          aria-label="Otvori meni"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {isOpen ? (
        <div className="border-t border-neutral-200 bg-white px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-neutral-700 transition hover:text-black"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            <Button asChild className="mt-2">
              <Link href="/shop" onClick={() => setIsOpen(false)}>
                Pogledaj kolekciju
              </Link>
            </Button>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
