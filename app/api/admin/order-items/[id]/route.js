import { NextResponse } from "next/server";
import { markItemReturned } from "@/lib/orders";

export async function PUT(request, { params }) {
  const { id } = await params;
  const { returned, reason } = await request.json();

  try {
    const order = markItemReturned(id, { returned, reason });
    return NextResponse.json({ order });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
