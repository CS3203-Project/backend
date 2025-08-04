import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Create a new service
 * @param {Object} serviceData - The service data
 * @param {string} serviceData.providerId - ID of the service provider
 * @param {string} serviceData.categoryId - ID of the service category
 * @param {string} [serviceData.title] - Service title
 * @param {string} [serviceData.description] - Service description
 * @param {number} serviceData.price - Service price
 * @param {string} [serviceData.currency="USD"] - Currency (defaults to USD)
 * @param {string[]} [serviceData.tags=[]] - Array of tags
 * @param {string[]} [serviceData.images=[]] - Array of image URLs
 * @param {boolean} [serviceData.isActive=true] - Service active status
 * @param {string[]} [serviceData.workingTime=[]] - Array of working time slots
 * @returns {Promise<Object>} Created service object
 */
export const createService = async (serviceData) => {
  try {
    const {
      providerId,
      categoryId,
      title,
      description,
      price,
      currency = "USD",
      tags = [],
      images = [],
      isActive = true,
      workingTime = []
    } = serviceData;

    // Validate required fields
    if (!providerId) {
      throw new Error('Provider ID is required');
    }
    if (!categoryId) {
      throw new Error('Category ID is required');
    }
    if (price === undefined || price === null) {
      throw new Error('Price is required');
    }

    // Validate that provider exists
    const provider = await prisma.serviceProvider.findUnique({
      where: { id: providerId }
    });
    if (!provider) {
      throw new Error('Service provider not found');
    }

    // Validate that category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    });
    if (!category) {
      throw new Error('Category not found');
    }

    // Create the service
    const newService = await prisma.service.create({
      data: {
        providerId,
        categoryId,
        title,
        description,
        price,
        currency,
        tags,
        images,
        isActive,
        workingTime
      },
      include: {
        provider: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        },
        category: true
      }
    });

    return newService;
  } catch (error) {
    throw new Error(`Failed to create service: ${error.message}`);
  }
};

/**
 * Get all services with optional filtering
 * @param {Object} filters - Optional filters
 * @param {string} [filters.providerId] - Filter by provider ID
 * @param {string} [filters.categoryId] - Filter by category ID
 * @param {boolean} [filters.isActive] - Filter by active status
 * @param {number} [filters.skip=0] - Number of records to skip for pagination
 * @param {number} [filters.take=10] - Number of records to take for pagination
 * @returns {Promise<Object[]>} Array of service objects
 */
export const getServices = async (filters = {}) => {
  try {
    const {
      providerId,
      categoryId,
      isActive,
      skip = 0,
      take = 10
    } = filters;

    const whereClause = {};
    
    if (providerId) whereClause.providerId = providerId;
    if (categoryId) whereClause.categoryId = categoryId;
    if (isActive !== undefined) whereClause.isActive = isActive;

    const services = await prisma.service.findMany({
      where: whereClause,
      skip,
      take,
      include: {
        provider: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        },
        category: true,
        reviews: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return services;
  } catch (error) {
    throw new Error(`Failed to fetch services: ${error.message}`);
  }
};

/**
 * Get a single service by ID
 * @param {string} serviceId - The service ID
 * @returns {Promise<Object|null>} Service object or null if not found
 */
export const getServiceById = async (serviceId) => {
  try {
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: {
        provider: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                phone: true
              }
            }
          }
        },
        category: true,
        reviews: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        },
        schedules: true
      }
    });

    return service;
  } catch (error) {
    throw new Error(`Failed to fetch service: ${error.message}`);
  }
};

/**
 * Update a service
 * @param {string} serviceId - The service ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated service object
 */
export const updateService = async (serviceId, updateData) => {
  try {
    const service = await prisma.service.findUnique({
      where: { id: serviceId }
    });

    if (!service) {
      throw new Error('Service not found');
    }

    const updatedService = await prisma.service.update({
      where: { id: serviceId },
      data: updateData,
      include: {
        provider: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        },
        category: true
      }
    });

    return updatedService;
  } catch (error) {
    throw new Error(`Failed to update service: ${error.message}`);
  }
};

/**
 * Delete a service
 * @param {string} serviceId - The service ID
 * @returns {Promise<Object>} Deleted service object
 */
export const deleteService = async (serviceId) => {
  try {
    const service = await prisma.service.findUnique({
      where: { id: serviceId }
    });

    if (!service) {
      throw new Error('Service not found');
    }

    const deletedService = await prisma.service.delete({
      where: { id: serviceId }
    });

    return deletedService;
  } catch (error) {
    throw new Error(`Failed to delete service: ${error.message}`);
  }
};

