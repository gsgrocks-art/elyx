import { notFound } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";
import { getProductById } from "@/lib/products";
import { listCategories } from "@/lib/categories";

export default async function EditProductPage({ params }) {
  const { id } = await params;
  const product = getProductById(id);
  const categories = listCategories();

  if (!product) notFound();

  return (
    <div>
      <h1 className="mb-6 font-heading text-2xl text-[var(--color-primary)]">Edit Product</h1>
      <ProductForm initialProduct={product} categories={categories} />
    </div>
  );
}
