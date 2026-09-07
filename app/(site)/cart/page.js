"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/components/CartContext";
import { formatPrice } from "@/lib/whatsapp";

function QuantityStepper({ quantity, onChange }) {
  return (
    <div className="inline-flex items-center rounded-full border border-[var(--color-border)]">
      <button
        type="button"
        onClick={() => onChange(quantity - 1)}
        disabled={quantity <= 1}
        className="flex h-8 w-8 items-center justify-center text-lg text-neutral-600 disabled:opacity-30"
        aria-label="Decrease quantity"
      >
        −
      </button>
      <span className="w-8 text-center text-sm font-medium">{quantity}</span>
      <button
        type="button"
        onClick={() => onChange(quantity + 1)}
        className="flex h-8 w-8 items-center justify-center text-lg text-neutral-600"
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, totalItems, totalPrice, loaded } = useCart();

  if (!loaded) return null;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
        <h1 className="font-heading text-2xl text-[var(--color-primary)]">Your cart is empty</h1>
        <p className="mt-2 text-sm text-neutral-500">
          Browse the catalog and add products you love.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center justify-center rounded-full bg-[var(--color-primary)] px-6 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
      <h1 className="mb-6 font-heading text-2xl text-[var(--color-primary)]">Your Cart</h1>

      {/* Mobile: stacked cards */}
      <div className="space-y-3 sm:hidden">
        {items.map((item) => (
          <div key={item.productId} className="flex gap-3 rounded-xl border border-[var(--color-border)] bg-white p-3">
            <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-neutral-100">
              {item.image ? (
                <Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover" />
              ) : null}
            </div>
            <div className="flex flex-1 flex-col justify-between">
              <div>
                <p className="font-medium text-neutral-800">{item.name}</p>
                <p className="text-xs text-neutral-400">{item.code}</p>
                <p className="text-sm text-[var(--color-primary)]">{formatPrice(item.price)}</p>
              </div>
              <div className="flex items-center justify-between">
                <QuantityStepper
                  quantity={item.quantity}
                  onChange={(q) => updateQuantity(item.productId, q)}
                />
                <button
                  type="button"
                  onClick={() => removeFromCart(item.productId)}
                  className="text-xs text-rose-600 hover:underline"
                >
                  Remove
                </button>
              </div>
            </div>
            <div className="whitespace-nowrap text-sm font-medium text-neutral-700">
              {formatPrice(item.price * item.quantity)}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: table */}
      <div className="hidden overflow-x-auto rounded-xl border border-[var(--color-border)] bg-white sm:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[var(--color-border)] bg-neutral-50 text-neutral-500">
            <tr>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Quantity</th>
              <th className="px-4 py-3 font-medium">Subtotal</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.productId} className="border-b border-[var(--color-border)] last:border-0">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                      {item.image ? (
                        <Image src={item.image} alt={item.name} fill sizes="56px" className="object-cover" />
                      ) : null}
                    </div>
                    <div>
                      <p className="font-medium text-neutral-800">{item.name}</p>
                      <p className="text-xs text-neutral-400">{item.code}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-neutral-700">{formatPrice(item.price)}</td>
                <td className="px-4 py-3">
                  <QuantityStepper
                    quantity={item.quantity}
                    onChange={(q) => updateQuantity(item.productId, q)}
                  />
                </td>
                <td className="px-4 py-3 font-medium text-neutral-800">
                  {formatPrice(item.price * item.quantity)}
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.productId)}
                    className="text-sm text-rose-600 hover:underline"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex flex-col items-end gap-1 border-t border-[var(--color-border)] pt-4">
        <p className="text-sm text-neutral-500">Total Items: {totalItems}</p>
        <p className="font-heading text-2xl text-[var(--color-primary)]">
          Order Total: {formatPrice(totalPrice)}
        </p>
      </div>

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-full border border-neutral-300 px-6 py-2 text-sm text-neutral-600 hover:bg-neutral-100"
        >
          Continue Shopping
        </Link>
        <Link
          href="/checkout"
          className="inline-flex items-center justify-center rounded-full bg-[var(--color-primary)] px-6 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          Proceed to Place Order
        </Link>
      </div>
    </div>
  );
}
