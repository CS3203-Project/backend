import { S3Client, PutObjectCommand, DeleteObjectCommand, ServerSideEncryption } from '@aws-sdk/client-s3';
import multer from 'multer';
import { Request, Response, NextFunction } from 'express';
import path from 'path';

// Configure AWS S3 Client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// Helper function to sanitize filename
const sanitizeFilename = (filename: string): string => {
  // Get file extension
  const ext = path.extname(filename);
  const name = path.basename(filename, ext);
  
  // Sanitize the name: replace spaces with hyphens, remove special characters
  const sanitizedName = name
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/[^a-zA-Z0-9.-]/g, '') // Remove special characters except dots and hyphens
    .toLowerCase()
    .substring(0, 50); // Limit length to 50 characters
  
  return sanitizedName + ext.toLowerCase();
};

// Configure multer for memory storage
const storage = multer.memoryStorage();

// Custom error handling for multer
const handleMulterError = (error: any) => {
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return new Error('File size too large. Maximum allowed size is 5MB');
      case 'LIMIT_FILE_COUNT':
        return new Error('Too many files. Maximum 5 files allowed');
      case 'LIMIT_UNEXPECTED_FILE':
        return new Error('Unexpected field name for file upload');
      default:
        return new Error(`Upload error: ${error.message}`);
    }
  }
  return error;
};

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 5, // Maximum 5 files
  },
  fileFilter: (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Check if file is an image
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed. Supported formats: JPEG, PNG, GIF, WebP'));
    }
  },
});

// Middleware wrapper to handle multer errors gracefully
export const handleUploadError = (uploadMiddleware: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    uploadMiddleware(req, res, (error: any) => {
      if (error) {
        const handledError = handleMulterError(error);
        return res.status(400).json({
          success: false,
          message: handledError.message,
          error: 'FILE_UPLOAD_ERROR'
        });
      }
      next();
    });
  };
};

// Upload file to S3
export const uploadToS3 = async (
  file: Express.Multer.File,
  folder: string = 'profile-images'
): Promise<string> => {
  try {
    // Sanitize filename
    const sanitizedFileName = sanitizeFilename(file.originalname);
    
    // Create unique key with timestamp and random string
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const key = `${folder}/${timestamp}-${randomString}-${sanitizedFileName}`;

    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ServerSideEncryption: ServerSideEncryption.AES256, // Add server-side encryption
    };

    const command = new PutObjectCommand(params);
    await s3Client.send(command);
    
    // Return the S3 URL
    return `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Delete file from S3
export const deleteFromS3 = async (imageUrl: string): Promise<void> => {
  try {
    // Extract key from URL
    const url = new URL(imageUrl);
    let key = url.pathname.substring(1); // Remove leading slash
    
    // Decode URL-encoded characters in the key
    key = decodeURIComponent(key);

    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: key,
    };

    const command = new DeleteObjectCommand(params);
    await s3Client.send(command);
  } catch (error) {
    console.error('Error deleting from S3:', error);
    // Don't throw error for delete failures to avoid breaking the update operation
  }
};
