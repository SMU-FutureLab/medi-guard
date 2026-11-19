from services.dosage_validation_service import validate_dosage

def get_sample_data():
    return [
        {
            "api_field": "useMethodQesitm",
            "original_text": (
                "만 7~12세 소아는 1회 권장용량을 "
                "4~6시간마다 필요시 복용합니다. "
                "몸무게를 아는 경우 10~15 mg/kg으로 "
                "복용하는 것이 더 적절합니다."
            )
        }
    ]

def test_age_out_of_range():
    result = validate_dosage(
        get_sample_data(),
        age_years=6,
        weight_kg=20
    )
    assert result["status"] == "blocked"

def test_missing_age():
    result = validate_dosage(
        get_sample_data(),
        age_years=None,
        weight_kg=20
    )
    assert result["status"] == "requires_age"

def test_missing_weight():
    result = validate_dosage(
        get_sample_data(),
        age_years=7,
        weight_kg=None
    )
    assert result["status"] == "requires_weight"

def test_missing_official_dose_table():
    result = validate_dosage(
        get_sample_data(),
        age_years=7,
        weight_kg=20
    )
    assert result["status"] == "requires_official_dose_table"

def test_missing_usage_information():
    result = validate_dosage(
        [],
        age_years=7,
        weight_kg=20
    )
    assert result["status"] == "blocked"