import re

from database import get_connection


def extract_keywords(question: str) -> list[str]:
    if not isinstance(question, str) or not question.strip():
        return []

    words = re.findall(r"[가-힣a-zA-Z0-9]+", question)

    stopwords = {
        "이", "그", "저", "것", "수", "때", "할",
        "알려줘", "알려주세요", "궁금해요",
        "어떻게", "무엇", "무슨", "있나요",
        "있어요", "인가요", "해주세요",
        "대한", "관련", "사항"
    }

    keywords = [
        word for word in words
        if len(word) >= 2 and word not in stopwords
    ]

    return list(dict.fromkeys(keywords))


def detect_question_intent(question: str) -> str:
    question = question.lower()

    intent_keywords = {
        "INTERACTION": ["상호작용", "함께 복용", "같이 복용", "병용",
                        "같이 먹", "함께 먹", "다른 약", "커피", "자몽"],
        "SIDE_EFFECT": ["부작용", "이상반응", "피부발진", "알레르기"],
        "STORAGE": ["보관", "보관 방법", "보관 장소", "유통기한"],
        "USAGE": ["복용 방법", "어떻게 복용", "복용해야", "복용법", "용법", "용량",
                  "몇 번", "복용 간격", "투여 방법", "사용 방법", "먹는 방법",
                  "몇 알", "몇알", "몇 정", "몇정", "하루에", "언제 먹"],
        # 일상 표현(술, 마셔도, 수유 등)도 경고 질문으로 인식
        "WARNING": ["복용 전", "경고", "음주", "술", "알코올", "마셔도",
                    "임산부", "임신", "수유", "간손상", "간 질환", "간질환"],
        "CAUTION": ["주의사항", "주의해야", "주의할 점", "주의"],
        "EFFICACY": ["효능", "효과", "어떤 약", "무슨 약", "약인가요", "약인지",
                    "무엇인가요", "무엇인지", "어디에 사용하는지", "어떤 증상",
                    "어떤 증상에 사용하는", "사용하는 약", "치료하는"]
    }

    for intent, keywords in intent_keywords.items():
        if any(keyword in question for keyword in keywords):
            return intent

    return "GENERAL"


def get_field_priority(intent: str) -> list[str]:
    priorities = {
        "EFFICACY": ["efcyQesitm"],
        "USAGE": ["useMethodQesitm"],
        # 경고(atpnWarnQesitm)와 주의사항(atpnQesitm)은 내용이 겹치는 경우가 많아 둘 다 찾는다
        "WARNING": ["atpnWarnQesitm", "atpnQesitm"],
        "CAUTION": ["atpnQesitm", "atpnWarnQesitm"],
        "INTERACTION": ["intrcQesitm"],
        "SIDE_EFFECT": ["seQesitm"],
        "STORAGE": ["depositMethodQesitm"]
    }

    return priorities.get(intent, [])


def search_relevant_chunks(
    item_seq: str,
    question: str,
    limit: int = 5
):
    if not isinstance(question, str) or not question.strip():
        return []

    if limit < 1:
        return []

    # 1. 질문 의도 먼저 분류
    intent = detect_question_intent(question)
    priority_fields = get_field_priority(intent)

    # 2. 질문 의도가 명확하면 해당 공식 정보 항목을 직접 검색
    if priority_fields:
        field_placeholders = ", ".join(
            ["%s"] * len(priority_fields)
        )

        priority_case = "CASE mc.api_field " + " ".join(
            f"WHEN %s THEN {index}"
            for index, field in enumerate(priority_fields)
        ) + " ELSE 99 END"

        query = f"""
            SELECT
                m.item_seq,
                m.item_name,
                mc.api_field,
                mc.source_name,
                mc.source_url,
                cc.chunk_index,
                cc.chunk_text,
                1 AS relevance_score
            FROM content_chunks cc
            JOIN medicine_contents mc
                ON cc.content_id = mc.content_id
            JOIN medicines m
                ON mc.item_seq = m.item_seq
            WHERE m.item_seq = %s
              AND mc.api_field IN ({field_placeholders})
            ORDER BY
                {priority_case},
                cc.content_id,
                cc.chunk_index
            LIMIT %s;
        """

        params = [
            item_seq,
            *priority_fields,
            *priority_fields,
            limit
        ]

    # 3. 질문 의도가 불분명하면 기존 키워드 기반 검색
    else:
        keywords = extract_keywords(question)

        # 의도가 분명하지 않은(GENERAL) 질문도 바로 포기하지 않고 키워드로 원문을 찾아본다.
        # 키워드가 원문에 없으면 결과가 비어서 "근거 없음"으로 처리된다.
        if not keywords:
            return []

        where_conditions = [
            "cc.chunk_text ILIKE %s"
            for _ in keywords
        ]

        score_conditions = [
            "CASE WHEN cc.chunk_text ILIKE %s THEN 1 ELSE 0 END"
            for _ in keywords
        ]

        where_clause = " OR ".join(where_conditions)
        score_expression = " + ".join(score_conditions)

        query = f"""
            SELECT
                m.item_seq,
                m.item_name,
                mc.api_field,
                mc.source_name,
                mc.source_url,
                cc.chunk_index,
                cc.chunk_text,
                ({score_expression}) AS relevance_score
            FROM content_chunks cc
            JOIN medicine_contents mc
                ON cc.content_id = mc.content_id
            JOIN medicines m
                ON mc.item_seq = m.item_seq
            WHERE m.item_seq = %s
              AND ({where_clause})
            ORDER BY
                relevance_score DESC,
                cc.content_id,
                cc.chunk_index
            LIMIT %s;
        """

        score_params = [
            f"%{keyword}%" for keyword in keywords
        ]
        where_params = [
            f"%{keyword}%" for keyword in keywords
        ]

        params = [
            *score_params,
            item_seq,
            *where_params,
            limit
        ]

    # 4. DB 검색 실행
    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(query, params)
            rows = cursor.fetchall()

    # 5. 검색 결과 반환
    return [
        {
            "item_seq": row[0],
            "item_name": row[1],
            "api_field": row[2],
            "source_name": row[3],
            "source_url": row[4],
            "chunk_index": row[5],
            "chunk_text": row[6],
            "relevance_score": row[7],
            "intent": intent
        }
        for row in rows
    ]