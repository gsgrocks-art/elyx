"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteOrderButton({ id, orderNumber, redirectTo }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Delete order ${orderNumber}? This cannot be undone.`)) return;
    setLoading(true);
    const res = await fetch(`/api/admin/orders/${id}`, { method: "DELETE" });
    setLoading(false);
    if (res.ok) {
      if (redirectTo) {
        router.push(redirectTo);
      }
      router.refresh();
    } else {
      alert("Failed to delete order.");
    }
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="text-rose-600 hover:underline disabled:opacity-50"
    >
      {loading ? "Deleting..." : "Delete"}
    </button>
  );
}
