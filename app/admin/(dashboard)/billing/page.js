import { listBillingRows } from "@/lib/orders";
import { formatPrice, formatDate } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

function monthOptions() {
  const options = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    options.push({ value, label });
  }
  return options;
}

function monthRange(month) {
  const [year, mon] = month.split("-").map(Number);
  const from = new Date(Date.UTC(year, mon - 1, 1)).toISOString();
  const to = new Date(Date.UTC(year, mon, 0, 23, 59, 59, 999)).toISOString();
  return { from, to };
}

export default async function AdminBillingPage({ searchParams }) {
  const sp = await searchParams;
  const month = sp?.month || "";
  const fromInput = sp?.from || "";
  const toInput = sp?.to || "";

  let from, to;
  if (fromInput || toInput) {
    from = fromInput ? new Date(fromInput).toISOString() : undefined;
    to = toInput ? new Date(`${toInput}T23:59:59.999Z`).toISOString() : undefined;
  } else if (month) {
    ({ from, to } = monthRange(month));
  }

  const rows = listBillingRows({ from, to });

  const totals = rows.reduce(
    (acc, r) => {
      acc.selling += r.sellingCost;
      acc.delivery += r.deliveryCharges;
      acc.total += r.totalSellingCost;
      if (r.buyingCostTotal != null) acc.buying += r.buyingCostTotal;
      if (r.profitMargin != null) acc.profit += r.profitMargin;
      return acc;
    },
    { selling: 0, buying: 0, delivery: 0, total: 0, profit: 0 }
  );

  return (
    <div>
      <h1 className="mb-2 font-heading text-2xl text-[var(--color-primary)]">Billing</h1>
      <p className="mb-6 text-sm text-neutral-500">
        Accounting view of every product sold — buying cost, selling cost, and profit margin.
      </p>

      <form method="get" className="mb-6 flex flex-wrap items-end gap-3 rounded-xl border border-[var(--color-border)] bg-white p-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">Month</label>
          <select
            name="month"
            defaultValue={month}
            className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none"
          >
            <option value="">All Time</option>
            {monthOptions().map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <span className="pb-2 text-sm text-neutral-400">or a custom range</span>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">From</label>
          <input
            type="date"
            name="from"
            defaultValue={fromInput}
            className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">To</label>
          <input
            type="date"
            name="to"
            defaultValue={toInput}
            className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="rounded-full bg-[var(--color-primary)] px-5 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          Apply
        </button>
      </form>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
        <div className="rounded-xl border border-[var(--color-border)] bg-white p-3">
          <p className="text-xs text-neutral-500">Selling Cost</p>
          <p className="font-heading text-lg text-[var(--foreground)]">{formatPrice(totals.selling)}</p>
        </div>
        <div className="rounded-xl border border-[var(--color-border)] bg-white p-3">
          <p className="text-xs text-neutral-500">Buying Cost</p>
          <p className="font-heading text-lg text-[var(--foreground)]">{formatPrice(totals.buying)}</p>
        </div>
        <div className="rounded-xl border border-[var(--color-border)] bg-white p-3">
          <p className="text-xs text-neutral-500">Delivery Charges</p>
          <p className="font-heading text-lg text-[var(--foreground)]">{formatPrice(totals.delivery)}</p>
        </div>
        <div className="rounded-xl border border-[var(--color-border)] bg-white p-3">
          <p className="text-xs text-neutral-500">Total Selling Cost</p>
          <p className="font-heading text-lg text-[var(--foreground)]">{formatPrice(totals.total)}</p>
        </div>
        <div className="rounded-xl border border-[var(--color-accent)]/40 bg-[var(--color-accent)]/5 p-3">
          <p className="text-xs text-neutral-500">Profit Margin</p>
          <p className="font-heading text-lg text-[var(--color-primary)]">{formatPrice(totals.profit)}</p>
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-neutral-300 p-10 text-center text-neutral-400">
          No sales in this period.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[var(--color-border)] bg-white">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b border-[var(--color-border)] bg-neutral-50 text-neutral-500">
              <tr>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Order #</th>
                <th className="px-4 py-3 font-medium">Product Name</th>
                <th className="px-4 py-3 font-medium">Code</th>
                <th className="px-4 py-3 font-medium">Qty</th>
                <th className="px-4 py-3 font-medium">Buying Cost</th>
                <th className="px-4 py-3 font-medium">Selling Cost</th>
                <th className="px-4 py-3 font-medium">Delivery Charges</th>
                <th className="px-4 py-3 font-medium">Total Selling Cost</th>
                <th className="px-4 py-3 font-medium">Profit Margin</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.itemId}
                  className={`border-b border-[var(--color-border)] last:border-0 ${r.isReturned ? "bg-rose-50/40" : ""}`}
                >
                  <td className="px-4 py-3 text-neutral-500">{formatDate(r.orderDate)}</td>
                  <td className="px-4 py-3 text-neutral-500">{r.orderNumber}</td>
                  <td className="px-4 py-3 font-medium text-neutral-800">
                    {r.productName}
                    {r.isReturned ? (
                      <span className="ml-2 text-xs font-medium text-rose-600">Returned – Damaged</span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-neutral-500">{r.productCode || "—"}</td>
                  <td className="px-4 py-3 text-neutral-600">{r.quantity}</td>
                  <td className="px-4 py-3 text-neutral-600">
                    {r.buyingCostTotal != null ? formatPrice(r.buyingCostTotal) : "—"}
                  </td>
                  <td className="px-4 py-3 text-neutral-600">{formatPrice(r.sellingCost)}</td>
                  <td className="px-4 py-3 text-neutral-600">{formatPrice(r.deliveryCharges)}</td>
                  <td className="px-4 py-3 font-medium text-neutral-800">{formatPrice(r.totalSellingCost)}</td>
                  <td
                    className={`px-4 py-3 font-medium ${
                      r.isReturned
                        ? "text-rose-600"
                        : r.profitMargin == null
                          ? "text-neutral-400"
                          : r.profitMargin >= 0
                            ? "text-emerald-700"
                            : "text-rose-600"
                    }`}
                  >
                    {r.isReturned ? "Returned – Damaged" : r.profitMargin != null ? formatPrice(r.profitMargin) : "—"}
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
