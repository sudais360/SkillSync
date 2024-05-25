from flask import Flask, request, jsonify
from flask_cors import CORS
from database import Database

from azure.storage.blob import BlobServiceClient, generate_blob_sas, BlobSasPermissions
from datetime import datetime, timedelta
import uuid

import PyPDF2
import re
import io
import requests

import spacy

# Initialize spaCy NLP model
nlp = spacy.load("en_core_web_sm")

app = Flask(__name__)
CORS(app)

db = Database(server="skillsync12345.database.windows.net",
              database="SkillSyn",
              username="skillsync",
              password="Sudais22!")
db.connect()

# Initialize the BlobServiceClient with your Azure connection string
connection_string = "DefaultEndpointsProtocol=https;AccountName=skillsync;AccountKey=ojDU6hUV5lnMwFeomFd15yCQLTdfAy4mNYjAHdnFSLkXsAxdWICeq74FLhabq5byM5VZ6sHntbMm+AStDr/d0g==;EndpointSuffix=core.windows.net"
blob_service_client = BlobServiceClient.from_connection_string(connection_string)
container_name = "resumes"

################################################# SIGNU  P#################################################

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

        if not db.conn:
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
    

    ################################################# LOGIN  P#################################################

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

        if not db.conn:
            db.connect()

        cursor = db.conn.cursor()

        if user_type == 'employee':
            cursor.execute("SELECT EmployeeId FROM employees WHERE email = ? AND password = ?", (email, password))
        elif user_type == 'employer':
            cursor.execute("SELECT EmployerID FROM employers WHERE email = ? AND password = ?", (email, password))  # Ensure correct column name
        else:
            print("Invalid user type provided.")
            cursor.close()
            return jsonify({"message": "Invalid user type"}), 400

        user = cursor.fetchone()  # Fetching user data
        print(f"Fetched user data: {user}")

        if user:  # If user exists
            user_id = user[0]  # Assuming the user ID is in the first column
            print(f"User ID: {user_id}")
            return jsonify({"message": "Login successful", "user_id": user_id}), 200
        else:
            print("Invalid email or password.")
            return jsonify({"message": "Invalid email or password"}), 401
    except Exception as e:
        print(f"Error in login: {e}")
        return jsonify({"message": "Internal Server Error"}), 500
    

################################################# EMPLOYER  #################################################

################################### Jobposting  #################

@app.route('/jobpostings', methods=['POST'])
def create_job_posting():
    try:
        data = request.json
        print(f"Received job posting data: {data}")
        
        employer_id = data.get('employer_id')  # Assuming you pass the employer's ID from the frontend
        title = data.get('position')  # Make sure the key names match those sent from the frontend
        description = data.get('scope')  # Adjust the field names as needed
        skills = data.get('skills')
        scope = data.get('scope')
        salary = data.get('salary')

        # Ensure all required fields are provided
        if not all([employer_id, title, description, skills, scope, salary]):
            print("Missing required fields.")
            return jsonify({"message": "Missing required fields"}), 400

        cursor = db.conn.cursor()
        cursor.execute("INSERT INTO JobPostings (EmployerId, Title, Description, Skills, Scope, Salary) VALUES (?, ?, ?, ?, ?, ?)",
                       (employer_id, title, description, ','.join(skills), scope, salary))
        db.conn.commit()
        cursor.close()

        return jsonify({"message": "Job posting created successfully"}), 201
    except Exception as e:
        print(f"Error creating job posting: {e}")
        return jsonify({"message": "Internal Server Error"}), 500

