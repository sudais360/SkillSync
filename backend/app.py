from flask import Flask, request, jsonify
from flask_cors import CORS
from database import Database

from azure.storage.blob import BlobServiceClient, generate_blob_sas, BlobSasPermissions
from datetime import datetime, timedelta
import uuid
import os
import pyodbc

from pyresparser import ResumeParser
import fitz  # PyMuPDF

# import PyPDF2
import re
import io
import requests
import datetime
import spacy
import logging
import traceback

import smtplib
from email.mime.text import MIMEText

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

API_BASE_URL =  'http://192.168.1.17:5000'; 

model_path = os.path.join(os.path.dirname(__file__), "custom_ner_model")
nlp = spacy.load(model_path)
print(f"Loaded model from {model_path}")
app = Flask(__name__)
CORS(app)

db = Database(server="skillsync12345.database.windows.net",
              database="SkillSyn",
              username="skillsync",
              password="Sudais22!")
try:
    db.connect()
except Exception as e:
    logging.error(f"Error connecting to the database: {e}")


logging.basicConfig(level=logging.INFO)

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
    employer_id = request.args.get('employer_id')
    try:
        cursor = db.conn.cursor()
        cursor.execute("""
            SELECT jp.JobID, jp.EmployerID, jp.Title, jp.Description, jp.SkillsRequired, jp.Scope, jp.Salary, jp.Location, e.CompanyName 
            FROM JobPostings jp
            JOIN Employers e ON jp.EmployerID = e.EmployerID
            WHERE jp.EmployerID = ?
        """, (employer_id,))
        job_postings = cursor.fetchall()
        job_postings_list = [
            {
                'JobID': job[0],
                'EmployerID': job[1],
                'Title': job[2],
                'Description': job[3],
                'SkillsRequired': job[4],
                'Scope': job[5],
                'Salary': job[6],
                'Location': job[7],
                'CompanyName': job[8]
            } for job in job_postings
        ]
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
            SELECT jp.JobID, jp.EmployerID, jp.Title, jp.Description, jp.SkillsRequired, jp.Scope, jp.Salary, jp.Location, e.CompanyName
            FROM JobPostings jp
            JOIN Employers e ON jp.EmployerID = e.EmployerID
        """)
        job_postings = cursor.fetchall()
        job_postings_list = [
            {
                'JobID': job[0],
                'EmployerID': job[1],
                'Title': job[2],
                'Description': job[3],
                'SkillsRequired': job[4] if job[4] else '',  # Ensure SkillsRequired is a string
                'Scope': job[5],
                'Salary': job[6],
                'Location': job[7],
                'CompanyName': job[8]
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
        print('Received data:', data)  # Add this print to check received data
        user_id = data.get('user_id')
        name = data.get('name')
        email = data.get('email')
        phone = data.get('phone')
        address = data.get('address')
        current_job_title = data.get('currentJobTitle')
        skills = data.get('skills')
        experience = data.get('experience')
        location = data.get('location')
        
        print('Location:', location)  # Add this print to check location value

        cursor = db.conn.cursor()
        cursor.execute("""
            UPDATE employees
            SET Name = ?, Email = ?, Phone = ?, Address = ?, CurrentJobTitle = ?, Skills = ?, Experience = ?, Location = ?
            WHERE EmployeeID = ?
        """, (name, email, phone, address, current_job_title, skills, experience, location, user_id))
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
        cursor.execute("SELECT Name, Email, Phone, Address, CurrentJobTitle, Skills, Experience, Location FROM employees WHERE EmployeeID = ?", (user_id,))
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
                "experience": result[6],
                "location": result[7]
            }
            print('Fetched employee data:', employee_data)  # Ensure this prints correctly
            return jsonify(employee_data), 200
        else:
            return jsonify({"message": "Employee not found"}), 404
    except Exception as e:
        print(f"Error fetching employee data: {e}")
        return jsonify({"message": "Internal Server Error"}), 500



    
 ################################## apply_for_job ######################   
from datetime import datetime

@app.route('/apply', methods=['POST'])
def apply_for_job():
    try:
        # Fetch JSON data from request
        data = request.json
        employee_id = data.get('applicant_id')
        job_id = data.get('job_id')
        application_date = data.get('application_date')  # Try to get application date from request

        # If application_date is not provided, set it to the current date and time
        if not application_date:
            application_date = datetime.now()
        else:
            application_date = datetime.fromisoformat(application_date)

        # Debugging log statements
        print(f"Received data: {data}")
        print(f"Employee ID: {employee_id}, Job ID: {job_id}, Application Date: {application_date}")

        if not all([employee_id, job_id]):
            return jsonify({"message": "Missing required fields."}), 400

        # Database insertion
        cursor = db.conn.cursor()
        # Inside apply_for_job function
        cursor.execute("""
            INSERT INTO Applications (EmployeeID, JobID, ApplicationDate, Status)
            VALUES (?, ?, ?, ?)
        """, (employee_id, job_id, application_date, "applied"))
        db.conn.commit()

        cursor.close()

        return jsonify({"message": "Application successful"}), 201

    except Exception as e:
        print(f"Error applying for job: {e}")  # Log the error for debugging
        return jsonify({"message": "Internal Server Error", "error": str(e)}), 500


 ################################## update_applicant_status ######################   

@app.route('/applicants/<int:applicant_id>/status', methods=['PUT'])
def update_applicant_status(applicant_id):
    try:
        status = request.json.get('status')
        if status not in ['Accepted', 'Rejected']:
            return jsonify({"message": "Invalid status"}), 400

        # Example database update (ensure this matches your actual database schema)
        cursor = db.conn.cursor()
        cursor.execute("""
            UPDATE Applications SET Status = ? WHERE ApplicationID = ?
        """, (status, applicant_id))
        db.conn.commit()
        cursor.close()

        # Send notification email to the applicant
        send_notification_email(applicant_id, status)

        return jsonify({"message": "Status updated successfully"}), 200

    except Exception as e:
        print(f"Error updating applicant status: {e}")
        return jsonify({"message": "Internal Server Error", "error": str(e)}), 500

def send_notification_email(applicant_id, status):
    # Example email sending logic (customize with your email configuration)
    cursor = db.conn.cursor()
    cursor.execute("SELECT Email, SkillsRequired FROM Applications WHERE ApplicationID = ?", (applicant_id,))
    applicant_data = cursor.fetchone()
    cursor.close()

    email_address = applicant_data[0]
    skills_required = applicant_data[1]

    if status == 'Accepted':
        subject = "Congratulations! You've been accepted"
        body = "We are pleased to inform you that you have been accepted for the job."
    else:
        missing_skills = "Example missing skills"  # Replace with actual logic to determine missing skills
        subject = "Application Status: Rejected"
        body = f"Unfortunately, your application was not successful. You are missing the following skills: {missing_skills}."

    send_email(email_address, subject, body)

def send_email(to_address, subject, body):
    # Configure your SMTP server and credentials
    smtp_server = "smtp.example.com"
    smtp_port = 587
    smtp_username = "your-email@example.com"
    smtp_password = "your-email-password"

    msg = MIMEText(body)
    msg['Subject'] = subject
    msg['From'] = smtp_username
    msg['To'] = to_address

    try:
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(smtp_username, smtp_password)
            server.sendmail(smtp_username, to_address, msg.as_string())
        print("Email sent successfully!")
    except Exception as e:
        print(f"Error sending email: {e}")   


 ################################## applied_jobs ######################   
@app.route('/applied_jobs', methods=['GET'])
def get_applied_jobs():
    try:
        employee_id = request.args.get('employee_id')
        cursor = db.conn.cursor()
        cursor.execute("""
            SELECT jp.JobID, jp.Title, e.CompanyName as CompanyName, a.Status
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


