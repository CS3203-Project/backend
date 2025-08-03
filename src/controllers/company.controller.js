import * as companyService from '../services/company.service.js';

export const createCompany = async (req, res, next) => {
  try {
    const company = await companyService.createCompany(req.user.id, req.body);
    res.status(201).json({ 
      message: 'Company created successfully', 
      company 
    });
  } catch (err) {
    next(err);
  }
};

export const updateCompany = async (req, res, next) => {
  try {
    const company = await companyService.updateCompany(req.user.id, req.params.companyId, req.body);
    res.status(200).json({ 
      message: 'Company updated successfully', 
      company 
    });
  } catch (err) {
    next(err);
  }
};

export const deleteCompany = async (req, res, next) => {
  try {
    await companyService.deleteCompany(req.user.id, req.params.companyId);
    res.status(200).json({ 
      message: 'Company deleted successfully' 
    });
  } catch (err) {
    next(err);
  }
};

export const getCompanies = async (req, res, next) => {
  try {
    const companies = await companyService.getCompanies(req.user.id);
    res.status(200).json(companies);
  } catch (err) {
    next(err);
  }
};
