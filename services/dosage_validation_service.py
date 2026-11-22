import re


def validate_dosage(
    medicine_contents: list[dict],
    age_years: int | None = None,
    weight_kg: float | None = None,
) -> dict:
    """
    식약처 공식 복용법을 기준으로 연령 및 체중 조건을 검증한다.

    주의:
    - 공식 원문에서 확인되지 않은 복용량은 계산하지 않는다.
    - 연령 조건이 불명확하면 구체적인 복용량 안내를 제한한다.
    """

    usage_texts = [
        item.get("original_text", "")
        for item in medicine_contents
        if item.get("api_field") == "useMethodQesitm"
        and item.get("original_text")
    ]

    if not usage_texts:
        return {
            "status": "blocked",
            "reason": "공식 복용법 정보를 확인할 수 없습니다.",
            "can_provide_specific_dose": False,
        }

    usage_text = "\n".join(usage_texts)

    # 공식 복용법에서 명시적인 연령 범위 확인
    age_ranges = re.findall(
        r"만?\s*(\d+)\s*[~～\-]\s*(\d+)\s*세",
        usage_text,
    )

    applicable_age = None

    for minimum, maximum in age_ranges:
        min_age = int(minimum)
        max_age = int(maximum)

        if age_years is not None:
            if not min_age <= age_years <= max_age:
                return {
                    "status": "blocked",
                    "reason": (
                        f"공식 복용법은 만 {min_age}~{max_age}세를 "
                        f"대상으로 하지만 입력 연령은 {age_years}세입니다."
                    ),
                    "can_provide_specific_dose": False,
                    "official_age_range": [min_age, max_age],
                }

        applicable_age = [min_age, max_age]

    if age_years is None:
        return {
            "status": "requires_age",
            "reason": "복용 대상자의 나이를 확인해야 합니다.",
            "can_provide_specific_dose": False,
            "official_age_range": applicable_age,
        }

    # 체중 기반 용량 조건 확인
    has_weight_based_dose = bool(
        re.search(r"\d+(?:\.\d+)?\s*[-~～]\s*\d+(?:\.\d+)?\s*mg/kg", usage_text)
    )

    if has_weight_based_dose and weight_kg is None:
        return {
            "status": "requires_weight",
            "reason": "공식 복용법에 체중 기반 용량 조건이 있어 체중 확인이 필요합니다.",
            "can_provide_specific_dose": False,
            "official_age_range": applicable_age,
            "weight_based_dose": True,
        }

    # 구체적인 연령별 1회 복용량 표가 확인되지 않았으므로 계산 금지
    return {
        "status": "requires_official_dose_table",
        "reason": (
            "연령 및 체중 조건은 확인했지만, "
            "구체적인 1회 복용량을 확인할 수 있는 공식 용량표가 없습니다."
        ),
        "can_provide_specific_dose": False,
        "official_age_range": applicable_age,
        "weight_based_dose": has_weight_based_dose,
        "weight_kg": weight_kg,
    }
