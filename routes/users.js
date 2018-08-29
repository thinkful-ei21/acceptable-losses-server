'use strict';

const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');

const { User } = require('../models/users.js');

const router = express.Router();

const jwtAuth = passport.authenticate('jwt', { session: false, failWithError: true });



/* ======================= POST (create) a new user ======================= */
router.post('/', (req, res) => {
  // Validate fields in request body
  const requiredFields = ['username', 'password'];
  const missingField = requiredFields.find(field => !(field in req.body));
  if (missingField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Missing field',
      location: missingField
    });
  }

  const stringFields = ['username', 'password', 'firstName', 'lastName'];
  const nonStringField = stringFields.find(
    field => field in req.body && typeof req.body[field] !== 'string'
  );
  if (nonStringField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Incorrect field type: expected string',
      location: nonStringField
    });
  }

  const trimmedFields = ['username', 'password'];
  const nonTrimmedField = trimmedFields.find(
    field => req.body[field].trim() !== req.body[field]
  );
  if (nonTrimmedField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Cannot start or end with whitespace',
      location: nonTrimmedField
    });
  }

  const sizedFields = {
    username: {min: 1},
    password: {min: 8, max: 72}
  };
  const tooSmallField = Object.keys(sizedFields).find(
    field =>
      'min' in sizedFields[field] &&
            req.body[field].trim().length < sizedFields[field].min
  );
  const tooLargeField = Object.keys(sizedFields).find(
    field =>
      'max' in sizedFields[field] &&
            req.body[field].trim().length > sizedFields[field].max
  );
  if (tooSmallField || tooLargeField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: tooSmallField
        ? `Must be at least ${sizedFields[tooSmallField]
          .min} characters long`
        : `Must be at most ${sizedFields[tooLargeField]
          .max} characters long`,
      location: tooSmallField || tooLargeField
    });
  }

  // All validations passed
  let { username, password, firstName = '', lastName = '' } = req.body;
  firstName = firstName.trim();
  lastName = lastName.trim();

  return User
    .find({ username })
    .countDocuments()
    .then(count => {
      if (count > 0) {
        return Promise.reject({
          code: 422,
          reason: 'ValidationError',
          message: 'Username already taken',
          location: 'username'
        });
      }
      return User.hashPassword(password);
    })
    .then(hash => User.create({
      username,
      password: hash,
      firstName,
      lastName
    }))
    .then(user => res.status(201).json(user))
    .catch(err => {
      if (err.reason === 'ValidationError') {
        return res.status(err.code).json(err);
      }
      return res.status(500).json({
        code: 500,
        message: 'Internal server error'
      });
    });
});



/* === PUT (update) username, firstName, and lastName of an existing user === */
router.put('/settings/:id', jwtAuth, (req, res, next) => {
  const userId = req.params.id;
  let { username, firstName='', lastName='' } = req.body;
  firstName = firstName.trim();
  lastName = lastName.trim();

  // Validate fields in request body
  if (!username) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Missing field: username',
      location: 'username'
    });
  }

  const stringFields = ['username', 'firstName', 'lastName'];
  const nonStringField = stringFields.find(
    field => field in req.body && typeof req.body[field] !== 'string'
  );
  if (nonStringField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Incorrect field type: expected string',
      location: nonStringField
    });
  }

  const trimmedFields = ['username', 'firstName', 'lastName'];
  const nonTrimmedField = trimmedFields.find(
    field => req.body[field].trim() !== req.body[field]
  );
  if (nonTrimmedField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Cannot start or end with whitespace',
      location: nonTrimmedField
    });
  }

  // Validate Mongoose Object Id
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Missing field: userId',
      location: userId
    });
  }

  // All validations passed
  return User
    .findById(userId)
    .then(result => {
      const user = result;

      user.username = username;
      user.firstName = firstName;
      user.lastName = lastName;

      return user
        .save()
        .then(user => res.status(201).json(user));
    })
    .catch(err => {
      if (err.code === 11000) {
        err = new Error();
        err.reason = 'ValidationError';
        err.message = 'User name already exists';
        err.location = 'username';
        err.status = 400;
      }
      next(err);
    });
});



/* =============== PUT (update) password of an existing user ================ */
router.put('/password/:id', jwtAuth, (req, res, next) => {
  const userId = req.params.id;
  const { oldPassword, newPassword } = req.body;

  // Validate fields in request body
  const requiredFields = ['oldPassword', 'newPassword'];
  const missingField = requiredFields.find(field => !(field in req.body));
  if (missingField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: `Missing field: ${missingField}`,
      location: missingField
    });
  }

  const stringFields = ['oldPassword', 'newPassword'];
  const nonStringField = stringFields.find(
    field => field in req.body && typeof req.body[field] !== 'string'
  );
  if (nonStringField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Incorrect field type: expected string',
      location: nonStringField
    });
  }

  const trimmedFields = ['oldPassword', 'newPassword'];
  const nonTrimmedField = trimmedFields.find(
    field => req.body[field].trim() !== req.body[field]
  );
  if (nonTrimmedField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Cannot start or end with whitespace',
      location: nonTrimmedField
    });
  }

  const sizedFields = {
    newPassword: {min: 8, max: 72}
  };
  const tooSmallField = Object.keys(sizedFields).find(
    field =>
      'min' in sizedFields[field] &&
            req.body[field].trim().length < sizedFields[field].min
  );
  const tooLargeField = Object.keys(sizedFields).find(
    field =>
      'max' in sizedFields[field] &&
            req.body[field].trim().length > sizedFields[field].max
  );
  if (tooSmallField || tooLargeField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: tooSmallField
        ? `Must be at least ${sizedFields[tooSmallField]
          .min} characters long`
        : `Must be at most ${sizedFields[tooLargeField]
          .max} characters long`,
      location: tooSmallField || tooLargeField
    });
  }

  // Ensure new and old passwords are not identical
  if (oldPassword === newPassword) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'New password identical to previous',
      location: 'newPassword'
    });
  }

  // Validate Mongoose Object Id
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Missing field: userId',
      location: userId
    });
  }

  // All validations passed
  return User
    .findById(userId)
    .then(user => user.validatePassword(oldPassword))
    .then(passed => {
      if (!passed) {
        return Promise.reject({
          code: 422,
          reason: 'ValidationError',
          message: 'Old password is incorrect',
          location: 'oldPassword'
        });
      }
      return User.hashPassword(newPassword);
    })
    .then(password => User.findByIdAndUpdate(userId, { password }, {new: true}))
    .then(user => res.status(201).json(user))
    .catch(err => {
      if (err.reason === 'ValidationError') {
        return res.status(err.code).json(err);
      }
      res.status(500).json({
        code: 500,
        message: 'Internal server error'
      });
    });
});



module.exports = { router };
