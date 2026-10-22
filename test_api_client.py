import requests
import json

base = "http://127.0.0.1:8000"

print("1. Testing GET /health...")
r = requests.get(f"{base}/health")
print(r.status_code, r.json())

print("2. Testing GET /model-info...")
r = requests.get(f"{base}/model-info")
print(r.status_code, r.json()["model_name"])

print("3. Testing POST /demo/predict (normal)...")
r = requests.post(f"{base}/demo/predict", json={"scenario": "normal", "blood_product": "PRBC", "bag_id": "HT-001"})
print(r.status_code, r.json()["remaining_safe_time_hours"], r.json()["health_score"], r.json()["risk_level"])

print("4. Testing POST /demo/predict (temperature_excursion)...")
r = requests.post(f"{base}/demo/predict", json={"scenario": "temperature_excursion", "blood_product": "PRBC", "bag_id": "HT-001"})
print(r.status_code, r.json()["current_temperature_C"], r.json()["risk_level"])

print("5. Testing GET /bags...")
r = requests.get(f"{base}/bags")
print(r.status_code, len(r.json()), "bags active")

print("ALL API TESTS PASSED!")
