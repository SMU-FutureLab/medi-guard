
import unittest
from unittest.mock import patch

from fastapi.testclient import TestClient

from main import app


class TestExplanationAPI(unittest.TestCase):

    def setUp(self):
        self.client = TestClient(app)
        self.url = "/api/v1/explanations"

    @patch("routers.explanation.get_medicine_detail")
    def test_medicine_not_found(self, mock_get_medicine):
        mock_get_medicine.return_value = None

        response = self.client.post(
            self.url,
            json={
                "item_seq": "000000000",
                "question": "이 약의 효능은 무엇인가요?"
            }
        )

        self.assertEqual(response.status_code, 404)

    def test_missing_item_seq(self):
        response = self.client.post(
            self.url,
            json={
                "question": "이 약의 효능은 무엇인가요?"
            }
        )

        self.assertEqual(response.status_code, 422)

    def test_missing_question(self):
        response = self.client.post(
            self.url,
            json={
                "item_seq": "123456789"
            }
        )

        self.assertEqual(response.status_code, 422)

    def test_invalid_limit(self):
        for limit in [0, 11]:
            with self.subTest(limit=limit):
                response = self.client.post(
                    self.url,
                    json={
                        "item_seq": "123456789",
                        "question": "이 약의 효능은 무엇인가요?",
                        "limit": limit
                    }
                )

                self.assertEqual(response.status_code, 422)

    @patch("routers.explanation.generate_medicine_explanation")
    @patch("routers.explanation.check_evidence_sufficiency")
    @patch("routers.explanation.search_relevant_chunks")
    @patch("routers.explanation.get_medicine_detail")
    def test_gemini_generation_failed(
        self,
        mock_get_medicine,
        mock_search,
        mock_check_evidence,
        mock_generate,
    ):
        mock_get_medicine.return_value = {
            "item_name": "테스트 의약품"
        }

        search_result = {
            "item_seq": "123456789",
            "item_name": "테스트 의약품",
            "api_field": "efcyQesitm",
            "chunk_text": "공식 의약품 효능 정보",
            "source_name": "의약품 공식 정보",
            "source_url": "https://example.com",
            "relevance_score": 1,
            "intent": "EFFICACY",
        }

        mock_search.return_value = [search_result]

        mock_check_evidence.return_value = {
            "is_sufficient": True,
            "intent": "EFFICACY",
            "evidence_count": 1,
            "evidence": [search_result],
        }

        mock_generate.side_effect = RuntimeError(
            "Gemini API 테스트 오류"
        )

        response = self.client.post(
            self.url,
            json={
                "item_seq": "123456789",
                "question": "이 약의 효능은 무엇인가요?"
            }
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.json()["status"],
            "generation_failed"
        )
        self.assertIsNone(response.json()["answer"])
        self.assertEqual(len(response.json()["evidence"]), 1)


if __name__ == "__main__":
    unittest.main()
