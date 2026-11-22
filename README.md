# MEDI GUARD

> 공식 의약품 정보 기반 AI 복약 정보 검색 및 설명 서비스

## 01. Overview

MEDI GUARD는 공식 의약품 정보를 기반으로 사용자가 의약품에 대한 정보를 검색하고, 복약 관련 내용을 보다 쉽게 이해할 수 있도록 AI 기반 설명을 제공하는 서비스입니다.

의약품 정보는 전문적인 용어와 복잡한 내용으로 구성되어 있어 일반 사용자가 필요한 정보를 이해하는 데 어려움을 겪을 수 있습니다. MEDI GUARD는 의약품 관련 데이터를 활용한 정보 검색과 AI 설명을 통해 사용자가 복약 정보를 보다 쉽게 확인하고 이해할 수 있도록 지원합니다.

단순한 AI 응답에 의존하지 않고, 의약품 관련 정보를 검색하고 답변에 활용할 근거를 구성하는 과정을 통해 정보 중심의 설명을 제공하는 것을 목표로 합니다.



## 02. Key Features

### 1. Medicine Search
- 의약품 검색
- 의약품 상세 정보 조회
- 데이터베이스 기반 의약품 정보 제공

### 2. AI Medicine Explanation
- 의약품 관련 질문 처리
- 의약품 정보를 기반으로 한 AI 설명 생성
- Gemini API 연동

### 3. Retrieval-based Information Search
- 의약품 콘텐츠 분할(Chunking)
- 질문과 관련된 정보 검색(Retrieval)
- 답변 생성에 활용할 근거 정보 구성(Evidence)

### 4. Dosage Validation
- 복용량 관련 입력값 검증
- 복용량 검증 로직을 통한 입력 정보 확인



## 03. AI Processing Pipeline

MEDI GUARD는 의약품 콘텐츠를 검색하고, 검색된 정보를 답변 생성에 활용하는 구조로 구성되어 있습니다.

```text
Medicine Data
     │
     ▼
Content Chunking
     │
     ▼
Retrieval
     │
     ▼
Evidence Construction
     │
     ▼
Gemini LLM
     │
     ▼
AI Medicine Explanation
```

| 단계 | 설명 |
|---|---|
| Medicine Data | 의약품 관련 데이터 및 콘텐츠 |
| Chunking | 검색을 위한 콘텐츠 분할 |
| Retrieval | 질문과 관련된 정보 검색 |
| Evidence | 답변 생성에 활용할 근거 구성 |
| LLM | 근거 정보를 활용한 AI 설명 생성 |



## 04. Tech Stack

### Backend

| Technology | Description |
|---|---|
| Python 3.13 | Backend Language |
| FastAPI | API Framework |
| Pydantic | Data Validation |
| Uvicorn | ASGI Server |

### Database

| Technology | Description |
|---|---|
| PostgreSQL 17 | Relational Database |
| Psycopg | PostgreSQL Driver |

### AI

| Technology | Description |
|---|---|
| Gemini API | AI-based Explanation |
| Retrieval | Relevant Medicine Information Search |
| Evidence | Supporting Information Construction |
| Chunking | Content Segmentation |

### Testing

| Technology | Description |
|---|---|
| Pytest | Backend Testing |



## 05. Backend Architecture

백엔드는 API 요청 처리, 비즈니스 로직, 데이터 처리 및 테스트 영역을 분리하여 관리합니다.

```text
backend/
│
├── routers/
│   ├── medicine.py
│   ├── explanation.py
│   └── __init__.py
│
├── services/
│   ├── medicine_service.py
│   ├── retrieval_service.py
│   ├── evidence_service.py
│   ├── llm_service.py
│   ├── chunking_service.py
│   ├── dosage_validation_service.py
│   └── __init__.py
│
├── scripts/
│   ├── analyze_medicine_data.py
│   ├── save_medicine_data.py
│   ├── save_content_chunks.py
│   ├── check_fk.py
│   ├── check_gemini_models.py
│   ├── check_medicine_api.py
│   └── check_retrieval.py
│
├── tests/
│   ├── test_analyze_medicine_data.py
│   ├── test_api_errors.py
│   ├── test_chunking.py
│   ├── test_dosage_validation.py
│   ├── test_explanation.py
│   └── test_llm_service.py
│
├── main.py
├── database.py
├── schema.sql
├── .env
├── .gitignore
└── README.md
```

### Directory Description

