'use strict';

const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const moment = require('moment');

const { Account } = require('../models/accounts.js');

const router = express.Router();

const jwtAuth = passport.authenticate('jwt', { session: false, failWithError: true });

router.use('/', jwtAuth);



/* ================ GET (read) all accounts ================== */
router.get('/', (req, res, next) => {
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
  return Account
    .find({userId})
    .then(accounts => res.json(accounts))
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



/* ================== GET an account by ID =================== */
router.get('/:id', (req, res, next) => {
  const userId = req.user.id;
  const accountId = req.params.id;

  // Validate Mongoose Object Id
  const ids = [userId, accountId];
  ids.forEach(id => {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(422).json({
        code: 422,
        reason: 'ValidationError',
        message: `Missing field: ${id}`,
        location: id
      });
    }
  });

  // All validations passed
  return Account
    .findById(accountId)
    .then(account => res.json(account))
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



/* post MVP feature: adds bills array x times based on current login time */

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
  const { name, amount=0, dueDate, frequency, reminder } = req.body;
  let { url } = req.body;

  // Validate fields in request body
  const requiredFields = ['name', 'frequency', 'dueDate', 'reminder', 'amount'];
  const missingField = requiredFields.find(field => !(field in req.body));
  if (missingField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: `Missing field: ${missingField}`,
      location: missingField
    });
  }

  const stringFields = ['name', 'frequency', 'dueDate', 'reminder', 'url'];
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

  // Ensure URL starts with 'http://' or 'https://'
  // if there is a url and it's not valid, prepend
  // if there is no url, this won't run
  const validUrl = value => /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/.test(value) ? true : false;
  if (url && !validUrl(url)) {
    if (validUrl('http://' + url)) {
      url = 'http://' + url;
    } else {
      return res.status(422).json({
        code: 422,
        reason: 'ValidationError',
        message: 'Url provided is invalid',
        location: 'url'
      });
    }
  }
  if (!url) {
    url = '';
  }

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
  const newAccount = {
    userId,
    name,
    url,
    reminder,
    frequency,
    nextDue: { dueDate, amount },
    bills: [{
      dueDate,
      amount
    }]
  };
  // logic for creating cron job goes here

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
  const { name, frequency, reminder } = req.body;
  let { url } = req.body;

  // Validate fields in request body
  const requiredFields = ['name', 'frequency', 'reminder'];
  const missingField = requiredFields.find(field => !(field in req.body));
  if (missingField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: `Missing field: ${missingField}`,
      location: missingField
    });
  }

  // Ensure URL starts with 'http://' or 'https://'
  // if there is a url and it's not valid, prepend
  // if there is no url, this won't run
  const validUrl = value => /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/.test(value) ? true : false;
  if (url && !validUrl(url)) {
    if (validUrl('http://' + url)) {
      url = 'http://' + url;
    } else {
      return res.status(422).json({
        code: 422,
        reason: 'ValidationError',
        message: 'Url provided is invalid',
        location: 'url'
      });
    }
  }
  if (!url) {
    url = '';
  }

  // Validate Mongoose Object Id
  const ids = [userId, accountId];
  ids.forEach(id => {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(422).json({
        code: 422,
        reason: 'ValidationError',
        message: `Missing field: ${id}`,
        location: id
      });
    }
  });

  // All validation passed
  return Account
    .findById(accountId)
    .then(result => {
      const account = result;

      account.name = name;
      account.url = url;
      account.reminder = reminder;
      account.frequency = frequency;

      return account
        .save()
        .then(account => res.status(201).json(account));
    })
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



/* ======== PUT (update) bills within an existing account ======== */
router.put('/bills/:id', (req, res, next) => {
  const userId = req.user.id;
  const accountId = req.params.id;
  const { amount=0 } = req.body;
  
  // Validate Mongoose Object Id
  const ids = [userId, accountId];
  ids.forEach(id => {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(422).json({
        code: 422,
        reason: 'ValidationError',
        message: `Missing field: ${id}`,
        location: id
      });
    }
  });

  // All validations passed
  return Account
    .findById(accountId)
    .then(result => {
      const account = result;

      const currBill = result.bills[result.bills.length - 1];
      currBill.isPaid = true;
      currBill.datePaid = moment().format('MM-DD-YYYY');
      currBill.amount = amount;

      let interval;
      if (account.frequency === 'Monthly') {
        interval = 1;
      }
      if (account.frequency === 'Quarterly') {
        interval = 3;
      }
      if (account.frequency === 'Semi-Annually') {
        interval = 6;
      }
      if (account.frequency === 'Annually') {
        interval = 12;
      }

      const newBill = {
        dueDate: moment(currBill.dueDate).add(interval, 'month').format('MM-DD-YYYY'),
        amount
      };

      account.bills = [...account.bills, newBill];
      account.nextDue = newBill;

      return account
        .save()
        .then(account => res.status(201).json(account));
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



/* ============ DELETE (delete) an exsiting bill ================ */
router.delete('/:id', (req, res, next) => {
  const userId = req.user.id;
  const accountId = req.params.id;

  // Validate Mongoose Object Id
  const ids = [userId, accountId];
  ids.forEach(id => {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(422).json({
        code: 422,
        reason: 'ValidationError',
        message: `Missing field: ${id}`,
        location: id
      });
    }
  });

  // All validations passed
  return Account
    .findOneAndRemove({_id: accountId, userId})
    .then(() => res.sendStatus(204).end())
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
