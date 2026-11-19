from database import get_connection

conn = get_connection()

try:
    with conn.cursor() as cur:
        cur.execute("SELECT COUNT(*) FROM medicine_contents")
        print("원본 의약품 정보:", cur.fetchone()[0], "건")

        cur.execute("SELECT COUNT(*) FROM content_chunks")
        print("저장된 청크:", cur.fetchone()[0], "개")

        cur.execute("""
            SELECT COUNT(DISTINCT content_id)
            FROM content_chunks
        """)
        print("청크가 생성된 원본 수:", cur.fetchone()[0], "건")

        cur.execute("""
            SELECT COUNT(*)
            FROM medicine_contents mc
            LEFT JOIN content_chunks cc
                ON mc.content_id = cc.content_id
            WHERE cc.content_id IS NULL
        """)
        print("청크가 없는 원본:", cur.fetchone()[0], "건")

finally:
    conn.close()
