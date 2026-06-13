import asyncio
from collections import defaultdict
from typing import Any

import httpx
from sqlalchemy import select

from app.core.db import async_session_factory
from app.core.security import hash_password
from app.models.category import Category
from app.models.product import Product, ProductImage
from app.models.user import User

DUMMYJSON_BASE = "https://dummyjson.com"
USD_TO_INR = 83
MIN_PRODUCTS_PER_CATEGORY = 6

CATEGORIES = [
    ("Electronics", "electronics"),
    ("Mobiles", "mobiles"),
    ("Computers", "computers"),
    ("Fashion", "fashion"),
    ("Home & Kitchen", "home-kitchen"),
    ("Books", "books"),
    ("Beauty", "beauty"),
    ("Sports", "sports"),
    ("Toys", "toys"),
    ("Appliances", "appliances"),
]

# Maps DummyJSON category slugs to our local category slugs.
DUMMYJSON_CATEGORY_MAP: dict[str, str] = {
    "smartphones": "mobiles",
    "tablets": "mobiles",
    "laptops": "computers",
    "mobile-accessories": "electronics",
    "mens-watches": "electronics",
    "womens-watches": "electronics",
    "mens-shirts": "fashion",
    "mens-shoes": "fashion",
    "womens-dresses": "fashion",
    "womens-shoes": "fashion",
    "tops": "fashion",
    "womens-bags": "fashion",
    "womens-jewellery": "fashion",
    "sunglasses": "fashion",
    "kitchen-accessories": "home-kitchen",
    "home-decoration": "home-kitchen",
    "groceries": "home-kitchen",
    "furniture": "appliances",
    "beauty": "beauty",
    "fragrances": "beauty",
    "skin-care": "beauty",
    "sports-accessories": "sports",
    "motorcycle": "sports",
    "vehicle": "appliances",
}

# Used to fill categories that DummyJSON does not provide directly.
SYNTHETIC_CATEGORY_PREFIXES: dict[str, str] = {
    "books": "Bestselling Illustrated Edition",
    "toys": "Fun Educational Playset",
}

SPEC_TEMPLATES: dict[str, dict[str, str]] = {
    "electronics": {"Connectivity": "Bluetooth 5.3", "Battery": "30 hours", "Weight": "250g", "Warranty": "1 Year"},
    "mobiles": {"RAM": "8GB", "Storage": "128GB", "Display": "6.5 inch AMOLED", "Battery": "5000mAh"},
    "computers": {"Interface": "USB-C", "Compatibility": "Windows/Mac", "Warranty": "1 Year", "Color": "Black"},
    "fashion": {"Material": "Cotton Blend", "Fit": "Regular", "Care": "Machine Wash", "Origin": "India"},
    "home-kitchen": {"Material": "Stainless Steel", "Dishwasher Safe": "Yes", "Warranty": "2 Years", "Origin": "India"},
    "books": {"Language": "English", "Format": "Paperback", "Publisher": "Premium Press", "Pages": "320"},
    "beauty": {"Skin Type": "All", "Volume": "100ml", "Paraben Free": "Yes", "Cruelty Free": "Yes"},
    "sports": {"Material": "High Grade", "Usage": "Indoor/Outdoor", "Warranty": "6 Months", "Color": "Multi"},
    "toys": {"Age Group": "3+ Years", "Material": "Non-toxic Plastic", "Battery": "Included", "Pieces": "1"},
    "appliances": {"Energy Rating": "5 Star", "Voltage": "230V", "Warranty": "2 Years", "Color": "Silver"},
}


def _enrich_title(item: dict[str, Any], category_slug: str) -> str:
    brand = item.get("brand") or "Premium"
    title = item.get("title") or "Product"
    prefix = SYNTHETIC_CATEGORY_PREFIXES.get(category_slug, "")
    category_label = category_slug.replace("-", " ").title()

    candidates = [
        f"{brand} {title} {prefix}".strip(),
        f"{brand} {title} Premium {category_label} with Advanced Features and Reliable Quality",
        f"{brand} {title} Original Authentic {category_label} for Everyday Premium Performance",
    ]

    for candidate in candidates:
        if len(candidate.split()) >= 10:
            return candidate

    return f"{brand} {title} Premium Quality Original Authentic Product with Advanced Features"