################################### Utility Functions  ###############################


def fetch_all_employees():
    cursor = db.conn.cursor()
    cursor.execute("SELECT EmployeeID, Name, Skills, Address FROM employees")
    employees = cursor.fetchall()
    cursor.close()
    return [{'EmployeeID': row.EmployeeID, 'Name': row.Name, 'Skills': row.Skills, 'Address': row.Address} for row in employees]

def fetch_all_job_postings():
    cursor = db.conn.cursor()
    cursor.execute("SELECT JobID, Title, SkillsRequired, Location, EmployerID FROM JobPostings")
    job_postings = cursor.fetchall()
    cursor.close()
    return [{'JobID': row.JobID, 'Title': row.Title, 'SkillsRequired': row.SkillsRequired, 'Location': row.Location, 'EmployerID': row.EmployerID} for row in job_postings]

def has_matching_skills(employee_skills, job_skills):
    employee_skills_set = set(map(str.strip, employee_skills.split(',')))
    job_skills_set = set(map(str.strip, job_skills.split(',')))
    return bool(employee_skills_set.intersection(job_skills_set))

def save_search_strategies(employee_strategies, employer_strategies):
    cursor = db.conn.cursor()
    employee_insert_query = """
    INSERT INTO SearchStrategies (UserID, JobTitle, Skills, Location, GeneratedAt)
    VALUES (?, ?, ?, ?, ?)
    """
    for strategy in employee_strategies:
        cursor.execute(employee_insert_query, (strategy['UserID'], strategy['JobTitle'], strategy['Skills'], strategy['Location'], strategy['GeneratedAt']))
    
    employer_insert_query = """
    INSERT INTO SearchStrategies (UserID, JobTitle, Skills, Location, GeneratedAt)
    VALUES (?, ?, ?, ?, ?)
    """
    for strategy in employer_strategies:
        cursor.execute(employer_insert_query, (strategy['UserID'], strategy['JobTitle'], strategy['Skills'], strategy['Location'], strategy['GeneratedAt']))
    
    db.conn.commit()
    cursor.close()


