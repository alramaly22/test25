from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.conf import settings
import json
import stripe
from django.views.decorators.csrf import csrf_exempt
from .models import Order, OrderItem


# ==========================
# 🔹 Views الخاصة بالصفحات
# ==========================
def index(request):
    return render(request, 'accounts/index.html')

def appetizers(request):
    return render(request, 'accounts/appetizers.html')

def breakfast(request):
    return render(request, 'accounts/breakfast.html')

def kaak(request):
    return render(request, 'accounts/kaak.html')

def manakish(request):
    return render(request, 'accounts/manakish.html')

def menu(request):
    return render(request, 'accounts/menu.html')

def pidetr(request):
    return render(request, 'accounts/pidetr.html')

def pizza(request):
    return render(request, 'accounts/pizza.html')

def payment_success(request):
    return render(request, 'accounts/success.html')

def payment_cancel(request):
    return render(request, 'accounts/cancel.html')

def checkout(request):
    """صفحة الدفع"""
    return render(request, "accounts/checkout.html")


# ==========================
# 🔹 Views الخاصة بالأوردرات
# ==========================

# تهيئة Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY

def create_order(request):
    """إنشاء الأوردر سواء كاش أو أونلاين"""
    if request.method != "POST":
        return JsonResponse({"error": "Invalid request method"}, status=400)

    try:
        data = json.loads(request.body)
    except Exception as e:
        return JsonResponse({"error": f"Invalid JSON: {str(e)}"}, status=400)

    required_fields = ["name", "phone", "address", "payment_method", "items", "total"]
    for field in required_fields:
        if field not in data:
            return JsonResponse({"error": f"Missing field: {field}"}, status=400)

    payment_method = data.get("payment_method")
    items = data.get("items", [])
    total = float(data.get("total", 0))

    if not items or total <= 0:
        return JsonResponse({"error": "Cart is empty or total is invalid"}, status=400)

    # 🟢 لو الدفع كاش (COD)
    if payment_method == "COD":
        try:
            order = Order.objects.create(
                name=data.get("name"),
                phone=data.get("phone"),
                address=data.get("address"),
                notes=data.get("notes", ""),
                total=total,
                payment_method="COD",
                paid=True
            )

            for item in items:
                OrderItem.objects.create(
                    order=order,
                    name=item.get("name"),
                    price=float(item.get("price")),
                    qty=int(item.get("qty")),
                    img=item.get("img", "")
                )

            return JsonResponse({"order_id": order.id, "status": "created"})
        except Exception as e:
            print(f"Server error (COD): {e}")
            return JsonResponse({"error": f"Server error: {str(e)}"}, status=500)

    # 🟢 لو الدفع أونلاين (Stripe Checkout)
    elif payment_method == "ONLINE":
        try:
            session = stripe.checkout.Session.create(
                payment_method_types=["card"],
                line_items=[
                    {
                        "price_data": {
                            "currency": "usd",
                            "product_data": {"name": i["name"]},
                            "unit_amount": int(float(i["price"]) * 100),
                        },
                        "quantity": int(i["qty"]),
                    }
                    for i in items
                ],
                mode="payment",
                success_url=request.build_absolute_uri("/?success=true"),
                cancel_url=request.build_absolute_uri("/?canceled=true"),
                metadata={
                    "name": data.get("name"),
                    "phone": data.get("phone"),
                    "address": data.get("address"),
                    "notes": data.get("notes", ""),
                    "items": json.dumps(items),
                    "total": str(total),
                }
            )
            return JsonResponse({"checkout_url": session.url})
        except Exception as stripe_error:
            print(f"Stripe error: {stripe_error}")
            return JsonResponse({"error": f"Stripe error: {str(stripe_error)}"}, status=500)

    else:
        return JsonResponse({"error": "Invalid payment method"}, status=400)


@csrf_exempt
def stripe_webhook(request):
    """Webhook لتأكيد الدفع من Stripe"""
    payload = request.body
    sig_header = request.META.get("HTTP_STRIPE_SIGNATURE")
    endpoint_secret = settings.STRIPE_WEBHOOK_SECRET

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, endpoint_secret)
    except (ValueError, stripe.error.SignatureVerificationError) as e:
        print(f"Webhook error: {e}")
        return JsonResponse({"status": "invalid"}, status=400)

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        metadata = session.get("metadata", {})

        try:
            order = Order.objects.create(
                name=metadata.get("name"),
                phone=metadata.get("phone"),
                address=metadata.get("address"),
                notes=metadata.get("notes", ""),
                total=float(metadata.get("total", 0)),
                payment_method="ONLINE",
                paid=True
            )

            items = json.loads(metadata.get("items", "[]"))
            for item in items:
                OrderItem.objects.create(
                    order=order,
                    name=item.get("name"),
                    price=float(item.get("price")),
                    qty=int(item.get("qty")),
                    img=item.get("img", "")
                )

            print(f"✅ Order {order.id} created & paid via Stripe.")
        except Exception as e:
            print(f"⚠️ Error creating order from webhook: {e}")

    return JsonResponse({"status": "success"})
