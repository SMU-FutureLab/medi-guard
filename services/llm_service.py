
import os
import logging

from dotenv import load_dotenv
from google import genai

load_dotenv()

logger = logging.getLogger(__name__)

GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.5-flash-lite")


def get_gemini_client():
    """Gemini API 클라이언트를 생성한다."""
    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        raise ValueError("GEMINI_API_KEY가 설정되지 않았습니다.")

    return genai.Client(
        api_key=api_key,
        http_options={"timeout": 20000},
    )


def generate_medicine_explanation(
    item_name: str,
    question: str,
    intent: str,
    evidence: list[dict],
) -> str:
    """
    식약처 공식 의약품 근거를 바탕으로
    사용자의 질문에 대한 쉬운 설명을 생성한다.
    """

    if not evidence:
        raise ValueError("설명 생성에 사용할 공식 근거가 없습니다.")

    evidence_text = "\n\n".join(
        [
            (
                f"[근거 {index}]\n"
                f"항목: {item.get('api_field', '정보 없음')}\n"
                f"공식 원문: {item.get('chunk_text', '')}"
            )
            for index, item in enumerate(evidence, start=1)
        ]
    )

    prompt = f"""
당신은 MEDI GUARD의 의약품 정보 설명 AI입니다.

사용자에게 식품의약품안전처의 공식 의약품 정보를
이해하기 쉬운 한국어로 설명하는 역할을 합니다.

[의약품 정보]
의약품명: {item_name}

[사용자 질문]
{question}

[질문 유형]
{intent}

[검색된 공식 근거]
{evidence_text}

[반드시 지켜야 할 규칙]
1. 제공된 공식 근거에 포함된 정보만 사용하세요.
2. 공식 근거에 없는 내용을 추측하거나 만들어내지 마세요.
3. 근거가 질문에 직접 답하지 못하면 정보가 충분하지 않다고 안내하세요.
4. 의약품의 안전성을 독자적으로 판정하지 마세요.
5. 복용 여부를 직접 결정하거나 복용 중단 및 변경을 지시하지 마세요.
6. 의학적 진단이나 처방을 하지 마세요.
7. 공식 원문의 의미를 임의로 바꾸지 마세요.
8. 이해하기 쉬운 자연스러운 한국어로 설명하세요.
9. 근거에 없는 상호작용 정보가 있다고 추정하지 마세요.
10. 검색된 정보가 없다는 사실만으로 상호작용이 없다고 단정하지 마세요.

[연령 및 체중별 복용량 안내 추가 규칙]
11. 소아, 성인, 고령자 등 연령별 복용 조건을 반드시 구분하여 설명하세요.
12. 공식 근거에 연령 제한이나 체중별 용량이 명시되어 있다면 해당 조건을 함께 안내하세요.
13. 체중별 용량이 mg/kg 단위로 제시된 경우, 사용자의 체중이 제공되지 않았다면 실제 복용량(mg)을 계산하지 마세요.
14. 사용자의 연령이나 체중이 확인되지 않았다면 특정 연령 또는 체중을 임의로 가정하지 마세요.
15. 1회 용량과 1일 최대 용량을 혼동하지 말고 공식 근거에 명시된 기준을 구분하여 설명하세요.
16. 연령, 체중, 복용 간격 등 복용량 판단에 필요한 정보가 부족하면 구체적인 복용량을 확정하지 말고 추가 확인이 필요하다고 안내하세요.
17. 공식 근거에 없는 소아 복용량이나 연령별 기준을 일반적인 의학 지식으로 보충하지 마세요.
18. 공식 근거에 명시된 연령별 복용 기준은 해당 연령 범위에만 적용하세요.
19. 사용자의 연령이 공식 근거에 명시된 연령 범위에 포함되지 않으면 해당 기준을 적용하지 마세요.
20. 체중별 용량 기준도 적용 가능한 연령 범위가 공식적으로 확인되지 않았다면 임의로 적용하지 마세요.
21. 연령별 기준이 확인되지 않는 경우 구체적인 복용량을 안내하지 말고 제품 허가사항이나 약사·의사에게 확인하도록 안내하세요.

[상호작용 질문에 대한 추가 규칙]
- intrcQesitm은 해당 의약품의 공식 병용금기·상호작용 관련 주의 정보입니다.
- 이 정보만으로 임의의 두 의약품 사이의 상호작용을 확정하지 마세요.
- 근거가 부족하다면 공식 정보만으로 확인하기 어렵다고 안내하세요.

[답변 형식]
1. 질문에 대한 핵심 설명
2. 공식 정보에 근거한 주의사항
3. 추가 확인이 필요한 내용

불필요한 의학적 추측 없이 답변하세요.
"""

    try:
        client = get_gemini_client()

        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=prompt,
        )

        answer = response.text

        if not answer:
            raise ValueError("Gemini가 빈 응답을 반환했습니다.")

        return answer.strip()

    except Exception:
        logger.exception("Gemini 의약품 설명 생성 실패")
        raise