################################### Generate Search Strategies  ###############################

@app.route('/generate_search_strategies', methods=['POST'])
def generate_search_strategies():
    try:
        employees = fetch_all_employees()
        job_postings = fetch_all_job_postings()
        
        employee_search_strategies = []
        employer_search_strategies = []
        
        for employee in employees:
            matched_jobs = []
            for job in job_postings:
                if has_matching_skills(employee['Skills'], job['SkillsRequired']):
                    matched_jobs.append(job)
            employee_search_strategies.append({
                'UserID': employee['EmployeeID'],
                'JobTitle': ', '.join([job['Title'] for job in matched_jobs]),
                'Skills': employee['Skills'],
                'Location': employee['Address'],
                'GeneratedAt': datetime.datetime.now()
            })
        
        for job in job_postings:
            matched_employees = []
            for employee in employees:
                if has_matching_skills(employee['Skills'], job['SkillsRequired']):
                    matched_employees.append(employee)
            employer_search_strategies.append({
                'UserID': job['EmployerID'],
                'JobTitle': job['Title'],
                'Skills': job['SkillsRequired'],
                'Location': job['Location'],
                'GeneratedAt': datetime.datetime.now()
            })
        
        save_search_strategies(employee_search_strategies, employer_search_strategies)
        
        return jsonify({"message": "Search strategies generated successfully"}), 201
    except Exception as e:
        print(f"Error generating search strategies: {e}")
        return jsonify({"message": "Internal Server Error"}), 500


################################### Suggets Jobs  ###############################
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
import datetime
import spacy
import logging

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

model_path = os.path.join(os.path.dirname(__file__), "custom_ner_model")
nlp = spacy.load(model_path)
print(f"Loaded model from {model_path}")
app = Flask(__name__)
CORS(app)

db = Database(server="skillsync12345.database.windows.net",
              database="SkillSyn",
              username="skillsync",
              password="Sudais22!")
try:
    db.connect()
except Exception as e:
    logging.error(f"Error connecting to the database: {e}")


