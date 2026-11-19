const userService = require('../services/userService');

exports.getUsers = (req, res, next) => {
  try {
    const users = userService.listUsers();
    return res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (err) {
    next(err);
  }
};

exports.getUserById = (req, res, next) => {
  try {
    const user = userService.getUser(req.params.id);
    return res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

exports.createUser = (req, res, next) => {
  try {
    const newUser = userService.registerUser(req.body);
    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: newUser
    });
  } catch (err) {
    next(err);
  }
};

exports.updateUser = (req, res, next) => {
  try {
    const updated = userService.modifyUser(req.params.id, req.body);
    return res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: updated
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteUser = (req, res, next) => {
  try {
    userService.deleteUser(req.params.id);
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
};
