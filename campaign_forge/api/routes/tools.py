from fastapi import APIRouter, Depends
from urllib.parse import urlencode, urlparse, urlunparse
import math

from campaign_forge.api.auth import get_current_user
from campaign_forge.models import User
from campaign_forge.schemas import UTMParams, UTMResult, ABTestInput, ABTestResult, BudgetInput, BudgetResult

router = APIRouter()

CHANNEL_BENCHMARKS = {
    "SEO": 0.25,
    "Paid Search": 0.20,
    "Social Media": 0.20,
    "Email": 0.15,
    "Display": 0.10,
    "Other": 0.10,
}


@router.post("/utm", response_model=UTMResult)
def build_utm(body: UTMParams, current_user: User = Depends(get_current_user)):
    params = {
        "utm_source": body.source,
        "utm_medium": body.medium,
        "utm_campaign": body.campaign,
    }
    if body.term:
        params["utm_term"] = body.term
    if body.content:
        params["utm_content"] = body.content

    parsed = urlparse(body.url)
    separator = "&" if parsed.query else "?"
    utm_url = f"{body.url}{separator}{urlencode(params)}"
    return UTMResult(utm_url=utm_url, params=params)


@router.post("/abtest", response_model=ABTestResult)
def ab_test(body: ABTestInput, current_user: User = Depends(get_current_user)):
    rate_a = body.conversions_a / body.visitors_a if body.visitors_a else 0
    rate_b = body.conversions_b / body.visitors_b if body.visitors_b else 0
    relative = ((rate_b - rate_a) / rate_a * 100) if rate_a else 0

    p = (body.conversions_a + body.conversions_b) / (body.visitors_a + body.visitors_b) if (body.visitors_a + body.visitors_b) else 0
    se = math.sqrt(p * (1 - p) * (1 / body.visitors_a + 1 / body.visitors_b)) if (body.visitors_a and body.visitors_b) else 0
    z = abs(rate_b - rate_a) / se if se else 0

    if z > 2.576:
        confidence = "99%"
    elif z > 1.96:
        confidence = "95%"
    elif z > 1.645:
        confidence = "90%"
    else:
        confidence = "Not significant"

    winner = "B" if rate_b > rate_a else ("A" if rate_a > rate_b else "Tie")

    return ABTestResult(
        rate_a=round(rate_a * 100, 2),
        rate_b=round(rate_b * 100, 2),
        relative_improvement=round(relative, 1),
        winner=winner,
        confidence=confidence,
    )


@router.post("/budget", response_model=BudgetResult)
def split_budget(body: BudgetInput, current_user: User = Depends(get_current_user)):
    weights = {c: CHANNEL_BENCHMARKS.get(c, 0.10) for c in body.channels}
    total_weight = sum(weights.values())
    allocations = {
        channel: round(body.total_budget * w / total_weight, 2)
        for channel, w in weights.items()
    }
    return BudgetResult(allocations=allocations, total=body.total_budget)
