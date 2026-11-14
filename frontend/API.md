# MEDI GUARD 프론트엔드 ↔ 백엔드 API 약속

프론트엔드는 아래 5개 API만 호출합니다. 데이터 형식(TypeScript 타입)은 [`src/types.ts`](src/types.ts)에 있습니다.
응답 예시는 [`src/api/mockData.ts`](src/api/mockData.ts)의 목업 데이터를 참고하세요.

- 기본 주소: 개발 시 `http://localhost:8080` (Vite가 `/api` 요청을 그대로 전달)
- 모든 요청/응답은 JSON
- 에러 응답: HTTP 상태 코드 + `{ "message": "사용자에게 보여줄 한국어 메시지" }`

| # | 메서드 | 경로 | 요청 | 응답 | 데이터 출처 |
|---|---|---|---|---|---|
| 1 | GET | `/api/drugs?query=타이레놀` | – | `DrugSummary[]` | e약은요 API (`itemName`) |
| 2 | GET | `/api/drugs/{id}` | – | `DrugDetail` | e약은요 API |
| 3 | POST | `/api/drugs/{id}/explanations` | – | `SectionExplanation[]` | RAG + LLM |
| 4 | POST | `/api/drugs/{id}/ask` | `{ "question": string }` | `AskResponse` | RAG + LLM |
| 5 | POST | `/api/interactions` | `{ "drugIds": string[] }` | `InteractionResult` | DUR 품목정보 API (병용금기 등) |

## 항목(SectionKey) ↔ e약은요 필드 대응

| SectionKey | 화면 제목 | e약은요 필드 |
|---|---|---|
| `efficacy` | 효능·효과 | `efcyQesitm` |
| `usage` | 용법·용량 | `useMethodQesitm` |
| `warning` | 사용상 주의사항 | `atpnWarnQesitm` + `atpnQesitm` |
| `interaction` | 함께 먹으면 안 되는 약·음식 | `intrcQesitm` |
| `sideEffect` | 부작용 | `seQesitm` |
| `storage` | 보관법 | `depositMethodQesitm` |

`id`는 품목기준코드(`itemSeq`)를 쓰는 것을 권장합니다.

## 프론트가 기대하는 규칙 (중요)

1. **`citations[].quote`는 원문(`sections[].original`)에 글자 그대로 들어 있는 구절이어야 합니다.**
   프론트는 이 구절을 원문에서 찾아 노란색으로 표시합니다. 원문에 없으면 표시되지 않습니다.
   → LLM에게 "근거 구절을 원문에서 그대로 복사하라"고 지시하고, 백엔드에서 `original.includes(quote)`로 검증한 뒤 통과한 것만 보내 주세요.
2. **원문에서 답을 못 찾으면 `ask`는 `answerable: false`로 응답**하고 `answer`에 안내 문구를 넣어 주세요. 프론트는 회색 박스로 보여줍니다.
3. `explanations`가 실패하거나 일부 항목이 빠져도 프론트는 그 항목의 **공식 원문을 대신 보여줍니다.** 빈 항목은 배열에서 빼면 됩니다.
4. `interactions` 결과가 빈 배열이면 "확인된 정보 없음 (안전하다는 뜻은 아님)"으로 표시합니다. 임의로 추론한 상호작용은 넣지 마세요.
5. `explanations`는 LLM 호출이라 느릴 수 있어, 프론트는 원문(`GET /api/drugs/{id}`)을 먼저 보여주고 설명은 따로 받습니다. 같은 약은 백엔드에서 캐시해 두면 시연 때 빠릅니다.
