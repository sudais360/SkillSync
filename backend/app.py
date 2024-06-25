from flask import Flask, request, jsonify
from flask_cors import CORS
from database import Database

from azure.storage.blob import BlobServiceClient, generate_blob_sas, BlobSasPermissions
from datetime import datetime, timedelta
import uuid
import os

from pyresparser import ResumeParser
import fitz  # PyMuPDF

# import PyPDF2
import re
import io
import requests

import spacy

model_path = os.path.join(os.path.dirname(__file__), "custom_ner_model")
nlp = spacy.load(model_path)
print(f"Loaded model from {model_path}")
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
account_name = "skillsync"
################################################# SIGNUP#################################################

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

################################### Jobposting  ########################################################
################################### Create Jobposting  #################
@app.route('/jobpostings', methods=['POST'])
def create_job_posting():
    try:
        data = request.json
        print(f"Received job posting data: {data}")
        
        employer_id = data.get('employer_id')  # Assuming you pass the employer's ID from the frontend
        title = data.get('position')  # Make sure the key names match those sent from the frontend
        description = data.get('expectations')  # Adjust the field names as needed
        skills = data.get('skills')
        scope = data.get('scope')
        salary = data.get('salary')

        # Ensure all required fields are provided
        if not all([employer_id, title, description, skills, scope, salary]):
            print("Missing required fields.")
            return jsonify({"message": "Missing required fields"}), 400

        cursor = db.conn.cursor()
        cursor.execute("INSERT INTO JobPostings (EmployerID, Title, Description, SkillsRequired, Scope, Salary) VALUES (?, ?, ?, ?, ?, ?)",
                       (employer_id, title, description, ','.join(skills), scope, salary))
        db.conn.commit()
        cursor.close()

        return jsonify({"message": "Job posting created successfully"}), 201
    except Exception as e:
        print(f"Error creating job posting: {e}")
        return jsonify({"message": "Internal Server Error"}), 500



