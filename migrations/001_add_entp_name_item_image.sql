-- 이미 만들어진 DB에 업체명·이미지 칸을 추가한다 (schema.sql로 새로 만든 DB는 실행할 필요 없음)
-- 실행: psql -U postgres -d medi_guard -f migrations/001_add_entp_name_item_image.sql
ALTER TABLE medicines ADD COLUMN IF NOT EXISTS entp_name VARCHAR(255);
ALTER TABLE medicines ADD COLUMN IF NOT EXISTS item_image TEXT;
