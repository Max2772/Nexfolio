from django.db import models

class AssetType(models.TextChoices):
    STOCK  = "stock",  "Stock"
    CRYPTO = "crypto", "Crypto"
    STEAM  = "steam",  "Steam"