"""
HemoTwin Backend Configuration
"""
from typing import Dict

PRODUCT_CANONICAL_MAP: Dict[str, str] = {
    "prbc": "PRBC",
    "packed_red_blood_cells": "PRBC",
    "whole_blood": "Whole_Blood",
    "whole blood": "Whole_Blood",
    "platelets": "Platelets",
    "platelet": "Platelets",
    "ffp": "FFP",
    "fresh_frozen_plasma": "FFP",
    "fresh frozen plasma": "FFP",
}

PRODUCT_TARGET_TEMPS: Dict[str, float] = {
    "PRBC": 4.0,
    "Whole_Blood": 4.0,
    "Platelets": 22.0,
    "FFP": -18.0,
}

PRODUCT_SAFE_RANGES: Dict[str, tuple] = {
    "PRBC": (2.0, 6.0),
    "Whole_Blood": (2.0, 6.0),
    "Platelets": (20.0, 24.0),
    "FFP": (-30.0, -18.0),
}

PRODUCT_MAX_LIFESPAN_HOURS: Dict[str, float] = {
    "PRBC": 1008.0,       # 42 days
    "Whole_Blood": 840.0,  # 35 days
    "Platelets": 120.0,    # 5 days
    "FFP": 8760.0,         # 365 days
}

SCIENTIFIC_DISCLAIMER: str = (
    "This research prototype generates physics-informed digital surrogate estimates "
    "based on synthetic simulation telemetry. It does NOT predict biological blood viability, "
    "hemolysis, or bacterial contamination, and must NOT be used for clinical diagnosis or safety validation."
)
