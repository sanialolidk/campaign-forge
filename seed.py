from campaign_forge.db import SessionLocal
from campaign_forge.models import Module

MODULES = [
    {
        "slug": "seo-basics",
        "title": "SEO Fundamentals",
        "category": "SEO",
        "order": 1,
        "content": """## What is SEO?
Search Engine Optimization (SEO) is the practice of improving your website so it ranks higher in search engine results pages (SERPs).

## How Search Engines Work
Search engines crawl the web, index pages, and rank them based on relevance and authority. The three pillars are:
- **Crawlability** — can bots find and read your pages?
- **Relevance** — does your content match what users search for?
- **Authority** — do other sites link to yours?

## Key Ranking Factors
1. **Keywords** — match what your audience searches
2. **Title tags** — the most important on-page element
3. **Backlinks** — links from trusted sites boost authority
4. **Page speed** — slow sites rank lower
5. **Mobile-friendliness** — Google indexes mobile-first

## On-Page SEO Checklist
- Use your keyword in the title tag (under 60 characters)
- Write a meta description under 155 characters
- Use H1 for the page title, H2/H3 for sections
- Add alt text to all images
- Link internally to related pages

## Key Terms
- **SERP** — Search Engine Results Page
- **Organic traffic** — visitors from unpaid search results
- **Keyword difficulty** — how hard it is to rank for a term
- **Domain authority** — a score (1–100) of your site's credibility""",
    },
    {
        "slug": "paid-search",
        "title": "Paid Search (PPC)",
        "category": "Paid",
        "order": 2,
        "content": """## What is PPC?
Pay-Per-Click advertising means you pay each time someone clicks your ad. Google Ads is the dominant platform.

## How Google Ads Works
You bid on keywords. When someone searches that keyword, Google runs an auction. The winner's ad appears at the top of the SERP.

**Ad Rank = Bid × Quality Score**

Quality Score is Google's rating (1–10) of your ad's relevance, click-through rate, and landing page experience.

## Key Metrics
| Metric | What it means |
|--------|--------------|
| CPC | Cost Per Click — what you pay per click |
| CTR | Click-Through Rate — clicks ÷ impressions |
| CPA | Cost Per Acquisition — cost to get one customer |
| ROAS | Return on Ad Spend — revenue ÷ ad spend |
| Impression Share | % of auctions where your ad showed |

## Campaign Structure
Account → Campaigns → Ad Groups → Ads + Keywords

Keep ad groups tightly themed. One product or service per ad group.

## Match Types
- **Broad match** — shows for related searches (wide reach, less control)
- **Phrase match** — "keyword" — must contain the phrase
- **Exact match** — [keyword] — must match exactly

## Negative Keywords
Words you exclude. If you sell premium products, add "cheap" and "free" as negatives to avoid unqualified clicks.""",
    },
    {
        "slug": "email-marketing",
        "title": "Email Marketing",
        "category": "Email",
        "order": 3,
        "content": """## Why Email Marketing?
Email delivers an average ROI of $36 for every $1 spent — higher than any other channel.

## List Building
- Use lead magnets (free guides, discounts, tools)
- Add signup forms to high-traffic pages
- Never buy email lists — it destroys deliverability

## Key Metrics
| Metric | Benchmark |
|--------|-----------|
| Open rate | 20–25% |
| Click rate | 2–3% |
| Unsubscribe rate | <0.5% |
| Bounce rate | <2% |

## Email Types
1. **Welcome sequence** — sent automatically when someone subscribes
2. **Newsletter** — regular content updates
3. **Promotional** — sales, offers, product launches
4. **Transactional** — order confirmations, password resets
5. **Re-engagement** — win back inactive subscribers

## Deliverability
Deliverability = % of emails that reach the inbox (not spam).

Improve it by:
- Authenticating your domain (SPF, DKIM, DMARC)
- Cleaning your list regularly
- Keeping complaint rates under 0.1%
- Warming up new sending domains gradually

## Subject Line Best Practices
- Keep under 50 characters
- Create curiosity or urgency without clickbait
- Personalize with the subscriber's name
- A/B test every send""",
    },
    {
        "slug": "social-media",
        "title": "Social Media Marketing",
        "category": "Social",
        "order": 4,
        "content": """## Choosing the Right Platforms
Don't be everywhere. Pick 1–2 platforms based on where your audience actually is.

| Platform | Best for |
|----------|----------|
| Instagram | Visual brands, B2C, lifestyle |
| LinkedIn | B2B, professional services, recruiting |
| TikTok | Young audiences, entertainment, product discovery |
| X (Twitter) | News, tech, thought leadership |
| Pinterest | Home, fashion, food, DIY |

## Organic vs Paid Social
- **Organic** — content you post for free. Reach is limited by algorithms.
- **Paid** — boosted posts and ads. You control who sees them.

## Content Types by Engagement (highest to lowest)
1. Short-form video (Reels, TikToks)
2. Carousels
3. Stories
4. Static images
5. Text posts

## Key Metrics
- **Reach** — unique accounts who saw your content
- **Impressions** — total times your content was shown
- **Engagement rate** — (likes + comments + shares) ÷ reach
- **CPM** — Cost Per 1,000 Impressions (paid)
- **CPC** — Cost Per Click (paid)

## The Algorithm Formula
Engagement rate is the most important signal. Posts with high early engagement get shown to more people. Post when your audience is most active.""",
    },
    {
        "slug": "analytics",
        "title": "Marketing Analytics",
        "category": "Analytics",
        "order": 5,
        "content": """## Why Analytics?
Data tells you what's working and where to invest more. Without it, you're guessing.

## The Funnel
Every customer goes through stages:
**Awareness → Consideration → Decision → Retention**

Measure each stage separately. A problem at any stage kills the whole funnel.

## Key Metrics by Stage
| Stage | Metrics |
|-------|---------|
| Awareness | Impressions, reach, traffic |
| Consideration | Time on site, pages per session, email signups |
| Decision | Conversion rate, CPA, revenue |
| Retention | Churn rate, LTV, repeat purchase rate |

## Essential KPIs
- **CAC** — Customer Acquisition Cost = total spend ÷ new customers
- **LTV** — Lifetime Value = average order value × purchase frequency × customer lifespan
- **LTV:CAC ratio** — healthy businesses aim for 3:1 or higher
- **ROAS** — Return on Ad Spend = revenue from ads ÷ ad spend
- **Conversion rate** — % of visitors who take the desired action

## Attribution Models
How do you credit which channel drove a sale?
- **Last click** — 100% credit to the last touchpoint before conversion
- **First click** — 100% credit to the first touchpoint
- **Linear** — equal credit to every touchpoint
- **Data-driven** — ML-based, most accurate

## UTM Parameters
Tag your URLs to track traffic sources in Google Analytics.
`?utm_source=newsletter&utm_medium=email&utm_campaign=summer-sale`""",
    },
    {
        "slug": "marketing-funnels",
        "title": "Marketing Funnels",
        "category": "Strategy",
        "order": 6,
        "content": """## What is a Marketing Funnel?
A framework for mapping the customer journey from first contact to purchase and beyond.

## TOFU / MOFU / BOFU
- **TOFU** (Top of Funnel) — Awareness. Broad audience, low intent. Goal: get attention.
- **MOFU** (Middle of Funnel) — Consideration. Interested audience. Goal: build trust.
- **BOFU** (Bottom of Funnel) — Decision. High intent. Goal: convert.

## Content by Funnel Stage
| Stage | Content Types |
|-------|--------------|
| TOFU | Blog posts, social media, YouTube videos, podcasts |
| MOFU | Email sequences, webinars, case studies, comparisons |
| BOFU | Free trials, demos, testimonials, discount offers |

## Conversion Rate Optimization (CRO)
CRO is the practice of increasing the % of visitors who take action.

Key levers:
- **Headlines** — most-read element on any page
- **Social proof** — reviews, logos, case studies
- **CTA clarity** — one clear action per page
- **Page speed** — every 1 second delay drops conversions ~7%
- **Trust signals** — security badges, money-back guarantees

## Calculating Funnel Drop-off
If 1,000 people visit → 200 start checkout → 50 buy:
- Visit-to-checkout rate: 20%
- Checkout-to-purchase rate: 25%
- Overall conversion rate: 5%

Focus optimization on the stage with the biggest drop-off first.""",
    },
]


def seed():
    db = SessionLocal()
    try:
        existing = db.query(Module).count()
        if existing == 0:
            for m in MODULES:
                db.add(Module(**m))
            db.commit()
            print(f"Seeded {len(MODULES)} modules.")
        else:
            print(f"Skipped — {existing} modules already in DB.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
