import type { Request, Response, NextFunction } from 'express';
import * as serviceService from './services.service.js';

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
