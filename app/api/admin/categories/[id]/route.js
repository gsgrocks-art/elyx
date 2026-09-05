import { NextResponse } from "next/server";
import { getCategoryById, deleteCategory, countProductsInCategory } from "@/lib/categories";

export async function DELETE(request, { params }) {
  const { id } = await params;
  const category = getCategoryById(id);
  if (!category) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const productCount = countProductsInCategory(id);
  deleteCategory(id);
  return NextResponse.json({ ok: true, productsUncategorized: productCount });
}
