import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("GEMINI_API_KEY를 찾을 수 없습니다.")
else:
    try:
        client = genai.Client(api_key=api_key)

        print("=== 사용 가능한 Gemini 모델 ===")

        for model in client.models.list():
            actions = getattr(model, "supported_actions", [])

            if "generateContent" in actions:
                print(f"모델 이름: {model.name}")
                print(f"지원 기능: {actions}")
                print("-" * 40)

    except Exception as e:
        print("모델 목록 조회 실패:", type(e).__name__, str(e))