def _enrich_description(item: dict[str, Any], category_slug: str) -> str:
    brand = item.get("brand") or "Premium"
    title = item.get("title") or "this product"
    base = item.get("description") or f"The {title} is a quality {category_slug.replace('-', ' ')} product."
    warranty = item.get("warrantyInformation") or "Standard manufacturer warranty included"
    shipping = item.get("shippingInformation") or "Ships within 3-5 business days"
    return_policy = item.get("returnPolicy") or "Easy return policy available"
    availability = item.get("availabilityStatus") or "In Stock"

    lines = [
        base,
        f"Discover the {brand} {title}, thoughtfully designed to deliver premium quality and reliable performance for modern lifestyles.",
        f"Availability status: {availability}. Every unit is quality-checked before dispatch to ensure you receive a genuine product.",
        f"Warranty coverage: {warranty}. {shipping}.",
        f"Shop with confidence — {return_policy}. Backed by {brand} customer support and secure packaging for safe delivery.",
    ]
    return "\n\n".join(lines)


def _build_features(item: dict[str, Any]) -> list[str]:
    features: list[str] = []

    tags = item.get("tags") or []
    if tags:
        features.append(f"Tagged for easy discovery: {', '.join(tags)}")

    for key, label in (
        ("warrantyInformation", "Warranty"),
        ("shippingInformation", "Shipping"),
        ("returnPolicy", "Returns"),
        ("availabilityStatus", "Availability"),
    ):
        value = item.get(key)
        if value:
            features.append(f"{label}: {value}")

    dimensions = item.get("dimensions") or {}
    if dimensions:
        features.append(
            "Dimensions (W x H x D): "
            f"{dimensions.get('width', 'N/A')} x {dimensions.get('height', 'N/A')} x {dimensions.get('depth', 'N/A')} cm"
        )

    weight = item.get("weight")
    if weight is not None:
        features.append(f"Weight: {weight} kg")

    sku = item.get("sku")
    if sku:
        features.append(f"SKU: {sku}")

    minimum_order = item.get("minimumOrderQuantity")
    if minimum_order:
        features.append(f"Minimum order quantity: {minimum_order}")

    if len(features) < 5:
        brand = item.get("brand") or "Premium"
        title = item.get("title") or "product"
        features.extend(
            [
                f"Authentic {brand} {title} sourced for quality and durability",
                "Highly rated by customers on the Amazon Clone marketplace",
                "Fast delivery eligible on qualifying orders across India",
            ]
        )

    return features[: max(5, len(features))]


def _build_specs(item: dict[str, Any], category_slug: str) -> dict[str, Any]:
    specs: dict[str, Any] = dict(SPEC_TEMPLATES.get(category_slug, {}))
    brand = item.get("brand")
    if brand:
        specs["Brand"] = brand

    if item.get("sku"):
        specs["SKU"] = item["sku"]
    if item.get("weight") is not None:
        specs["Weight"] = f"{item['weight']} kg"

    dimensions = item.get("dimensions") or {}
    if dimensions:
        specs["Dimensions"] = (
            f"{dimensions.get('width', 'N/A')} x {dimensions.get('height', 'N/A')} x {dimensions.get('depth', 'N/A')} cm"
        )

    if item.get("warrantyInformation"):
        specs["Warranty"] = item["warrantyInformation"]
    if item.get("shippingInformation"):
        specs["Shipping"] = item["shippingInformation"]
    if item.get("returnPolicy"):
        specs["Return Policy"] = item["returnPolicy"]

    return specs


def _build_images(item: dict[str, Any]) -> list[str]:
    images = [url for url in (item.get("images") or []) if url]
    thumbnail = item.get("thumbnail")
    if thumbnail and thumbnail not in images:
        images.insert(0, thumbnail)
    return images or ([thumbnail] if thumbnail else [])


