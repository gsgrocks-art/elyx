import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/whatsapp";
import WhatsAppShareButton from "./WhatsAppShareButton";
import AddToCartButton from "./AddToCartButton";

export default function ProductCard({ product }) {
  const image = product.images?.[0];
  const soldOut = product.stock === "sold_out";

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-[var(--color-border)] bg-white transition hover:shadow-lg">
      <Link href={`/product/${product.id}`} className="relative block aspect-square bg-neutral-100">
        {image ? (
          <Image
            src={image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-neutral-300">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="h-16 w-16">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
            </svg>
          </div>
        )}
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {product.isNewArrival ? (
            <span className="rounded-full bg-[var(--color-accent)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white shadow">
              New
            </span>
          ) : null}
          {product.discountPercent ? (
            <span className="rounded-full bg-rose-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white shadow">
              {product.discountPercent}% off
            </span>
          ) : null}
        </div>
        {soldOut ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-neutral-800">
              Sold Out
            </span>
          </div>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col gap-1 p-3">
        <Link href={`/product/${product.id}`}>
          <h3 className="line-clamp-1 font-medium text-[var(--foreground)]">{product.name}</h3>
        </Link>
        <p className="text-xs text-neutral-400">{product.code}</p>
        <p className="mt-1 font-heading text-lg text-[var(--color-primary)]">
          {formatPrice(product.price)}
        </p>

        <div className="mt-2 flex flex-col gap-1.5">
          <AddToCartButton product={product} small />
          <WhatsAppShareButton
            path={`/product/${product.id}`}
            message={`Check out ${product.name} (${product.code}) - ${formatPrice(product.price)}`}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#25D366] px-3 py-1.5 text-xs font-medium text-[#128C4A] transition hover:bg-[#25D366] hover:text-white"
            label="Share"
          />
        </div>
      </div>
    </div>
  );
}
