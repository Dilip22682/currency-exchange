from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.http import require_GET
from decimal import Decimal

from .services import get_currencies, get_latest_rates, convert_amount, get_historical_rates
from .models import ConversionHistory


def home(request):
    currencies = get_currencies()
    return render(request, 'home.html', {
        'currencies': currencies,
    })


@require_GET
def api_currencies(request):
    return JsonResponse({'currencies': get_currencies()})


@require_GET
def api_latest_rates(request):
    base = request.GET.get('base', 'EUR')
    data = get_latest_rates(base)
    if data is None:
        return JsonResponse({'error': 'Failed to fetch rates'}, status=502)
    return JsonResponse(data)


@require_GET
def api_convert(request):
    try:
        amount = float(request.GET.get('amount', 0))
        from_curr = request.GET.get('from', 'USD').upper()
        to_curr = request.GET.get('to', 'EUR').upper()
    except (ValueError, TypeError):
        return JsonResponse({'error': 'Invalid parameters'}, status=400)

    if amount < 0:
        return JsonResponse({'error': 'Amount must be non-negative'}, status=400)

    data = convert_amount(amount, from_curr, to_curr)
    if data is None:
        return JsonResponse({'error': 'Conversion failed'}, status=502)

    to_amount = Decimal(str(list(data['rates'].values())[0]))
    rate = to_amount / Decimal(str(amount))

    ConversionHistory.objects.create(
        from_currency=from_curr,
        to_currency=to_curr,
        from_amount=Decimal(str(amount)),
        to_amount=to_amount,
        rate=rate,
    )

    return JsonResponse(data)


@require_GET
def api_historical(request):
    from_curr = request.GET.get('from', 'USD').upper()
    to_curr = request.GET.get('to', 'EUR').upper()
    days = min(int(request.GET.get('days', 30)), 90)

    if from_curr == to_curr:
        return JsonResponse({'error': 'Currencies must be different'}, status=400)

    data = get_historical_rates(from_curr, to_curr, days)
    if data is None:
        return JsonResponse({'error': 'Failed to fetch historical data'}, status=502)
    return JsonResponse(data)


@require_GET
def api_recent_conversions(request):
    recent = ConversionHistory.objects.all()[:10]
    data = [
        {
            'from_currency': c.from_currency,
            'to_currency': c.to_currency,
            'from_amount': str(c.from_amount),
            'to_amount': str(c.to_amount),
            'rate': str(c.rate),
            'created_at': c.created_at.isoformat(),
        }
        for c in recent
    ]
    return JsonResponse({'conversions': data})