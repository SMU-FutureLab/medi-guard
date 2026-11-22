# 프론트-백엔드 API 연동 체크리스트 (프론트 정리본)

- 작성: 프론트엔드 (팀 케로케로)
- 비교 기준
  - 프론트: `app/src/api/client.ts`, `app/src/types.ts` (feat/frontend 브랜치)
  - 백엔드: `routers/`, `services/`, `schema.sql` (feat/medicine-data-validation 브랜치)
- 표시: ✅ 맞음 · ⚠️ 이름/모양만 다름(변환하면 됨) · ❌ 백엔드에 없음

---

## 1. API 명세 공유

### 1-1. 프론트에서 사용 중인 API 목록 · 요청 URL · Method

| # | 기능 | 프론트가 부르는 주소 | 백엔드 현재 주소 | 상태 |
|---|---|---|---|---|
| ① | 의약품 검색 | `GET /api/drugs?query=타이레놀` | `GET /api/v1/medicines?keyword=타이레놀&page=1&size=10` | ⚠️ |
| ② | 의약품 상세(공식 원문 포함) | `GET /api/drugs/{id}` | `GET /api/v1/medicines/{item_seq}` | ⚠️ |
| ③ | 항목별 AI 쉬운 설명 (상세 화면 "AI 쉬운 설명" 탭) | `POST /api/drugs/{id}/explanations` | 없음 | ❌ |
| ④ | AI에게 질문하기 | `POST /api/drugs/{id}/ask` | `POST /api/v1/explanations` | ⚠️ |
| ⑤ | 함께 먹는 약 확인 (병용금기·성분중복) | `POST /api/interactions` | 없음 | ❌ |

> 주소는 백엔드 쪽(`/api/v1/...`)에 맞추는 걸로 하고, 프론트가 바꿀게요.

### 1-2. Request / Response 구조 비교

#### ① 검색

```jsonc
// 프론트가 기대하는 응답: 배열
[
  {
    "id": "202106092",
    "name": "타이레놀정500밀리그람",
    "company": "켄뷰코리아판매유한회사",
    "ingredients": ["아세트아미노펜"],
    "category": "일반의약품",          // 일반의약품 | 전문의약품
    "form": "정제",                    // 선택
    "classification": "해열·진통제",   // 선택
    "strength": "500mg",               // 선택
    "imageUrl": "https://..."          // 선택 (목록 썸네일)
  }
]

// 백엔드 현재 응답
{
  "keyword": "타이레놀", "page": 1, "size": 10, "total_count": 3,
  "items": [{ "item_seq": "202106092", "item_name": "타이레놀정500밀리그람" }]
}
```

#### ② 상세

```jsonc
// 프론트가 기대하는 응답 (검색 결과 필드 + 아래)
{
  "id": "202106092", "name": "...", "company": "...", "ingredients": ["..."], "category": "일반의약품",
  "sections": [
    { "key": "efficacy", "title": "효능·효과", "original": "이 약은 감기로 인한 발열 및 ..." }
  ],
  "source": { "name": "식품의약품안전처 의약품개요정보(e약은요)", "url": "https://...", "retrievedAt": "2026-11-14T00:00:00Z" },
  "images": [{ "kind": "package", "url": "https://...", "source": "식약처 의약품안전나라" }],   // 선택
  "identification": { "shape": "장방형", "color": "하양", "markFront": "TYLENOL", "markBack": "500", "size": "17.6×7.1mm" } // 선택
}

// 백엔드 현재 응답
{
  "item_seq": "202106092", "item_name": "...", "created_at": "...", "updated_at": "...",
  "contents": [
    { "content_id": 1, "content_type": "EFFICACY", "api_field": "efcyQesitm",
      "original_text": "...", "source_name": "식품의약품안전처", "source_url": "https://...", "retrieved_at": "..." }
  ]
}
```

#### ④ 질문하기

```jsonc
// 프론트 요청
{ "question": "술 마셔도 돼요?" }
// 프론트가 기대하는 응답
{ "answerable": true, "answer": "...", "citations": [{ "sectionKey": "warning", "quote": "원문에 실제로 있는 구절" }] }

// 백엔드 요청
{ "item_seq": "202106092", "question": "...", "limit": 5, "age_years": null, "weight_kg": null }
// 백엔드 응답
{ "item_seq": "...", "item_name": "...", "question": "...", "intent": "WARNING",
  "status": "answered",   // answered | no_results | insufficient_evidence | generation_failed | (복용량 검증 상태)
  "answer": "...",
  "evidence": [{ "api_field": "atpnQesitm", "original_text": "...", "source_name": "...", "source_url": "..." }],
  "notice": "AI 설명은 ...", "dosage_validation": { ... } }
```

### 1-3. 백엔드 API와 불일치하는 부분 → 처리 방법