################################### Update Jobposting  #################
@app.route('/jobpostings/<int:job_id>', methods=['PUT'])
def update_job_posting(job_id):
    try:
        data = request.json
        print(f"Received job update data for job ID {job_id}: {data}")
        
        title = data.get('position')
        description = data.get('expectations')
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
            SET Title = ?, Description = ?, SkillsRequired = ?, Scope = ?, Salary = ?
            WHERE JobID = ?
        """, (title, description, ','.join(skills), scope, salary, job_id))
        db.conn.commit()
        cursor.close()

        return jsonify({"message": "Job posting updated successfully"}), 200
    except Exception as e:
        print(f"Error updating job posting: {e}")
        return jsonify({"message": "Internal Server Error"}), 500

################################### Get Jobposting  #################

@app.route('/jobpostings', methods=['GET'])
def get_job_postings():
    try:
        employer_id = request.args.get('employer_id')
        cursor = db.conn.cursor()
        
        if employer_id:
            cursor.execute("SELECT JobID, EmployerID, Title, Description, SkillsRequired, Scope, Salary FROM JobPostings WHERE EmployerID = ?", (employer_id,))
        else:
            cursor.execute("SELECT JobID, EmployerID, Title, Description, SkillsRequired, Scope, Salary FROM JobPostings")
        
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

    
################################### get_applicants_for_job  ###############################
# Modify the existing get_applicants_for_job endpoint
@app.route('/job/<int:job_id>/applicants', methods=['GET'])
def get_applicants_for_job(job_id):
    try:
        cursor = db.conn.cursor()
        cursor.execute("""
            SELECT e.EmployeeID, e.Name, e.Email, e.Phone, e.CurrentJobTitle, e.Skills
            FROM Applications a
            JOIN employees e ON a.EmployeeID = e.EmployeeID
            WHERE a.JobID = ?
        """, (job_id,))
        applicants = cursor.fetchall()

        # Fetch job details
        cursor.execute("SELECT SkillsRequired FROM JobPostings WHERE JobID = ?", (job_id,))
        job_skills_result = cursor.fetchone()
        job_skills = job_skills_result[0].split(',') if job_skills_result and job_skills_result[0] else []

        applicants_list = []
        for applicant in applicants:
            applicant_skills = applicant[5].split(',') if applicant[5] else []
            score = calculate_skill_score(applicant_skills, job_skills)
            applicants_list.append({
                'id': applicant[0],
                'name': applicant[1],
                'email': applicant[2],
                'phone': applicant[3],
                'currentJobTitle': applicant[4],
                'skills': applicant_skills,
                'score': score
            })

        cursor.close()
        return jsonify(applicants_list), 200
    except Exception as e:
        print(f"Error fetching applicants for job: {e}")
        return jsonify({"message": "Internal Server Error"}), 500




################################### EMPLOYEE  ###############################
################################### get Job Postings  ###############################
@app.route('/employee_jobpostings', methods=['GET'])
def get_job_postings_employees():
    try:
        cursor = db.conn.cursor()
        cursor.execute("""
            SELECT jp.JobID, jp.EmployerID, jp.Title, jp.Description, jp.SkillsRequired, jp.Scope, jp.Salary, e.Name AS CompanyName
            FROM JobPostings jp
            JOIN employers e ON jp.EmployerID = e.EmployerID
        """)
        job_postings = cursor.fetchall()
        job_postings_list = [
            {
                'JobID': job[0],
                'EmployerID': job[1],
                'Title': job[2],
                'Description': job[3],
                'Skills': job[4].split(',') if job[4] else [],
                'Scope': job[5],
                'Salary': job[6],
                'CompanyName': job[7]
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

################################## Upload RESUME ######################

@app.route('/upload_resume', methods=['POST'])
def upload_resume():
    try:
        file = request.files['resume']
        user_id = request.form['user_id']

        if file:
            print(f"Received file: {file.filename}")
            pdf_data = file.read()

            # Store the PDF data in the database
            cursor = db.conn.cursor()
            cursor.execute("UPDATE employees SET ResumePDF = ? WHERE EmployeeID = ?", (pdf_data, user_id))
            db.conn.commit()
            cursor.close()

            return jsonify({"message": "Resume uploaded successfully"}), 200
        else:
            print("No file provided")
            return jsonify({"message": "No file provided"}), 400
    except Exception as e:
        print(f"Error uploading resume: {e}")
        return jsonify({"message": "Internal Server Error"}), 500


################################## generate the SAS token ######################
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
    
################################## Get RESUME ######################
# @app.route('/get_resume', methods=['GET'])
# def get_resume():
#     try:
#         user_id = request.args.get('user_id')
#         cursor = db.conn.cursor()
#         cursor.execute("SELECT ResumePDF FROM employees WHERE EmployeeID = ?", (user_id,))
#         result = cursor.fetchone()
#         cursor.close()

#         if result and result[0]:
#             resume_pdf = result[0]
#             response = make_response(resume_pdf)
#             response.headers.set('Content-Type', 'application/pdf')
#             response.headers.set('Content-Disposition', 'attachment', filename=f'resume_{user_id}.pdf')
#             return response
#         else:
#             return jsonify({"message": "No resume found for user"}), 404
#     except Exception as e:
#         print(f"Error fetching resume: {e}")
#         return jsonify({"message": "Internal Server Error"}), 500


    
################################## extract_resume_data ######################
@app.route('/extract_resume_data', methods=['POST'])
def extract_resume_data():
    try:
        data = request.json
        user_id = data.get('user_id')
        
        if not user_id:
            return jsonify({"message": "User ID not provided"}), 400
        
        cursor = db.conn.cursor()
        cursor.execute("SELECT ResumePDF FROM employees WHERE EmployeeID = ?", (user_id,))
        result = cursor.fetchone()
        cursor.close()
        
        if not result or not result[0]:
            return jsonify({"message": "No resume found for user"}), 404
        
        pdf_data = result[0]
        resume_path = f"/tmp/{uuid.uuid4()}.pdf"
        
        with open(resume_path, 'wb') as f:
            f.write(pdf_data)
        
        print(f"Resume downloaded to {resume_path}")
        
        with open(resume_path, 'rb') as f:
            print(f"File size: {os.path.getsize(resume_path)} bytes")
            print(f"First 20 bytes of file: {f.read(20)}")

        doc = fitz.open(resume_path)
        text = ""
        for page in doc:
            text += page.get_text()

        doc.close()
        os.remove(resume_path)

        print("Extracted Text:\n", text)

        parsed_data = parse_text_with_ner(text)
        
        print(f"Extracted resume data: {parsed_data}")
        return jsonify(parsed_data), 200
    except Exception as e:
        print(f"Error extracting resume data: {e}")
        return jsonify({"message": "Internal Server Error"}), 500

def parse_text_with_ner(text):
    doc = nlp(text)
    extracted_data = {
        "name": None,
        "email": None,
        "phone": None,
        "address": None,
        "skills": []
    }

    for ent in doc.ents:
        if ent.label_ == "NAME":
            extracted_data["name"] = ent.text
        elif ent.label_ == "PHONE":
            extracted_data["phone"] = ent.text
        elif ent.label_ == "SKILL":
            extracted_data["skills"].append(ent.text)

    # Use regex to extract email and address
    email_regex = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
    phone_regex = r'\+?\d[\d -]{8,}\d'
    address_regex = r'\d{1,5}\s+\w+(?:\s+\w+)*(?:\s(?:Street|St|Avenue|Ave|Boulevard|Blvd|Road|Rd|Lane|Ln|Drive|Dr|Court|Ct|Plaza|Plz|Square|Sq|Alley|Al|Parkway|Pkwy|Trail|Trl|Terrace|Ter|Place|Pl))?(?:,\s*\w+)*'

    emails = re.findall(email_regex, text)
    phones = re.findall(phone_regex, text)
    addresses = re.findall(address_regex, text)

    if emails:
        extracted_data["email"] = emails[0]
    if phones:
        extracted_data["phone"] = phones[0]
    if addresses:
        extracted_data["address"] = addresses[0]

    # Additional heuristic: look for "Address:" or "Location:" preceding the address
    address_context_regex = r'(Address|Location):\s*(.*)'
    address_context_match = re.search(address_context_regex, text)
    if address_context_match:
        extracted_data["address"] = address_context_match.group(2).strip()
    elif addresses:
        extracted_data["address"] = addresses[0]

    return extracted_data

################################## update_employee_settings ######################
    
@app.route('/update_employee_settings', methods=['POST'])
def update_employee_settings():
    try:
        data = request.json
        user_id = data.get('user_id')
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
        """, (name, email, phone, address, current_job_title, skills, experience, user_id))
        db.conn.commit()
        cursor.close()

        return jsonify({"message": "Employee settings updated successfully"}), 200
    except Exception as e:
        print(f"Error updating employee settings: {e}")
        return jsonify({"message": "Internal Server Error"}), 500

