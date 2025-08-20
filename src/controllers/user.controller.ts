import type { Request, Response, NextFunction } from 'express';
import { register, login, getProfile, updateProfile, deleteProfile, checkEmailExists, searchUsers } from '../services/user.service.js';
import { uploadToS3, deleteFromS3 } from '../utils/s3.js';

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
            const { email, firstName, lastName, password, imageUrl, location, address, phone, socialmedia } = req.body;
            const user = await register({ email, firstName, lastName, password, imageUrl, location, address, phone, socialmedia });
    res.status(201).json({ message: 'User registered', user });
  } catch (err) {
    next(err);
  }
};

export const checkEmailExistsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    const exists = await checkEmailExists(email as string);
    res.status(200).json({ exists });
  } catch (err) {
    next(err);
  }
};

export const loginUser = async (req: Request, res: Response) => {
    try {
    const result = await login(req.body);
    res.status(200).json({ message: 'Login successful', ...result });
  } catch (err: any) {
    res.status(401).json({ message: err.message });
  }
};

export const getUserProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await getProfile((req as any).user.id);
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};

export const updateUserProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let imageUrl = req.body.imageUrl;
    
    // If a new image file is uploaded, upload it to S3
    if (req.file) {
      // Get current user to check if they have an existing image
      const currentUser = await getProfile((req as any).user.id);
      
      // Upload new image to S3
      imageUrl = await uploadToS3(req.file, 'profile-images');
      
      // Delete old image if it exists and is from S3
      if (currentUser.imageUrl && currentUser.imageUrl.includes('amazonaws.com')) {
        await deleteFromS3(currentUser.imageUrl);
      }
    }
    
    const updateData = { ...req.body };
    if (imageUrl) {
      updateData.imageUrl = imageUrl;
    }
    
    // Parse socialmedia if it's a JSON string
    if (updateData.socialmedia && typeof updateData.socialmedia === 'string') {
      try {
        updateData.socialmedia = JSON.parse(updateData.socialmedia);
      } catch (e) {
        // If parsing fails, treat it as an array with single item
        updateData.socialmedia = [updateData.socialmedia];
      }
    }
    
    const updatedUser = await updateProfile((req as any).user.id, updateData);
    res.status(200).json({ message: 'Profile updated', user: updatedUser });
  } catch (err) {
    next(err);
  }
};

export const deleteUserProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await deleteProfile((req as any).user.id);
    res.status(200).json({ message: 'Profile deleted' });
  } catch (err) {
    next(err);
  }
};

export const searchUsersController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    const users = await searchUsers(q as string);
    res.status(200).json(users);
  } catch (err) {
    next(err);
  }
};

export const uploadImageController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    // Upload image to S3
    const imageUrl = await uploadToS3(req.file, 'uploads');
    
    res.status(200).json({ 
      message: 'Image uploaded successfully',
      imageUrl 
    });
  } catch (err) {
    next(err);
  }
};