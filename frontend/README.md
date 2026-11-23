# MEDI GUARD 앱 (React Native · Expo)

하나의 코드로 **iOS · Android 앱과 웹**을 함께 만든다. Expo SDK 58, Expo Router, TypeScript.

## 실행

```bash
npm install
npm start
```

터미널에 QR 코드가 뜬다.

- **휴대폰:** App Store / Play 스토어에서 **Expo Go**를 설치하고 QR 코드를 찍는다. PC와 휴대폰이 같은 Wi-Fi에 있어야 한다.
- **웹:** 터미널에서 `w`를 누르거나 `npm run web` → http://localhost:8081
- 기본값은 **목업 데이터 모드**라 백엔드 없이도 모든 화면이 동작한다.

## 백엔드 연결

`.env.example`을 복사해 `.env`를 만들고 값을 바꾼 뒤 `npm start`를 다시 실행한다.

```
EXPO_PUBLIC_USE_MOCK=false
EXPO_PUBLIC_API_BASE_URL=http://192.168.0.10:8080
```

휴대폰에서 테스트할 때는 `localhost`가 휴대폰 자신을 가리키므로, **PC의 IP 주소**를 적어야 한다.
API 형식은 [../frontend/API.md](../frontend/API.md)와 같다.

## 화면

| 경로 | 화면 |
|---|---|
| `/` (탭) | 홈 |
| `/search` (탭) | 의약품 검색 · 검색 결과 |
| `/history` | 조회 기록 (마이페이지 안) |
| `/my` (탭) | 마이페이지 |
| `/drugs/[id]` | 의약품 상세 (공식 정보 / AI 쉽게 설명, 근거 원문 하이라이트, 관심 의약품) |
| `/drugs/[id]/ai` | AI 질문하기 |
| `/interactions` | 함께 먹어도 될까? (병용금기·성분중복) |
| `/favorites`, `/about`, `/faq` | 관심 의약품, 서비스 안내, 자주 묻는 질문 |

## 폴더 구조

```
src/
  app/            화면(라우트). 파일 하나 = 화면 하나, _layout.tsx = 탭·스택 구성
  components/     ui.tsx(글자·버튼·카드 등), drug.tsx(검색창·약 카드), Icon.tsx(아이콘·로고·알약 그림)
  theme/theme.ts  색·둥글기·폰트 — 디자인을 바꿀 때 가장 먼저 고칠 파일
  api/            API 호출(목업/실제 전환), 목업 데이터
  store/          관심 의약품·조회 기록·함께 먹는 약 (기기에 저장)
  types.ts        백엔드와 공유하는 데이터 형식
```

## 확인 명령

```bash
npm run typecheck
```

## 참고

- `ios/`, `android/` 폴더는 만들지 않는다. 앱 설정은 `app.json`에서 한다.
- 라이브러리는 `npm install` 대신 `npx expo install <패키지>`로 설치해야 SDK와 맞는 버전이 들어간다.
- 실제 앱 파일(.apk/.ipa)로 배포하려면 EAS Build를 쓴다: `npx eas-cli@latest build`

## 의약품 사진

`assets/drugs/`의 사진은 **식품의약품안전처 의약품안전나라**(nedrug.mfds.go.kr) 의약품 상세정보의 낱알·포장 사진입니다. `*-thumb.jpg`는 낱알 사진에서 알약 하나를 정사각형으로 잘라낸 썸네일입니다. 발표나 배포 전에는 출처 표기와 이용 조건을 확인하세요.
실제 API 연동 후에는 백엔드가 보내는 사진 주소(`images`, `imageUrl`)를 쓰며, 앱에 넣어 둔 사진은 목업에서만 사용합니다.

## 공유 링크(claude.ai 아티팩트) 업데이트

```bash
npm run build:artifact
```

웹 빌드를 `artifact-web/`에 만든다. 이 폴더를 아티팩트로 올리면 링크로 앱을 볼 수 있다 (Claude에게 "아티팩트 업데이트해줘"라고 하면 된다).
