import re


CHUNK_SIZE = 500
CHUNK_OVERLAP = 80


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

    chunks = []
    start = 0

    while start < len(text):
        end = min(start + chunk_size, len(text))

        if end < len(text):
            boundary = max(
                text.rfind(".", start + chunk_size // 2, end),
                text.rfind("!", start + chunk_size // 2, end),
                text.rfind("?", start + chunk_size // 2, end),
                text.rfind("。", start + chunk_size // 2, end),
                text.rfind("!", start + chunk_size // 2, end),
                text.rfind(" ", start + chunk_size // 2, end),
            )

            if boundary > start:
                end = boundary + 1

        chunk = text[start:end].strip()

        if chunk:
            chunks.append(chunk)

        if end >= len(text):
            break

        next_start = max(start + 1, end - overlap)

        while next_start < end and not text[next_start - 1].isspace():
            next_start += 1

        start = next_start

    return chunks
