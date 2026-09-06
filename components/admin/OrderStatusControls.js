"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { buildContactUrl } from "@/lib/whatsapp";

const ORDER_STATUSES = ["processing", "dispatched", "delivered", "cancelled"];
const ORDER_STATUS_LABELS = {
  processing: "Order In Process",
  dispatched: "Order Dispatched",
  delivered: "Order Delivered Successfully",
  cancelled: "Cancelled",
};
const PAYMENT_STATUSES = ["pending", "payment_requested", "payment_received", "payment_failed"];

function labelizePayment(value) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function OrderStatusControls({
  orderId,
  orderStatus,
  paymentStatus,
  mobileNumber,
  notifyMessage,
}) {
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

  // India-only: order.mobileNumber is stored as a plain 10-digit number
  // (validated at checkout), so wa.me needs the country code prepended.
  const notifyUrl = notifyMessage ? buildContactUrl(`91${mobileNumber}`, notifyMessage) : null;

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">Order Status</label>
          <select
            value={orderStatus}
            disabled={saving}
            onChange={(e) => update("orderStatus", e.target.value)}
            className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none"
          >
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {ORDER_STATUS_LABELS[s]}
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
                {labelizePayment(s)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {notifyUrl ? (
        <a
          href={notifyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
        >
          Notify Customer via WhatsApp ({ORDER_STATUS_LABELS[orderStatus]})
        </a>
      ) : null}
    </div>
  );
}