@app.route('/jobpostings/<int:job_id>', methods=['PUT'])
def update_job_posting(job_id):
    try:
        data = request.json
        print(f"Received job update data for job ID {job_id}: {data}")
        
        title = data.get('position')
        description = data.get('scope')
        skills = data.get('skills')
        scope = data.get('scope')
        salary = data.get('salary')

        # Ensure all required fields are provided
        if not all([title, description, skills, scope, salary]):
            print("Missing required fields.")
            return jsonify({"message": "Missing required fields"}), 400

        cursor = db.conn.cursor()
        cursor.execute("""
            UPDATE JobPostings
            SET Title = ?, Description = ?, Skills = ?, Scope = ?, Salary = ?
            WHERE JobID = ?
        """, (title, description, ','.join(skills), scope, salary, job_id))
        db.conn.commit()
        cursor.close()

        return jsonify({"message": "Job posting updated successfully"}), 200
    except Exception as e:
        print(f"Error updating job posting: {e}")
        return jsonify({"message": "Internal Server Error"}), 500


@app.route('/jobpostings', methods=['GET'])
def get_job_postings():
    try:
        employer_id = request.args.get('employer_id')
        cursor = db.conn.cursor()
        
        if employer_id:
            cursor.execute("SELECT JobID, EmployerID, Title, Description, Skills, Scope, Salary FROM JobPostings WHERE EmployerID = ?", (employer_id,))
        else:
            cursor.execute("SELECT JobID, EmployerID, Title, Description, Skills, Scope, Salary FROM JobPostings")
        
        job_postings = cursor.fetchall()
        
        job_postings_list = []
        for job in job_postings:
            job_postings_list.append({
                'JobID': job[0],
                'EmployerID': job[1],
                'Title': job[2],
                'Description': job[3],
                'Skills': job[4].split(',') if job[4] else [],
                'Scope': job[5],
                'Salary': job[6]
            })
        
        cursor.close()
        return jsonify(job_postings_list), 200
    except Exception as e:
        print(f"Error fetching job postings: {e}")
        return jsonify({"message": "Internal Server Error"}), 500
    



################################### EMPLOYEE  ###############################

@app.route('/jobpostings', methods=['GET'])
def get_job_postings_employees():
    try:
        cursor = db.conn.cursor()
        cursor.execute("SELECT JobID, EmployerID, Title, Description, Skills, Scope, Salary FROM JobPostings")
        job_postings = cursor.fetchall()
        job_postings_list = [
            {
                'JobID': job[0],
                'EmployerID': job[1],
                'Title': job[2],
                'Description': job[3],
                'Skills': job[4].split(',') if job[4] else [],
                'Scope': job[5],
                'Salary': job[6]
            } for job in job_postings
        ]
        cursor.close()
        return jsonify(job_postings_list), 200
    except Exception as e:
        print(f"Error fetching job postings: {e}")
        return jsonify({"message": "Internal Server Error"}), 500



################################## RESUME ######################

def generate_sas_token(blob_name):
    sas_token = generate_blob_sas(
        account_name="skillsync",
        container_name=container_name,
        blob_name=blob_name,
        account_key="ojDU6hUV5lnMwFeomFd15yCQLTdfAy4mNYjAHdnFSLkXsAxdWICeq74FLhabq5byM5VZ6sHntbMm+AStDr/d0g==",
        permission=BlobSasPermissions(read=True),
        expiry=datetime.utcnow() + timedelta(hours=1)
    )
    return sas_token

@app.route('/upload_resume', methods=['POST'])
def upload_resume():
    try:
        file = request.files['resume']
        user_id = request.form['user_id']

        if file:
            print(f"Received file: {file.filename}")
            # Generate a unique filename
            blob_name = str(uuid.uuid4()) + "-" + file.filename
            blob_client = blob_service_client.get_blob_client(container=container_name, blob=blob_name)
            blob_client.upload_blob(file)
            print(f"Uploaded file to blob storage: {blob_client.url}")

            # Store the blob name in the database
            cursor = db.conn.cursor()
            cursor.execute("UPDATE employees SET ResumeURL = ? WHERE EmployeeID = ?", (blob_name, user_id))
            db.conn.commit()
            cursor.close()

            return jsonify({"message": "Resume uploaded successfully", "blob_name": blob_name}), 200
        else:
            print("No file provided")
            return jsonify({"message": "No file provided"}), 400
    except Exception as e:
        print(f"Error uploading resume: {e}")
        return jsonify({"message": "Internal Server Error"}), 500

