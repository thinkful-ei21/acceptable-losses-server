'use strict';

const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const cloudinary = require('cloudinary');

const { User } = require('../models/users.js');

const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});

const jwtAuth = passport.authenticate('jwt', { session: false, failWithError: true });

router.use('/', jwtAuth);



/* ===== POST (create) user profile picture to cloudinary ===== */
router.post('/upload', (req, res, next) => {
  const userId = req.user.id;

  // Validate Mongoose Object Id
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Missing field: userId',
      location: 'userId'
    });
  }

  // All validations passed
  cloudinary.uploader
    .upload(req.files.fileName.path)
    .then(result => {
      const { public_id, secure_url } = result;
      const profilePic = { public_id, secure_url };
      return User.findByIdAndUpdate(userId, { profilePic }, {new: true});
    })
    .then(user => {
      const { public_id, secure_url } = user.profilePic;
      const result = { public_id, secure_url };
      return res.status(201).json(result);
    })
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



/* ===== DELETE (delete) user profile picture from cloudinary ===== */
router.delete('/delete', (req, res, next) => {
  const userId = req.user.id;
  const { public_id } = req.body;

  // Validate Mongoose Object Id
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Missing field: userId',
      location: 'userId'
    });
  }

  // All validations passed
  cloudinary.uploader
    .destroy(public_id)
    .then(result => {
      const profilePic = {
        public_id: '',
        secure_url: ''
      };
      return User.findByIdAndUpdate(userId, { profilePic }, {new: true});
    })
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
