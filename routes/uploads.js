'use strict';

const express = require('express');
const passport = require('passport');
const cloudinary = require('cloudinary');

const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});

const jwtAuth = passport.authenticate('jwt', { session: false, failWithError: true });

router.post('/', jwtAuth, (req, res) => {
  cloudinary.uploader
    .upload(req.files.fileName.path)
    .then(results => res.json(results))
    .catch(err => console.log(err));
});

module.exports = { router };
