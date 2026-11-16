
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
