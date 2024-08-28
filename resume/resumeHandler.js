const express = require('express');
const { BlobServiceClient } = require('@azure/storage-blob');
const multer = require('multer');
const path = require('path');
const sql = require('mssql'); // Ensure this is configured correctly based on your database setup

const app = express();
const upload = multer({ dest: 'uploads/' }); // Set destination for file uploads

const AZURE_STORAGE_CONNECTION_STRING = 'DefaultEndpointsProtocol=https;AccountName=skillsync;AccountKey=ojDU6hUV5lnMwFeomFd15yCQLTdfAy4mNYjAHdnFSLkXsAxdWICeq74FLhabq5byM5VZ6sHntbMm+AStDr/d0g==;EndpointSuffix=core.windows.net';

// Upload Resume Endpoint
app.post('/upload-resume', upload.single('resume'), async (req, res) => {
  const file = req.file;
  const employeeId = req.body.employeeId;

  if (!file || !employeeId) {
    return res.status(400).json({ error: 'File and employeeId are required' });
  }

  const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
  const containerClient = blobServiceClient.getContainerClient('resumes');
  const blobName = path.basename(file.path);
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  try {
    // Upload the file to Azure Blob Storage
    await blockBlobClient.uploadFile(file.path);
    const resumeUrl = blockBlobClient.url;

    // Connect to SQL database
    await sql.connect('your-database-connection-string');
    
    // Update the employee record with resume URL
    const query = `UPDATE employees SET resume_url = @resumeUrl WHERE id = @employeeId`;
    const request = new sql.Request();
    request.input('resumeUrl', sql.VarChar, resumeUrl);
    request.input('employeeId', sql.Int, employeeId);
    await request.query(query);

    // Respond with success message and resume URL
    res.status(200).json({ message: 'Resume uploaded successfully', resumeUrl });
  } catch (err) {
    console.error('Error uploading resume:', err.message || err);

    // Check if the error is related to SQL connection or query
    if (err instanceof sql.ConnectionError || err instanceof sql.RequestError) {
      res.status(500).json({ error: 'Database error: Failed to update employee record' });
    } else {
      res.status(500).json({ error: 'Failed to upload resume' });
    }
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
