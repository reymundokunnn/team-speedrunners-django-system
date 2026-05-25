from django import template
from django.utils.timesince import timesince

register = template.Library()

CURRENCY_SYMBOLS = {
    'USD': '$', 'EUR': '€', 'GBP': '£', 'PHP': '₱', 'JPY': '¥',
    'AUD': 'A$', 'CAD': 'C$', 'INR': '₹', 'CNY': '¥', 'KRW': '₩',
    'RUB': '₽', 'BRL': 'R$', 'TRY': '₺', 'ZAR': 'R', 'MXN': 'MX$',
    'SGD': 'S$', 'HKD': 'HK$', 'CHF': 'CHF', 'SEK': 'kr', 'NOK': 'kr',
    'DKK': 'kr', 'PLN': 'zł', 'THB': '฿', 'MYR': 'RM', 'IDR': 'Rp',
    'VND': '₫', 'AED': 'د.إ', 'SAR': '﷼', 'QAR': '﷼', 'EGP': 'E£',
    'NGN': '₦', 'GHS': '₵', 'KES': 'KSh', 'TZS': 'TSh', 'UGX': 'USh',
    'NZD': 'NZ$', 'TWD': 'NT$', 'ILS': '₪', 'HUF': 'Ft', 'CZK': 'Kč',
    'RON': 'lei', 'UAH': '₴', 'ARS': 'AR$', 'CLP': 'CLP$', 'COP': 'COL$',
    'PEN': 'S/', 'CRC': '₡', 'DOP': 'RD$', 'GTQ': 'Q', 'HNL': 'L',
    'NIO': 'C$', 'PAB': 'B/.', 'PYG': '₲', 'UYU': 'UY$', 'BOB': 'Bs',
    'XOF': 'CFA', 'XAF': 'FCFA', 'MAD': 'MAD', 'TND': 'DT', 'JOD': 'JD',
    'LBP': 'ل.ل', 'IQD': 'ع.د', 'IRR': '﷼', 'PKR': '₨', 'BDT': '৳',
    'LKR': 'Rs', 'NPR': 'रू', 'MMK': 'K', 'KHR': '៛', 'LAK': '₭',
    'MNT': '₮', 'KZT': '₸', 'KGS': 'с', 'TJS': 'ЅМ', 'AFN': '؋',
    'AMD': '֏', 'AZN': '₼', 'GEL': '₾', 'MDL': 'L', 'BYN': 'Br',
    'ALL': 'L', 'MKD': 'ден', 'RSD': 'дин', 'BAM': 'KM', 'HRK': 'kn',
    'BGN': 'лв', 'ISK': 'kr', 'FJD': 'FJ$', 'PGK': 'K', 'SBD': 'SI$',
    'TOP': 'T$', 'WST': 'WS$', 'VUV': 'VT', 'XPF': '₣', 'XCD': 'EC$',
    'BBD': 'Bds$', 'BMD': 'BD$', 'BSD': 'BS$', 'BZD': 'BZ$', 'GYD': 'GY$',
    'JMD': 'J$', 'TTD': 'TT$', 'XPF': '₣',
}

@register.filter
def currency_symbol(code):
    """Convert currency code to symbol."""
    if not code:
        code = 'USD'
    return CURRENCY_SYMBOLS.get(code, code)

@register.filter
def currency_format(amount, currency_code='USD'):
    """
    Format amount with currency symbol.
    Usage: {{ total_budget|currency_format:request.currency }}
    """
    if amount is None:
        return ''
    symbol = CURRENCY_SYMBOLS.get(currency_code, currency_code or '')
    try:
        return f"{symbol}{float(amount):,.2f}"
    except (ValueError, TypeError):
        return f"{symbol}{amount}"

@register.filter
def get_finished_files(files):
    """Filter to get finished files from a queryset."""
    return [f for f in files if hasattr(f, 'file_type') and f.file_type == 'finished']

@register.filter
def get_reference_files(files):
    """Filter to get reference files from a queryset."""
    return [f for f in files if hasattr(f, 'file_type') and f.file_type == 'reference']

@register.filter
def friendly_timesince(value):
    """
    Converts a timesince string to a friendly format.
    Replaces '0 minutes' with 'Just now'.
    Returns the complete string with 'ago' suffix (except for 'Just now').
    """
    time_str = timesince(value).strip()
    # Replace non-breaking spaces with regular spaces
    time_str = time_str.replace('\xa0', ' ')
    
    # Check for "0 minutes" specifically (exact match)
    if time_str == '0 minutes':
        return 'Just now'
    
    return time_str + ' ago'
