"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Menu, ShoppingBag, X } from "lucide-react";
import { FaFacebookF, FaInstagram } from "react-icons/fa";
import { Button } from "@/components/ui/button";

const navigation = [
  { name: "Početna", href: "/" },
  { name: "Shop", href: "/shop" },
  { name: "O nama", href: "/#about" },
  { name: "Kontakt", href: "/#contact" },
  { name: "FAQ", href: "/#faq" },
];

const socialLinks = [
  {
    name: "Instagram",
    href: "https://www.instagram.com/dressmeup_boutique_/",
    icon: FaInstagram,
  },
  {
    name: "Facebook",
    href: "https://www.facebook.com/p/Dress-Me-Up-61564424618405/",
    icon: FaFacebookF,
  },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#061537]/95 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative h-14 w-14">
            <Image
              src="/dressmeup-logo.png"
              alt="Dress Me Up Boutique"
              fill
              className="object-contain"
              priority
            />
          </div>

          <div>
            <p className="text-xl font-semibold leading-none tracking-tight text-white">
              Dress Me Up
            </p>
            <p className="mt-1 text-xs text-amber-200/80">Boutique Tuzla</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-white/85 md:flex">
          {navigation.map((item) => (
            <Link key={item.name} href={item.href} className="hover:text-amber-200">
              {item.name}
            </Link>
          ))}

          <div className="h-5 w-px bg-white/15" />

          {socialLinks.map((item) => {
            const Icon = item.icon;

            return (
              <a
                key={item.name}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                aria-label={item.name}
                className="flex h-9 w-9 items-center justify-center rounded-full border text-white/85 transition hover:border-amber-200 hover:bg-amber-100 hover:text-neutral-950"
              >
                <Icon className="h-4 w-4" />
              </a>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Button asChild className="rounded-full bg-amber-100 text-neutral-950 hover:bg-amber-200">
            <Link href="/shop">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Kolekcija
            </Link>
          </Button>
        </div>

        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white transition hover:bg-white/20 md:hidden"
          onClick={() => setIsOpen((current) => !current)}
        >
          {isOpen ? <X className="h-6 w-6 text-white" /> : <Menu className="h-6 w-6 text-white" />}
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
              {socialLinks.map((item) => {
                const Icon = item.icon;

                return (
                  <a
                    key={item.name}
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={item.name}
                    className="flex h-10 w-10 items-center justify-center rounded-full border text-neutral-800"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
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


