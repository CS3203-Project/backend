import * as userService from '../services/user.service.js';

export const createUser = async (req, res, next) => {
  try {
            const { email, firstName, lastName, password, imageUrl, location, address, phoneNumber } = req.body;
            const user = await userService.register({ email, firstName, lastName, password, imageUrl, location, address, phoneNumber });
    res.status(201).json({ message: 'User registered', user });
  } catch (err) {
    next(err);
  }
};
export const loginUser = async (req, res) => {
    try {
    const result = await userService.login(req.body);
    res.status(200).json({ message: 'Login successful', ...result });
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};

export const getUserProfile = async (req, res, next) => {
  try {
    const user = await userService.getProfile(req.user.id);
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};