| 불일치 | 처리 |
|---|---|
| 주소·파라미터 이름 (`/api/drugs` ↔ `/api/v1/medicines`, `query` ↔ `keyword`) | **프론트가 백엔드에 맞춤** |
| 필드 이름 (`id`↔`item_seq`, `name`↔`item_name`, `original`↔`original_text` 등) | **프론트에서 변환** (백엔드 수정 불필요) |
| 검색 응답이 `{ items: [...] }` 로 감싸져 있음 | 프론트에서 `items`만 꺼내 씀 |
| 질문 응답: `status` / `evidence` ↔ `answerable` / `citations` | 프론트에서 변환 (`status === "answered"` → 답변 표시, 나머지는 `notice` 표시) |
| 에러 응답: FastAPI는 `{ "detail": "..." }`, 프론트는 `message`를 읽음 | **프론트에서 `detail`도 읽도록 수정** |
| 검색·상세에 **업체명·주성분·전문/일반 구분·사진**이 없음 | **백엔드 추가 요청** (아래 2번) |
| ③ 항목별 쉬운 설명, ⑤ 함께 먹는 약 API 없음 | **결정 필요** (아래 3번, 4번) |
| 웹 버전에서 호출하려면 CORS 허용 필요 | **백엔드에 `CORSMiddleware` 추가 요청** (개발: `http://localhost:8081`) |

---

## 2. 의약품 데이터 구조 통일

### 2-1. 의약품 ID 형식 ✅
- **식약처 품목기준코드(`item_seq`, 문자열)** 를 ID로 쓰기로 통일. 프론트도 문자열로 다루고 있어서 그대로 맞음.
- 지금 프론트 예시 데이터는 `tylenol-500` 같은 임시 ID라서, 연동하면 `202106092` 같은 실제 코드로 바뀜.

### 2-2. 이름·성분·제조사 등 필드

| 화면에 쓰는 정보 | 프론트 필드 | 백엔드 | 비고 |
|---|---|---|---|
| 약 이름 | `name` | `item_name` ✅ | |
| 업체명 | `company` | ❌ | e약은요 API `entpName` 저장 요청 |
| 주성분 | `ingredients` | ❌ | e약은요에는 없음 → 허가정보 API 또는 일단 빈 값 허용 |
| 일반/전문 구분 | `category` | ❌ | e약은요는 일반의약품 위주 → 없으면 "일반의약품"으로 표시 |
| 사진 | `imageUrl`, `images` | ❌ | e약은요 API `itemImage` 저장 요청 (없으면 프론트 기본 그림) |
| 제형·분류·함량·낱알 모양 | `form`, `classification`, `strength`, `identification` | ❌ | **선택 항목** — 없어도 화면이 깨지지 않음 |

### 2-3. 검색 결과와 상세 정보 구조 ⚠️
- 검색: `item_seq`, `item_name`만 옴 → 목록에 이름만 나오고 업체명 자리가 빔. **검색 결과에도 업체명(`entp_name`)·사진(`item_image`) 포함 요청.**
- 상세: 위 필드 + `contents`(공식 원문)면 충분.

### 2-4. 공식 원문 연결 방식 ⚠️ (프론트에서 변환)

| 백엔드 `content_type` | 프론트 `key` | 화면 제목 |
|---|---|---|
| `EFFICACY` | `efficacy` | 효능·효과 |
| `USAGE` | `usage` | 용법·용량 |
| `WARNING` + `PRECAUTION` | `warning` | 사용상의 주의사항 (두 항목을 이어 붙여 한 칸에 표시) |
| `INTERACTION` | `interaction` | 상호작용 |
| `SIDE_EFFECT` | `sideEffect` | 부작용 |
| `STORAGE` | `storage` | 보관방법 |

- 출처: 첫 번째 `contents`의 `source_name` / `source_url` / `retrieved_at`을 화면 하단 "출처"에 사용.
- `source_url`이 지금 API 주소(`apis.data.go.kr/...`)라서 사용자가 눌러도 볼 수 없음 → **사람이 볼 수 있는 의약품안전나라 상세 페이지 주소로 바꿔 줄 수 있는지 확인.** (예: `https://nedrug.mfds.go.kr/pbp/CCBBB01/getItemDetail?itemSeq=...`)

---

## 3. AI 기능 연동

### 3-1. 의약품 쉬운 설명 API ❌ → 결정 필요
상세 화면의 "AI 쉬운 설명" 탭은 **항목별(효능·용법·주의사항…) 쉬운 설명**을 한 번에 받아서 보여줌.

