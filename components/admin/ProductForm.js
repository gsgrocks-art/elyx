"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import ImageUploader from "./ImageUploader";
import CategorySelect from "./CategorySelect";

export default function ProductForm({ initialProduct, categories: initialCategories }) {
  const router = useRouter();
  const isEdit = !!initialProduct;

  const [categories, setCategories] = useState(initialCategories);
  const [form, setForm] = useState({
    name: initialProduct?.name || "",
    code: initialProduct?.code || "",
    price: initialProduct?.price ?? "",
    categoryId: initialProduct?.categoryId || "",
    description: initialProduct?.description || "",
    images: initialProduct?.images || [],
    stock: initialProduct?.stock || "in_stock",
    isNewArrival: initialProduct?.isNewArrival || false,
    discountPercent: initialProduct?.discountPercent ?? "",
    buyingCost: initialProduct?.buyingCost ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) {
      setError("Product name is required");
      return;
    }

    setSaving(true);
    const payload = {
      name: form.name.trim(),
      code: form.code.trim() || undefined,
      price: form.price === "" ? 0 : Number(form.price),
      categoryId: form.categoryId || null,
      description: form.description,
      images: form.images,
      stock: form.stock,
      isNewArrival: form.isNewArrival,
      discountPercent: form.discountPercent === "" ? null : Number(form.discountPercent),
      buyingCost: form.buyingCost === "" ? null : Number(form.buyingCost),
    };

    try {
      const url = isEdit ? `/api/admin/products/${initialProduct.id}` : "/api/admin/products";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save product");
      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700">Product Photos</label>
        <ImageUploader images={form.images} onChange={(images) => update("images", images)} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">Product Name *</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            required
            className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            Product Code <span className="text-neutral-400">(leave blank to auto-generate)</span>
          </label>
          <input
            type="text"
            value={form.code}
            onChange={(e) => update("code", e.target.value)}
            placeholder="JWL-0001"
            className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">Price (₹) *</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.price}
            onChange={(e) => update("price", e.target.value)}
            required
            className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            Buying Cost (₹) <span className="text-neutral-400">(admin only — never shown to customers)</span>
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.buyingCost}
            onChange={(e) => update("buyingCost", e.target.value)}
            className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">Category</label>
          <CategorySelect
            categories={categories}
            value={form.categoryId}
            onChange={(id) => update("categoryId", id)}
            onCategoryCreated={(cat) => setCategories((prev) => [...prev, cat])}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">Stock Status</label>
          <select
            value={form.stock}
            onChange={(e) => update("stock", e.target.value)}
            className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none"
          >
            <option value="in_stock">In Stock</option>
            <option value="sold_out">Sold Out</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            Discount % <span className="text-neutral-400">(optional)</span>
          </label>
          <input
            type="number"
            min="0"
            max="100"
            value={form.discountPercent}
            onChange={(e) => update("discountPercent", e.target.value)}
            className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          rows={4}
          className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-neutral-700">
        <input
          type="checkbox"
          checked={form.isNewArrival}
          onChange={(e) => update("isNewArrival", e.target.checked)}
          className="h-4 w-4 rounded border-neutral-300"
        />
        Mark as New Arrival
      </label>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-[var(--color-primary)] px-6 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "Saving..." : isEdit ? "Save Changes" : "Add Product"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className="rounded-full border border-neutral-300 px-6 py-2 text-sm text-neutral-600 hover:bg-neutral-100"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
