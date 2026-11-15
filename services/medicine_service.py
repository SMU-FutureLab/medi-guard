
from database import get_connection


def search_medicines(keyword: str, page: int = 1, size: int = 10):
    offset = (page - 1) * size

    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT COUNT(*)
                FROM medicines
                WHERE item_name ILIKE %s;
                """,
                (f"%{keyword}%",)
            )

            total_count = cursor.fetchone()[0]

            cursor.execute(
                """
                SELECT item_seq, item_name
                FROM medicines
                WHERE item_name ILIKE %s
                ORDER BY item_name
                LIMIT %s OFFSET %s;
                """,
                (f"%{keyword}%", size, offset)
            )

            rows = cursor.fetchall()

    return {
        "keyword": keyword,
        "page": page,
        "size": size,
        "total_count": total_count,
        "items": [
            {
                "item_seq": row[0],
                "item_name": row[1]
            }
            for row in rows
        ]
    }


def get_medicine_detail(item_seq: str):
    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT item_seq, item_name, created_at, updated_at
                FROM medicines
                WHERE item_seq = %s;
                """,
                (item_seq,)
            )

            medicine = cursor.fetchone()

            if medicine is None:
                return None

            cursor.execute(
                """
                SELECT
                    content_id,
                    content_type,
                    api_field,
                    original_text,
                    source_name,
                    source_url,
                    retrieved_at
                FROM medicine_contents
                WHERE item_seq = %s
                ORDER BY content_id;
                """,
                (item_seq,)
            )

            contents = cursor.fetchall()

    return {
        "item_seq": medicine[0],
        "item_name": medicine[1],
        "created_at": medicine[2],
        "updated_at": medicine[3],
        "contents": [
            {
                "content_id": row[0],
                "content_type": row[1],
                "api_field": row[2],
                "original_text": row[3],
                "source_name": row[4],
                "source_url": row[5],
                "retrieved_at": row[6]
            }
            for row in contents
        ]
    }

def get_medicine_contents(item_seq: str):
    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT item_seq, item_name
                FROM medicines
                WHERE item_seq = %s;
                """,
                (item_seq,)
            )

            medicine = cursor.fetchone()

            if medicine is None:
                return None

            cursor.execute(
                """
                SELECT
                    content_id,
                    content_type,
                    api_field,
                    original_text,
                    source_name,
                    source_url,
                    retrieved_at
                FROM medicine_contents
                WHERE item_seq = %s
                ORDER BY content_id;
                """,
                (item_seq,)
            )

            contents = cursor.fetchall()

    return {
        "item_seq": medicine[0],
        "item_name": medicine[1],
        "contents": [
            {
                "content_id": row[0],
                "content_type": row[1],
                "api_field": row[2],
                "original_text": row[3],
                "source_name": row[4],
                "source_url": row[5],
                "retrieved_at": row[6]
            }
            for row in contents
        ]
    }