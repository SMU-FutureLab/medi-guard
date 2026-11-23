
import logging
import sys

from dotenv import load_dotenv

from scripts.analyze_medicine_data import fetch_medicines
from database import get_connection


load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s: %(message)s",
)

logger = logging.getLogger(__name__)

CONTENT_FIELDS = {
    "efcyQesitm": "EFFICACY",
    "useMethodQesitm": "USAGE",
    "atpnWarnQesitm": "WARNING",
    "atpnQesitm": "PRECAUTION",
    "intrcQesitm": "INTERACTION",
    "seQesitm": "SIDE_EFFECT",
    "depositMethodQesitm": "STORAGE",
}

# 기본으로 저장할 약 (e약은요는 일반의약품 위주라 자주 찾는 일반의약품으로 구성)
DEFAULT_SEARCH_NAMES = [
    "타이레놀",
    "게보린",
    "펜잘",
    "판콜",
    "판피린",
    "부루펜",
    "베아제",
    "훼스탈",
]

SOURCE_NAME = "식품의약품안전처"
SOURCE_URL = (
    "https://apis.data.go.kr/1471000/"
    "DrbEasyDrugInfoService/getDrbEasyDrugList"
)


def save_medicine(medicine: dict) -> None:
    item_seq = str(medicine.get("itemSeq") or "").strip()
    item_name = str(medicine.get("itemName") or "").strip()
    # 업체명·낱알 이미지 (없으면 NULL)
    entp_name = str(medicine.get("entpName") or "").strip() or None
    item_image = str(medicine.get("itemImage") or "").strip() or None

    if not item_seq or not item_name:
        raise ValueError("의약품명 또는 품목기준코드가 없습니다.")

    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO medicines (item_seq, item_name, entp_name, item_image)
                VALUES (%s, %s, %s, %s)
                ON CONFLICT (item_seq)
                DO UPDATE SET
                    item_name = EXCLUDED.item_name,
                    entp_name = EXCLUDED.entp_name,
                    item_image = EXCLUDED.item_image,
                    updated_at = CURRENT_TIMESTAMP
                """,
                (item_seq, item_name, entp_name, item_image),
            )

            saved_contents = 0

            for api_field, content_type in CONTENT_FIELDS.items():
                original_text = medicine.get(api_field)

                if not isinstance(original_text, str):
                    continue

                original_text = original_text.strip()

                if not original_text:
                    continue

                cursor.execute(
                    """
                    INSERT INTO medicine_contents (
                        item_seq,
                        content_type,
                        api_field,
                        original_text,
                        source_name,
                        source_url
                    )
                    VALUES (%s, %s, %s, %s, %s, %s)
                    ON CONFLICT (item_seq, api_field)
                    DO UPDATE SET
                        content_type = EXCLUDED.content_type,
                        original_text = EXCLUDED.original_text,
                        source_name = EXCLUDED.source_name,
                        source_url = EXCLUDED.source_url,
                        retrieved_at = CURRENT_TIMESTAMP
                    """,
                    (
                        item_seq,
                        content_type,
                        api_field,
                        original_text,
                        SOURCE_NAME,
                        SOURCE_URL,
                    ),
                )

                saved_contents += 1

    logger.info(
        "의약품 저장 완료: %s / 원문 %d건",
        item_name,
        saved_contents,
    )


def main() -> None:
    logger.info("의약품 API 조회 시작")

    # 저장할 약 이름 목록. 실행할 때 직접 줄 수도 있다:
    #   python -m scripts.save_medicine_data 타이레놀 게보린 베아제
    names = sys.argv[1:] or DEFAULT_SEARCH_NAMES

    total = 0

    for name in names:
        try:
            medicines = fetch_medicines(name)
        except Exception:
            logger.exception("의약품 조회 실패: %s", name)
            continue

        if not medicines:
            logger.warning("저장할 의약품 데이터가 없습니다: %s", name)
            continue

        for medicine in medicines:
            save_medicine(medicine)

        total += len(medicines)

    logger.info("전체 저장 작업 종료: %d건", total)


if __name__ == "__main__":
    main()
