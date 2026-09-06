import db from "./db";
import { getProductById } from "./products";
import { formatPrice } from "./whatsapp";

const ORDER_STATUSES = ["processing", "dispatched", "delivered", "cancelled"];
const ORDER_STATUS_LABELS = {
  processing: "Order In Process",
  dispatched: "Order Dispatched",
  delivered: "Order Delivered Successfully",
  cancelled: "Cancelled",
};
const PAYMENT_STATUSES = ["pending", "payment_requested", "payment_received", "payment_failed"];

const CANCELLATION_REASONS = ["customer_request", "no_inventory", "other"];
const CANCELLATION_REASON_LABELS = {
  customer_request: "Order cancelled by customer",
  no_inventory: "Order cancelled due to no inventory",
  other: "Other",
};

// Customer-facing WhatsApp message for each order status, shown to admin as
// a pre-filled wa.me link on the order detail page (see
// components/admin/OrderStatusControls.js) so they can notify the customer
// with one click — there's no automated messaging provider wired up.
export function buildStatusUpdateMessage(order, status) {
  const name = order.firstName;
  const amount = formatPrice(order.orderTotal);
  const templates = {
    processing: `Hi ${name},\n\nYour order ${order.orderNumber} worth ${amount} is now successfully placed!\n\nWe are getting your order ready and will notify you when it has been shipped.`,
    dispatched: `Hi ${name},\n\nYour order ${order.orderNumber} worth ${amount} has been shipped and is on its way!`,
    delivered: `Hi ${name},\n\nYour order ${order.orderNumber} worth ${amount} has been delivered successfully. Thank you for shopping with us!`,
    cancelled: `Hi ${name},\n\nWe're sorry to let you know that your order ${order.orderNumber} worth ${amount} has been cancelled. Please contact us if you have any questions.`,
  };
  return templates[status] || null;
}

