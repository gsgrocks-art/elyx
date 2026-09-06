import { NextResponse } from "next/server";
import { getOrderById, updateOrderStatus, updatePaymentStatus, updateDeliveryCharges } from "@/lib/orders";

export async function GET(request, { params }) {
  const { id } = await params;
  const order = getOrderById(id);
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ order });
}

export async function PUT(request, { params }) {
  const { id } = await params;
  const existing = getOrderById(id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { orderStatus, paymentStatus, deliveryCharges } = await request.json();

  try {
    if (orderStatus) updateOrderStatus(id, orderStatus);
    if (paymentStatus) updatePaymentStatus(id, paymentStatus);
    if (deliveryCharges !== undefined) updateDeliveryCharges(id, deliveryCharges);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ order: getOrderById(id) });
}
