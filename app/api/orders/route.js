import { NextResponse } from "next/server";
import { createOrder } from "@/lib/orders";

export async function POST(request) {
  const body = await request.json();

  try {
    const order = createOrder({
      customer: body.customer,
      address: body.address,
      cart: body.cart,
    });
    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to place order" }, { status: 400 });
  }
}
