"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function CategoryTabs({ categories }) {
  const pathname = usePathname();

  const isActive = (slug) => {
    if (!slug) return pathname === "/";
    return pathname === `/category/${slug}`;
  };

  return (
    <nav className="scrollbar-hide flex gap-2 overflow-x-auto px-4 pb-3 pt-1 sm:px-6">
      <Link
        href="/"
        className={`whitespace-nowrap rounded-full border px-4 py-1.5 text-sm transition ${
          isActive(null)
            ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
            : "border-[var(--color-border)] bg-white text-[var(--foreground)] hover:border-[var(--color-primary)]"
        }`}
      >
        All
      </Link>
      {categories.map((cat) => (
        <Link
          key={cat.id}
          href={`/category/${cat.slug}`}
          className={`whitespace-nowrap rounded-full border px-4 py-1.5 text-sm transition ${
            isActive(cat.slug)
              ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
              : "border-[var(--color-border)] bg-white text-[var(--foreground)] hover:border-[var(--color-primary)]"
          }`}
        >
          {cat.name}
        </Link>
      ))}
    </nav>
  );
}
