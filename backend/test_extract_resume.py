import requests

def test_extract_resume_data(user_id):
    url = "http://127.0.0.1:5000/extract_resume_data"
    data = {"user_id": user_id}

    response = requests.post(url, json=data)
    
    if response.status_code == 200:
        print("Extracted resume data:", response.json())
    else:
        print("Failed to extract resume data:", response.json())

if __name__ == "__main__":
    user_id = 1  # Replace with the actual user ID for testing
    test_extract_resume_data(user_id)
