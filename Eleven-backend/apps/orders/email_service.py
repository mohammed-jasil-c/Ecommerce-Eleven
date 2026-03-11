from django.core.mail import send_mail
from django.conf import settings


def send_order_confirmation_email(order):

    subject = "Your Order is Confirmed"

    message = f"""
Hello {order.user.email},

Your payment was successful.

Order ID: {order.id}
Total Amount: ₹{order.total_amount}

Your order has been confirmed and will be processed soon.

Thank you for shopping with us!
"""

    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [order.user.email],
        fail_silently=False,
    )