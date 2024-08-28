const { BlobServiceClient } = require('@azure/storage-blob'); // Import Azure Blob Service Client
const fs = require('fs'); // Import file system module for reading files
const path = require('path'); // Import path module for file path operations

// Azure storage connection string
const AZURE_STORAGE_CONNECTION_STRING = 'DefaultEndpointsProtocol=https;AccountName=skillsync;AccountKey=...;EndpointSuffix=core.windows.net';

// Function to upload a file to Azure Blob Storage
async function uploadFileToBlob(containerName, filePath) {
  try {
    // Create a BlobServiceClient object using the connection string
    const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);

    // Get a reference to a container
    const containerClient = blobServiceClient.getContainerClient(containerName);

    // Get the base name of the file from the file path
    const blobName = path.basename(filePath);

    // Get a reference to a block blob client for the file
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    // Read the file content into a buffer
    const data = fs.readFileSync(filePath);

    // Upload the file content to the blob
    const uploadBlobResponse = await blockBlobClient.upload(data, data.length);

    // Log a success message with the request ID
    console.log(`Blob "${blobName}" was uploaded successfully. RequestId: ${uploadBlobResponse.requestId}`);

    // Return the URL of the uploaded blob
    return blockBlobClient.url;
  } catch (error) {
    // Log an error message if something goes wrong
    console.error('Error uploading file:', error.message);
    throw error; // Rethrow the error to be handled by the caller
  }
}

// Example usage of the upload function
const containerName = 'resumes'; // The container to upload the file to
const filePath = 'path-to-your-pdf-file.pdf'; // Provide the path to your PDF file

// Call the upload function and handle the promise
uploadFileToBlob(containerName, filePath)
  .then(blobUrl => console.log('Resume uploaded successfully. URL:', blobUrl))
  .catch(error => console.error('Failed to upload resume:', error.message));
