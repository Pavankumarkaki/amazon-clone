import asyncio

from sqlalchemy import select

from app.core.db import async_session_factory
from app.core.security import hash_password
from app.models.category import Category
from app.models.product import Product, ProductImage
from app.models.user import User

CATEGORIES = [
    ("Electronics", "electronics"),
    ("Books", "books"),
    ("Home & Kitchen", "home-kitchen"),
    ("Fashion", "fashion"),
    ("Sports", "sports"),
]

PRODUCTS = [
    {
        "title": "Wireless Bluetooth Headphones",
        "description": "Premium over-ear headphones with active noise cancellation, 30-hour battery life, and crystal-clear audio quality.",
        "price_cents": 7999,
        "stock": 50,
        "category": "electronics",
        "specs": {"Brand": "SoundMax", "Battery": "30 hours", "Connectivity": "Bluetooth 5.3", "Weight": "250g"},
        "images": [
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600",
            "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600",
        ],
    },
    {
        "title": "4K Ultra HD Smart TV 55 inch",
        "description": "Stunning 4K resolution with HDR support, built-in streaming apps, and voice control.",
        "price_cents": 49999,
        "stock": 20,
        "category": "electronics",
        "specs": {"Screen": "55 inch", "Resolution": "4K UHD", "HDR": "Dolby Vision", "Smart": "Yes"},
        "images": ["https://images.unsplash.com/photo-1593359672873-a7850647df70?w=600"],
    },
    {
        "title": "Mechanical Gaming Keyboard RGB",
        "description": "Tactile mechanical switches with customizable RGB backlighting for the ultimate gaming experience.",
        "price_cents": 12999,
        "stock": 35,
        "category": "electronics",
        "specs": {"Switch": "Cherry MX Red", "Layout": "Full-size", "Backlight": "RGB", "Connection": "USB-C"},
        "images": ["https://images.unsplash.com/photo-1704225618883-c7847102e6d4?w=500",
                    "https://images.unsplash.com/photo-1648860694064-03e6d6ee87f2?w=500"
            ],
    },
    {
        "title": "Wireless Mouse Ergonomic",
        "description": "Comfortable ergonomic design with precision tracking and long battery life.",
        "price_cents": 2999,
        "stock": 100,
        "category": "electronics",
        "specs": {"DPI": "16000", "Buttons": "6", "Battery": "70 days", "Connection": "2.4GHz + Bluetooth"},
        "images": ["https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600"],
    },
    {
        "title": "Portable Bluetooth Speaker",
        "description": "Waterproof portable speaker with 360-degree sound and 12-hour playtime.",
        "price_cents": 5999,
        "stock": 60,
        "category": "electronics",
        "specs": {"Waterproof": "IPX7", "Battery": "12 hours", "Power": "20W", "Weight": "540g"},
        "images": ["https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600"],
    },
    {
        "title": "The Pragmatic Programmer",
        "description": "Your journey to mastery. A classic guide for software developers at every level.",
        "price_cents": 3999,
        "stock": 80,
        "category": "books",
        "specs": {"Author": "David Thomas & Andrew Hunt", "Pages": "352", "Publisher": "Addison-Wesley", "Edition": "20th Anniversary"},
        "images": ["https://images.unsplash.com/photo-1532012197260-da84d127e765?w=600"],
    },
    {
        "title": "Clean Code: A Handbook",
        "description": "Learn to write clean, maintainable code that any developer can understand.",
        "price_cents": 3499,
        "stock": 75,
        "category": "books",
        "specs": {"Author": "Robert C. Martin", "Pages": "464", "Publisher": "Prentice Hall", "Language": "English"},
        "images": ["https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600"],
    },
    {
        "title": "Designing Data-Intensive Applications",
        "description": "The big ideas behind reliable, scalable, and maintainable systems.",
        "price_cents": 4499,
        "stock": 45,
        "category": "books",
        "specs": {"Author": "Martin Kleppmann", "Pages": "616", "Publisher": "O'Reilly", "Language": "English"},
        "images": ["https://images.unsplash.com/photo-1589998059174-4d0fa4a2a930?w=600"],
    },
    {
        "title": "Atomic Habits",
        "description": "An easy and proven way to build good habits and break bad ones.",
        "price_cents": 1599,
        "stock": 120,
        "category": "books",
        "specs": {"Author": "James Clear", "Pages": "320", "Publisher": "Avery", "Language": "English"},
        "images": ["https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=600"],
    },
    {
        "title": "Stainless Steel Cookware Set 10-Piece",
        "description": "Professional-grade stainless steel cookware set with even heat distribution.",
        "price_cents": 19999,
        "stock": 25,
        "category": "home-kitchen",
        "specs": {"Material": "18/10 Stainless Steel", "Pieces": "10", "Oven Safe": "500°F", "Dishwasher Safe": "Yes"},
        "images": ["https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600"],
    },
    {
        "title": "Programmable Coffee Maker",
        "description": "Brew the perfect cup with 24-hour programmable timer and thermal carafe.",
        "price_cents": 8999,
        "stock": 40,
        "category": "home-kitchen",
        "specs": {"Capacity": "12 cups", "Timer": "24-hour", "Carafe": "Thermal", "Filter": "Permanent gold-tone"},
        "images": ["https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600"],
    },
    {
        "title": "Air Fryer 6 Quart",
        "description": "Healthy cooking with 85% less fat. 8 preset cooking functions.",
        "price_cents": 11999,
        "stock": 30,
        "category": "home-kitchen",
        "specs": {"Capacity": "6 Quart", "Power": "1700W", "Presets": "8", "Temperature": "180-400°F"},
        "images": ["https://images.unsplash.com/photo-1585515320310-259814833e62?w=600"],
    },
    {
        "title": "Men's Classic Fit Dress Shirt",
        "description": "Wrinkle-resistant cotton blend dress shirt for professional and casual wear.",
        "price_cents": 3499,
        "stock": 90,
        "category": "fashion",
        "specs": {"Material": "60% Cotton, 40% Polyester", "Fit": "Classic", "Care": "Machine Wash", "Collar": "Spread"},
        "images": ["https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600"],
    },
    {
        "title": "Women's Running Shoes",
        "description": "Lightweight running shoes with responsive cushioning and breathable mesh upper.",
        "price_cents": 8999,
        "stock": 55,
        "category": "fashion",
        "specs": {"Type": "Running", "Sole": "Rubber", "Upper": "Mesh", "Weight": "220g"},
        "images": ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600"],
    },
    {
        "title": "Leather Crossbody Bag",
        "description": "Genuine leather crossbody bag with adjustable strap and multiple compartments.",
        "price_cents": 5999,
        "stock": 40,
        "category": "fashion",
        "specs": {"Material": "Genuine Leather", "Dimensions": "10x8x3 in", "Strap": "Adjustable", "Color": "Brown"},
        "images": ["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600"],
    },
    {
        "title": "Yoga Mat Premium 6mm",
        "description": "Non-slip yoga mat with alignment lines and carrying strap included.",
        "price_cents": 2999,
        "stock": 70,
        "category": "sports",
        "specs": {"Thickness": "6mm", "Material": "TPE", "Size": "72x24 in", "Weight": "2.5 lbs"},
        "images": ["https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600"],
    },
    {
        "title": "Adjustable Dumbbell Set 20kg",
        "description": "Space-saving adjustable dumbbells from 2.5kg to 20kg per hand.",
        "price_cents": 24999,
        "stock": 15,
        "category": "sports",
        "specs": {"Weight Range": "2.5-20kg", "Material": "Steel", "Adjustment": "Quick-dial", "Pairs": "1"},
        "images": ["https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600"],
    },
    {
        "title": "Camping Tent 4-Person",
        "description": "Waterproof 4-person tent with easy setup and ventilation windows.",
        "price_cents": 15999,
        "stock": 20,
        "category": "sports",
        "specs": {"Capacity": "4 Person", "Waterproof": "3000mm", "Setup": "5 minutes", "Weight": "8.5 lbs"},
        "images": ["https://images.unsplash.com/photo-1478131338917-66046c5b7025?w=600"],
    },
    {
        "title": "Smart Watch Fitness Tracker",
        "description": "Track your health with heart rate monitor, GPS, and 7-day battery life.",
        "price_cents": 19999,
        "stock": 45,
        "category": "electronics",
        "specs": {"Display": "1.4 inch AMOLED", "Battery": "7 days", "GPS": "Built-in", "Water Resistant": "5ATM"},
        "images": ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600"],
    },
    {
        "title": "USB-C Laptop Charger 65W",
        "description": "Compact GaN charger compatible with MacBook, Dell, and other USB-C laptops.",
        "price_cents": 3999,
        "stock": 85,
        "category": "electronics",
        "specs": {"Power": "65W", "Ports": "2 USB-C", "Technology": "GaN", "Weight": "120g"},
        "images": ["https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600"],
    },
]


async def seed() -> None:
    async with async_session_factory() as session:
        existing = await session.execute(select(Category).limit(1))
        if existing.scalar_one_or_none():
            print("Database already seeded. Skipping.")
            return

        category_map: dict[str, Category] = {}
        for name, slug in CATEGORIES:
            cat = Category(name=name, slug=slug)
            session.add(cat)
            category_map[slug] = cat

        await session.flush()

        for data in PRODUCTS:
            product = Product(
                title=data["title"],
                description=data["description"],
                price_cents=data["price_cents"],
                stock=data["stock"],
                category_id=category_map[data["category"]].id,
                specs=data["specs"],
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
        print(f"Seeded {len(CATEGORIES)} categories, {len(PRODUCTS)} products, and 1 demo user.")


if __name__ == "__main__":
    asyncio.run(seed())