logging.basicConfig(level=logging.INFO)

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
            SELECT jp.JobID, jp.EmployerID, jp.Title, jp.Description, jp.SkillsRequired, jp.Scope, jp.Salary, jp.Location, e.CompanyName
            FROM JobPostings jp
            JOIN Employers e ON jp.EmployerID = e.EmployerID
        """)
        job_postings = cursor.fetchall()
        job_postings_list = [
            {
                'JobID': job[0],
                'EmployerID': job[1],
                'Title': job[2],
                'Description': job[3],
                'SkillsRequired': job[4] if job[4] else '',  # Ensure SkillsRequired is a string
                'Scope': job[5],
                'Salary': job[6],
                'Location': job[7] if job[7] else 'Location Not Provided',  # Ensure Location is handled
                'CompanyName': job[8]
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
        # Get JSON data from the request
        data = request.json
        employee_id = data.get('applicant_id')
        job_id = data.get('job_id')
        application_date = data.get('application_date')  # Fetch application date from request

        # Debugging logs
        print(f"Received data: {data}")
        print(f"Employee ID: {employee_id}, Job ID: {job_id}, Application Date (string): {application_date}")

        # Convert the application_date from string to datetime object
        if application_date:
            try:
                # This conversion assumes the ISO string format sent by the frontend
                application_date = datetime.fromisoformat(application_date.replace("Z", "+00:00")) 
                print(f"Converted Application Date (datetime): {application_date}")
            except ValueError:
                return jsonify({"message": "Invalid date format."}), 400
        else:
            application_date = datetime.now()  # Default to current date if not provided
            print(f"Default Application Date (datetime): {application_date}")

        # Check if required fields are present
        if not all([employee_id, job_id]):
            return jsonify({"message": "Missing required fields."}), 400

        # Check if an application already exists for this employee and job
        cursor = db.conn.cursor()
        cursor.execute("""
            SELECT ApplicationID FROM Applications 
            WHERE EmployeeID = ? AND JobID = ?
        """, (employee_id, job_id))
        existing_application = cursor.fetchone()

        if existing_application:
            # If the application exists, update the application date and status
            cursor.execute("""
                UPDATE Applications 
                SET ApplicationDate = ?, Status = ? 
                WHERE ApplicationID = ?
            """, (application_date, "applied", existing_application[0]))
            print(f"Application updated for EmployeeID {employee_id} and JobID {job_id}")
        else:
            # Insert a new application record if it doesn't exist
            cursor.execute("""
                INSERT INTO Applications (EmployeeID, JobID, ApplicationDate, Status)
                VALUES (?, ?, ?, ?)
            """, (employee_id, job_id, application_date, "applied"))
            print(f"New application created for EmployeeID {employee_id} and JobID {job_id}")

        db.conn.commit()
        cursor.close()

        return jsonify({"message": "Application processed successfully"}), 201

    except Exception as e:
        print(f"Error applying for job: {e}")  # Log the error
        return jsonify({"message": "Internal Server Error", "error": str(e)}), 500





 ################################## applied_jobs ######################   
@app.route('/applied_jobs', methods=['GET'])
def get_applied_jobs():
    try:
        employee_id = request.args.get('employee_id')
        cursor = db.conn.cursor()
        cursor.execute("""
            SELECT jp.JobID, jp.Title, e.CompanyName as CompanyName, a.Status
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


################################### update_keyword_frequency  ###############################
# Global error handler to log and return detailed errors
# @app.errorhandler(Exception)
# def handle_exception(e):
#     if isinstance(e, HTTPException):
#         return e
#     logging.error(f"An error occurred: {e}")
#     logging.error(traceback.format_exc())
#     return jsonify({"message": "Internal Server Error", "error": str(e)}), 500

# Helper function to normalize skills
def normalize_skills(skills):
    normalized = [skill.strip().lower() for skill in skills.split(',')]
    logging.info(f"Normalized skills: {normalized}")
    return normalized

# Helper function to check and reconnect the database
def check_and_reconnect_db():
    if db.conn:
        try:
            db.conn.close()
        except Exception as e:
            logging.error(f"Error closing the existing database connection: {e}")
    
    try:
        db.connect()
    except Exception as e:
        logging.error(f"Error reconnecting to the database: {e}")
        raise

##################################################Employees ---  suggest_jobs #################################################

