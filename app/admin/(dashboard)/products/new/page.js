import ProductForm from "@/components/admin/ProductForm";
import { listCategories } from "@/lib/categories";

export const dynamic = "force-dynamic";

export default function NewProductPage() {
  const categories = listCategories();

  return (
    <div>
      <h1 className="mb-6 font-heading text-2xl text-[var(--color-primary)]">Add Product</h1>
      <ProductForm categories={categories} />
    </div>
  );
}
