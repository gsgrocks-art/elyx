"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CategoryManager({ initialCategories }) {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleAdd = async (e) => {
    e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add category");
      setCategories((prev) => [...prev, { ...data.category, productCount: 0 }]);
      setNewName("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cat) => {
    const message = cat.productCount
      ? `"${cat.name}" has ${cat.productCount} product(s). They will become uncategorized. Delete anyway?`
      : `Delete category "${cat.name}"?`;
    if (!confirm(message)) return;

    const res = await fetch(`/api/admin/categories/${cat.id}`, { method: "DELETE" });
    if (res.ok) {
      setCategories((prev) => prev.filter((c) => c.id !== cat.id));
      router.refresh();
    } else {
      alert("Failed to delete category.");
    }
  };

  return (
    <div className="max-w-xl">
      <form onSubmit={handleAdd} className="mb-6 flex gap-2">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New category name"
          className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none"
        />
        <button
          type="submit"
          disabled={saving}
          className="whitespace-nowrap rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          {saving ? "Adding..." : "Add Category"}
        </button>
      </form>
      {error ? <p className="mb-4 text-sm text-rose-600">{error}</p> : null}

      <ul className="divide-y divide-[var(--color-border)] rounded-xl border border-[var(--color-border)] bg-white">
        {categories.map((cat) => (
          <li key={cat.id} className="flex items-center justify-between px-4 py-3">
            <div>
              <span className="font-medium text-neutral-800">{cat.name}</span>
              <span className="ml-2 text-xs text-neutral-400">{cat.productCount} product(s)</span>
            </div>
            <button
              type="button"
              onClick={() => handleDelete(cat)}
              className="text-sm text-rose-600 hover:underline"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
