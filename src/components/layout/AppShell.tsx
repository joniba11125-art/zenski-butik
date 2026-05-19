"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink, Home } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith("/admin");
  const showAdminHomeButton =
    isAdminPage && pathname !== "/admin" && pathname !== "/admin/login";
  const showPublicSiteButton = isAdminPage && pathname !== "/admin/login";

  return (
    <>
      {!isAdminPage ? <Header /> : null}

      {isAdminPage ? <div className="admin-shell">{children}</div> : children}

      {!isAdminPage ? <Footer /> : null}

      {showAdminHomeButton ? (
        <Link
          href="/admin"
          className="fixed left-4 top-1/2 z-[70] hidden -translate-y-1/2 items-center gap-2 rounded-full border bg-neutral-950 px-4 py-3 text-sm font-semibold text-white shadow-2xl transition hover:bg-neutral-800 md:flex"
        >
          <Home className="h-4 w-4" />
          Admin početna
        </Link>
      ) : null}

      {showAdminHomeButton ? (
        <Link
          href="/admin"
          className="fixed bottom-5 left-5 z-[70] flex h-12 w-12 items-center justify-center rounded-full bg-neutral-950 text-white shadow-2xl md:hidden"
          aria-label="Admin početna"
        >
          <Home className="h-5 w-5" />
        </Link>
      ) : null}

      {showPublicSiteButton ? (
        <Link
          href="/"
          target="_blank"
          className="fixed bottom-5 right-5 z-[70] hidden items-center gap-2 rounded-full border bg-[#061537] px-5 py-3 text-sm font-semibold text-white shadow-2xl transition hover:bg-[#0b2052] md:flex"
        >
          <ExternalLink className="h-4 w-4" />
          Pogledaj sajt
        </Link>
      ) : null}

      {showPublicSiteButton ? (
        <Link
          href="/"
          target="_blank"
          className="fixed bottom-5 right-5 z-[70] flex h-12 w-12 items-center justify-center rounded-full bg-[#061537] text-white shadow-2xl md:hidden"
          aria-label="Pogledaj sajt"
        >
          <ExternalLink className="h-5 w-5" />
        </Link>
      ) : null}
    </>
  );
}