@app.route('/suggest_jobs', methods=['POST'])
def suggest_jobs():
    try:
        data = request.json
        user_id = data.get('user_id')
        preferred_job_title = data.get('preferred_job_title', '')

        if not user_id:
            logging.error("User ID not provided")
            return jsonify({"message": "User ID not provided"}), 400

        # Fetch employee skills
        employee = db.execute_query("SELECT Skills FROM employees WHERE EmployeeID = ?", (user_id,))
        if not employee:
            logging.error(f"Employee not found for User ID: {user_id}")
            return jsonify({"message": "Employee not found"}), 404

        employee_skills = normalize_skills(employee[0][0])
        logging.info(f"Fetched and normalized skills for User ID {user_id}: {employee_skills}")

        # Fetch job postings with company names
        job_postings_query = """
            SELECT jp.JobID, jp.Title, jp.SkillsRequired, jp.Description, jp.EmployerID, jp.Salary, jp.Location, e.CompanyName
            FROM JobPostings jp
            JOIN Employers e ON jp.EmployerID = e.EmployerID
        """
        job_postings = db.execute_query(job_postings_query)
        if not job_postings:
            logging.error("No job postings found")
            return jsonify({"message": "No job postings found"}), 404

        job_suggestions = []

        for job in job_postings:
            job_id, title, skills_required, description, employer_id, salary, location, company_name = job
            job_skills = normalize_skills(skills_required)

            matched_skills = set(employee_skills) & set(job_skills)
            total_required_skills = len(job_skills)

            if total_required_skills > 0:
                relevance_score = (len(matched_skills) / total_required_skills) * 100
            else:
                relevance_score = 0

            logging.info(f"Calculated relevance score: {relevance_score} for Job ID: {job_id}")

            if relevance_score > 0:  # Only include jobs with a non-zero relevance score
                job_suggestions.append({
                    'JobID': job_id,
                    'Title': title,
                    'SkillsRequired': ", ".join(job_skills),  # Return as comma-separated string
                    'Description': description,
                    'RelevanceScore': relevance_score,
                    'EmployerID': employer_id,
                    'Salary': salary,
                    'Location': location,
                    'CompanyName': company_name
                })

        job_suggestions = sorted(job_suggestions, key=lambda x: x['RelevanceScore'], reverse=True)[:5]

        logging.info(f"Generated job suggestions for User ID {user_id}: {job_suggestions}")
        return jsonify(job_suggestions), 200

    except Exception as e:
        logging.error(f"Error suggesting jobs: {e}", exc_info=True)
        return jsonify({"message": "Internal Server Error", "error": str(e)}), 500



##################################################Employees --- /update_keyword_frequency #################################################
@app.route('/update_keyword_frequency', methods=['POST'])
def update_keyword_frequency():
    try:
        data = request.json
        employee_id = data.get('employee_id')
        keyword = data.get('keyword')

        if not employee_id or not keyword:
            return jsonify({"message": "Employee ID and keyword are required"}), 400

        # Establish a new connection
        conn_str = f'DRIVER=ODBC Driver 17 for SQL Server;SERVER={db.server};DATABASE={db.database};UID={db.username};PWD={db.password};MARS_Connection=yes'
        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()

        # Get the KeywordID
        cursor.execute("SELECT KeywordID FROM Keywords WHERE Keyword = ?", (keyword,))
        keyword_data = cursor.fetchone()

        if keyword_data:
            keyword_id = keyword_data[0]
        else:
            # Insert new keyword if it does not exist
            cursor.execute("INSERT INTO Keywords (Keyword) VALUES (?)", (keyword,))
            conn.commit()
            cursor.execute("SELECT KeywordID FROM Keywords WHERE Keyword = ?", (keyword,))
            keyword_id = cursor.fetchone()[0]

        # Check if the user has already interacted with this keyword
        cursor.execute("SELECT Frequency FROM UserKeywords WHERE EmployeeID = ? AND KeywordID = ?", (employee_id, keyword_id))
        user_keyword_data = cursor.fetchone()

        if user_keyword_data:
            # Update frequency
            new_frequency = user_keyword_data[0] + 1
            cursor.execute("UPDATE UserKeywords SET Frequency = ? WHERE EmployeeID = ? AND KeywordID = ?", (new_frequency, employee_id, keyword_id))
        else:
            # Insert new record
            cursor.execute("INSERT INTO UserKeywords (EmployeeID, KeywordID, Frequency) VALUES (?, ?, ?)", (employee_id, keyword_id, 1))

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"message": "Keyword frequency updated successfully"}), 200
    except Exception as e:
        logging.error(f"Error updating keyword frequency: {e}", exc_info=True)
        return jsonify({"message": "Internal Server Error", "error": str(e)}), 500


##################################################Employers ---  suggest_employees #################################################

def normalize_skills_list(skills):
    if isinstance(skills, list):
        return [skill.strip().lower() for skill in skills]
    return [skill.strip().lower() for skill in skills.split(',')]


