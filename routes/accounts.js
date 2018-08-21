'use strict';

const express = require('express');
const passport = require('passport');

const { Account } = require('../models/accounts.js');

const router = express.Router();

const jwtAuth = passport.authenticate('jwt', { session: false, failWithError: true });

router.use('/', jwtAuth);

// ========== GET (read) all accounts ================
router.get('/', (req, res, next) => {
  const userId = req.user.id;
  Account.find({userId})
    .then(result => res.json(result))
    .catch(err => next(err));
});

// ========== POST (create) a new account ============
router.post('/', (req, res, next) => {
  const userId = req.user.id;
  const { name, url, amount, dueDate, frequency } = req.body;

  const newAccount = {
    userId,
    name,
    url,
    bills: [{
      frequency,
      dueDate,
      amount
    }]
  };

  Account.create(newAccount)
    .then(result => res.json(result))
    .catch(err => next(err));
});

// ========== PUT (update) a bill, or add a bill =====
router.put('/', (req, res, next) => {
  const userId = req.user.id;
  const {frequency, dueDate, amount} = req.body;
});

module.exports = {router};