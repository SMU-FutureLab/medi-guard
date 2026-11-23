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


# 웹 프론트에서 직접 호출할 수 있도록 CORS 허용.
# 개발 중에는 프론트 개발 서버가 대신 전달하므로 없어도 되지만, 웹을 배포하면 필요하다.
# 허용할 주소는 .env의 CORS_ORIGINS(쉼표로 구분)로 정하고, 없으면 모두 허용한다.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in os.getenv("CORS_ORIGINS", "*").split(",") if o.strip()],
    allow_methods=["*"],
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
