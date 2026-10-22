"""
HemoTwin Digital Surrogate API Server
FastAPI Backend providing Physics-Informed ML Inference & Digital Twin Services
"""
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any

from .config import SCIENTIFIC_DISCLAIMER
from .schemas import (
    TelemetryInput,
    BagRegistration,
    BagSummary,
    DigitalTwinResponse,
    StatelessPredictResponse,
    DemoScenarioRequest,
    ModelInfoResponse
)
from .feature_engineering import MODEL_FEATURES, normalize_blood_product
from .predictor import predictor_instance
from .digital_twin import twin_manager

app = FastAPI(
    title="HemoTwin Digital Surrogate API",
    description="Multi-Physics Digital Surrogate for Hematic Kinetic Stability Forecasting",
    version="0.2.0"
)

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def get_root():
    return {
        "project": "HemoTwin",
        "description": "Multi-Physics Digital Surrogate for Hematic Kinetic Stability Forecasting",
        "version": "0.2.0",
        "status": "operational",
        "mode": "Research Prototype",
        "disclaimer": SCIENTIFIC_DISCLAIMER
    }

@app.get("/health")
def get_health():
    return {
        "status": "healthy",
        "model_loaded": predictor_instance.model_loaded,
        "active_bags_count": len(twin_manager.bags),
        "disclaimer": SCIENTIFIC_DISCLAIMER
    }

@app.get("/model-info", response_model=ModelInfoResponse)
def get_model_info():
    return ModelInfoResponse(
        model_name="Physics-Informed HistGradientBoostingRegressor (Experiment B)",
        model_type="physics-informed-surrogate",
        feature_count=len(MODEL_FEATURES),
        features=MODEL_FEATURES,
        training_dataset_size=172800,
        simulated_bags_count=600,
        benchmarks={
            "test_mae_hours": 7.24,
            "test_r2": 0.99986,
            "validation_split": "Bag-level grouped split (GroupKFold, 5 splits)",
            "benchmark_category": "Synthetic-data benchmark"
        },
        limitations="Trained and validated on synthetic physics simulation curves; not clinically validated for patient diagnosis.",
        disclaimer=SCIENTIFIC_DISCLAIMER
    )

@app.post("/predict", response_model=StatelessPredictResponse)
def predict_stateless(telemetry: TelemetryInput):
    data = telemetry.model_dump()
    data["blood_product"] = normalize_blood_product(data.get("blood_product", "PRBC"))
    rst, health, risk = predictor_instance.predict(data)
    return StatelessPredictResponse(
        remaining_safe_time_hours=rst,
        health_score=health,
        risk_level=risk,
        model_type=predictor_instance.model_type,
        disclaimer=SCIENTIFIC_DISCLAIMER
    )

@app.post("/bags/register", response_model=BagSummary, status_code=status.HTTP_201_CREATED)
def register_bag(payload: BagRegistration):
    bag = twin_manager.register_bag(
        bag_id=payload.bag_id,
        blood_product=payload.blood_product,
        initial_hours=payload.initial_storage_hours,
        donor_id=payload.donor_id
    )
    return bag.to_summary()

@app.get("/bags", response_model=List[BagSummary])
def list_bags():
    return twin_manager.list_bags()

@app.get("/bags/{bag_id}", response_model=DigitalTwinResponse)
def get_bag_twin(bag_id: str):
    bag = twin_manager.get_bag(bag_id)
    if not bag:
        raise HTTPException(status_code=404, detail=f"Bag '{bag_id}' not found in registry.")
    return bag.to_twin_response()

@app.delete("/bags/{bag_id}")
def delete_bag(bag_id: str):
    success = twin_manager.delete_bag(bag_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"Bag '{bag_id}' not found in registry.")
    return {"message": f"Bag '{bag_id}' removed from tracking.", "status": "deleted"}

@app.post("/bags/{bag_id}/telemetry", response_model=DigitalTwinResponse)
def ingest_bag_telemetry(bag_id: str, telemetry: TelemetryInput):
    data = telemetry.model_dump()
    twin = twin_manager.ingest_telemetry(bag_id, data, data_source="live" if data.get("timestamp") else "synthetic")
    return twin

@app.post("/demo/predict", response_model=DigitalTwinResponse)
def demo_predict(request: DemoScenarioRequest):
    twin = twin_manager.generate_demo_packet(
        scenario=request.scenario,
        product=request.blood_product,
        bag_id=request.bag_id or "HT-001"
    )
    return twin