################################## get_employee_data ######################
@app.route('/get_employee_data', methods=['GET'])
def get_employee_data():
    try:
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({"message": "User ID not provided"}), 400

        cursor = db.conn.cursor()
        cursor.execute("SELECT Name, Email, Phone, Address, CurrentJobTitle, Skills, Experience FROM employees WHERE EmployeeID = ?", (user_id,))
        result = cursor.fetchone()
        cursor.close()
        
        if result:
            employee_data = {
                "name": result[0],
                "email": result[1],
                "phone": result[2],
                "address": result[3],
                "currentJobTitle": result[4],
                "skills": result[5],
                "experience": result[6]
            }
            return jsonify(employee_data), 200
        else:
            return jsonify({"message": "Employee not found"}), 404
    except Exception as e:
        print(f"Error fetching employee data: {e}")
        return jsonify({"message": "Internal Server Error"}), 500
    
 ################################## apply_for_job ######################   
@app.route('/apply', methods=['POST'])
def apply_for_job():
    try:
        data = request.json
        employee_id = data.get('applicant_id')  # Ensure the key matches the frontend
        job_id = data.get('job_id')
        application_date = datetime.now()  # Get the current date and time

        if not all([employee_id, job_id]):
            return jsonify({"message": "Missing required fields."}), 400

        cursor = db.conn.cursor()
        cursor.execute("""
            INSERT INTO Applications (EmployeeID, JobID, ApplicationDate, Status)
            VALUES (?, ?, ?, ?)
        """, (employee_id, job_id, application_date, "applied"))
        db.conn.commit()
        cursor.close()

        return jsonify({"message": "Application successful"}), 201
    except Exception as e:
        print(f"Error applying for job: {e}")
        return jsonify({"message": "Internal Server Error"}), 500

 ################################## applied_jobs ######################   
@app.route('/applied_jobs', methods=['GET'])
def get_applied_jobs():
    try:
        employee_id = request.args.get('employee_id')
        cursor = db.conn.cursor()
        cursor.execute("""
            SELECT jp.JobID, jp.Title, e.Name as CompanyName, a.Status
            FROM Applications a
            JOIN JobPostings jp ON a.JobID = jp.JobID
            JOIN employers e ON jp.EmployerID = e.EmployerID
            WHERE a.EmployeeID = ?
        """, (employee_id,))
        applied_jobs = cursor.fetchall()

        applied_jobs_list = [{
            'JobID': job[0],
            'Title': job[1],
            'CompanyName': job[2],
            'Status': job[3]
        } for job in applied_jobs]

        cursor.close()
        return jsonify(applied_jobs_list), 200
    except Exception as e:
        print(f"Error fetching applied jobs: {e}")
        return jsonify({"message": "Internal Server Error"}), 500




################################### Scoring Criteria  ###############################
################################### calculate_score  ###############################

def calculate_skill_score(applicant_skills, job_skills):
    if not job_skills:
        return 0

    match_count = len(set(applicant_skills) & set(job_skills))
    return (match_count / len(job_skills)) * 100



if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)