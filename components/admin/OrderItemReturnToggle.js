"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function OrderItemReturnToggle({ itemId, isReturned }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const toggle = async () => {
    if (!isReturned && !confirm("Mark this item as returned due to damage? It will be excluded from the profit margin in Billing.")) {
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/order-items/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ returned: !isReturned }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update");
      router.refresh();
    } catch (err) {
      alert(err.message || "Failed to update.");
    } finally {
      setSaving(false);
    }
  };

  if (isReturned) {
    return (
      <button
        type="button"
        onClick={toggle}
        disabled={saving}
        className="rounded-full bg-rose-100 px-3 py-1 text-xs font-medium text-rose-700 hover:bg-rose-200 disabled:opacity-50"
      >
        {saving ? "Updating…" : "Returned – Damaged (Undo)"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={saving}
      className="rounded-full border border-rose-300 px-3 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 disabled:opacity-50"
    >
      {saving ? "Updating…" : "Mark as Damaged Return"}
    </button>
  );
}