```jsonc
// 프론트가 기대하는 응답: POST /api/v1/medicines/{item_seq}/explanations
[ { "sectionKey": "efficacy", "easyText": "열을 내리고 통증을 줄여 주는 약이에요.",
    "citations": [{ "sectionKey": "efficacy", "quote": "감기로 인한 발열" }] } ]
```
- **안 A (추천):** 백엔드에 위 API 추가 (항목 원문을 그대로 넣고 Gemini로 쉬운 말 변환)
- **안 B:** 백엔드 추가 없이, 프론트가 기존 질문 API를 항목마다 "효능을 쉽게 설명해 줘" 식으로 호출 → 호출이 6번이라 느림

### 3-2. 사용자 질문 API ⚠️ → 그대로 사용 가능
- `POST /api/v1/explanations` 사용. 프론트가 `item_seq`, `question`만 보냄.
- **복용량 질문**은 백엔드가 나이·체중을 받는데, 프론트 질문 화면에는 입력칸이 없음 → 필요하면 나이/체중 입력칸 추가할지 결정.

### 3-3. AI 응답 데이터 구조 → 프론트 변환 규칙

| 백엔드 `status` | 프론트 표시 |
|---|---|
| `answered` | 답변 + 근거 원문 |
| `no_results`, `insufficient_evidence` | "공식 정보에서 답을 찾지 못했어요" + `notice` + 약사 상담 안내 |
| `generation_failed` | 오류 안내 + "공식 원문 확인" |
| 복용량 검증 실패 상태 | `notice`(검증 사유) 표시 |

### 3-4. 근거 자료·출처 표시 방식
- 백엔드 `evidence[].api_field` → 위 2-4 표로 항목 이름 변환, `original_text` → 근거 구절로 표시.
- 프론트는 근거 구절을 **상세 화면 원문에서 형광펜으로 하이라이트**함 → `original_text`가 원문 일부(청크)라서 그대로 동작. 청크가 원문에서 잘려 바뀌지 않도록(공백·줄바꿈 정리 안 함) 유지 부탁.

---

## 4. 복용 주의 및 상호작용 기능

### 4-1. 함께 복용 확인 API 구현 여부 ❌
- 백엔드에 아직 없음 (DUR 데이터 미적재).
- **결정 필요:** 해커톤 범위에 넣을지 / 프론트 예시 데이터로 시연만 할지.

### 4-2. 프론트가 전달하는 의약품 목록 형식
```jsonc
// POST /api/v1/interactions
{ "drugIds": ["202106092", "197900277"] }   // item_seq 배열, 2개 이상
```

### 4-3. 병용금기·동일성분 중복 결과 표시 방식
```jsonc
{
  "checkedAt": "2026-11-14T00:00:00Z",
  "pairs": [{
    "drugA": { "id": "...", "name": "..." }, "drugB": { "id": "...", "name": "..." },
    "ingredientA": "이트라코나졸", "ingredientB": "심바스타틴",
    "type": "병용금기",               // 병용금기 | 동일성분중복
    "reason": "공식 원문 사유",
    "easyExplanation": "AI 쉬운 설명",
    "source": { "name": "식품의약품안전처 DUR 품목정보", "retrievedAt": "..." }
  }]
}
```
- 결과가 없으면 `pairs: []` → 프론트는 "확인된 병용금기·성분중복 없음 (안전하다는 뜻은 아님)"으로 표시.

---

## 백엔드에 요청할 것 (요약)

1. 검색·상세 응답에 **업체명(`entpName`)·사진(`itemImage`)** 추가 (e약은요 API에 있음)
2. **CORS 허용** (`http://localhost:8081`, 배포 주소)
3. `source_url`을 사람이 볼 수 있는 의약품안전나라 페이지로 (가능하면)
4. **항목별 쉬운 설명 API** 추가 여부 결정 (3-1)
5. **함께 먹는 약(DUR) API** 범위 결정 (4-1)
6. 서버 주소 공유 (프론트 `.env`의 `EXPO_PUBLIC_API_BASE_URL`에 넣음)

## 프론트가 할 것 (완료)

- [x] 주소를 `/api/v1/...`로 변경, 백엔드 응답 → 프론트 형식 변환 코드 추가 (`app/src/api/adapter.ts`)
- [x] 에러 응답 `detail` 읽기
- [x] 질문 응답 `status`별 화면 처리, `notice` 표시
- [x] ID를 `item_seq`로 사용
- [x] 업체명·주성분·사진이 없어도 화면이 깨지지 않게 처리 (빈 칸 숨김, 기본 그림)
- [x] 항목별 쉬운 설명: 전용 API가 생기기 전까지 질문 API를 항목마다 불러 대신함
- [x] 함께 먹는 약: 백엔드 API가 생기기 전까지 "준비 중" 안내 (예시 데이터 모드에서는 시연 가능)

### 실제 백엔드로 실행하는 법

`app/.env` 파일을 만들고 아래처럼 적은 뒤 `npx expo start --web`

```
EXPO_PUBLIC_USE_MOCK=false
EXPO_PUBLIC_API_BASE_URL=http://localhost:8000
```
