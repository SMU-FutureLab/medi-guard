import pytest

from chunking import split_text


def test_empty_text():
    assert split_text("") == []
    assert split_text("   ") == []


def test_short_text():
    text = "의약품 사용상 주의사항입니다."

    assert split_text(text) == [text]


def test_long_text_is_split():
    text = "의약품 주의사항입니다. " * 100

    chunks = split_text(text)

    assert len(chunks) > 1
    assert all(len(chunk) <= 500 for chunk in chunks)


def test_chunk_size_can_be_customized():
    text = "의약품 정보입니다. " * 30

    chunks = split_text(
        text,
        chunk_size=100,
        overlap=20,
    )

    assert len(chunks) > 1
    assert all(len(chunk) <= 100 for chunk in chunks)


def test_invalid_chunk_size():
    with pytest.raises(ValueError):
        split_text("테스트", chunk_size=0)


def test_invalid_overlap():
    with pytest.raises(ValueError):
        split_text("테스트", chunk_size=100, overlap=100)


def test_none_input():
    assert split_text(None) == []

def test_chunks_preserve_original_text():
    text = "첫 번째 문장입니다. " * 100

    chunks = split_text(text)

    assert len(chunks) > 1
    assert chunks[0].startswith("첫 번째 문장입니다.")
    assert all(len(chunk) <= 500 for chunk in chunks)


def test_chunk_order_is_preserved():
    text = "첫 번째 내용입니다. " * 50 + "마지막 내용입니다."

    chunks = split_text(text)

    assert chunks[0].startswith("첫 번째 내용입니다.")
    assert chunks[-1].endswith("마지막 내용입니다.")
