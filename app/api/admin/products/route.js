import { NextResponse } from "next/server";
import { listProducts, createProduct, isCodeTaken } from "@/lib/products";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || undefined;
  const categoryId = searchParams.get("categoryId") || undefined;
  const products = listProducts({ search, categoryId });
  return NextResponse.json({ products });
}

export async function POST(request) {
  const data = await request.json();

  if (!data.name || !data.name.trim()) {
    return NextResponse.json({ error: "Product name is required" }, { status: 400 });
  }

  if (data.code && isCodeTaken(data.code.trim())) {
    return NextResponse.json({ error: `Product code "${data.code}" is already in use` }, { status: 400 });
  }

  const product = createProduct(data);
  return NextResponse.json({ product }, { status: 201 });
}
