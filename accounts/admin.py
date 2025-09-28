from django.contrib import admin
from .models import Order, OrderItem
from django.db import models

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0

class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'phone', 'total', 'payment_method', 'paid', 'created_at')
    inlines = [OrderItemInline]
    readonly_fields = ('created_at',)

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.filter(models.Q(paid=True) | models.Q(payment_method="COD"))

admin.site.register(Order, OrderAdmin)
