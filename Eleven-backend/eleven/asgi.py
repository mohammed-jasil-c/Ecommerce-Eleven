"""
ASGI config for eleven project.
"""

import os

from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'eleven.settings')

application = get_asgi_application()
