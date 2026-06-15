import logging

from app.core.config import get_settings
from app.utils.email_templates import (
    OrderConfirmationEmailData,
    OrderEmailItem,
    format_order_number,
    render_order_confirmation_html,
    render_order_confirmation_plain,
)

logger = logging.getLogger(__name__)
settings = get_settings()


async def send_order_confirmation(data: OrderConfirmationEmailData) -> None:
    plain_body = render_order_confirmation_plain(data)
    html_body = render_order_confirmation_html(data)
    subject = f"Order Confirmation - {data.order_number}"
    to_email = data.shipping_address.get("email")

    if not settings.MAIL_USERNAME:
        logger.info("Email (console mode): to=%s\n%s", to_email or "missing", plain_body)
        return

    if not to_email:
        logger.warning("No recipient email on order %s; skipping send.", data.order_number)
        logger.info("Email (console mode): to=missing\n%s", plain_body)
        return

    logger.info("Sending order confirmation email to=%s order=%s", to_email, data.order_number)

    try:
        from fastapi_mail import ConnectionConfig, FastMail, MessageSchema, MessageType

        conf = ConnectionConfig(
            MAIL_USERNAME=settings.MAIL_USERNAME,
            MAIL_PASSWORD=settings.MAIL_PASSWORD,
            MAIL_FROM=settings.MAIL_FROM,
            MAIL_PORT=settings.MAIL_PORT,
            MAIL_SERVER=settings.MAIL_SERVER,
            MAIL_STARTTLS=True,
            MAIL_SSL_TLS=False,
            USE_CREDENTIALS=True,
        )
        fm = FastMail(conf)
        message_schema = MessageSchema(
            subject=subject,
            recipients=[to_email],
            body=html_body,
            subtype=MessageType.html,
            alternative_body=plain_body,
        )
        await fm.send_message(message_schema)
        logger.info("Email sent successfully to=%s subject=%s", to_email, subject)
    except Exception as exc:
        error_text = str(exc)
        if "Unauthorized IP address" in error_text:
            logger.warning(
                "Failed to send email (Brevo IP block): %s. "
                "In Brevo: Settings → Security → Authorized IPs — disable the restriction "
                "or add this machine's public IP, then retry.",
                exc,
            )
        else:
            logger.warning("Failed to send email: %s. Falling back to console.", exc)
        logger.info("Email (fallback): to=%s\n%s", to_email, plain_body)


def build_order_confirmation_email(order) -> OrderConfirmationEmailData:
    items = [
        OrderEmailItem(
            title=item.product.title if item.product else "Product",
            quantity=item.quantity,
            line_total_cents=item.unit_price_cents * item.quantity,
        )
        for item in order.items
    ]
    subtotal_cents = sum(item.line_total_cents for item in items)
    tax_cents = order.total_cents - subtotal_cents
    frontend_origin = settings.cors_origins_list[0] if settings.cors_origins_list else "http://localhost:3000"

    return OrderConfirmationEmailData(
        recipient_name=order.shipping_address.get("full_name", "Customer"),
        order_number=format_order_number(str(order.id), order.created_at),
        items=items,
        subtotal_cents=subtotal_cents,
        tax_cents=tax_cents,
        total_cents=order.total_cents,
        shipping_address=order.shipping_address,
        orders_page_url=f"{frontend_origin.rstrip('/')}/orders",
    )
