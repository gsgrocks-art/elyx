"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const ORDER_STATUSES = ["new", "processing", "shipped", "delivered", "cancelled"];
const PAYMENT_STATUSES = ["pending", "payment_requested", "payment_received", "payment_failed"];

function labelize(value) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function OrderStatusControls({ orderId, orderStatus, paymentStatus }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const update = async (field, value) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });
      if (!res.ok) throw new Error("Failed to update");
      router.refresh();
    } catch {
      alert("Failed to update status.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700">Order Status</label>
        <select
          value={orderStatus}
          disabled={saving}
          onChange={(e) => update("orderStatus", e.target.value)}
          className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm capitalize focus:border-[var(--color-primary)] focus:outline-none"
        >
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s} className="capitalize">
              {labelize(s)}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700">
          Payment Status <span className="text-neutral-400">(internal only)</span>
        </label>
        <select
          value={paymentStatus}
          disabled={saving}
          onChange={(e) => update("paymentStatus", e.target.value)}
          className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none"
        >
          {PAYMENT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {labelize(s)}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
