import Link from "next/link";
import Image from "next/image";
import { listProducts } from "@/lib/products";
import { formatPrice } from "@/lib/whatsapp";
import DeleteProductButton from "@/components/admin/DeleteProductButton";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = listProducts({ includeCost: true });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-2xl text-[var(--color-primary)]">Products</h1>
        <Link
          href="/admin/products/new"
          className="rounded-full bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          + Add Product
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="rounded-xl border border-dashed border-neutral-300 p-10 text-center text-neutral-400">
          No products yet. Click &quot;Add Product&quot; to create your first one.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[var(--color-border)] bg-white">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-[var(--color-border)] bg-neutral-50 text-neutral-500">
              <tr>
                <th className="px-4 py-3 font-medium">Photo</th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Code</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Buying Cost</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Stock</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-[var(--color-border)] last:border-0">
                  <td className="px-4 py-3">
                    <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-neutral-100">
                      {product.images?.[0] ? (
                        <Image src={product.images[0]} alt={product.name} fill sizes="48px" className="object-cover" />
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-neutral-800">{product.name}</td>
                  <td className="px-4 py-3 text-neutral-500">{product.code}</td>
                  <td className="px-4 py-3 text-neutral-500">{product.category_name || "—"}</td>
                  <td className="px-4 py-3 text-neutral-500">
                    {product.buyingCost != null ? formatPrice(product.buyingCost) : "—"}
                  </td>
                  <td className="px-4 py-3 text-neutral-700">{formatPrice(product.price)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        product.stock === "sold_out"
                          ? "bg-neutral-200 text-neutral-600"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {product.stock === "sold_out" ? "Sold Out" : "In Stock"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      <Link href={`/admin/products/${product.id}/edit`} className="text-[var(--color-primary)] hover:underline">
                        Edit
                      </Link>
                      <DeleteProductButton id={product.id} name={product.name} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
