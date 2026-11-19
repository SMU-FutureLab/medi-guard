
import os
import requests
import json

API_URL = "https://apis.data.go.kr/1471000/DrbEasyDrugInfoService/getDrbEasyDrugList"

SERVICE_KEY = os.getenv("DATA_GO_KR_SERVICE_KEY")

if not SERVICE_KEY:
    raise ValueError("API 인증키를 확인해주세요.")

params = {
    "serviceKey": SERVICE_KEY,
    "pageNo": 1,
    "numOfRows": 10,
    "itemName": "타이레놀",
    "type": "json"
}

try:
    response = requests.get(API_URL, params=params, timeout=20)
    print("HTTP 상태 코드:", response.status_code)
    response.raise_for_status()

    data = response.json()
    print(json.dumps(data, ensure_ascii=False, indent=2))

except requests.exceptions.RequestException as e:
    print("API 요청 오류:", e)
except ValueError:
    print("JSON 변환 실패:")
    print(response.text)
