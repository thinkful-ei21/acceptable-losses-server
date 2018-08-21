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

// ========== POST (create) a new bill within an account
router.post('/:id', (req, res, next) => {
  // grab accountId, userId, and newBill data
  const accountId = req.params.id;
  const {frequency, dueDate, amount} = req.body;
  // construct newBill
  const newBill = {
    frequency,
    dueDate,
    amount,
  };

  return Account.findById(accountId)
    .then(result => {
      const account = result;
      account.bills = [...account.bills, newBill];
      account.save()
        .then(account => res.status(201).json(account));
    })
    .catch(err => next(err));
});

// ========== PUT (update) an exsiting bill within an account =====
router.put('/:id', (req, res, next) => {
  // grab accountId, userId, and updateBill data
  // should bill be referenced by index? or by _id?
  const userId = req.user.id;
  const accountId = req.params.id;
  const {frequency, dueDate, amount, isPaid} = req.body;
  // construct updateBill
  const updateBill = {
    frequency,
    dueDate,
    amount,
    isPaid
  };

  // account.find(account.bills._id: blah)
});

module.exports = {router};



/*
user's account

[
    {
        "url": "www.netflix.com",
        "userId": "5b7c52fd60e2580cfeb26b24",
        "name": "Neftlix",
        "bills": [
            {
                "isPaid": false,
                "_id": "5b7c6118598d8d0e674756a9",
                "frequency": "monthly",
                "dueDate": "2018-08-21T18:54:57.000Z",
                "amount": 100
            }
        ],
        "createdAt": "2018-08-21T18:59:36.918Z",
        "updatedAt": "2018-08-21T18:59:36.918Z",
        "id": "5b7c6118598d8d0e674756a8"
    }
]
*/