'use strict';

const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const moment = require('moment');

const { Account } = require('../models/accounts.js');

const router = express.Router();

const jwtAuth = passport.authenticate('jwt', { session: false, failWithError: true });

router.use('/', jwtAuth);

// helper function for post MVP feature: updates all bills to current
// function catchUpBills(account) {
//   const bills = account.bills;
//   const lastBillDate = moment(bills[bills.length-1].dueDate);
//   const today = moment();
//   while(lastBillDate.isBefore(today)) {
//     console.log(lastBillDate);
//     lastBillDate.add(1, 'month');
//     bills.push({
//       dueDate: lastBillDate,
//       amount: bills[0].amount
//     });
//   }
//   account.bills = [...bills];
//   return account.save();
// }



/* ================ GET (read) all accounts ================== */
router.get('/', (req, res, next) => {
  const userId = req.user.id;

  /* Validate fields in request body */
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    const err = new Error();
    err.message = 'The `userId` is missing or invalid';
    err.status = 400;
    return next(err);
  }

  return Account
    .find({userId})
    .then(accounts => res.json(accounts))
    .catch(err => next(err));
});



/* ================== GET an account by ID =================== */
router.get('/:id', (req, res, next) => {
  const userId = req.user.id;
  const accountId = req.params.id;

  /* Validate fields in request body */
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    const err = new Error();
    err.message = 'The `userId` is missing or invalid';
    err.status = 400;
    return next(err);
  }
  if (!mongoose.Types.ObjectId.isValid(accountId)) {
    const err = new Error();
    err.message = 'The `accountId` is invalid';
    err.status = 400;
    return next(err);
  }

  return Account
    .findById(accountId)
    .then(account => res.json(account))
    .catch(err => next(err));
});

// post MVP feature: adds bills array x times based on current login time
// router.get('/:id', (req, res, next) => {
//   const accountId = req.params.id;
//   Account.findById(accountId)
//     .then(account => {
//       console.log(account);
//       return catchUpBills(account);
//     })
//     .then(account => res.json(account))
//     .catch(err => next(err));
// });



/* =============== POST (create) a new account ================ */
router.post('/', (req, res, next) => {
  const userId = req.user.id;
  const { name, url, amount=0, dueDate, frequency } = req.body;

  /* Validate fields in request body */
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    const err = new Error();
    err.message = 'The `userId` is missing or invalid';
    err.status = 400;
    return next(err);
  }
  if (!name) {
    const err = new Error();
    err.message = 'Missing `name` in request body';
    err.status = 400;
    return next(err);
  }
  if (!frequency) {
    const err = new Error();
    err.message = 'Missing `frequency` in request body';
    err.status = 400;
    return next(err);
  }
  if (!dueDate) {
    const err = new Error();
    err.message = 'Missing `dueDate` in request body';
    err.status = 400;
    return next(err);
  }

  const newAccount = {
    userId,
    name,
    url,
    frequency,
    nextDue: { dueDate, amount },
    bills: [{
      dueDate,
      amount
    }]
  };

  return Account
    .create(newAccount)
    .then(result => res.json(result))
    .catch(err => {
      if (err.code === 11000) {
        err = new Error();
        err.reason = 'ValidationError';
        err.message = 'Account name already exists';
        err.location = 'name';
        err.status = 400;
      }
      next(err);
    });
});



/* ======== PUT (update) an exsiting account properties ========= */
router.put('/:id', (req, res, next) => {
  const userId = req.user.id;
  const accountId = req.params.id;
  const { name, url=null, frequency } = req.body;

  /* Validate fields in request body */
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    const err = new Error();
    err.message = 'The `userId` is missing or invalid';
    err.status = 400;
    return next(err);
  }
  if (!mongoose.Types.ObjectId.isValid(accountId)) {
    const err = new Error();
    err.message = 'The `accountId` is invalid';
    err.status = 400;
    return next(err);
  }
  if (!name) {
    const err = new Error();
    err.message = 'Missing `name` in request body';
    err.status = 400;
    return next(err);
  }
  if (!frequency) {
    const err = new Error();
    err.message = 'Missing `frequency` in request body';
    err.status = 400;
    return next(err);
  }

  return Account
    .findById(accountId)
    .then(result => {
      const account = result;

      account.name = name;
      account.url = url;
      account.frequency = frequency;

      return account
        .save()
        .then(account => res.status(201).json(account));
    })
    .catch(err => {
      if (err.code === 11000) {
        err = new Error();
        err.message = 'Account name already exists';
        err.status = 400;
      }
      next(err);
    });
});



/* ======== PUT (update) bills within an existing account ======== */
router.put('/bills/:id', (req, res, next) => {
  const accountId = req.params.id;
  const { amount=0 } = req.body;
  
  return Account
    .findById(accountId)
    .then(result => {
      const account = result;
      const currBill = result.bills[result.bills.length - 1];
      const interval = 1; // account.frequency if monthly then interval = 1

      const newBill = {
        dueDate: moment(currBill.dueDate).add(interval, 'month'),
        amount
      };

      currBill.isPaid = true;
      currBill.datePaid = moment().format();
      account.bills = [...account.bills, newBill];
      account.nextDue = newBill;

      return account
        .save()
        .then(account => res.status(201).json(account));
    })
    .catch(err => next(err));
});


/* ============ DELETE (delete) an exsiting bill ================ */
router.delete('/:id', (req, res, next) => {
  const userId = req.user.id;
  const accountId = req.params.id;

  /* Validate fields in request body */
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    const err = new Error();
    err.message = 'The `userId` is missing or invalid';
    err.status = 400;
    return next(err);
  }
  if (!mongoose.Types.ObjectId.isValid(accountId)) {
    const err = new Error();
    err.message = 'The `accountId` is invalid';
    err.status = 400;
    return next(err);
  }

  return Account
    .findOneAndRemove({_id: accountId, userId})
    .then(() => res.sendStatus(204).end())
    .catch(err => next(err));
});



module.exports = { router };