@app.route('/suggest_employees', methods=['POST'])
def suggest_employees():
    try:
        data = request.json
        employer_id = data.get('employer_id')
        job_id = data.get('job_id')
        job_title = data.get('job_title')
        job_skills = data.get('job_skills')

        if not all([employer_id, job_id, job_title, job_skills]):
            logging.error("Missing required fields")
            return jsonify({"message": "Missing required fields: employer_id, job_id, job_title, job_skills"}), 400

        job_skills = normalize_skills_list(job_skills)  # Normalize skills using the new function
        logging.info(f"Normalized job skills: {job_skills}")

        # Fetch employees
        employees = db.execute_query("SELECT EmployeeID, Skills, Name, Email, Phone, Location, Experience FROM employees")
        if not employees:
            logging.error("No employees found")
            return jsonify({"message": "No employees found"}), 404

        suggested_employees = []

        for employee in employees:
            employee_id, skills, name, email, phone, location, experience = employee
            employee_skills = normalize_skills(skills)
            job_skills_text = " ".join(job_skills)
            employee_skills_text = " ".join(employee_skills)

            logging.info(f"Comparing job skills: {job_skills_text} with employee skills: {employee_skills_text}")

            vectorizer = TfidfVectorizer().fit_transform([job_skills_text, employee_skills_text])
            vectors = vectorizer.toarray()
            cosine_sim = cosine_similarity(vectors)

            score = cosine_sim[0][1] * 100  # Convert to percentage

            logging.info(f"Calculated relevance score: {score} for Employee ID: {employee_id}")

            if score > 0:  # Only include employees with a non-zero relevance score
                suggested_employees.append({
                    'EmployeeID': employee_id,
                    'Name': name,
                    'Email': email,
                    'Phone': phone,
                    'Location': location,
                    'Skills': skills,
                    'Experience': experience,
                    'RelevanceScore': score
                })

        suggested_employees = sorted(suggested_employees, key=lambda x: x['RelevanceScore'], reverse=True)[:5]

        logging.info(f"Generated employee suggestions for Job ID {job_id}: {suggested_employees}")
        return jsonify(suggested_employees), 200

    except Exception as e:
        logging.error(f"Error suggesting employees: {e}", exc_info=True)
        return jsonify({"message": "Internal Server Error", "error": str(e)}), 500
    


##################################################update_employer_settings #################################################
@app.route('/get_employer_data', methods=['GET'])
def get_employer_data():
    try:
        employer_id = request.args.get('employer_id')
        cursor = db.conn.cursor()
        cursor.execute("SELECT Name, Email, Phone, CompanyName, CompanyAddress FROM employers WHERE EmployerID = ?", (employer_id,))
        employer = cursor.fetchone()
        cursor.close()
        
        if employer:
            return jsonify({
                "name": employer[0],
                "email": employer[1],
                "phone": employer[2],
                "companyName": employer[3],
                "companyAddress": employer[4]
            }), 200
        else:
            return jsonify({"message": "Employer not found"}), 404
    except Exception as e:
        print(f"Error fetching employer data: {e}")
        return jsonify({"message": "Internal Server Error"}), 500
    ##################################################update_employer_settings #################################################
@app.route('/update_employer_settings', methods=['POST'])
def update_employer_settings():
    try:
        data = request.json
        employer_id = data.get('employer_id')
        name = data.get('name')
        email = data.get('email')
        phone = data.get('phone')
        company_name = data.get('companyName')
        company_address = data.get('companyAddress')

        cursor = db.conn.cursor()
        cursor.execute("""
            UPDATE employers
            SET Name = ?, Email = ?, Phone = ?, CompanyName = ?, CompanyAddress = ?
            WHERE EmployerID = ?
        """, (name, email, phone, company_name, company_address, employer_id))
        db.conn.commit()
        cursor.close()

        return jsonify({"message": "Employer settings updated successfully"}), 200
    except Exception as e:
        print(f"Error updating employer settings: {e}")
        return jsonify({"message": "Internal Server Error"}), 500
    
    ##################################################ugenerate_shareable_url' #################################################
@app.route('/generate_shareable_url', methods=['POST'])
def generate_shareable_url():
    try:
        data = request.json
        job_id = data.get('job_id')
        employee_id = data.get('employee_id')

        if not job_id or not employee_id:
            return jsonify({"message": "Job ID and Employee ID are required"}), 400

        # Create a shareable URL
        shareable_url = f"http://http://192.168.68.107:5000/shared_job?job_id={job_id}&employee_id={employee_id}"
        
        return jsonify({"shareable_url": shareable_url}), 200
    except Exception as e:
        print(f"Error generating shareable URL: {e}")
        return jsonify({"message": "Internal Server Error"}), 500


#################################################################################################
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)