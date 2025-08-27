import type { Request, Response, NextFunction } from 'express';
import * as serviceService from '../services/services.service.js';
import { uploadToS3 } from '../utils/s3.js';

/**
 * Create a new service
 */
export const createService = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const serviceData = req.body;
    const newService = await serviceService.createService(serviceData);
    
    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: newService
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all services with optional filtering
 */
export const getServices = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filters: any = {
      providerId: req.query.providerId as string,
      categoryId: req.query.categoryId as string,
      skip: req.query.skip ? parseInt(req.query.skip as string) : 0,
      take: req.query.take ? parseInt(req.query.take as string) : 10
    };
    if (typeof req.query.isActive !== 'undefined') {
      filters.isActive = req.query.isActive === 'true';
    }

    const services = await serviceService.getServices(filters);
    
    res.status(200).json({
      success: true,
      message: 'Services retrieved successfully',
      data: services,
      pagination: {
        skip: filters.skip,
        take: filters.take
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single service by ID
 */
export const getServiceById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const service = await serviceService.getServiceById(id!);
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Service retrieved successfully',
      data: service
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a service
 */
export const updateService = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const updatedService = await serviceService.updateService(id!, updateData);
    
    res.status(200).json({
      success: true,
      message: 'Service updated successfully',
      data: updatedService
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a service
 */
export const deleteService = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    await serviceService.deleteService(id!);
    
    res.status(200).json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload images for a service
 */
export const uploadServiceImages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const files = (req as any).files as Express.Multer.File[];
    
    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No image files provided'
      });
    }

    // Additional file size validation for each file
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        return res.status(400).json({
          success: false,
          message: `File "${file.originalname}" is too large. Maximum allowed size is 5MB`,
          error: 'FILE_SIZE_EXCEEDED'
        });
      }
    }

    // Check if service exists and user owns it
    const service = await serviceService.getServiceById(id);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Upload all images to S3
    const uploadPromises = files.map(file => uploadToS3(file, 'service-images'));
    const imageUrls = await Promise.all(uploadPromises);
    
    // Update service with new image URLs (append to existing images)
    const currentImages = service.images || [];
    const updatedImages = [...currentImages, ...imageUrls];
    
    // Limit to maximum 10 images per service
    if (updatedImages.length > 10) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 10 images allowed per service',
        error: 'IMAGE_LIMIT_EXCEEDED'
      });
    }
    
    const updatedService = await serviceService.updateService(id, {
      images: updatedImages
    });
    
    res.status(200).json({
      success: true,
      message: 'Images uploaded successfully',
      data: {
        service: updatedService,
        uploadedImages: imageUrls,
        totalImages: updatedImages.length
      }
    });
  } catch (error) {
    next(error);
  }
};
