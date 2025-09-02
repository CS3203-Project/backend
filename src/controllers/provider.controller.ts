import type { Request, Response, NextFunction } from 'express';
import * as providerService from '../services/provider.service.js';
import { uploadToS3 } from '../utils/s3.js';

export const createProvider = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const provider = await providerService.createProvider((req as any).user.id, req.body);
    res.status(201).json({ 
      message: 'Service provider profile created successfully', 
      provider 
    });
  } catch (err) {
    next(err);
  }
};

export const updateProvider = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const provider = await providerService.updateProvider((req as any).user.id, req.body);
    res.status(200).json({ 
      message: 'Service provider profile updated successfully', 
      provider 
    });
  } catch (err) {
    next(err);
  }
};

export const deleteProvider = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await providerService.deleteProvider((req as any).user.id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const getProviderProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const provider = await providerService.getProviderProfile((req as any).user.id);
    res.status(200).json(provider);
  } catch (err) {
    next(err);
  }
};

export const getProviderById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const provider = await providerService.getProviderById(req.params.id);
    res.status(200).json(provider);
  } catch (err) {
    next(err);
  }
};

export const verifyProvider = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const provider = await providerService.verifyProvider(req.params.id);
    res.status(200).json({ 
      message: 'Service provider verified successfully', 
      provider 
    });
  } catch (err) {
    next(err);
  }
};

export const unverifyProvider = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const provider = await providerService.unverifyProvider(req.params.id);
    res.status(200).json({ 
      message: 'Service provider unverified successfully', 
      provider 
    });
  } catch (err) {
    next(err);
  }
};

export const uploadIdCard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!(req as any).file) {
      return res.status(400).json({
        success: false,
        message: 'No ID card image provided'
      });
    }

    // Upload ID card to S3
    const idCardUrl = await uploadToS3((req as any).file, 'id-cards');
    
    // Update provider with ID card URL
    const provider = await providerService.updateProvider((req as any).user.id, {
      IDCardUrl: idCardUrl
    });
    
    res.status(200).json({
      success: true,
      message: 'ID card uploaded successfully',
      data: {
        provider,
        idCardUrl
      }
    });
  } catch (err) {
    next(err);
  }
};
