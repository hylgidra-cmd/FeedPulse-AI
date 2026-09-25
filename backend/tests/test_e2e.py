import os
import asyncio
from fastapi.testclient import TestClient

# Use temporary SQLite database for testing
os.environ["DATABASE_URL"] = "sqlite:///./test_feedpulse.db"

from app.main import app
from app.core.database import Base, engine

client = TestClient(app)

def run_e2e_test():
    print("--- 1. Initializing DB ---")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    print("--- 2. Registering User ---")
    reg_res = client.post("/api/v1/auth/register", json={
        "email": "testpm@example.com",
        "password": "Password123!",
        "full_name": "Test Product Manager"
    })
    assert reg_res.status_code == 201, f"Register failed: {reg_res.text}"
    print("User registered:", reg_res.json()["email"])

    print("--- 3. Logging in ---")
    login_res = client.post("/api/v1/auth/login", json={
        "email": "testpm@example.com",
        "password": "Password123!"
    })
    assert login_res.status_code == 200, f"Login failed: {login_res.text}"
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("JWT Token acquired successfully.")

    print("--- 4. Creating Project ---")
    proj_res = client.post("/api/v1/projects", json={
        "name": "Super Fintech App",
        "description": "Mobile banking application",
        "platform": "ios"
    }, headers=headers)
    assert proj_res.status_code == 201, f"Project creation failed: {proj_res.text}"
    project_id = proj_res.json()["id"]
    print(f"Project created with ID: {project_id}")

    print("--- 5. Uploading CSV Feedbacks ---")
    csv_path = "../sample_feedbacks.csv"
    with open(csv_path, "rb") as f:
        upload_res = client.post(
            f"/api/v1/projects/{project_id}/feedbacks/upload-csv",
            files={"file": ("sample_feedbacks.csv", f, "text/csv")},
            headers=headers
        )
    assert upload_res.status_code == 200, f"CSV upload failed: {upload_res.text}"
    stats = upload_res.json()
    print("Upload result:", stats["message"])
    assert stats["total_inserted"] > 0

    print("--- 6. Running AI Clustering & Analysis ---")
    analysis_res = client.post(f"/api/v1/projects/{project_id}/analysis/trigger", headers=headers)
    assert analysis_res.status_code == 200, f"Analysis trigger failed: {analysis_res.text}"
    clusters = analysis_res.json()
    print(f"Generated {len(clusters)} issue clusters.")
    for i, c in enumerate(clusters):
        print(f"\n  Cluster #{i+1}: {c['title']}")
        print(f"  Severity: {c['severity']} | Impact: {c['impact_percentage']}%")
        print(f"  Root Cause: {c['root_cause'][:80]}...")
        print(f"  Jira Markdown preview: {c['jira_markdown'][:100]}...")

    print("--- 7. Fetching Project Analysis Summary ---")
    summary_res = client.get(f"/api/v1/projects/{project_id}/analysis/clusters", headers=headers)
    assert summary_res.status_code == 200
    summary = summary_res.json()
    print("\nSummary metrics:")
    print(f"  Total feedbacks: {summary['total_feedbacks']}")
    print(f"  Negative: {summary['negative_feedbacks']}")
    print(f"  Positive: {summary['positive_feedbacks']}")
    print(f"  Neutral: {summary['neutral_feedbacks']}")

    # Clean up test database file
    try:
        if os.path.exists("./test_feedpulse.db"):
            os.remove("./test_feedpulse.db")
    except Exception:
        pass

    print("\n[SUCCESS] All End-to-End Tests Passed with 100% success!")

if __name__ == "__main__":
    run_e2e_test()
