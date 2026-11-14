
import os
import logging
from typing import Any

import requests


API_URL = (
    "https://apis.data.go.kr/1471000/"
    "DrbEasyDrugInfoService/getDrbEasyDrugList"
)

TIMEOUT = 20
PAGE_NO = 1
NUM_OF_ROWS = 10
SEARCH_NAME = "타이레놀"
SUCCESS_CODES = {"00"}

FIELDS = {
    "itemName": "의약품명",
    "itemSeq": "품목기준코드",
    "efcyQesitm": "효능·효과",
    "useMethodQesitm": "용법·사용법",
    "atpnWarnQesitm": "경고사항",
    "atpnQesitm": "사용상 주의사항",
    "intrcQesitm": "상호작용",
    "seQesitm": "부작용",
    "depositMethodQesitm": "보관방법",
}

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s: %(message)s",
)

logger = logging.getLogger(__name__)


class MedicineAPIError(Exception):
    pass


def get_items(data: dict[str, Any]) -> list[dict[str, Any]]:
    body = data.get("body", data)

    if isinstance(body, list):
        items = body
    elif isinstance(body, dict):
        items = body.get("items", body)

        if isinstance(items, dict):
            items = items.get("item", [])
        elif not isinstance(items, list):
            items = []
    else:
        items = []

    if isinstance(items, dict):
        items = [items]

    if not isinstance(items, list):
        return []

    return [item for item in items if isinstance(item, dict)]


def fetch_medicines(item_name: str) -> list[dict[str, Any]]:
    service_key = os.getenv("DATA_GO_KR_SERVICE_KEY")

    if not service_key:
        raise ValueError("공공데이터포털 API 인증키가 설정되지 않았습니다.")

    if not item_name or not item_name.strip():
        raise ValueError("검색할 의약품명을 입력해야 합니다.")

    params = {
        "serviceKey": service_key,
        "pageNo": PAGE_NO,
        "numOfRows": NUM_OF_ROWS,
        "itemName": item_name.strip(),
        "type": "json",
    }

    response = requests.get(
        API_URL,
        params=params,
        timeout=TIMEOUT,
    )
    response.raise_for_status()

    try:
        data = response.json()
    except ValueError as exc:
        raise MedicineAPIError(
            "API 응답이 올바른 JSON 형식이 아닙니다."
        ) from exc

    if not isinstance(data, dict):
        raise MedicineAPIError("API 응답 데이터 형식이 올바르지 않습니다.")

    header = data.get("header")

    if not isinstance(header, dict):
        raise MedicineAPIError("API 응답에 상태 정보가 없습니다.")

    result_code = str(header.get("resultCode", ""))

    if result_code not in SUCCESS_CODES:
        result_msg = header.get("resultMsg", "알 수 없는 API 오류")
        raise MedicineAPIError(
            f"API 오류 ({result_code}): {result_msg}"
        )

    medicines = get_items(data)

    logger.info("의약품 데이터 조회 완료: %d건", len(medicines))

    return medicines


def display_medicines(medicines: list[dict[str, Any]]) -> None:
    if not medicines:
        logger.warning("조회된 의약품 데이터가 없습니다.")
        return

    for index, medicine in enumerate(medicines, start=1):
        print(f"\n[의약품 {index}]")

        for key, label in FIELDS.items():
            value = medicine.get(key)
            print(f"{label}: {value if value else '정보 없음'}")

        print("-" * 50)


def main() -> None:
    logger.info("의약품 데이터 조회 시작")

    medicines = fetch_medicines(SEARCH_NAME)
    display_medicines(medicines)

    logger.info("의약품 데이터 조회 종료")


if __name__ == "__main__":
    try:
        main()
    except requests.exceptions.RequestException:
        logger.exception("의약품 API 요청에 실패했습니다.")
        raise SystemExit(1)
    except (ValueError, MedicineAPIError):
        logger.exception("의약품 데이터 처리에 실패했습니다.")
        raise SystemExit(1)
