"use client";

import Link from "next/link";
import { useCart } from "./CartContext";

export default function AddToCartButton({ product, className, small = false }) {
  const { addToCart, isInCart } = useCart();
  const soldOut = product.stock === "sold_out";
  const inCart = isInCart(product.id);
  const sizing = small ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm";

  if (soldOut) {
    return (
      <button
        type="button"
        disabled
        className={
          className ||
          `inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-neutral-200 font-medium text-neutral-500 ${sizing}`
        }
      >
        Sold Out
      </button>
    );
  }

  if (inCart) {
    return (
      <Link
        href="/cart"
        className={
          className ||
          `inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-[var(--color-primary)] font-medium text-white transition hover:opacity-90 ${sizing}`
        }
      >
        Added &#10003; Go to Cart
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={() => addToCart(product)}
      className={
        className ||
        `inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-[var(--color-primary)] font-medium text-[var(--color-primary)] transition hover:bg-[var(--color-primary)] hover:text-white ${sizing}`
      }
    >
      Add to Cart
    </button>
  );
}
