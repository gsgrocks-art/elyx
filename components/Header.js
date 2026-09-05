import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { getSettings } from "@/lib/settings";
import { listCategories } from "@/lib/categories";
import { buildContactUrl } from "@/lib/whatsapp";
import CategoryTabs from "./CategoryTabs";
import SearchBar from "./SearchBar";

export default function Header() {
  const settings = getSettings();
  const categories = listCategories();
  const contactUrl = buildContactUrl(
    settings?.whatsappNumber,
    `Hi ${settings?.businessName || ""}, I'd like to know more about your jewellery.`
  );

  return (
    <header className="sticky top-0 z-20 border-b border-[var(--color-border)] bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          {settings?.logoUrl ? (
            <Image
              src={settings.logoUrl}
              alt={settings.businessName || "Logo"}
              width={44}
              height={44}
              className="h-11 w-11 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-primary)] font-heading text-lg text-[var(--color-accent)]">
              {(settings?.businessName || "J").charAt(0)}
            </div>
          )}
          <div>
            <div className="font-heading text-lg leading-tight text-[var(--color-primary)] sm:text-xl">
              {settings?.businessName || "Jewellery Catalog"}
            </div>
            {settings?.websiteUrl ? (
              <div className="text-xs text-neutral-400">{settings.websiteUrl.replace(/^https?:\/\//, "")}</div>
            ) : null}
          </div>
        </Link>

        <div className="order-3 w-full sm:order-2 sm:mx-2 sm:max-w-md sm:flex-1">
          <Suspense fallback={<div className="h-9" />}>
            <SearchBar />
          </Suspense>
        </div>

        {contactUrl ? (
          <a
            href={contactUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="order-2 ml-auto inline-flex items-center gap-2 rounded-full bg-[#25D366] px-3 py-1.5 text-xs font-medium text-white transition hover:opacity-90 sm:order-3 sm:ml-0"
          >
            WhatsApp Us
          </a>
        ) : null}
      </div>

      <div className="mx-auto max-w-6xl">
        <CategoryTabs categories={categories} />
      </div>
    </header>
  );
}
