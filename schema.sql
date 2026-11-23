CREATE TABLE medicines (
    item_seq VARCHAR(20) PRIMARY KEY,
    item_name VARCHAR(255) NOT NULL,
    entp_name VARCHAR(255),          -- 업체명 (e약은요 entpName)
    item_image TEXT,                 -- 낱알 이미지 주소 (e약은요 itemImage)
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE medicine_contents (
    content_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    item_seq VARCHAR(20) NOT NULL,
    content_type VARCHAR(50) NOT NULL,
    api_field VARCHAR(100) NOT NULL,
    original_text TEXT NOT NULL,
    source_name VARCHAR(100) NOT NULL DEFAULT '식품의약품안전처',
    source_url TEXT,
    retrieved_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_medicine_contents_medicine
        FOREIGN KEY (item_seq)
        REFERENCES medicines(item_seq)
        ON DELETE CASCADE,

    CONSTRAINT uq_medicine_content_type
        UNIQUE (item_seq, api_field)
);

CREATE TABLE content_chunks (
    chunk_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    content_id BIGINT NOT NULL,
    chunk_index INTEGER NOT NULL,
    chunk_text TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_content_chunks_content
        FOREIGN KEY (content_id)
        REFERENCES medicine_contents(content_id)
        ON DELETE CASCADE,

    CONSTRAINT uq_content_chunk_index
        UNIQUE (content_id, chunk_index),

    CONSTRAINT chk_chunk_index
        CHECK (chunk_index >= 0)
);

CREATE INDEX idx_medicines_item_name
    ON medicines(item_name);

CREATE INDEX idx_medicine_contents_item_seq
    ON medicine_contents(item_seq);

CREATE INDEX idx_content_chunks_content_id
    ON content_chunks(content_id);
