from django.contrib import admin
from .models import ConversionHistory


@admin.register(ConversionHistory)
class ConversionHistoryAdmin(admin.ModelAdmin):
    list_display = ('from_currency', 'to_currency', 'from_amount', 'to_amount', 'rate', 'created_at')
    list_filter = ('from_currency', 'to_currency', 'created_at')
    search_fields = ('from_currency', 'to_currency')
    readonly_fields = ('rate', 'created_at')