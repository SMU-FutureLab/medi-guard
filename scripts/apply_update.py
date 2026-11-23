"""
이번 업데이트를 DB에 한 번에 적용한다. (여러 번 실행해도 안전)

    python -m scripts.apply_update

1) medicines 테이블에 업체명(entp_name)·이미지(item_image) 칸 추가
2) 식약처 e약은요 API에서 약 정보 다시 받아 저장 (업체명·이미지 포함, 기본 8종)
3) 검색용 원문 조각(content_chunks) 다시 만들기

끝나면 서버(uvicorn)를 재시작하면 된다.
"""
import logging

from dotenv import load_dotenv

from database import get_connection
from scripts.save_content_chunks import save_content_chunks
from scripts.save_medicine_data import main as save_medicines

load_dotenv()

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s: %(message)s")
logger = logging.getLogger(__name__)


def add_columns() -> None:
    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute("ALTER TABLE medicines ADD COLUMN IF NOT EXISTS entp_name VARCHAR(255);")
            cursor.execute("ALTER TABLE medicines ADD COLUMN IF NOT EXISTS item_image TEXT;")
    logger.info("1/3 DB 칸 추가 완료 (entp_name, item_image)")


def main() -> None:
    add_columns()

    logger.info("2/3 약 정보 저장 시작")
    save_medicines()

    logger.info("3/3 검색용 원문 조각 만들기 시작")
    save_content_chunks()

    logger.info("완료! 이제 서버를 재시작하세요: uvicorn main:app --host 0.0.0.0 --port 8811")


if __name__ == "__main__":
    main()
