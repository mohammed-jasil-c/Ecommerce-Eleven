from django.core.mail import send_mail
from django.conf import settings


def send_welcome_email(user):

    subject = "Welcome to Our Store"

    message = f"""
Hello {user.first_name or user.email},

Your account has been successfully created.

Welcome to our E-commerce platform.
 
Thank you for joining us.
"""

    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
        fail_silently=False,
    )

