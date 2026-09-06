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
const CANCELLATION_REASONS = ["customer_request", "no_inventory", "other"];
const CANCELLATION_REASON_LABELS = {
  customer_request: "Order cancelled by customer",
  no_inventory: "Order cancelled due to no inventory",
  other: "Other",
};

function labelizePayment(value) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function OrderStatusControls({
  orderId,
  orderStatus,
  paymentStatus,
  deliveryCharges,
  cancellationReason,
  cancellationNote,
  mobileNumber,
  notifyMessage,
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [deliveryInput, setDeliveryInput] = useState(String(deliveryCharges ?? 0));
  const [deliveryError, setDeliveryError] = useState("");

  const [pendingStatus, setPendingStatus] = useState(orderStatus);
  const [reason, setReason] = useState(cancellationReason || "");
  const [note, setNote] = useState(cancellationNote || "");
  const [reasonError, setReasonError] = useState("");

  const applyUpdate = async (payload) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update");
      router.refresh();
      return true;
    } catch (err) {
      alert(err.message || "Failed to update.");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = (newStatus) => {
    setPendingStatus(newStatus);
    setReasonError("");
    if (newStatus !== "cancelled") {
      applyUpdate({ orderStatus: newStatus });
    }
    // "cancelled" isn't saved yet — the reason form below must be filled
    // in and confirmed first, since a cancellation reason is required.
  };

  const confirmCancellation = async (e) => {
    e.preventDefault();
    setReasonError("");
    if (!CANCELLATION_REASONS.includes(reason)) {
      setReasonError("Please select a cancellation reason.");
      return;
    }
    if (reason === "other" && !note.trim()) {
      setReasonError("Please describe the cancellation reason.");
      return;
    }
    await applyUpdate({ orderStatus: "cancelled", cancellationReason: reason, cancellationNote: note });
  };

  const saveDeliveryCharges = async (e) => {
    e.preventDefault();
    setDeliveryError("");
    const value = Number(deliveryInput);
    if (!Number.isFinite(value) || value < 0) {
      setDeliveryError("Enter a non-negative number.");
      return;
    }
    await applyUpdate({ deliveryCharges: value });
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
            value={pendingStatus}
            disabled={saving}
            onChange={(e) => handleStatusChange(e.target.value)}
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
            onChange={(e) => applyUpdate({ paymentStatus: e.target.value })}
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

      {pendingStatus === "cancelled" ? (
        <form
          onSubmit={confirmCancellation}
          className="mt-4 space-y-3 rounded-lg border border-rose-200 bg-rose-50 p-3"
        >
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Cancellation Reason</label>
            <select
              value={reason}
              disabled={saving}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none sm:max-w-xs"
            >
              <option value="">Select a reason…</option>
              {CANCELLATION_REASONS.map((r) => (
                <option key={r} value={r}>
                  {CANCELLATION_REASON_LABELS[r]}
                </option>
              ))}
            </select>
          </div>

          {reason === "other" ? (
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">Describe the reason</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                disabled={saving}
                className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none sm:max-w-xs"
              />
            </div>
          ) : null}

          {reasonError ? <p className="text-sm text-rose-600">{reasonError}</p> : null}

          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-rose-600 px-5 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            {orderStatus === "cancelled" ? "Update Cancellation" : "Confirm Cancellation"}
          </button>
        </form>
      ) : null}

      <form onSubmit={saveDeliveryCharges} className="mt-4 flex items-end gap-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">Delivery Charges (₹)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={deliveryInput}
            onChange={(e) => setDeliveryInput(e.target.value)}
            disabled={saving}
            className="w-32 rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg border border-[var(--color-primary)] px-4 py-2 text-sm font-medium text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white disabled:opacity-50"
        >
          Save
        </button>
        {deliveryError ? <p className="text-sm text-rose-600">{deliveryError}</p> : null}
      </form>

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
