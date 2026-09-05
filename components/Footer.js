import Link from "next/link";
import { getSettings } from "@/lib/settings";
import { listCategories } from "@/lib/categories";
import { buildContactUrl } from "@/lib/whatsapp";

export default function Footer() {
  const settings = getSettings();
  const categories = listCategories().slice(0, 6);
  const contactUrl = buildContactUrl(
    settings?.whatsappNumber,
    `Hi ${settings?.businessName || ""}, I'd like to know more about your jewellery.`
  );
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-[var(--color-border)] bg-[var(--color-primary)] text-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3 sm:px-6">
        <div>
          <div className="font-heading text-xl text-[var(--color-accent-light)]">
            {settings?.businessName || "Jewellery Catalog"}
          </div>
          <p className="mt-2 text-sm text-white/70">Jewellery that inspires.</p>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white/80">Contact</h4>
          <ul className="space-y-2 text-sm text-white/70">
            {contactUrl ? (
              <li>
                <a href={contactUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white">
                  WhatsApp: {settings.whatsappNumber}
                </a>
              </li>
            ) : null}
            {settings?.websiteUrl ? (
              <li>
                <a
                  href={settings.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white"
                >
                  {settings.websiteUrl.replace(/^https?:\/\//, "")}
                </a>
              </li>
            ) : null}
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white/80">Categories</h4>
          <ul className="grid grid-cols-2 gap-2 text-sm text-white/70">
            {categories.map((cat) => (
              <li key={cat.id}>
                <Link href={`/category/${cat.slug}`} className="hover:text-white">
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/50">
        © {year} {settings?.businessName || "Jewellery Catalog"}. All rights reserved.
      </div>
    </footer>
  );
}
