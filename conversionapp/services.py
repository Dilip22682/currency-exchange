import requests
import logging
from django.conf import settings
from django.core.cache import cache

logger = logging.getLogger(__name__)

SESSION = requests.Session()
SESSION.headers.update({'User-Agent': 'AureaFX/1.0'})


def _api_get(path, params=None):
    url = f"{settings.FRANKFURTER_API_URL}{path}"
    try:
        resp = SESSION.get(url, params=params, timeout=10)
        resp.raise_for_status()
        return resp.json()
    except requests.RequestException as e:
        logger.error(f"Frankfurter API error: {e}")
        return None


def get_currencies():
    cache_key = 'fx:currencies'
    data = cache.get(cache_key)
    if data is None:
        data = _api_get('/currencies') or {}
        cache.set(cache_key, data, 86400)
    return data


def get_latest_rates(base='EUR'):
    cache_key = f'fx:latest:{base}'
    data = cache.get(cache_key)
    if data is None:
        data = _api_get('/latest', params={'base': base})
        if data:
            cache.set(cache_key, data, settings.FRANKFURTER_CACHE_TIMEOUT)
    return data


def convert_amount(amount, from_curr, to_curr):
    return _api_get('/latest', params={
        'amount': amount,
        'from': from_curr,
        'to': to_curr,
    })


def get_historical_rates(from_curr, to_curr, days=30):
    from datetime import date, timedelta
    end = date.today()
    start = end - timedelta(days=days)
    date_range = f"{start.isoformat()}..{end.isoformat()}"
    cache_key = f'fx:hist:{from_curr}:{to_curr}:{date_range}'
    data = cache.get(cache_key)
    if data is None:
        data = _api_get(f'/{date_range}', params={'from': from_curr, 'to': to_curr})
        if data:
            cache.set(cache_key, data, 1800)
    return data