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
    .then(accounts => {
      return Promise.all([...accounts.map(account => {
        return catchUpBills(account);
      })]);
      return accounts
    .catch(err => next(err));
});

function catchUpBills(account) {
  const bills = account.bills;
  const lastBillDate = moment(bills[bills.length-1].dueDate);
  const today = moment();
  while(lastBillDate.isBefore(today)) {
    lastBillDate.add(1, 'month');
    bills.push({
      dueDate: lastBillDate,
      amount: bills[0].amount
    })
  }
  account.bills = [...bills];
  return account;
}

// ========== GET a account by ID ====================
router.get('/:id', (req, res, next) => {
  const accountId = req.params.id;
  Account.findById(accountId)
    .then(account => res.json(account))
    .catch(err => next(err));
});

// ========== POST (create) a new account ============
router.post('/', (req, res, next) => {
  const userId = req.user.id;
  const { name, url, amount=0, dueDate, frequency } = req.body;

  const newAccount = {
    userId,
    name,
    url,
    frequency,
    bills: [{
      dueDate,
      amount
    }]
  };

  Account.create(newAccount)
    .then(result => res.json(result))
    .catch(err => next(err));
});

// ========== COMPLETED, BUT NOT USED ============================
// ========== POST (create) a new bill within an account =========
router.post('/:id', (req, res, next) => {
  // grab accountId, userId, and newBill data
  const accountId = req.params.id;
  const {dueDate, amount} = req.body;
  // construct newBill
  const newBill = {
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

// ========== INCOMPLETE ==========================================
// ========== PUT (update) an exsiting bill within an account =====
router.put('/:id', (req, res, next) => {
  // grab accountId, userId, and updateBill data
  // should bill be referenced by index? or by _id?
  const accountId = req.params.id;
  const {dueDate, amount, isPaid} = req.body;
  // construct updateBill
  const updateBill = {
    dueDate,
    amount,
    isPaid
  };
  // this endpoint is not yet complete
  return Account.findById(accountId)
    .then(result => res.json(result))
    .catch(err => next(err));
});

// ========== DELETE (delete) an exsiting bill =====================
router.delete('/:id', (req, res, next) => {
  // const userId = req.user.id;
  const accountId = req.params.id;

  return Account.findByIdAndRemove(accountId)
    .then(() => res.sendStatus(204).end())
    .catch(err => next(err));
});


module.exports = {router};



/*
username: floridaman123
password: password123
userId: 5b7da6fc881f34122ab6bf95
authToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNWI3ZGE2ZmM4ODFmMzQxMjJhYjZiZjk1IiwidXNlcm5hbWUiOiJmbG9yaWRhbWFuMTIzIiwiZmlyc3ROYW1lIjoiIiwibGFzdE5hbWUiOiIifSwiaWF0IjoxNTM0OTYxNDQ4LCJleHAiOjE1MzU1NjYyNDgsInN1YiI6ImZsb3JpZGFtYW4xMjMifQ.H1pPE_Y6CweXfqwHyjEhLYoapkvWHEfwdb1y3FTxuCc

sample accounts

[
    {
        "url": "www.netflix.com",
        "userId": "5b7da6fc881f34122ab6bf95",
        "name": "Netflix",
        "frequency": "monthly",
        "bills": [
            {
                "isPaid": false,
                "oneTime": false,
                "_id": "5b7da886b9c01a1245094a7a",
                "dueDate": "2018-08-22T18:15:43.000Z",
                "amount": 30
            }
        ],
        "createdAt": "2018-08-22T18:16:38.697Z",
        "updatedAt": "2018-08-22T18:16:38.697Z",
        "id": "5b7da886b9c01a1245094a79"
    },
    {
        "url": "www.pge.com",
        "userId": "5b7da6fc881f34122ab6bf95",
        "name": "PG&E",
        "frequency": "monthly",
        "bills": [
            {
                "isPaid": false,
                "oneTime": false,
                "_id": "5b7da898b9c01a1245094a7c",
                "dueDate": "2018-08-22T18:15:43.000Z",
                "amount": 10
            }
        ],
        "createdAt": "2018-08-22T18:16:56.650Z",
        "updatedAt": "2018-08-22T18:16:56.650Z",
        "id": "5b7da898b9c01a1245094a7b"
    }
]


*/