import Link from "next/link";
import LogoutButton from "@/components/admin/LogoutButton";
import { getCurrentAdmin } from "@/lib/auth";

const NAV_ITEMS = [
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/staff", label: "Staff" },
  { href: "/admin/settings", label: "Settings" },
];

export default async function AdminDashboardLayout({ children }) {
  const admin = await getCurrentAdmin();

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="border-b border-[var(--color-border)] bg-[var(--color-primary)] text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-6">
            <span className="font-heading text-lg text-[var(--color-accent-light)]">Admin Panel</span>
            <nav className="flex gap-4 text-sm">
              {NAV_ITEMS.map((item) => (
                <Link key={item.href} href={item.href} className="text-white/80 hover:text-white">
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            {admin ? <span className="text-sm text-white/70">Signed in as {admin.username}</span> : null}
            <Link href="/" target="_blank" className="text-sm text-white/80 hover:text-white">
              View Site ↗
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}