function generateOrderNumber() {
  const now = new Date();
  const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(
    now.getDate()
  ).padStart(2, "0")}`;
  const prefix = `ORD-${datePart}-`;

  const rows = db
    .prepare("SELECT order_number FROM orders WHERE order_number LIKE ?")
    .all(`${prefix}%`);
  let maxSeq = 0;
  for (const { order_number } of rows) {
    const match = order_number.match(/-(\d+)$/);
    if (match) {
      const n = parseInt(match[1], 10);
      if (n > maxSeq) maxSeq = n;
    }
  }
  return `${prefix}${String(maxSeq + 1).padStart(4, "0")}`;
}

function rowToOrder(row) {
  if (!row) return null;
  return {
    id: row.id,
    orderNumber: row.order_number,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    mobileNumber: row.mobile_number,
    addressLine1: row.address_line1,
    addressLine2: row.address_line2,
    country: row.country,
    state: row.state,
    city: row.city,
    pincode: row.pincode,
    totalItems: row.total_items,
    orderTotal: row.order_total,
    orderStatus: row.order_status,
    paymentStatus: row.payment_status,
    deliveryCharges: row.delivery_charges,
    cancellationReason: row.cancellation_reason,
    cancellationNote: row.cancellation_note,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function rowToItem(row) {
  return {
    id: row.id,
    orderId: row.order_id,
    productId: row.product_id,
    productName: row.product_name,
    productCode: row.product_code,
    productImage: row.product_image,
    unitPrice: row.unit_price,
    quantity: row.quantity,
    subtotal: row.subtotal,
  };
}

export function getOrderItems(orderId) {
  return db
    .prepare("SELECT * FROM order_items WHERE order_id = ? ORDER BY created_at ASC")
    .all(orderId)
    .map(rowToItem);
}

export function listOrders() {
  const rows = db.prepare("SELECT * FROM orders ORDER BY created_at DESC").all();
  return rows.map(rowToOrder);
}

export function getOrderById(id) {
  const order = rowToOrder(db.prepare("SELECT * FROM orders WHERE id = ?").get(id));
  if (!order) return null;
  return { ...order, items: getOrderItems(id) };
}

// Validates the cart against live product data, recomputes every price and
// the total server-side (never trusts amounts sent from the browser), and
// creates the order + its line items in one transaction. Throws with a
// user-facing message if anything in the cart is no longer valid.
export function createOrder({ customer, address, cart }) {
  if (!Array.isArray(cart) || cart.length === 0) {
    throw new Error("Your cart is empty.");
  }
  if (
    !customer?.firstName?.trim() ||
    !customer?.lastName?.trim() ||
    !customer?.mobileNumber?.trim() ||
    !customer?.email?.trim()
  ) {
    throw new Error("First name, last name, mobile number, and email are required.");
  }
  if (!/^\d{10}$/.test(customer.mobileNumber.trim())) {
    throw new Error("Mobile number must be exactly 10 digits.");
  }
  if (!/^\S+@\S+\.\S+$/.test(customer.email.trim())) {
    throw new Error("Please enter a valid email address.");
  }
  if (
    !address?.addressLine1?.trim() ||
    !address?.country?.trim() ||
    !address?.state?.trim() ||
    !address?.city?.trim() ||
    !address?.pincode?.trim()
  ) {
    throw new Error("A complete delivery address is required.");
  }

  const resolvedItems = [];
  for (const line of cart) {
    const quantity = Number(line.quantity);
    if (!line.productId || !Number.isInteger(quantity) || quantity < 1) {
      throw new Error("Invalid item in cart.");
    }
    const product = getProductById(line.productId);
    if (!product) {
      throw new Error(`"${line.name || "A product"}" in your cart no longer exists. Please remove it and try again.`);
    }
    if (product.stock === "sold_out") {
      throw new Error(`"${product.name}" just went out of stock. Please remove it from your cart and try again.`);
    }
    const unitPrice = product.price;
    resolvedItems.push({
      productId: product.id,
      productName: product.name,
      productCode: product.code,
      productImage: product.images?.[0] || null,
      unitPrice,
      quantity,
      subtotal: Math.round(unitPrice * quantity * 100) / 100,
    });
  }

  const orderTotal = Math.round(resolvedItems.reduce((sum, i) => sum + i.subtotal, 0) * 100) / 100;
  const totalItems = resolvedItems.reduce((sum, i) => sum + i.quantity, 0);

  const id = crypto.randomUUID();
  const orderNumber = generateOrderNumber();
  const now = new Date().toISOString();

  const insertOrder = db.prepare(
    `INSERT INTO orders
      (id, order_number, first_name, last_name, email, mobile_number,
       address_line1, address_line2, country, state, city, pincode,
       total_items, order_total, order_status, payment_status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'processing', 'pending', ?, ?)`
  );
  const insertItem = db.prepare(
    `INSERT INTO order_items
      (id, order_id, product_id, product_name, product_code, product_image, unit_price, quantity, subtotal, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );

  const run = db.transaction(() => {
    insertOrder.run(
      id,
      orderNumber,
      customer.firstName.trim(),
      customer.lastName.trim(),
      customer.email?.trim() || null,
      customer.mobileNumber.trim(),
      address.addressLine1.trim(),
      address.addressLine2?.trim() || null,
      address.country.trim(),
      address.state.trim(),
      address.city.trim(),
      address.pincode.trim(),
      totalItems,
      orderTotal,
      now,
      now
    );
    for (const item of resolvedItems) {
      insertItem.run(
        crypto.randomUUID(),
        id,
        item.productId,
        item.productName,
        item.productCode,
        item.productImage,
        item.unitPrice,
        item.quantity,
        item.subtotal,
        now
      );
    }
  });
  run();

  return getOrderById(id);
}

