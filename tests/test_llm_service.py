import unittest
from unittest.mock import Mock, patch

from services.llm_service import generate_medicine_explanation


class TestLLMSafety(unittest.TestCase):

    @patch("services.llm_service.get_gemini_client")
    def test_empty_evidence_blocks_gemini(self, mock_get_client):
        with self.assertRaises(ValueError):
            generate_medicine_explanation(
                item_name="테스트 의약품",
                question="다른 약과 함께 복용해도 되나요?",
                intent="INTERACTION",
                evidence=[],
            )

        mock_get_client.assert_not_called()

    @patch("services.llm_service.get_gemini_client")
    def test_interaction_safety_rules_in_prompt(self, mock_get_client):
        mock_response = Mock()
        mock_response.text = "공식 의약품 정보를 확인해 주세요."

        mock_client = Mock()
        mock_client.models.generate_content.return_value = mock_response
        mock_get_client.return_value = mock_client

        evidence = [
            {
                "api_field": "intrcQesitm",
                "chunk_text": "다른 의약품과 병용 시 주의가 필요합니다.",
            }
        ]

        generate_medicine_explanation(
            item_name="테스트 의약품",
            question="다른 약과 함께 복용해도 되나요?",
            intent="INTERACTION",
            evidence=evidence,
        )

        prompt = mock_client.models.generate_content.call_args.kwargs[
            "contents"
        ]

        self.assertIn("intrcQesitm", prompt)
        self.assertIn("상호작용이 없다고 단정하지 마세요", prompt)
        self.assertIn("공식 정보만으로", prompt)
        self.assertIn("병용", prompt)

    @patch("services.llm_service.get_gemini_client")
    def test_interaction_evidence_is_included_in_prompt(
        self,
        mock_get_client,
    ):
        mock_response = Mock()
        mock_response.text = "공식 정보에 따른 설명입니다."

        mock_client = Mock()
        mock_client.models.generate_content.return_value = mock_response
        mock_get_client.return_value = mock_client

        evidence = [
            {
                "api_field": "intrcQesitm",
                "chunk_text": "특정 의약품과 함께 사용할 때 주의해야 합니다.",
            }
        ]

        answer = generate_medicine_explanation(
            item_name="테스트 의약품",
            question="다른 약과 같이 복용해도 되나요?",
            intent="INTERACTION",
            evidence=evidence,
        )

        prompt = mock_client.models.generate_content.call_args.kwargs[
            "contents"
        ]

        self.assertIn(
            "특정 의약품과 함께 사용할 때 주의해야 합니다.",
            prompt,
        )
        self.assertEqual(answer, "공식 정보에 따른 설명입니다.")


    @patch("services.llm_service.get_gemini_client")
    def test_pediatric_age_rules_in_prompt(self, mock_get_client):
        prompt = self._get_test_prompt(mock_get_client)

        self.assertIn("소아, 성인, 고령자", prompt)
        self.assertIn("연령별 복용 조건", prompt)

    @patch("services.llm_service.get_gemini_client")
    def test_weight_based_dosage_rules_in_prompt(self, mock_get_client):
        prompt = self._get_test_prompt(mock_get_client)

        self.assertIn("mg/kg", prompt)
        self.assertIn("실제 복용량(mg)을 계산하지 마세요", prompt)
        self.assertIn("체중이 제공되지 않았다면", prompt)

    @patch("services.llm_service.get_gemini_client")
    def test_dosage_limit_rules_in_prompt(self, mock_get_client):
        prompt = self._get_test_prompt(mock_get_client)

        self.assertIn("1회 용량과 1일 최대 용량", prompt)
        self.assertIn("구분하여 설명하세요", prompt)

    @patch("services.llm_service.get_gemini_client")
    def test_unsupported_dosage_rules_in_prompt(self, mock_get_client):
        prompt = self._get_test_prompt(mock_get_client)

        self.assertIn("공식 근거에 없는 소아 복용량", prompt)
        self.assertIn("일반적인 의학 지식으로 보충하지 마세요", prompt)

    def _get_test_prompt(self, mock_get_client):
        mock_response = Mock()
        mock_response.text = "테스트 답변"

        mock_client = Mock()
        mock_client.models.generate_content.return_value = mock_response
        mock_get_client.return_value = mock_client

        generate_medicine_explanation(
            item_name="테스트 의약품",
            question="어린이 복용량은 어떻게 되나요?",
            intent="USAGE",
            evidence=[
                {
                    "api_field": "useMethodQesitm",
                    "chunk_text": "7~12세 소아의 복용 방법에 관한 공식 근거",
                }
            ],
        )

        return mock_client.models.generate_content.call_args.kwargs["contents"]


if __name__ == "__main__":
    unittest.main()