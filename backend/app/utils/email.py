import logging

from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


async def send_order_confirmation(
    to_email: str,
    order_id: str,
    total_cents: int,
    recipient_name: str,
) -> None:
    total = total_cents / 100
    message = (
        f"Order Confirmation\n"
        f"Hello {recipient_name},\n"
        f"Your order {order_id} has been placed successfully.\n"
        f"Total: ${total:.2f}\n"
        f"Thank you for shopping with Amazon Clone!"
    )

    if not settings.MAIL_USERNAME:
        logger.info("Email (console mode): to=%s\n%s", to_email, message)
        return

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
            subject=f"Order Confirmation - {order_id[:8]}",
            recipients=[to_email],
            body=message,
            subtype=MessageType.plain,
        )
        await fm.send_message(message_schema)
    except Exception as exc:
        logger.warning("Failed to send email: %s. Falling back to console.", exc)
        logger.info("Email (fallback): to=%s\n%s", to_email, message)
