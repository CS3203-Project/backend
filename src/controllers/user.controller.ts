import type { Request, Response, NextFunction } from 'express';
import { register, login, getProfile, updateProfile, deleteProfile, checkEmailExists, searchUsers } from '../services/user.service.js';

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
    const updatedUser = await updateProfile((req as any).user.id, req.body);
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