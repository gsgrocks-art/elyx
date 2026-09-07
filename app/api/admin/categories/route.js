import { NextResponse } from "next/server";
import { listCategories, createCategory } from "@/lib/categories";

export async function GET() {
  const categories = listCategories();
  return NextResponse.json({ categories });
}

export async function POST(request) {
  const { name } = await request.json();
  if (!name || !name.trim()) {
    return NextResponse.json({ error: "Category name is required" }, { status: 400 });
  }
  const category = createCategory(name);
  return NextResponse.json({ category }, { status: 201 });
}
