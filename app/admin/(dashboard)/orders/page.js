import Link from "next/link";
import { listOrders } from "@/lib/orders";
import { formatPrice } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

const STATUS_STYLES = {
  new: "bg-blue-100 text-blue-700",
  processing: "bg-amber-100 text-amber-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-neutral-200 text-neutral-600",
};

export default function AdminOrdersPage() {
  const orders = listOrders();

  return (
    <div>
      <h1 className="mb-6 font-heading text-2xl text-[var(--color-primary)]">Orders</h1>

      {orders.length === 0 ? (
        <p className="rounded-xl border border-dashed border-neutral-300 p-10 text-center text-neutral-400">
          No orders yet.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[var(--color-border)] bg-white">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b border-[var(--color-border)] bg-neutral-50 text-neutral-500">
              <tr>
                <th className="px-4 py-3 font-medium">Order ID</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Mobile</th>
                <th className="px-4 py-3 font-medium">Items</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">City</th>
                <th className="px-4 py-3 font-medium">State</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-[var(--color-border)] last:border-0">
                  <td className="px-4 py-3 font-medium text-neutral-800">{order.orderNumber}</td>
                  <td className="px-4 py-3 text-neutral-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-neutral-700">
                    {order.firstName} {order.lastName}
                  </td>
                  <td className="px-4 py-3 text-neutral-500">{order.mobileNumber}</td>
                  <td className="px-4 py-3 text-neutral-500">{order.totalItems}</td>
                  <td className="px-4 py-3 text-neutral-700">{formatPrice(order.orderTotal)}</td>
                  <td className="px-4 py-3 text-neutral-500">{order.city}</td>
                  <td className="px-4 py-3 text-neutral-500">{order.state}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                        STATUS_STYLES[order.orderStatus] || "bg-neutral-100 text-neutral-600"
                      }`}
                    >
                      {order.orderStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/orders/${order.id}`} className="text-[var(--color-primary)] hover:underline">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
