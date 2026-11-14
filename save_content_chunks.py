
import logging

from database import get_connection
from chunking import split_text


logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s: %(message)s",
)

logger = logging.getLogger(__name__)


def save_content_chunks() -> None:
    total_contents = 0
    total_chunks = 0

    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT content_id, original_text
                FROM medicine_contents
                ORDER BY content_id
                """
            )

            contents = cursor.fetchall()

            for content_id, original_text in contents:
                chunks = split_text(original_text)

                cursor.execute(
                    """
                    DELETE FROM content_chunks
                    WHERE content_id = %s
                    """,
                    (content_id,),
                )

                if chunks:
                    cursor.executemany(
                        """
                        INSERT INTO content_chunks (
                            content_id,
                            chunk_index,
                            chunk_text
                        )
                        VALUES (%s, %s, %s)
                        """,
                        [
                            (content_id, index, chunk)
                            for index, chunk in enumerate(chunks)
                        ],
                    )

                total_contents += 1
                total_chunks += len(chunks)

    logger.info("원문 처리 완료: %d건", total_contents)
    logger.info("생성된 청크: %d건", total_chunks)


if __name__ == "__main__":
    save_content_chunks()
