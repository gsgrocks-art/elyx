"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function SearchBar({ className }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("search") || "");

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = value.trim();
    router.push(trimmed ? `/?search=${encodeURIComponent(trimmed)}` : "/");
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="relative w-full">
        <input
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search by name or code..."
          className="w-full rounded-full border border-[var(--color-border)] bg-white py-2 pl-4 pr-10 text-sm text-[var(--foreground)] placeholder:text-neutral-400 focus:border-[var(--color-primary)] focus:outline-none"
        />
        <button
          type="submit"
          aria-label="Search"
          className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-4 w-4"
          >
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>
      </div>
    </form>
  );
}
