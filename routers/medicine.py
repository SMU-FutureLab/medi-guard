
from fastapi import APIRouter, HTTPException, Query

from services.medicine_service import (
    search_medicines,
    get_medicine_detail
)


router = APIRouter(
    prefix="/api/v1/medicines",
    tags=["Medicines"]
)


@router.get("")
def get_medicines(
    keyword: str = Query(..., min_length=1, description="검색할 의약품명"),
    page: int = Query(1, ge=1, description="페이지 번호"),
    size: int = Query(10, ge=1, le=100, description="페이지당 조회 개수")
):
    try:
        return search_medicines(
            keyword=keyword,
            page=page,
            size=size
        )

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="의약품 검색 중 오류가 발생했습니다."
        )


@router.get("/{item_seq}")
def get_medicine(item_seq: str):
    try:
        medicine = get_medicine_detail(item_seq)

        if medicine is None:
            raise HTTPException(
                status_code=404,
                detail="해당 의약품을 찾을 수 없습니다."
            )

        return medicine

    except HTTPException:
        raise

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="의약품 상세 정보 조회 중 오류가 발생했습니다."
        )