export function updateOrderStatus(id, orderStatus, { cancellationReason, cancellationNote } = {}) {
  if (!ORDER_STATUSES.includes(orderStatus)) {
    throw new Error(`Invalid order status: ${orderStatus}`);
  }

  if (orderStatus === "cancelled") {
    if (!CANCELLATION_REASONS.includes(cancellationReason)) {
      throw new Error("A cancellation reason is required.");
    }
    if (cancellationReason === "other" && !cancellationNote?.trim()) {
      throw new Error("Please describe the cancellation reason.");
    }
  }

  db.prepare(
    `UPDATE orders SET order_status = ?, cancellation_reason = ?, cancellation_note = ?, updated_at = ?
     WHERE id = ?`
  ).run(
    orderStatus,
    orderStatus === "cancelled" ? cancellationReason : null,
    orderStatus === "cancelled" ? cancellationNote?.trim() || null : null,
    new Date().toISOString(),
    id
  );
  return getOrderById(id);
}

export function updatePaymentStatus(id, paymentStatus) {
  if (!PAYMENT_STATUSES.includes(paymentStatus)) {
    throw new Error(`Invalid payment status: ${paymentStatus}`);
  }
  db.prepare("UPDATE orders SET payment_status = ?, updated_at = ? WHERE id = ?").run(
    paymentStatus,
    new Date().toISOString(),
    id
  );
  return getOrderById(id);
}

export function deleteOrder(id) {
  const run = db.transaction(() => {
    db.prepare("DELETE FROM order_items WHERE order_id = ?").run(id);
    db.prepare("DELETE FROM orders WHERE id = ?").run(id);
  });
  run();
}

export function updateDeliveryCharges(id, deliveryCharges) {
  const value = Number(deliveryCharges);
  if (!Number.isFinite(value) || value < 0) {
    throw new Error("Delivery charges must be a non-negative number.");
  }
  db.prepare("UPDATE orders SET delivery_charges = ?, updated_at = ? WHERE id = ?").run(
    value,
    new Date().toISOString(),
    id
  );
  return getOrderById(id);
}

// Accounting report for Admin > Billing: one row per order line item, with
// the CURRENT product buying cost (not snapshotted — buying cost is
// internal analytics data, unlike the customer-facing selling price which
// is snapshotted in order_items for legal/trust reasons). Each order's
// delivery charge is split across its items in proportion to quantity, so
// the per-item amounts still add up to the order's actual delivery charge.
export function listBillingRows({ from, to } = {}) {
  let query = `
    SELECT
      order_items.id as item_id,
      order_items.product_id,
      order_items.product_name,
      order_items.product_code,
      order_items.unit_price,
      order_items.quantity,
      order_items.subtotal,
      orders.id as order_id,
      orders.order_number,
      orders.total_items as order_total_items,
      orders.delivery_charges as order_delivery_charges,
      orders.created_at as order_date,
      products.buying_cost
    FROM order_items
    JOIN orders ON orders.id = order_items.order_id
    LEFT JOIN products ON products.id = order_items.product_id
    WHERE 1=1
  `;
  const params = [];
  if (from) {
    query += " AND orders.created_at >= ?";
    params.push(from);
  }
  if (to) {
    query += " AND orders.created_at <= ?";
    params.push(to);
  }
  query += " ORDER BY orders.created_at DESC";

  const rows = db.prepare(query).all(...params);

  return rows.map((row) => {
    const deliveryShare =
      row.order_total_items > 0
        ? Math.round(((row.order_delivery_charges * row.quantity) / row.order_total_items) * 100) / 100
        : 0;
    const buyingCostTotal = row.buying_cost != null ? row.buying_cost * row.quantity : null;
    const sellingCost = row.subtotal;
    const totalSellingCost = Math.round((sellingCost + deliveryShare) * 100) / 100;
    const profitMargin = buyingCostTotal != null ? Math.round((totalSellingCost - buyingCostTotal) * 100) / 100 : null;

    return {
      itemId: row.item_id,
      orderId: row.order_id,
      orderNumber: row.order_number,
      orderDate: row.order_date,
      productId: row.product_id,
      productName: row.product_name,
      productCode: row.product_code,
      quantity: row.quantity,
      buyingCostTotal,
      sellingCost,
      deliveryCharges: deliveryShare,
      totalSellingCost,
      profitMargin,
    };
  });
}

export {
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  PAYMENT_STATUSES,
  CANCELLATION_REASONS,
  CANCELLATION_REASON_LABELS,
};
