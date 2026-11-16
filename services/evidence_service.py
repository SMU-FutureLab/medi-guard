from services.retrieval_service import get_field_priority


def check_evidence_sufficiency(
    search_results: list[dict],
    min_relevance_score: int = 1
) -> dict:
    """
    검색된 공식 원문이 질문에 답하기에 충분한지 확인한다.
    """

    if not search_results:
        return {
            "is_sufficient": False,
            "reason": "검색된 공식 근거가 없습니다.",
            "evidence_count": 0,
            "evidence": []
        }

    intent = search_results[0].get("intent", "GENERAL")

    priority_fields = get_field_priority(intent)

    relevant_results = [
        result for result in search_results
        if result.get("relevance_score", 0) >= min_relevance_score
    ]

    if priority_fields:
        matched_results = [
            result for result in relevant_results
            if result.get("api_field") in priority_fields
        ]
    else:
        matched_results = relevant_results

    is_sufficient = len(matched_results) > 0

    if is_sufficient:
        reason = "질문과 관련된 공식 의약품 정보가 검색되었습니다."
    elif not relevant_results:
        reason = "질문과 관련된 검색 근거가 충분하지 않습니다."
    else:
        reason = "검색 결과가 있지만 질문 의도에 맞는 공식 정보 항목을 찾지 못했습니다."

    return {
        "is_sufficient": is_sufficient,
        "reason": reason,
        "intent": intent,
        "evidence_count": len(matched_results),
        "evidence": matched_results
    }
