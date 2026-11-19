from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from services.medicine_service import get_medicine_detail
from services.retrieval_service import search_relevant_chunks
from services.evidence_service import check_evidence_sufficiency
from services.llm_service import generate_medicine_explanation


router = APIRouter(
    prefix="/api/v1/explanations",
    tags=["Explanations"]
)


class ExplanationRequest(BaseModel):
    item_seq: str = Field(..., min_length=1)
    question: str = Field(..., min_length=1)
    limit: int = Field(default=5, ge=1, le=10)


@router.post("")
def create_explanation(request: ExplanationRequest):

    try:
        # 1. 의약품 존재 여부 및 이름 확인
        medicine = get_medicine_detail(request.item_seq)

        if medicine is None:
            raise HTTPException(
                status_code=404,
                detail="해당 의약품을 찾을 수 없습니다."
            )

        item_name = medicine["item_name"]

        # 2. RAG 근거 검색
        search_results = search_relevant_chunks(
            item_seq=request.item_seq,
            question=request.question,
            limit=request.limit
        )

        if not search_results:
            return {
                "item_seq": request.item_seq,
                "item_name": item_name,
                "question": request.question,
                "intent": None,
                "status": "no_results",
                "answer": None,
                "evidence": [],
                "notice": "질문과 관련된 공식 근거를 찾지 못했습니다."
            }

        # 3. 근거 충분성 확인
        evidence_result = check_evidence_sufficiency(
            search_results
        )

        intent = evidence_result.get("intent", "GENERAL")
        evidence = evidence_result.get("evidence", [])

        if not evidence_result["is_sufficient"]:
            return {
                "item_seq": request.item_seq,
                "item_name": item_name,
                "question": request.question,
                "intent": intent,
                "status": "insufficient_evidence",
                "answer": None,
                "evidence": [],
                "notice": "공식 정보에서 답변을 뒷받침할 충분한 근거를 찾지 못했습니다."
            }

        # 4. Gemini 설명 생성
        try:
            answer = generate_medicine_explanation(
                item_name=item_name,
                question=request.question,
                intent=intent,
                evidence=evidence
            )

        except Exception:
            return {
                "item_seq": request.item_seq,
                "item_name": item_name,
                "question": request.question,
                "intent": intent,
                "status": "generation_failed",
                "answer": None,
                "evidence": evidence,
                "notice": "AI 설명 생성 중 오류가 발생했습니다. 공식 원문을 확인해 주세요."
            }

        # 5. 설명 및 공식 근거 반환
        return {
            "item_seq": request.item_seq,
            "item_name": item_name,
            "question": request.question,
            "intent": intent,
            "status": "answered",
            "answer": answer,
            "evidence": [
                {
                    "api_field": item.get("api_field"),
                    "original_text": item.get("chunk_text"),
                    "source_name": item.get("source_name"),
                    "source_url": item.get("source_url")
                }
                for item in evidence
            ],
            "notice": "AI 설명은 제공된 공식 의약품 정보를 바탕으로 생성되었습니다. 복용 여부에 대한 의학적 판단을 대신하지 않습니다."
        }

    except HTTPException:
        raise

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="의약품 설명 처리 중 오류가 발생했습니다."
        )
