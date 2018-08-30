'use strict';

const express = require('express');
const passport = require('passport');
const cloudinary = require('cloudinary');

const router = express.Router();

const jwtAuth = passport.authenticate('jwt', { session: false, failWithError: true });



// post
router.post('/', jwtAuth, (req, res) => {
  const images = Object.values(req.files).map(file => file.path);
  const promises = images.map(image => cloudinary.uploader.upload(image));
  
  Promise
    .all(promises)
    .then(results => res.json(results));
});



module.exports = { router };