def _transform_product(item: dict[str, Any], category_slug: str) -> dict[str, Any]:
    price_usd = float(item.get("price") or 0)
    price_cents = int(round(price_usd * USD_TO_INR * 100))
    discount = int(round(float(item.get("discountPercentage") or 0)))
    mrp_cents = round(price_cents / (1 - discount / 100)) if 0 < discount < 100 else price_cents
    reviews = item.get("reviews") or []

    return {
        "title": _enrich_title(item, category_slug),
        "brand": item.get("brand") or "",
        "description": _enrich_description(item, category_slug),
        "price_cents": max(price_cents, 99),
        "mrp_cents": max(mrp_cents, price_cents),
        "discount_percentage": discount,
        "rating": round(float(item.get("rating") or 4.0), 1),
        "reviews_count": max(len(reviews) * 150, 120),
        "stock": int(item.get("stock") or 0),
        "category": category_slug,
        "specs": _build_specs(item, category_slug),
        "features": _build_features(item),
        "images": _build_images(item),
    }


def _clone_for_category(product: dict[str, Any], category_slug: str, variant: int) -> dict[str, Any]:
    cloned = dict(product)
    cloned["category"] = category_slug
    cloned["title"] = f"{product['title']} {SYNTHETIC_CATEGORY_PREFIXES.get(category_slug, 'Special Edition')} Variant {variant + 1}"
    cloned["specs"] = dict(SPEC_TEMPLATES.get(category_slug, {}))
    cloned["specs"]["Brand"] = product.get("brand") or "Premium"
    return cloned


def _balance_categories(products: list[dict[str, Any]]) -> list[dict[str, Any]]:
    by_category: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for product in products:
        by_category[product["category"]].append(product)

    all_slugs = [slug for _, slug in CATEGORIES]
    pool = list(products)

    for slug in all_slugs:
        while len(by_category[slug]) < MIN_PRODUCTS_PER_CATEGORY and pool:
            source = pool[len(by_category[slug]) % len(pool)]
            variant = len(by_category[slug])
            by_category[slug].append(_clone_for_category(source, slug, variant))

    balanced: list[dict[str, Any]] = []
    for slug in all_slugs:
        balanced.extend(by_category[slug])
    return balanced


async def fetch_products_from_api() -> list[dict[str, Any]]:
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.get(f"{DUMMYJSON_BASE}/products", params={"limit": 0})
        response.raise_for_status()
        payload = response.json()

    products: list[dict[str, Any]] = []
    for item in payload.get("products", []):
        api_category = item.get("category", "")
        local_category = DUMMYJSON_CATEGORY_MAP.get(api_category)
        if not local_category:
            continue

        images = _build_images(item)
        if not images:
            continue

        products.append(_transform_product(item, local_category))

    if not products:
        raise RuntimeError("No products fetched from DummyJSON API")

    return _balance_categories(products)


async def seed() -> None:
    async with async_session_factory() as session:
        existing = await session.execute(select(Category).limit(1))
        if existing.scalar_one_or_none():
            print("Database already seeded. Skipping.")
            return

        print("Fetching products from DummyJSON API...")
        products = await fetch_products_from_api()

        category_map: dict[str, Category] = {}
        for name, slug in CATEGORIES:
            cat = Category(name=name, slug=slug)
            session.add(cat)
            category_map[slug] = cat

        await session.flush()

        for data in products:
            product = Product(
                title=data["title"],
                brand=data["brand"],
                description=data["description"],
                price_cents=data["price_cents"],
                mrp_cents=data["mrp_cents"],
                discount_percentage=data["discount_percentage"],
                rating=data["rating"],
                reviews_count=data["reviews_count"],
                stock=data["stock"],
                category_id=category_map[data["category"]].id,
                specs=data["specs"],
                features=data["features"],
                currency="INR",
            )
            session.add(product)
            await session.flush()

            for i, url in enumerate(data["images"]):
                session.add(ProductImage(product_id=product.id, url=url, sort_order=i))

        demo_user = User(
            email="demo@amazon-clone.com",
            hashed_password=hash_password("demo123"),
            full_name="Demo User",
        )
        session.add(demo_user)

        await session.commit()
        print(f"Seeded {len(CATEGORIES)} categories, {len(products)} products, and 1 demo user.")


if __name__ == "__main__":
    asyncio.run(seed())
