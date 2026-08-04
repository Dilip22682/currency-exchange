from django.db import models
from django.conf import settings


class ConversionHistory(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL, related_name='conversions'
    )
    from_currency = models.CharField(max_length=3, db_index=True)
    to_currency = models.CharField(max_length=3, db_index=True)
    from_amount = models.DecimalField(max_digits=18, decimal_places=6)
    to_amount = models.DecimalField(max_digits=18, decimal_places=6)
    rate = models.DecimalField(max_digits=18, decimal_places=8)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'Conversion histories'

    def __str__(self):
        return f"{self.from_amount} {self.from_currency} → {self.to_amount} {self.to_currency}"