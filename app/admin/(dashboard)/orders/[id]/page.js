import { notFound } from "next/navigation";
import Image from "next/image";
import { getOrderById, buildStatusUpdateMessage, CANCELLATION_REASON_LABELS } from "@/lib/orders";
import { formatPrice } from "@/lib/whatsapp";
import OrderStatusControls from "@/components/admin/OrderStatusControls";
import DeleteOrderButton from "@/components/admin/DeleteOrderButton";
import OrderItemReturnToggle from "@/components/admin/OrderItemReturnToggle";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({ params }) {
  const { id } = await params;
  const order = getOrderById(id);

  if (!order) notFound();

  return (
    <div className="max-w-3xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="font-heading text-2xl text-[var(--color-primary)]">{order.orderNumber}</h1>
          <p className="text-sm text-neutral-400">
            Placed on {new Date(order.createdAt).toLocaleString()}
          </p>
          {order.orderStatus === "cancelled" && order.cancellationReason ? (
            <p className="mt-1 text-sm text-rose-600">
              Cancelled — {CANCELLATION_REASON_LABELS[order.cancellationReason]}
              {order.cancellationReason === "other" && order.cancellationNote
                ? `: ${order.cancellationNote}`
                : ""}
            </p>
          ) : null}
        </div>
        <DeleteOrderButton id={order.id} orderNumber={order.orderNumber} redirectTo="/admin/orders" />
      </div>

      <div className="mb-6 rounded-xl border border-[var(--color-border)] bg-white p-4">
        <OrderStatusControls
          orderId={order.id}
          orderStatus={order.orderStatus}
          paymentStatus={order.paymentStatus}
          deliveryCharges={order.deliveryCharges}
          cancellationReason={order.cancellationReason}
          cancellationNote={order.cancellationNote}
          mobileNumber={order.mobileNumber}
          notifyMessage={buildStatusUpdateMessage(order, order.orderStatus)}
        />
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-[var(--color-border)] bg-white p-4">
          <h2 className="mb-2 font-heading text-lg text-[var(--foreground)]">Customer Details</h2>
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between">
              <dt className="text-neutral-500">Name</dt>
              <dd className="text-neutral-800">
                {order.firstName} {order.lastName}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-neutral-500">Mobile</dt>
              <dd className="text-neutral-800">{order.mobileNumber}</dd>
            </div>
            {order.email ? (
              <div className="flex justify-between">
                <dt className="text-neutral-500">Email</dt>
                <dd className="text-neutral-800">{order.email}</dd>
              </div>
            ) : null}
          </dl>
        </div>

        <div className="rounded-xl border border-[var(--color-border)] bg-white p-4">
          <h2 className="mb-2 font-heading text-lg text-[var(--foreground)]">Delivery Address</h2>
          <p className="text-sm text-neutral-800">
            {order.addressLine1}
            {order.addressLine2 ? `, ${order.addressLine2}` : ""}
            <br />
            {order.city}, {order.state} {order.pincode}
            <br />
            {order.country}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-[var(--color-border)] bg-white p-4">
        <h2 className="mb-3 font-heading text-lg text-[var(--foreground)]">Order Items</h2>

        <div className="space-y-3 sm:hidden">
          {order.items.map((item) => (
            <div key={item.id} className="flex flex-wrap items-start gap-3 border-b border-[var(--color-border)] pb-3 last:border-0">
              <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                {item.productImage ? (
                  <Image src={item.productImage} alt={item.productName} fill sizes="56px" className="object-cover" />
                ) : null}
              </div>
              <div className="flex-1 text-sm">
                <p className="font-medium text-neutral-800">{item.productName}</p>
                <p className="text-neutral-400">
                  Qty {item.quantity} × {formatPrice(item.unitPrice)}
                </p>
                {item.isReturned ? (
                  <p className="mt-1 text-xs text-rose-600">Returned – Damaged</p>
                ) : null}
              </div>
              <p className="text-sm font-medium text-neutral-700">{formatPrice(item.subtotal)}</p>
              <div className="w-full">
                <OrderItemReturnToggle itemId={item.id} isReturned={item.isReturned} />
              </div>
            </div>
          ))}
        </div>

        <table className="hidden w-full text-left text-sm sm:table">
          <thead className="border-b border-[var(--color-border)] text-neutral-500">
            <tr>
              <th className="py-2 font-medium">Product</th>
              <th className="py-2 font-medium">Quantity</th>
              <th className="py-2 font-medium">Unit Price</th>
              <th className="py-2 font-medium">Subtotal</th>
              <th className="py-2 font-medium">Return</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} className="border-b border-[var(--color-border)] last:border-0">
                <td className="py-2 text-neutral-800">
                  {item.productName}
                  {item.isReturned ? (
                    <span className="ml-2 text-xs font-medium text-rose-600">Returned – Damaged</span>
                  ) : null}
                </td>
                <td className="py-2 text-neutral-600">{item.quantity}</td>
                <td className="py-2 text-neutral-600">{formatPrice(item.unitPrice)}</td>
                <td className="py-2 font-medium text-neutral-800">{formatPrice(item.subtotal)}</td>
                <td className="py-2">
                  <OrderItemReturnToggle itemId={item.id} isReturned={item.isReturned} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 flex flex-col items-end gap-0.5 border-t border-[var(--color-border)] pt-3 text-sm">
          <p className="text-neutral-500">Total Items: {order.totalItems}</p>
          <p className="text-neutral-500">Items Total: {formatPrice(order.orderTotal)}</p>
          {order.deliveryCharges ? (
            <p className="text-neutral-500">Delivery Charges: {formatPrice(order.deliveryCharges)}</p>
          ) : null}
          <p className="font-heading text-lg text-[var(--color-primary)]">
            Grand Total: {formatPrice(order.orderTotal + (order.deliveryCharges || 0))}
          </p>
        </div>
      </div>
    </div>
  );
}
