
from fastapi import FastAPI, HTTPException
import psycopg

from database import get_connection
from routers.medicine import router as medicine_router


app = FastAPI(
    title="MEDI GUARD API",
    description="공식 의약품 정보를 기반으로 주의사항을 설명하는 서비스",
    version="1.0.0",
)


app.include_router(medicine_router)


@app.get("/")
def root():
    return {
        "message": "MEDI GUARD API 서버가 실행 중입니다."
    }


@app.get("/health")
def health_check():
    try:
        with get_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1;")
                cursor.fetchone()

        return {
            "status": "healthy",
            "database": "connected"
        }

    except psycopg.Error:
        raise HTTPException(
            status_code=503,
            detail={
                "status": "unhealthy",
                "database": "disconnected"
            }
        )
