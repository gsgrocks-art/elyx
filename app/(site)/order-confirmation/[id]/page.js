import { notFound } from "next/navigation";
import Link from "next/link";
import { getOrderById } from "@/lib/orders";
import { getSettings } from "@/lib/settings";
import { formatPrice } from "@/lib/whatsapp";
import OrderStatusStepper from "@/components/OrderStatusStepper";

export const dynamic = "force-dynamic";

export default async function OrderConfirmationPage({ params }) {
  const { id } = await params;
  const order = getOrderById(id);

  if (!order) notFound();

  const settings = getSettings();
  const officialNumber = settings?.whatsappNumber
    ? ` (${settings.whatsappNumber})`
    : "";

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <div className="rounded-2xl border border-[var(--color-border)] bg-white p-6 text-center sm:p-10">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-7 w-7">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <h1 className="mt-4 font-heading text-2xl text-[var(--color-primary)] sm:text-3xl">
          Order Placed Successfully!
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          Thank you for placing your order. We have received your order successfully and our team
          will contact you shortly.
        </p>

        <div className="mt-6 rounded-xl bg-neutral-50 p-4">
          <p className="text-sm text-neutral-500">Order ID</p>
          <p className="font-heading text-xl text-[var(--foreground)]">{order.orderNumber}</p>
          <div className="mt-3 flex justify-center gap-8 text-sm">
            <div>
              <p className="text-neutral-500">Total Items</p>
              <p className="font-medium text-neutral-800">{order.totalItems}</p>
            </div>
            <div>
              <p className="text-neutral-500">Order Total</p>
              <p className="font-medium text-neutral-800">{formatPrice(order.orderTotal)}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-[var(--color-border)] p-4">
          <h2 className="mb-4 font-heading text-base text-[var(--color-primary)]">Order Status</h2>
          <OrderStatusStepper status={order.orderStatus} />
        </div>

        <div className="mt-6 rounded-xl border border-[var(--color-accent)]/40 bg-[var(--color-accent)]/5 p-4 text-left">
          <h2 className="font-heading text-base text-[var(--color-primary)]">Payment Information</h2>
          <p className="mt-2 text-sm text-neutral-600">
            Your order has been successfully placed. Our team will contact you for payment
            confirmation. For payment, you will receive a payment barcode/QR code from the official
            mobile number{officialNumber} mentioned on our website. Please make the payment only
            after receiving the barcode/QR code from our official number.
          </p>
          <p className="mt-2 text-sm font-medium text-rose-600">
            For your security, please do not make any payment to an unknown number or through an
            unverified payment link.
          </p>
        </div>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-[var(--color-primary)] px-6 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
