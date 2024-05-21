const { BlobServiceClient } = require('@azure/storage-blob');
const fs = require('fs');
const path = require('path');

const AZURE_STORAGE_CONNECTION_STRING = 'DefaultEndpointsProtocol=https;AccountName=skillsync;AccountKey=ojDU6hUV5lnMwFeomFd15yCQLTdfAy4mNYjAHdnFSLkXsAxdWICeq74FLhabq5byM5VZ6sHntbMm+AStDr/d0g==;EndpointSuffix=core.windows.net';

async function uploadFileToBlob(containerName, filePath) {
  try {
    // Create a BlobServiceClient object using the connection string
    const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);

    // Get a reference to a container
    const containerClient = blobServiceClient.getContainerClient(containerName);

    // Get the base name of the file
    const blobName = path.basename(filePath);

    // Get a reference to a blob
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    // Read the file content
    const data = fs.readFileSync(filePath);

    // Upload the file content to the blob
    const uploadBlobResponse = await blockBlobClient.upload(data, data.length);

    // Log success message
    console.log(`Blob "${blobName}" was uploaded successfully. RequestId: ${uploadBlobResponse.requestId}`);

    // Return the URL of the uploaded blob
    return blockBlobClient.url;
  } catch (error) {
    // Log error message
    console.error('Error uploading file:', error.message);
    throw error;
  }
}

// Example usage
const containerName = 'resumes';
const filePath = 'path-to-your-pdf-file.pdf'; // Provide the path to your PDF file
uploadFileToBlob(containerName, filePath)
  .then(blobUrl => console.log('Resume uploaded successfully. URL:', blobUrl))
  .catch(error => console.error('Failed to upload resume:', error.message));