| Directory / File | Description |
|---|---|
| `routers/` | API Endpoint 및 요청 처리 |
| `services/` | 핵심 비즈니스 로직 |
| `scripts/` | 데이터 처리 및 개발용 진단 스크립트 |
| `tests/` | 테스트 코드 |
| `main.py` | FastAPI Application Entry Point |
| `database.py` | Database Connection |
| `schema.sql` | Database Schema |
| `.env` | Environment Variables |

---

## 06. Database

MEDI GUARD는 PostgreSQL을 사용하여 의약품 데이터와 AI 검색에 활용되는 콘텐츠를 관리합니다.

### 주요 테이블

| Table | Description |
|---|---|
| `medicines` | 의약품 기본 정보 |
| `medicine_contents` | 의약품 상세 콘텐츠 |
| `content_chunks` | 검색을 위한 콘텐츠 분할 데이터 |

### Data Processing

```text
Medicine Data
     │
     ▼
Data Analysis
     │
     ▼
Data Processing
     │
     ▼
Database Storage
     │
     ▼
Content Chunking
     │
     ▼
Chunk Storage
```

데이터 분석, 의약품 데이터 저장 및 콘텐츠 Chunk 저장을 위한 스크립트를 별도로 관리합니다.



## 07. Services

### `medicine_service.py`
의약품 검색 및 관련 데이터 조회 로직을 담당합니다.

### `chunking_service.py`
의약품 콘텐츠를 검색에 활용할 수 있도록 분할하는 로직을 담당합니다.

### `retrieval_service.py`
사용자 질문과 관련된 의약품 정보를 검색하는 역할을 담당합니다.

### `evidence_service.py`
검색 결과를 AI 답변 생성에 활용할 수 있는 근거 정보로 구성합니다.

### `llm_service.py`
Gemini API를 활용한 AI 설명 생성 로직을 담당합니다.

### `dosage_validation_service.py`
복용량 관련 입력값 검증 로직을 담당합니다.



## 08. Scripts

데이터 처리 및 개발 과정에서 사용하는 스크립트를 `scripts/` 디렉토리에서 관리합니다.

| Script | Description |
|---|---|
| `analyze_medicine_data.py` | 의약품 데이터 분석 |
| `save_medicine_data.py` | 의약품 데이터 저장 |
| `save_content_chunks.py` | 콘텐츠 Chunk 저장 |
| `check_fk.py` | DB Foreign Key 확인 |
| `check_gemini_models.py` | Gemini 모델 확인 |
| `check_medicine_api.py` | 의약품 API 확인 |
| `check_retrieval.py` | Retrieval 동작 확인 |



## 09. Testing

MEDI GUARD 백엔드는 Pytest를 사용하여 주요 서비스 및 API 로직을 테스트합니다.

### Test Coverage Areas

- 의약품 데이터 분석
- API 오류 처리
- Chunking
- Dosage Validation
- Explanation API
- LLM Service

### Run Tests

```bash
py -m pytest -v
```

### Current Test Results

```text
37 passed
2 subtests passed
```

기존 테스트 실행 기준으로 37개의 테스트와 2개의 subtest가 통과했습니다.



## 10. Environment Setup

### Requirements

- Python 3.13
- PostgreSQL 17
- Gemini API Key

### Environment Variables

프로젝트 실행에 필요한 데이터베이스 연결 정보 및 AI API Key를 `.env` 파일에 설정합니다.

```env
DATABASE_URL=your_database_url
GEMINI_API_KEY=your_gemini_api_key
```

> 실제 환경변수 이름과 설정 방식은 프로젝트 코드에 정의된 값을 기준으로 설정해야 합니다.

### Installation

```bash
pip install -r requirements.txt
```

### Run Backend

```bash
py -m uvicorn main:app --reload
```

서버 실행 후 FastAPI 문서를 통해 API를 확인할 수 있습니다.

- Swagger UI: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`



## 11. Git

### Branch

```text
feat/medicine-data-validation
```

### Latest Backend Refactoring

```text
ada89da
```

```text
refactor: 백엔드 디렉토리 구조 정리 및 서비스 모듈명 통일
```

이번 리팩토링을 통해 테스트 파일, 데이터 처리 스크립트, 서비스 모듈을 역할에 따라 분리하고 백엔드 디렉토리 구조를 정리했습니다.



## 12. Project Goal

MEDI GUARD는 공식 의약품 정보를 바탕으로 사용자가 복약 관련 정보를 보다 쉽게 검색하고 이해할 수 있도록 돕는 것을 목표로 합니다.

AI가 생성하는 설명에 의존하기보다 의약품 관련 근거 정보를 검색하고 활용함으로써, 보다 신뢰할 수 있는 복약 정보 제공 환경을 구축하고자 합니다.

