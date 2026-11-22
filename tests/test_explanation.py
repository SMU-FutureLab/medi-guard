import unittest
from unittest.mock import patch

from routers.explanation import (
    ExplanationRequest,
    create_explanation,
)


class TestCreateExplanation(unittest.TestCase):

    @patch("routers.explanation.generate_medicine_explanation")
    @patch("routers.explanation.search_relevant_chunks")
    @patch("routers.explanation.get_medicine_detail")
    def test_no_search_results(
        self,
        mock_get_medicine,
        mock_search,
        mock_generate,
    ):
        mock_get_medicine.return_value = {
            "item_name": "테스트 의약품"
        }
        mock_search.return_value = []

        request = ExplanationRequest(
            item_seq="123456789",
            question="이 약의 효능은 무엇인가요?"
        )

        result = create_explanation(request)

        self.assertEqual(result["status"], "no_results")
        self.assertIsNone(result["answer"])
        self.assertEqual(result["evidence"], [])

        mock_generate.assert_not_called()

    @patch("routers.explanation.generate_medicine_explanation")
    @patch("routers.explanation.check_evidence_sufficiency")
    @patch("routers.explanation.search_relevant_chunks")
    @patch("routers.explanation.get_medicine_detail")
    def test_insufficient_evidence(
        self,
        mock_get_medicine,
        mock_search,
        mock_check_evidence,
        mock_generate,
    ):
        mock_get_medicine.return_value = {
            "item_name": "테스트 의약품"
        }

        mock_search.return_value = [
            {
                "item_seq": "123456789",
                "item_name": "테스트 의약품",
                "api_field": "seQesitm",
                "chunk_text": "테스트 근거 내용",
                "relevance_score": 1,
                "intent": "SIDE_EFFECT",
            }
        ]

        mock_check_evidence.return_value = {
            "is_sufficient": False,
            "intent": "SIDE_EFFECT",
            "evidence_count": 0,
            "evidence": [],
        }

        request = ExplanationRequest(
            item_seq="123456789",
            question="이 약의 부작용은 무엇인가요?"
        )

        result = create_explanation(request)

        self.assertEqual(
            result["status"],
            "insufficient_evidence"
        )
        self.assertIsNone(result["answer"])
        self.assertEqual(result["evidence"], [])

        mock_generate.assert_not_called()

    @patch("routers.explanation.generate_medicine_explanation")
    @patch("routers.explanation.check_evidence_sufficiency")
    @patch("routers.explanation.search_relevant_chunks")
    @patch("routers.explanation.get_medicine_detail")
    def test_sufficient_evidence_calls_gemini(
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
            "api_field": "seQesitm",
            "chunk_text": "공식 의약품 정보에 기재된 부작용 내용",
            "source_name": "의약품 공식 정보",
            "source_url": "https://example.com",
            "relevance_score": 1,
            "intent": "SIDE_EFFECT",
        }

        mock_search.return_value = [search_result]

        mock_check_evidence.return_value = {
            "is_sufficient": True,
            "intent": "SIDE_EFFECT",
            "evidence_count": 1,
            "evidence": [search_result],
        }

        mock_generate.return_value = "테스트 AI 설명"

        request = ExplanationRequest(
            item_seq="123456789",
            question="이 약의 부작용은 무엇인가요?"
        )

        result = create_explanation(request)

        self.assertEqual(result["status"], "answered")
        self.assertEqual(result["answer"], "테스트 AI 설명")
        self.assertEqual(len(result["evidence"]), 1)

        mock_generate.assert_called_once()


if __name__ == "__main__":
    unittest.main()
