import * as providerService from '../services/provider.service.js';

export const createProvider = async (req, res, next) => {
  try {
    const provider = await providerService.createProvider(req.user.id, req.body);
    res.status(201).json({ 
      message: 'Service provider profile created successfully', 
      provider 
    });
  } catch (err) {
    next(err);
  }
};

export const updateProvider = async (req, res, next) => {
  try {
    const provider = await providerService.updateProvider(req.user.id, req.body);
    res.status(200).json({ 
      message: 'Service provider profile updated successfully', 
      provider 
    });
  } catch (err) {
    next(err);
  }
};

export const deleteProvider = async (req, res, next) => {
  try {
    const result = await providerService.deleteProvider(req.user.id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const getProviderProfile = async (req, res, next) => {
  try {
    const provider = await providerService.getProviderProfile(req.user.id);
    res.status(200).json(provider);
  } catch (err) {
    next(err);
  }
};
