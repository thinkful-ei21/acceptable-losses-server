'use strict';

const express = require('express');
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

  return Account
    .find({userId})
    .then(result => res.json(result))
    .catch(err => next(err));
});



/* ================== GET an account by ID =================== */
router.get('/:id', (req, res, next) => {
  const accountId = req.params.id;
  
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
    .catch(err => next(err));
});



/* ======== PUT (update) an exsiting account properties ========= */
router.put('/:id', (req, res, next) => {
  const accountId = req.params.id;
  const { name, url, frequency } = req.body;

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
    .catch(err => next(err));
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

  return Account
    .findOneAndRemove({_id: accountId, userId})
    .then(() => res.sendStatus(204).end())
    .catch(err => next(err));
});



module.exports = { router };
