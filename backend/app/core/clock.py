from datetime import datetime, timezone


def utcnow() -> datetime:
    """Naive UTC timestamp; SQLite drops tzinfo, so everything is stored as UTC."""
    return datetime.now(timezone.utc).replace(tzinfo=None)


def to_naive_utc(value: datetime) -> datetime:
    """Normalise an incoming datetime to naive UTC (naive input is assumed to be UTC)."""
    if value.tzinfo is None:
        return value
    return value.astimezone(timezone.utc).replace(tzinfo=None)
