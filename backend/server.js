const express = require('express');
const multer = require('multer');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Multer setup for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// AWS SDK v3 configuration
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const ddbClient = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

// Upload endpoint
app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileId = uuidv4();
    const s3Key = `${fileId}-${req.file.originalname}`;

    // Upload to S3
    const s3Params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: s3Key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
      ACL: 'public-read',
    };

    await s3Client.send(new PutObjectCommand(s3Params));
    const s3Url = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;

    // Save metadata to DynamoDB
    const dbParams = {
      TableName: process.env.AWS_DYNAMODB_TABLE,
      Item: {
        id: fileId,
        fileName: req.file.originalname,
        s3Url: s3Url,
        uploadedAt: new Date().toISOString(),
      },
    };

    await ddbDocClient.send(new PutCommand(dbParams));

    res.status(201).json({
      message: 'File uploaded successfully',
      fileId,
      s3Url,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'File upload failed' });
  }
});

// AWS_ACCESS_KEY_ID=AKIAT5SXCFYZLQ2QAMX4
// AWS_SECRET_ACCESS_KEY=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
// AWS_REGION=us-east-2
// S3_BUCKET=269691792946bucket
// PORT=3000
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});