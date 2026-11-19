import re

CHUNK_SIZE = 500
CHUNK_OVERLAP = 80
MIN_LAST_CHUNK_SIZE = 150


def split_text(
    text: str,
    chunk_size: int = CHUNK_SIZE,
    overlap: int = CHUNK_OVERLAP,
) -> list[str]:
    if not isinstance(text, str) or not text.strip():
        return []

    if chunk_size <= 0:
        raise ValueError("chunk_size는 0보다 커야 합니다.")

    if overlap < 0 or overlap >= chunk_size:
        raise ValueError("overlap은 0 이상 chunk_size 미만이어야 합니다.")

    text = re.sub(r"\s+", " ", text).strip()

    if len(text) <= chunk_size:
        return [text]

    # 문장 종료 기호를 기준으로 문장 분리
    sentences = re.split(r"(?<=[.!?。])\s+", text)

    chunks = []
    current_chunk = ""

    for sentence in sentences:
        sentence = sentence.strip()

        if not sentence:
            continue

        if len(sentence) > chunk_size:
            if current_chunk:
                chunks.append(current_chunk)
                current_chunk = ""

            start = 0

            while start < len(sentence):
                end = min(start + chunk_size, len(sentence))

                if end < len(sentence):
                    boundary = sentence.rfind(" ", start, end)

                    if boundary > start:
                        end = boundary

                part = sentence[start:end].strip()

                if part:
                    chunks.append(part)

                if end >= len(sentence):
                    break

                start = max(start + 1, end - overlap)

                while start < end and not sentence[start - 1].isspace():
                    start += 1

            continue

        candidate = (
            f"{current_chunk} {sentence}"
            if current_chunk
            else sentence
        )

        if len(candidate) <= chunk_size:
            current_chunk = candidate
        else:
            if current_chunk:
                chunks.append(current_chunk)

            # 마지막 청크의 마지막 완성 문장 가져옴
            overlap_text = ""

            if chunks and overlap > 0:
                previous_sentences = re.split(
                    r"(?<=[.!?。])\s+",
                    chunks[-1],
                )

                if previous_sentences:
                    last_sentence = previous_sentences[-1].strip()

                    if last_sentence and len(last_sentence) <= overlap:
                        overlap_text = last_sentence

            candidate = (
                f"{overlap_text} {sentence}"
                if overlap_text
                else sentence
            )

            if len(candidate) <= chunk_size:
                current_chunk = candidate
            else:
                current_chunk = sentence

    if current_chunk:
        chunks.append(current_chunk)

    # 지나치게 짧은 마지막 청크는 이전 청크와 병합
    if len(chunks) >= 2:
        last_chunk = chunks[-1]
        previous_chunk = chunks[-2]

        merged = f"{previous_chunk} {last_chunk}"

        if (
            len(last_chunk) < MIN_LAST_CHUNK_SIZE
            and len(merged) <= chunk_size
        ):
            chunks[-2] = merged
            chunks.pop()

    return chunks
