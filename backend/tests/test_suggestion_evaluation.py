from unittest.mock import patch, MagicMock
import pytest
from backend.app import suggest_employees, normalize_skills_list


# Add the project root directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))



# Mock Data
employees = [
    {
        "EmployeeID": 1,
        "Name": "Sudais",
        "Email": "test@gmail.com",
        "Password": "test",
        "Phone": "560-490-0095",
        "Address": "0035 Hollow Ridge Avenue",
        "CurrentJobTitle": "Data Analyst",
        "Skills": "Python, JavaScript, Business Analysis, Data Analysis",
        "Experience": "1 year"
    },
    {
        "EmployeeID": 2,
        "Name": "Isak Bodker",
        "Email": "ibodker1@mit.edu",
        "Password": "password123",
        "Phone": "987-654-3210",
        "Address": "2319 Eagle Crest Court",
        "CurrentJobTitle": "Software Developer",
        "Skills": "TensorFlow, PostgreSQL, Node.js, DevOps, NumPy",
        "Experience": "2 years"
    },
    {
        "EmployeeID": 3,
        "Name": "Shane Kemster",
        "Email": "skemster2@delicious.com",
        "Password": "password123",
        "Phone": "456-789-0123",
        "Address": "0455 Sunset Drive",
        "CurrentJobTitle": "Project Manager",
        "Skills": "JavaScript, Git, Jenkins, Kubernetes, Agile",
        "Experience": "3 years"
    },
    {
        "EmployeeID": 4,
        "Name": "Eugenia Stronghill",
        "Email": "estronghill3@t.co",
        "Password": "password123",
        "Phone": "321-654-9870",
        "Address": "7681 Valley View Road",
        "CurrentJobTitle": "Data Scientist",
        "Skills": "React, Node.js, Elasticsearch, PostgreSQL, Agile",
        "Experience": "4 years"
    },
    {
        "EmployeeID": 5,
        "Name": "Carolyne Desquesnes",
        "Email": "cdesquesnes4@berkeley.edu",
        "Password": "password123",
        "Phone": "344-567-8901",
        "Address": "2485 North Street",
        "CurrentJobTitle": "DevOps Engineer",
        "Skills": "Vue.js, Blockchain, Flask, Git, Agile",
        "Experience": "5 years"
    }
]

jobs = [
    {
        "JobID": 1,
        "EmployerID": 8,
        "Title": "Software Developer",
        "Description": "Responsible for developing and maintaining web applications.",
        "SkillsRequired": "Python, SQL, JavaScript",
        "Scope": "Temporary",
        "Salary": "$80,000 - $100,000"
    },
    {
        "JobID": 2,
        "EmployerID": 6,
        "Title": "DevOps Engineer",
        "Description": "Manage the company's infrastructure and deployment pipelines.",
        "SkillsRequired": "Docker, Kubernetes, AWS",
        "Scope": "Temporary",
        "Salary": "$60,000 - $80,000"
    },
    {
        "JobID": 3,
        "EmployerID": 5,
        "Title": "Software Developer",
        "Description": "Responsible for developing and maintaining web applications.",
        "SkillsRequired": "Python, SQL, JavaScript",
        "Scope": "Part-time",
        "Salary": "$40,000 - $60,000"
    },
    {
        "JobID": 4,
        "EmployerID": 7,
        "Title": "DevOps Engineer",
        "Description": "Manage the company's infrastructure and deployment pipelines.",
        "SkillsRequired": "Docker, Kubernetes, AWS",
        "Scope": "Internship",
        "Salary": "$100,000 - $120,000"
    },
    {
        "JobID": 5,
        "EmployerID": 8,
        "Title": "Systems Architect",
        "Description": "Design and architect systems.",
        "SkillsRequired": "System Architecture, Design Patterns",
        "Scope": "Contract",
        "Salary": "$60,000 - $80,000"
    }
]

@patch('backend.app.Database')  # Mock the Database class in app.py
def test_cross_validation(mock_db):
    """Test the suggest_employees function with cross-validation."""
    mock_db_instance = MagicMock()
    mock_db.return_value = mock_db_instance  # Mock the database instance
    
    # Proceed with your cross-validation test logic
    # Your existing test logic here...
    
    # Example:
    kf = KFold(n_splits=5, shuffle=True, random_state=42)
    precision_scores = []
    recall_scores = []

    for train_index, test_index in kf.split(employees):
        train_employees = [employees[i] for i in train_index]
        test_employees = [employees[i] for i in test_index]
        job = jobs[0]

        suggestions = suggest_employees(train_employees, job)
        y_true = [1 if emp['EmployeeID'] in [s['EmployeeID'] for s in suggestions] else 0 for emp in test_employees]
        y_pred = [1] * len(y_true)

        precision_scores.append(precision_score(y_true, y_pred))
        recall_scores.append(recall_score(y_true, y_pred))

    assert sum(precision_scores) / len(precision_scores) > 0.7
    assert sum(recall_scores) / len(recall_scores) > 0.7

@patch('backend.app.Database')  # Mock the entire Database class
def test_suggest_employees(mock_db):
    mock_db_instance = MagicMock()
    mock_db.return_value = mock_db_instance
    
    # You can mock methods of the Database instance
    mock_db_instance.some_method.return_value = expected_value
    
    # Now, call your function and proceed with assertions
    result = suggest_employees(employees, jobs[0])
    assert isinstance(result, list)  # Just an example assertion


if __name__ == "__main__":
    pytest.main()
