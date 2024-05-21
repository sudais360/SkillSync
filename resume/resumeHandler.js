const express = require('express');
const { BlobServiceClient } = require('@azure/storage-blob');
const multer = require('multer');
const path = require('path');
const sql = require('mssql'); // Adjust based on your database

const app = express();
const upload = multer({ dest: 'uploads/' });
const AZURE_STORAGE_CONNECTION_STRING = 'DefaultEndpointsProtocol=https;AccountName=skillsync;AccountKey=ojDU6hUV5lnMwFeomFd15yCQLTdfAy4mNYjAHdnFSLkXsAxdWICeq74FLhabq5byM5VZ6sHntbMm+AStDr/d0g==;EndpointSuffix=core.windows.net';

// Upload Resume Endpoint
app.post('/upload-resume', upload.single('resume'), async (req, res) => {
  const file = req.file;
  const employeeId = req.body.employeeId;

  const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
  const containerClient = blobServiceClient.getContainerClient('resumes');
  const blobName = path.basename(file.path);
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  try {
    await blockBlobClient.uploadFile(file.path);
    const resumeUrl = blockBlobClient.url;

    // Update the employee record with resume URL
    await sql.connect('your-database-connection-string');
    const query = `UPDATE employees SET resume_url = @resumeUrl WHERE id = @employeeId`;
    const request = new sql.Request();
    request.input('resumeUrl', sql.VarChar, resumeUrl);
    request.input('employeeId', sql.Int, employeeId);
    await request.query(query);

    res.status(200).json({ message: 'Resume uploaded successfully', resumeUrl });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Failed to upload resume' });
  }
});
