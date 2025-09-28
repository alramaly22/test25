from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path
from accounts import views

urlpatterns = [
    # الصفحات الرئيسية
    path('', views.index, name='index'),
    path('menu/', views.menu, name='menu'),
    path('appetizers/', views.appetizers, name='appetizers'),
    path('breakfast/', views.breakfast, name='breakfast'),
    path('kaak/', views.kaak, name='kaak'),
    path('manakish/', views.manakish, name='manakish'),
    path('pidetr/', views.pidetr, name='pidetr'),
    path('pizza/', views.pizza, name='pizza'),

    # صفحات الدفع
    path('checkout/', views.checkout, name='checkout'),
    path('success/', views.payment_success, name='payment_success'),
    path('cancel/', views.payment_cancel, name='payment_cancel'),

    # API الأوردر
    path('api/create-order/', views.create_order, name='create_order'),
    path('webhook/stripe/', views.stripe_webhook, name='stripe_webhook'),

    # لوحة التحكم
    path('admin/', admin.site.urls),
]+ static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
