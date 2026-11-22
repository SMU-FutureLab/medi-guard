import os
import unittest
from unittest.mock import Mock, patch

from scripts.analyze_medicine_data import get_items, fetch_medicines


class TestGetItems(unittest.TestCase):

    def test_normal_response(self):
        data = {
            "body": {
                "items": [
                    {"itemName": "타이레놀정"},
                    {"itemName": "타이레놀산"},
                ]
            }
        }

        result = get_items(data)

        self.assertEqual(len(result), 2)
        self.assertEqual(result[0]["itemName"], "타이레놀정")

    def test_empty_response(self):
        data = {"body": {"items": []}}

        self.assertEqual(get_items(data), [])

    def test_nested_item_response(self):
        data = {
            "body": {
                "items": {
                    "item": [
                        {"itemName": "타이레놀정"}
                    ]
                }
            }
        }

        result = get_items(data)

        self.assertEqual(len(result), 1)

    def test_list_response(self):
        data = {
            "body": [
                {"itemName": "타이레놀정"}
            ]
        }

        self.assertEqual(len(get_items(data)), 1)

    def test_missing_items(self):
        data = {
            "body": {
                "pageNo": 1,
                "totalCount": 0
            }
        }

        self.assertEqual(get_items(data), [])


class TestFetchMedicines(unittest.TestCase):

    @patch.dict(os.environ, {"DATA_GO_KR_SERVICE_KEY": "test-key"})
    @patch("scripts.analyze_medicine_data.requests.get")
    def test_successful_request(self, mock_get):
        mock_response = Mock()
        mock_response.json.return_value = {
            "header": {
                "resultCode": "00",
                "resultMsg": "NORMAL SERVICE."
            },
            "body": {
                "items": [
                    {"itemName": "타이레놀"}
                ]
            }
        }

        mock_get.return_value = mock_response

        result = fetch_medicines("타이레놀")

        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]["itemName"], "타이레놀")

    @patch.dict(os.environ, {}, clear=True)
    def test_missing_api_key(self):
        with self.assertRaises(ValueError):
            fetch_medicines("타이레놀")

    @patch.dict(os.environ, {"DATA_GO_KR_SERVICE_KEY": "test-key"})
    def test_empty_search_name(self):
        with self.assertRaises(ValueError):
            fetch_medicines(" ")


if __name__ == "__main__":
    unittest.main()
