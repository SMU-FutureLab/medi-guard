from services.retrieval_service import search_relevant_chunks

ITEM_SEQ = "202005623"

test_questions = {
    "EFFICACY": "이 약은 어떤 효능과 효과가 있나요?",
    "USAGE": "복용 방법과 용량을 알려주세요.",
    "WARNING": "복용 전에 확인해야 할 경고 사항이 있나요?",
    "CAUTION": "복용할 때 주의사항을 알려주세요.",
    "INTERACTION": "다른 약과 함께 복용할 때 상호작용이 있나요?",
    "SIDE_EFFECT": "이 약의 부작용은 무엇인가요?",
    "STORAGE": "이 약은 어떻게 보관해야 하나요?",
    "GENERAL": "아세트아미노펜 어린이"
}

for expected_intent, question in test_questions.items():
    print("\n" + "=" * 70)
    print(f"[{expected_intent}] 질문: {question}")

    results = search_relevant_chunks(
        item_seq=ITEM_SEQ,
        question=question
    )

    print("검색 결과 수:", len(results))

    for result in results:
        print("-" * 50)
        print("분류:", result["intent"])
        print("API 항목:", result["api_field"])
        print("청크 번호:", result["chunk_index"])
        print("관련도 점수:", result["relevance_score"])
        print("내용:", result["chunk_text"][:180])

