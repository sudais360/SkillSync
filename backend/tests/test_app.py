import pytest
from unittest.mock import patch, MagicMock
from backend.app import app

@pytest.fixture
def client():
    with app.test_client() as client:
        yield client

# Mock the Database class in app.py to prevent actual database connections during tests
@patch('backend.app.Database')
def test_database_connection(mock_db, client):
    mock_db_instance = MagicMock()
    mock_db.return_value = mock_db_instance

    # Mock the connect method to simulate a successful connection
    mock_db_instance.connect.return_value = True

    # Test your application behavior here
    response = client.get('/')
    assert response.status_code == 404  # Example assertion
