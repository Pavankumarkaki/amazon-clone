import html
from dataclasses import dataclass
from datetime import datetime
from typing import Any


@dataclass(frozen=True)
class OrderEmailItem:
    title: str
    quantity: int
    line_total_cents: int


@dataclass(frozen=True)
class OrderConfirmationEmailData:
    recipient_name: str
    order_number: str
    items: list[OrderEmailItem]
    subtotal_cents: int
    tax_cents: int
    total_cents: int
    shipping_address: dict[str, Any]
    orders_page_url: str


def format_order_number(order_id: str, created_at: datetime) -> str:
    date_str = created_at.strftime("%Y%m%d")
    suffix = order_id.replace("-", "")[:4].upper()
    return f"AMZ-{date_str}-{suffix}"


def format_price_inr(cents: int) -> str:
    amount = cents / 100
    whole, fraction = divmod(round(amount * 100), 100)
    whole_str = f"{whole:,}"
    return f"₹{whole_str}.{fraction:02d}"


def _escape(value: str | None) -> str:
    return html.escape(value or "", quote=True)


def _format_address(address: dict[str, Any]) -> str:
    lines = [
        _escape(address.get("full_name")),
        _escape(address.get("address_line1")),
    ]
    if address.get("address_line2"):
        lines.append(_escape(address["address_line2"]))
    lines.append(
        _escape(
            f"{address.get('city', '')}, {address.get('state', '')} {address.get('postal_code', '')}"
        )
    )
    lines.append(_escape(address.get("country")))
    if address.get("phone"):
        lines.append(f"Phone: {_escape(str(address['phone']))}")
    return "<br>".join(lines)


def render_order_confirmation_html(data: OrderConfirmationEmailData) -> str:
    item_rows = "\n".join(
        f"""
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #e5e5e5;color:#111827;">{_escape(item.title)}</td>
          <td style="padding:12px 8px;border-bottom:1px solid #e5e5e5;color:#111827;text-align:center;width:48px;">{item.quantity}</td>
          <td style="padding:12px 0;border-bottom:1px solid #e5e5e5;color:#111827;text-align:right;width:110px;">{format_price_inr(item.line_total_cents)}</td>
        </tr>"""
        for item in data.items
    )

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation</title>
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:Arial,Helvetica,sans-serif;color:#111827;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f3f4f6;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background-color:#ffffff;border:1px solid #e5e7eb;border-radius:8px;">
          <tr>
            <td style="padding:32px 32px 24px;">
              <h1 style="margin:0 0 16px;font-size:28px;line-height:1.2;font-weight:700;color:#067d62;">
                Thank you for your order!
              </h1>
              <p style="margin:0 0 8px;font-size:16px;line-height:1.5;color:#374151;">
                Hi {_escape(data.recipient_name)}, your order has been placed successfully.
              </p>
              <p style="margin:0;font-size:15px;line-height:1.5;color:#374151;">
                Order number:
                <strong style="color:#111827;font-family:monospace;">{_escape(data.order_number)}</strong>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 24px;">
              <h2 style="margin:0 0 12px;font-size:18px;font-weight:700;color:#111827;">Items ordered</h2>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-top:1px solid #e5e5e5;">
                <tr>
                  <th align="left" style="padding:10px 0;font-size:13px;font-weight:700;color:#6b7280;border-bottom:1px solid #e5e5e5;">Item</th>
                  <th align="center" style="padding:10px 8px;font-size:13px;font-weight:700;color:#6b7280;border-bottom:1px solid #e5e5e5;width:48px;">Qty</th>
                  <th align="right" style="padding:10px 0;font-size:13px;font-weight:700;color:#6b7280;border-bottom:1px solid #e5e5e5;width:110px;">Price</th>
                </tr>
                {item_rows}
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 24px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding:6px 0;font-size:15px;color:#374151;">Subtotal</td>
                  <td align="right" style="padding:6px 0;font-size:15px;color:#111827;">{format_price_inr(data.subtotal_cents)}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;font-size:15px;color:#374151;">Tax</td>
                  <td align="right" style="padding:6px 0;font-size:15px;color:#111827;">{format_price_inr(data.tax_cents)}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;font-size:15px;color:#374151;">Shipping</td>
                  <td align="right" style="padding:6px 0;font-size:15px;font-weight:700;color:#067d62;">FREE</td>
                </tr>
                <tr>
                  <td style="padding:12px 0 0;font-size:17px;font-weight:700;color:#111827;border-top:1px solid #e5e5e5;">Order total</td>
                  <td align="right" style="padding:12px 0 0;font-size:17px;font-weight:700;color:#111827;border-top:1px solid #e5e5e5;">{format_price_inr(data.total_cents)}</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 24px;">
              <h2 style="margin:0 0 12px;font-size:18px;font-weight:700;color:#111827;">Delivery address</h2>
              <p style="margin:0;font-size:15px;line-height:1.6;color:#374151;">
                {_format_address(data.shipping_address)}
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 32px;">
              <p style="margin:0;font-size:14px;line-height:1.6;color:#6b7280;">
                You can track your order from your
                <a href="{data.orders_page_url}" style="color:#007185;text-decoration:none;">account orders page</a>.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""


def render_order_confirmation_plain(data: OrderConfirmationEmailData) -> str:
    lines = [
        "Thank you for your order!",
        f"Hi {data.recipient_name}, your order has been placed successfully.",
        f"Order number: {data.order_number}",
        "",
        "Items ordered",
    ]
    for item in data.items:
        lines.append(
            f"- {item.title} | Qty: {item.quantity} | {format_price_inr(item.line_total_cents)}"
        )
    lines.extend(
        [
            "",
            f"Subtotal: {format_price_inr(data.subtotal_cents)}",
            f"Tax: {format_price_inr(data.tax_cents)}",
            "Shipping: FREE",
            f"Order total: {format_price_inr(data.total_cents)}",
            "",
            "Delivery address",
            data.shipping_address.get("full_name", ""),
            data.shipping_address.get("address_line1", ""),
        ]
    )
    if data.shipping_address.get("address_line2"):
        lines.append(data.shipping_address["address_line2"])
    lines.extend(
        [
            f"{data.shipping_address.get('city', '')}, {data.shipping_address.get('state', '')} {data.shipping_address.get('postal_code', '')}",
            data.shipping_address.get("country", ""),
        ]
    )
    if data.shipping_address.get("phone"):
        lines.append(f"Phone: {data.shipping_address['phone']}")
    lines.extend(
        [
            "",
            f"Track your order: {data.orders_page_url}",
        ]
    )
    return "\n".join(lines)
