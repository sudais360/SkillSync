from flask import Flask, request, jsonify
from flask_cors import CORS
from database import Database

app = Flask(__name__)
CORS(app)

db = Database(server="skillsync12345.database.windows.net",
              database="SkillSyn",
              username="skillsync",
              password="Sudais22!")
db.connect()

@app.route('/signup', methods=['POST'])
def signup():
    try:
        data = request.json
        print(f"Received signup data: {data}")
        
        name = data.get('name')
        email = data.get('email')
        password = data.get('password')
        role = data.get('role')  # use 'role' instead of 'user_type' to match input

        # Ensure all required fields are provided
        if not all([name, email, password, role]):
            print("Missing required fields.")
            return jsonify({"message": "Missing required fields"}), 400

        db.connect()
        cursor = db.conn.cursor()

        if role == 'employee':
            cursor.execute("SELECT * FROM employees WHERE email = ?", (email,))
        elif role == 'employer':
            cursor.execute("SELECT * FROM employers WHERE email = ?", (email,))
        else:
            print("Invalid user type provided.")
            cursor.close()
            return jsonify({"message": "Invalid user type"}), 400

        user = cursor.fetchone()

        if user:
            print("User already exists.")
            cursor.close()
            return jsonify({"message": "User already exists"}), 400

        if role == 'employee':
            cursor.execute("INSERT INTO employees (name, email, password) VALUES (?, ?, ?)", (name, email, password))
        elif role == 'employer':
            cursor.execute("INSERT INTO employers (name, email, password) VALUES (?, ?, ?)", (name, email, password))

        db.conn.commit()
        cursor.close()

        return jsonify({"message": "User created successfully"}), 201
    except Exception as e:
        print(f"Error in signup: {e}")
        return jsonify({"message": "Internal Server Error"}), 500

# @app.route('/login', methods=['POST'])
# def login():
#     try:
#         data = request.json
#         print(f"Received login data: {data}")
        
#         email = data.get('email')
#         password = data.get('password')
#         user_type = data.get('role')  # use 'role' instead of 'user_type' to match input

#         # Ensure all required fields are provided
#         if not all([email, password, user_type]):
#             print("Missing required fields.")
#             return jsonify({"message": "Missing required fields"}), 400

#         cursor = db.conn.cursor()

#         if user_type == 'employee':
#             cursor.execute("SELECT * FROM employees WHERE email = ? AND password = ?", (email, password))
#         elif user_type == 'employer':
#             cursor.execute("SELECT * FROM employers WHERE email = ? AND password = ?", (email, password))
#         else:
#             print("Invalid user type provided.")
#             cursor.close()
#             return jsonify({"message": "Invalid user type"}), 400

#         user = cursor.fetchone()
#         cursor.close()

#         if user:
#             return jsonify({"message": "Login successful"}), 200
#         else:
#             print("Invalid email or password.")
#             return jsonify({"message": "Invalid email or password"}), 401
#     except Exception as e:
#         print(f"Error in login: {e}")
#         return jsonify({"message": "Internal Server Error"}), 500
    

# @app.route('/jobpostings', methods=['POST'])
# def create_job_posting():
#     try:
#         data = request.json
#         print(f"Received job posting data: {data}")
        
#         employer_id = data.get('employer_id')  # Assuming you pass the employer's ID from the frontend
#         title = data.get('title')
#         description = data.get('description')
#         skills = data.get('skills')
#         scope = data.get('scope')
#         salary = data.get('salary')

#         # Ensure all required fields are provided
#         if not all([employer_id, title, description, skills, scope, salary]):
#             print("Missing required fields.")
#             return jsonify({"message": "Missing required fields"}), 400

#         cursor = db.conn.cursor()
#         cursor.execute("INSERT INTO JobPosting (EmployerId, Title, Description, Skills, Scope, Salary) VALUES (?, ?, ?, ?, ?, ?)",
#                        (employer_id, title, description, skills, scope, salary))
#         db.conn.commit()
#         cursor.close()

#         return jsonify({"message": "Job posting created successfully"}), 201
#     except Exception as e:
#         print(f"Error creating job posting: {e}")
#         return jsonify({"message": "Internal Server Error"}), 500

@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.json
        print(f"Received login data: {data}")
        
        email = data.get('email')
        password = data.get('password')
        user_type = data.get('role')

        # Ensure all required fields are provided
        if not all([email, password, user_type]):
            print("Missing required fields.")
            return jsonify({"message": "Missing required fields"}), 400

        cursor = db.conn.cursor()

        if user_type == 'employee':
            cursor.execute("SELECT EmployeeId FROM employees WHERE email = ? AND password = ?", (email, password))
        elif user_type == 'employer':
            cursor.execute("SELECT EmployerId FROM employers WHERE email = ? AND password = ?", (email, password))
        else:
            print("Invalid user type provided.")
            cursor.close()
            return jsonify({"message": "Invalid user type"}), 400

        user = cursor.fetchone()  # Fetching user data
        print(f"Fetched user data: {user}")

        if user:  # If user exists
            user_id = user[0]  # Assuming the user ID is in the first column
            employer_id = user_id
            print(f"User ID: {user_id}")
            return jsonify({"message": "Login successful", "user_id": employer_id}), 200
        else:
            print("Invalid email or password.")
            return jsonify({"message": "Invalid email or password"}), 401
    except Exception as e:
        print(f"Error in login: {e}")
        return jsonify({"message": "Internal Server Error"}), 500


    

@app.route('/jobpostings', methods=['POST'])
def create_job_posting():
    try:
        data = request.json
        print(f"Received job posting data: {data}")
        
        employer_id = data.get('employer_id')  # Retrieve employer_id from the JSON payload
        title = data.get('title')
        description = data.get('description')
        skills = data.get('skills')
        scope = data.get('scope')
        salary = data.get('salary')

        # Ensure all required fields are provided
        if not all([employer_id, title, description, skills, scope, salary]):
            print("Missing required fields.")
            return jsonify({"message": "Missing required fields"}), 400

        cursor = db.conn.cursor()
        cursor.execute("INSERT INTO JobPosting (EmployerId, Title, Description, Skills, Scope, Salary) VALUES (?, ?, ?, ?, ?, ?)",
                       (employer_id, title, description, skills, scope, salary))
        db.conn.commit()
        cursor.close()

        return jsonify({"message": "Job posting created successfully"}), 201
    except Exception as e:
        print(f"Error creating job posting: {e}")
        return jsonify({"message": "Internal Server Error"}), 500



if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
