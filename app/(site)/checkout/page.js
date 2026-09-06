"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/components/CartContext";
import { formatPrice } from "@/lib/whatsapp";

const FIELD_CLASS =
  "w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalItems, totalPrice, clearCart, loaded } = useCart();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    mobileNumber: "",
    email: "",
    addressLine1: "",
    addressLine2: "",
    country: "India",
    state: "",
    city: "",
    pincode: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [mobileError, setMobileError] = useState("");

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const validateMobile = (value) => {
    if (!/^\d{10}$/.test(value)) {
      setMobileError("Mobile number must be exactly 10 digits.");
      return false;
    }
    setMobileError("");
    return true;
  };

  const handleMobileChange = (value) => {
    const digitsOnly = value.replace(/\D/g, "").slice(0, 10);
    update("mobileNumber", digitsOnly);
    if (mobileError) validateMobile(digitsOnly);
  };

  if (!loaded) return null;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
        <h1 className="font-heading text-2xl text-[var(--color-primary)]">Your cart is empty</h1>
        <p className="mt-2 text-sm text-neutral-500">Add some products before checking out.</p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center justify-center rounded-full bg-[var(--color-primary)] px-6 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setError("");

    if (!validateMobile(form.mobileNumber)) {
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            firstName: form.firstName,
            lastName: form.lastName,
            mobileNumber: form.mobileNumber,
            email: form.email,
          },
          address: {
            addressLine1: form.addressLine1,
            addressLine2: form.addressLine2 || undefined,
            country: form.country,
            state: form.state,
            city: form.city,
            pincode: form.pincode,
          },
          cart: items.map((i) => ({ productId: i.productId, quantity: i.quantity, name: i.name })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to place order");

      clearCart();
      router.push(`/order-confirmation/${data.order.id}`);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
      <h1 className="mb-6 font-heading text-2xl text-[var(--color-primary)]">Checkout</h1>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">
          <section>
            <h2 className="mb-3 font-heading text-lg text-[var(--foreground)]">Customer Details</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                type="text"
                placeholder="First Name"
                required
                value={form.firstName}
                onChange={(e) => update("firstName", e.target.value)}
                className={FIELD_CLASS}
              />
              <input
                type="text"
                placeholder="Last Name"
                required
                value={form.lastName}
                onChange={(e) => update("lastName", e.target.value)}
                className={FIELD_CLASS}
              />
              <div>
                <input
                  type="tel"
                  inputMode="numeric"
                  placeholder="Mobile Number"
                  required
                  maxLength={10}
                  value={form.mobileNumber}
                  onChange={(e) => handleMobileChange(e.target.value)}
                  onBlur={(e) => validateMobile(e.target.value)}
                  className={`${FIELD_CLASS} ${mobileError ? "border-rose-500" : ""}`}
                />
                {mobileError ? <p className="mt-1 text-xs text-rose-600">{mobileError}</p> : null}
              </div>
              <input
                type="email"
                placeholder="Email"
                required
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                className={FIELD_CLASS}
              />
            </div>
          </section>

          <section>
            <h2 className="mb-3 font-heading text-lg text-[var(--foreground)]">Delivery Address</h2>
            <div className="grid gap-3">
              <input
                type="text"
                placeholder="Address Line 1"
                required
                value={form.addressLine1}
                onChange={(e) => update("addressLine1", e.target.value)}
                className={FIELD_CLASS}
              />
              <input
                type="text"
                placeholder="Address Line 2 (Optional)"
                value={form.addressLine2}
                onChange={(e) => update("addressLine2", e.target.value)}
                className={FIELD_CLASS}
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  type="text"
                  placeholder="Country"
                  required
                  value={form.country}
                  onChange={(e) => update("country", e.target.value)}
                  className={FIELD_CLASS}
                />
                <input
                  type="text"
                  placeholder="State"
                  required
                  value={form.state}
                  onChange={(e) => update("state", e.target.value)}
                  className={FIELD_CLASS}
                />
                <input
                  type="text"
                  placeholder="City"
                  required
                  value={form.city}
                  onChange={(e) => update("city", e.target.value)}
                  className={FIELD_CLASS}
                />
                <input
                  type="text"
                  placeholder="Pincode"
                  required
                  value={form.pincode}
                  onChange={(e) => update("pincode", e.target.value)}
                  className={FIELD_CLASS}
                />
              </div>
            </div>
          </section>

          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        </form>

        <aside className="h-fit rounded-xl border border-[var(--color-border)] bg-white p-4">
          <h2 className="mb-3 font-heading text-lg text-[var(--foreground)]">Order Summary</h2>
          <ul className="space-y-3">
            {items.map((item) => (
              <li key={item.productId} className="flex gap-3">
                <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                  {item.image ? (
                    <Image src={item.image} alt={item.name} fill sizes="48px" className="object-cover" />
                  ) : null}
                </div>
                <div className="flex-1 text-sm">
                  <p className="font-medium text-neutral-800">{item.name}</p>
                  <p className="text-neutral-400">
                    Qty: {item.quantity} × {formatPrice(item.price)}
                  </p>
                </div>
                <p className="text-sm font-medium text-neutral-700">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </li>
            ))}
          </ul>

          <div className="mt-4 space-y-1 border-t border-[var(--color-border)] pt-3 text-sm">
            <div className="flex justify-between text-neutral-500">
              <span>Total Items</span>
              <span>{totalItems}</span>
            </div>
            <div className="flex justify-between font-heading text-lg text-[var(--color-primary)]">
              <span>Order Total</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>
          </div>

          <button
            type="submit"
            form="checkout-form"
            disabled={submitting}
            className="mt-4 w-full rounded-full bg-[var(--color-primary)] py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? "Placing Order..." : "Place Order"}
          </button>
        </aside>
      </div>
    </div>
  );
}
