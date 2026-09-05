import { notFound } from "next/navigation";
import Link from "next/link";
import ProductGallery from "@/components/ProductGallery";
import WhatsAppShareButton from "@/components/WhatsAppShareButton";
import { getProductById } from "@/lib/products";
import { getSettings } from "@/lib/settings";
import { formatPrice, buildContactUrl } from "@/lib/whatsapp";

export default async function ProductPage({ params }) {
  const { id } = await params;
  const product = getProductById(id);

  if (!product) notFound();

  const settings = getSettings();
  const soldOut = product.stock === "sold_out";
  const contactUrl = buildContactUrl(
    settings?.whatsappNumber,
    `Hi, I'm interested in ${product.name} (${product.code}).`
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
      <nav className="mb-4 text-sm text-neutral-500">
        <Link href="/" className="hover:text-[var(--color-primary)]">
          Home
        </Link>
        {product.category_slug ? (
          <>
            {" / "}
            <Link href={`/category/${product.category_slug}`} className="hover:text-[var(--color-primary)]">
              {product.category_name}
            </Link>
          </>
        ) : null}
        {" / "}
        <span className="text-neutral-700">{product.name}</span>
      </nav>

      <div className="grid gap-8 md:grid-cols-2">
        <ProductGallery images={product.images} name={product.name} />

        <div>
          <div className="flex flex-wrap items-center gap-2">
            {product.isNewArrival ? (
              <span className="rounded-full bg-[var(--color-accent)] px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-white">
                New Arrival
              </span>
            ) : null}
            {product.discountPercent ? (
              <span className="rounded-full bg-rose-600 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-white">
                {product.discountPercent}% off
              </span>
            ) : null}
            {soldOut ? (
              <span className="rounded-full bg-neutral-700 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-white">
                Sold Out
              </span>
            ) : (
              <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-white">
                In Stock
              </span>
            )}
          </div>

          <h1 className="mt-3 font-heading text-2xl text-[var(--foreground)] sm:text-3xl">{product.name}</h1>
          <p className="mt-1 text-sm text-neutral-400">Code: {product.code}</p>
          {product.category_name ? (
            <p className="mt-1 text-sm text-neutral-400">Category: {product.category_name}</p>
          ) : null}

          <p className="mt-4 font-heading text-3xl text-[var(--color-primary)]">
            {formatPrice(product.price)}
          </p>

          {product.description ? (
            <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-neutral-600">
              {product.description}
            </p>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-3">
            <WhatsAppShareButton
              path={`/product/${product.id}`}
              message={`Check out ${product.name} (${product.code}) - ${formatPrice(product.price)}`}
              label="Share on WhatsApp"
            />
            {contactUrl ? (
              <a
                href={contactUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-[var(--color-primary)] px-4 py-2 text-sm font-medium text-[var(--color-primary)] transition hover:bg-[var(--color-primary)] hover:text-white"
              >
                Enquire Now
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
