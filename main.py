import os

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import psycopg

from database import get_connection
from routers.medicine import router as medicine_router
from routers.explanation import router as explanation_router


app = FastAPI(
    title="MEDI GUARD API",
    description="공식 의약품 정보를 기반으로 주의사항을 설명하는 서비스",
    version="1.0.0",
)


# CORS: 웹 프론트(브라우저)에서 이 API를 호출할 수 있게 허용한다. 없으면 브라우저가 요청을 막는다.
# 허용할 주소는 .env의 CORS_ORIGINS에 쉼표로 적는다 (예: http://localhost:8081,https://내-배포-주소).
# 비워 두면 모든 주소를 허용한다 (해커톤·개발용).
_cors_origins = [o.strip() for o in os.getenv("CORS_ORIGINS", "").split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins or ["*"],
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


app.include_router(medicine_router)
app.include_router(explanation_router)

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
