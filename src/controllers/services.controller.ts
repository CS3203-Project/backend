import type { Request, Response, NextFunction } from 'express';
import * as serviceService from '../services/services.service.js';
import { semanticSearchService } from '../services/semantic-search.service.js';
import googleMapsService from '../services/googleMaps.service.js';

/**
 * Create a new service
 */
export const createService = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('=== SERVICE CREATION DEBUG ===');
    console.log('Request body received:', JSON.stringify(req.body, null, 2));
    
    const serviceData = req.body;
    
    // Handle location data if provided
    if (serviceData.address || (serviceData.latitude && serviceData.longitude)) {
      try {
        let locationData;
        
        if (serviceData.latitude && serviceData.longitude) {
          // Manual coordinates provided - validate and reverse geocode
          if (!googleMapsService.validateCoordinates(serviceData.latitude, serviceData.longitude)) {
            return res.status(400).json({
              success: false,
              message: 'Invalid coordinates provided'
            });
          }
          
          locationData = await googleMapsService.reverseGeocode(
            serviceData.latitude, 
            serviceData.longitude
          );
        } else if (serviceData.address) {
          // Address provided - geocode to get coordinates
          locationData = await googleMapsService.geocodeAddress(serviceData.address);
        }

        if (locationData) {
          // Merge location data into service data
          serviceData.latitude = locationData.lat;
          serviceData.longitude = locationData.lng;
          serviceData.address = locationData.formatted_address;
          serviceData.city = locationData.city;
          serviceData.state = locationData.state;
          serviceData.country = locationData.country;
          serviceData.postalCode = locationData.postal_code;
          serviceData.locationLastUpdated = new Date();
        }
      } catch (locationError) {
        console.warn('Location processing failed:', locationError);
        // Continue without location data rather than failing the entire request
      }
    }
    
    // Debug: Check if videoUrl is present
    console.log('Video URL in service data:', serviceData.videoUrl);
    console.log('Video URL type:', typeof serviceData.videoUrl);
    console.log('Video URL length:', serviceData.videoUrl ? serviceData.videoUrl.length : 'N/A');
    
    console.log('Calling service creation...');
    const newService = await serviceService.createService(serviceData);
    
    console.log('Service created successfully. Result:', JSON.stringify(newService, null, 2));
    console.log('Video URL in created service:', (newService as any).videoUrl);
    
    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: newService
    });
  } catch (error) {
    console.error('=== SERVICE CREATION ERROR ===');
    console.error('Error details:', error);
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
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
 * Get a service by conversation ID
 */
export const getServiceByConversationId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { conversationId } = req.params;
    const service = await serviceService.getServiceByConversationId(conversationId!);
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found for this conversation'
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
 * Semantic search for services
 */
export const searchServices = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { query, limit, threshold, categoryId, providerId, minPrice, maxPrice } = req.query;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const searchOptions = {
      query: query as string,
      limit: limit ? parseInt(limit as string) : 20,
      threshold: threshold ? parseFloat(threshold as string) : 0.7,
      categoryId: categoryId as string,
      providerId: providerId as string,
      minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
    };

    const results = await semanticSearchService.searchServices(searchOptions);

    res.status(200).json({
      success: true,
      message: 'Semantic search completed successfully',
      data: {
        query: query,
        results: results,
        count: results.length
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Find similar services to a given service
 */
export const getSimilarServices = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { limit } = req.query;

    const similarServices = await semanticSearchService.findSimilarServices(
      id!,
      limit ? parseInt(limit as string) : 5
    );

    res.status(200).json({
      success: true,
      message: 'Similar services retrieved successfully',
      data: similarServices
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update embeddings for a specific service
 */
export const updateServiceEmbeddings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    await semanticSearchService.updateServiceEmbeddings(id!);

    res.status(200).json({
      success: true,
      message: 'Service embeddings updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Batch update embeddings for all services
 */
export const updateAllServiceEmbeddings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { batchSize } = req.query;

    const updatedCount = await semanticSearchService.updateAllServiceEmbeddings(
      batchSize ? parseInt(batchSize as string) : 10
    );

    res.status(200).json({
      success: true,
      message: `Batch embedding update completed. Updated ${updatedCount} services.`,
      data: {
        updatedCount
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Search services by location
 */
export const searchServicesByLocation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { 
      lat, 
      lng, 
      address,
      radius = 10, // Default 10km radius
      page = 1,
      limit = 20,
      categoryId,
      minPrice,
      maxPrice
    } = req.query;

    let userLat: number, userLng: number;

    // Determine user coordinates
    if (lat && lng) {
      userLat = parseFloat(lat as string);
      userLng = parseFloat(lng as string);
      
      if (!googleMapsService.validateCoordinates(userLat, userLng)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid coordinates provided'
        });
      }
    } else if (address) {
      try {
        const locationData = await googleMapsService.geocodeAddress(address as string);
        userLat = locationData.lat;
        userLng = locationData.lng;
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: 'Could not geocode the provided address'
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'Location required for search (provide lat/lng or address)'
      });
    }

    const searchOptions = {
      latitude: userLat,
      longitude: userLng,
      radius: parseFloat(radius as string),
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      categoryId: categoryId as string,
      minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined
    };

    const results = await serviceService.searchServicesByLocation(searchOptions);

    res.status(200).json({
      success: true,
      message: 'Location-based search completed successfully',
      data: {
        services: results.services,
        pagination: {
          total: results.total,
          page: searchOptions.page,
          limit: searchOptions.limit,
          totalPages: Math.ceil(results.total / searchOptions.limit)
        },
        search_location: {
          lat: userLat,
          lng: userLng,
          radius: searchOptions.radius
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user location from IP address
 */
export const getLocationFromIP = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const clientIP = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] as string;
    
    try {
      const locationData = await googleMapsService.getLocationFromIP(clientIP);
      
      res.status(200).json({
        success: true,
        message: 'Location detected from IP address',
        data: locationData
      });
    } catch (error) {
      res.status(200).json({
        success: false,
        message: 'Could not determine location from IP address',
        data: null
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Geocode an address
 */
export const geocodeAddress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { address } = req.body;

    if (!address) {
      return res.status(400).json({
        success: false,
        message: 'Address is required'
      });
    }

    try {
      const locationData = await googleMapsService.geocodeAddress(address);
      
      res.status(200).json({
        success: true,
        message: 'Address geocoded successfully',
        data: locationData
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Could not geocode the provided address'
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Reverse geocode coordinates
 */
export const reverseGeocode = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { lat, lng, latitude, longitude } = req.body;

    // Support both lat/lng and latitude/longitude formats
    const latValue = lat || latitude;
    const lngValue = lng || longitude;

    if (!latValue || !lngValue) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    const latParsed = parseFloat(latValue);
    const lngParsed = parseFloat(lngValue);

    if (!googleMapsService.validateCoordinates(latParsed, lngParsed)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid coordinates provided'
      });
    }

    try {
      const locationData = await googleMapsService.reverseGeocode(latParsed, lngParsed);
      
      res.status(200).json({
        success: true,
        message: 'Coordinates reverse geocoded successfully',
        data: locationData
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Could not reverse geocode the provided coordinates'
      });
    }
  } catch (error) {
    next(error);
  }
};
