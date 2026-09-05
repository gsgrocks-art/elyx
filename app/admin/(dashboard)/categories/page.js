import { listCategories, countProductsInCategory } from "@/lib/categories";
import CategoryManager from "@/components/admin/CategoryManager";

export const dynamic = "force-dynamic";

export default function AdminCategoriesPage() {
  const categories = listCategories().map((cat) => ({
    ...cat,
    productCount: countProductsInCategory(cat.id),
  }));

  return (
    <div>
      <h1 className="mb-6 font-heading text-2xl text-[var(--color-primary)]">Categories</h1>
      <CategoryManager initialCategories={categories} />
    </div>
  );
}