@app.route('/get_resume_url', methods=['GET'])
def get_resume_url():
    try:
        user_id = request.args.get('user_id')
        cursor = db.conn.cursor()
        cursor.execute("SELECT ResumeURL FROM employees WHERE EmployeeID = ?", (user_id,))
        result = cursor.fetchone()
        cursor.close()

        if result and result[0]:
            blob_name = result[0]
            sas_token = generate_sas_token(blob_name)
            resume_url = f"https://skillsync.blob.core.windows.net/{container_name}/{blob_name}?{sas_token}"
            return jsonify({"resume_url": resume_url}), 200
        else:
            return jsonify({"resume_url": None}), 200
    except Exception as e:
        print(f"Error fetching resume URL: {e}")
        return jsonify({"message": "Internal Server Error"}), 500

# @app.route('/extract_resume_data', methods=['POST'])
# def extract_resume_data():
#     try:
#         data = request.json
#         file_uri = data.get('uri')
        
#         if not file_uri:
#             return jsonify({"message": "File URI not provided"}), 400
        
#         # Download the file from the given URI
#         response = requests.get(file_uri)
#         file_content = response.content

#         # Extract text from PDF
#         pdf_reader = PyPDF2.PdfFileReader(io.BytesIO(file_content))
#         num_pages = pdf_reader.getNumPages()
#         text = ''
#         for i in range(num_pages):
#             text += pdf_reader.getPage(i).extract_text()

#         # Process the text with spaCy
#         doc = nlp(text)

#         # Extract entities using spaCy
#         name = ''
#         email = ''
#         phone = ''
#         address = ''
#         current_job_title = ''
#         skills = []
#         experience = ''

#         for ent in doc.ents:
#             if ent.label_ == "PERSON":
#                 name = ent.text
#             elif ent.label_ == "ORG" and not current_job_title:
#                 current_job_title = ent.text
#             elif ent.label_ == "GPE" and not address:
#                 address = ent.text
#             elif ent.label_ == "EMAIL":
#                 email = ent.text
#             elif ent.label_ == "PHONE":
#                 phone = ent.text

#         # Extract skills and experience manually (since they are not standard entities)
#         skills = re.findall(r'\bSkills: (.*?)\b', text, re.IGNORECASE)
#         experience = re.findall(r'\bExperience: (.*?)\b', text, re.IGNORECASE)

#         extracted_data = {
#             "name": name,
#             "email": email,
#             "phone": phone,
#             "address": address,
#             "currentJobTitle": current_job_title,
#             "skills": skills[0] if skills else '',
#             "experience": experience[0] if experience else ''
#         }
        
#         print(f"Extracted resume data: {extracted_data}")
        
#         return jsonify(extracted_data), 200
#     except Exception as e:
#         print(f"Error extracting resume data: {e}")
#         return jsonify({"message": "Internal Server Error"}), 500

@app.route('/update_employee_settings', methods=['POST'])
def update_employee_settings():
    try:
        data = request.json
        employee_id = data.get('employeeId')
        name = data.get('name')
        email = data.get('email')
        phone = data.get('phone')
        address = data.get('address')
        current_job_title = data.get('currentJobTitle')
        skills = data.get('skills')
        experience = data.get('experience')

        cursor = db.conn.cursor()
        cursor.execute("""
            UPDATE employees
            SET Name = ?, Email = ?, Phone = ?, Address = ?, CurrentJobTitle = ?, Skills = ?, Experience = ?
            WHERE EmployeeID = ?
        """, (name, email, phone, address, current_job_title, skills, experience, employee_id))
        db.conn.commit()
        cursor.close()

        return jsonify({"message": "Settings updated successfully"}), 200
    except Exception as e:
        print(f"Error updating settings: {e}")
        return jsonify({"message": "Internal Server Error"}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)