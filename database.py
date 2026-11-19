
import os
import logging

import psycopg
from dotenv import load_dotenv


load_dotenv()

logger = logging.getLogger(__name__)


def get_connection():
    connection = psycopg.connect(
        host=os.getenv("DB_HOST", "localhost"),
        port=os.getenv("DB_PORT", "5432"),
        dbname=os.getenv("DB_NAME", "medi_guard"),
        user=os.getenv("DB_USER", "postgres"),
        password=os.getenv("DB_PASSWORD"),
        connect_timeout=10,
    )

    return connection


def test_connection():
    try:
        with get_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute("SELECT current_database(), current_user;")
                result = cursor.fetchone()

        logger.info("PostgreSQL 연결 성공")
        print(f"데이터베이스: {result[0]}")
        print(f"사용자: {result[1]}")

    except psycopg.Error:
        logger.exception("PostgreSQL 연결 실패")
        raise


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    test_connection()
