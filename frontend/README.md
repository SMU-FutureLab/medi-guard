# MEDI GUARD 프론트엔드

React 18 + TypeScript + Vite

## 실행

```bash
npm install
npm run dev
```

http://localhost:5173 에서 열립니다. 기본값은 **목업 데이터 모드**라 백엔드 없이도 모든 화면이 동작합니다.

## 백엔드 연결

`.env.example`을 복사해 `.env`를 만들고 `VITE_USE_MOCK=false`로 바꾼 뒤 `npm run dev`를 다시 실행하세요.
백엔드는 `localhost:8080`에서 실행 중이어야 합니다 (포트는 `vite.config.ts`의 proxy에서 변경).
API 형식은 [API.md](API.md)를 참고하세요.

## 화면

| 경로 | 화면 | 주요 기능 |
|---|---|---|
| `/` | 약 검색 | 약 이름·성분명 검색, 추천 검색어 |
| `/drugs/:id` | 약 상세 | 항목별 **AI 쉬운 설명 ↔ 공식 원문** 전환, 근거 구절 클릭 시 원문에서 하이라이트, 출처 표시, 약에 대해 질문하기 |
| `/interactions` | 함께 먹어도 될까? | 약 여러 개 담기 → DUR 병용금기·성분중복 확인, AI 쉬운 설명 + 공식 사유 |

## 폴더 구조

```
src/
  types.ts            백엔드와 공유하는 데이터 타입
  api/client.ts       API 호출 (목업/실제 전환)
  api/mockData.ts     시연용 예시 데이터 (약 4종)
  api/mockApi.ts      목업 API
  components/         화면 조각 (InfoSection, AskBox, Highlight 등)
  pages/              페이지 3개
  context/            "함께 확인할 약" 목록 (localStorage 저장)
  styles.css          전체 스타일 (색상은 :root 변수에서 변경)
```

## 시연 시나리오 (목업 데이터)

1. `타이레놀` 검색 → 상세 → "사용상 주의사항"의 근거 원문 클릭 → 원문 하이라이트 확인
2. 질문하기: "술 마셔도 돼요?" (답변 + 근거) / "임신 중에 먹어도 돼요?" (공식 정보 없음 → 답변 거절)
3. `스포라녹스` + `조코정` 담기 → 상호작용 확인 → **병용금기**
4. `타이레놀` + `게보린` 담기 → **동일성분중복** (아세트아미노펜)
