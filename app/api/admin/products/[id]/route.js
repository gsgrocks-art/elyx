import { NextResponse } from "next/server";
import { getProductById, updateProduct, deleteProduct, isCodeTaken } from "@/lib/products";
import { deleteUploadedFile } from "@/lib/upload";

export async function GET(request, { params }) {
  const { id } = await params;
  const product = getProductById(id);
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ product });
}

export async function PUT(request, { params }) {
  const { id } = await params;
  const existing = getProductById(id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const data = await request.json();

  if (data.code && isCodeTaken(data.code.trim(), id)) {
    return NextResponse.json({ error: `Product code "${data.code}" is already in use` }, { status: 400 });
  }

  const product = updateProduct(id, data);
  return NextResponse.json({ product });
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  const existing = getProductById(id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  existing.images.forEach((img) => deleteUploadedFile(img));
  deleteProduct(id);
  return NextResponse.json({ ok: true });
}
