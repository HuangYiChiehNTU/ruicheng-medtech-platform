"""Import Ruicheng public-site CMS and product data into a local backend DB.

Run this after applying the patch and running Alembic migrations:

    cd backend
    ../ruicheng-public-site-full-bundle/import_public_site_data.py

By default it imports into backend/sleek_dev.db. Pass a custom SQLite path as
the first argument if needed.
"""
from __future__ import annotations

import json
import sqlite3
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parent
DATA_DIR = ROOT / "data"


def load_json(name: str):
    return json.loads((DATA_DIR / name).read_text(encoding="utf-8"))


def columns(cursor: sqlite3.Cursor, table: str) -> set[str]:
    return {row[1] for row in cursor.execute(f"PRAGMA table_info({table})")}


def table_exists(cursor: sqlite3.Cursor, table: str) -> bool:
    return cursor.execute(
        "SELECT 1 FROM sqlite_master WHERE type='table' AND name=?",
        (table,),
    ).fetchone() is not None


def upsert_public_site_content(cursor: sqlite3.Cursor) -> None:
    payload = load_json("cms-current-content.json")
    content_text = json.dumps(payload["content"], ensure_ascii=False)
    existing = cursor.execute(
        "SELECT content_id FROM public_site_contents WHERE slug=?",
        (payload.get("slug") or "default",),
    ).fetchone()
    if existing:
        cursor.execute(
            "UPDATE public_site_contents SET content=?, updated_at=CURRENT_TIMESTAMP WHERE slug=?",
            (content_text, payload.get("slug") or "default"),
        )
    else:
        cursor.execute(
            "INSERT INTO public_site_contents (slug, content, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)",
            (payload.get("slug") or "default", content_text),
        )


def upsert_products(cursor: sqlite3.Cursor) -> None:
    rows = load_json("public-products.json")
    if not rows or not table_exists(cursor, "products"):
        return

    available = columns(cursor, "products")
    for row in rows:
        row = {key: value for key, value in row.items() if key in available and key != "product_id"}
        if not row.get("sku"):
            continue
        existing = cursor.execute("SELECT product_id FROM products WHERE sku=?", (row["sku"],)).fetchone()
        if existing:
            assignments = ", ".join(f"{key}=?" for key in row if key != "sku")
            values = [value for key, value in row.items() if key != "sku"]
            if assignments:
                cursor.execute(
                    f"UPDATE products SET {assignments} WHERE sku=?",
                    [*values, row["sku"]],
                )
        else:
            keys = list(row)
            placeholders = ", ".join("?" for _ in keys)
            cursor.execute(
                f"INSERT INTO products ({', '.join(keys)}) VALUES ({placeholders})",
                [row[key] for key in keys],
            )


def main() -> None:
    db_path = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("sleek_dev.db")
    if not db_path.exists():
        raise SystemExit(f"Database not found: {db_path}")

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    if not table_exists(cursor, "public_site_contents"):
        raise SystemExit("public_site_contents table not found. Run alembic upgrade head first.")

    upsert_public_site_content(cursor)
    upsert_products(cursor)
    conn.commit()
    print("Imported CMS content and product catalog data.")


if __name__ == "__main__":
    main()
