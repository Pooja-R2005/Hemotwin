from app.main import app

def test_routes():
    routes = [route.path for route in app.routes]
    print("Routes:", routes)
    assert "/health" in routes
    assert "/model-info" in routes
    assert "/predict" in routes
    assert "/demo/predict" in routes
    print("ALL ROUTES VERIFIED OK")

if __name__ == "__main__":
    test_routes()
