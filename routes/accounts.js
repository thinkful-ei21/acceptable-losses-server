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



/* ====== PUT (update) an exsiting account with a new bill ====== */
router.put('/:id', (req, res, next) => {
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



module.exports = {router};



/*

username: floridaman789
password: password123
userId: 5b7dcc92e858ec15013b335f
authToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNWI3ZGNjOTJlODU4ZWMxNTAxM2IzMzVmIiwidXNlcm5hbWUiOiJmbG9yaWRhbWFuNzg5IiwiZmlyc3ROYW1lIjoiIiwibGFzdE5hbWUiOiIifSwiaWF0IjoxNTM0OTcxMDY5LCJleHAiOjE1MzU1NzU4NjksInN1YiI6ImZsb3JpZGFtYW43ODkifQ.h1_hXxZmJSBKuzVVUP1THje4mEJfCY8jjuQmPxk-3OQ
sample accounts:
[
    {
        "url": "www.netflix.com",
        "userId": "5b7dcc92e858ec15013b335f",
        "name": "Netflix",
        "frequency": "monthly",
        "bills": [
            {
                "isPaid": false,
                "oneTime": false,
                "_id": "5b7dcdaae858ec15013b3361",
                "dueDate": "2017-08-22T20:53:00.000Z",
                "amount": 0
            }
        ],
        "createdAt": "2018-08-22T20:55:06.739Z",
        "updatedAt": "2018-08-22T20:55:06.739Z",
        "id": "5b7dcdaae858ec15013b3360"
    },
    {
        "url": "www.pge.com",
        "userId": "5b7dcc92e858ec15013b335f",
        "name": "PG&E",
        "frequency": "monthly",
        "bills": [
            {
                "isPaid": false,
                "oneTime": false,
                "_id": "5b7dcdc3e858ec15013b3363",
                "dueDate": "2018-02-22T20:53:00.000Z",
                "amount": 0
            }
        ],
        "createdAt": "2018-08-22T20:55:31.719Z",
        "updatedAt": "2018-08-22T20:55:31.719Z",
        "id": "5b7dcdc3e858ec15013b3362"
    },
    {
        "url": "www.att.com",
        "userId": "5b7dcc92e858ec15013b335f",
        "name": "AT&T",
        "frequency": "monthly",
        "bills": [
            {
                "isPaid": false,
                "oneTime": false,
                "_id": "5b7dce0fe858ec15013b3365",
                "dueDate": "2018-05-22T20:53:00.000Z",
                "amount": 100
            }
        ],
        "createdAt": "2018-08-22T20:56:47.841Z",
        "updatedAt": "2018-08-22T20:56:47.841Z",
        "id": "5b7dce0fe858ec15013b3364"
    }
]

*/
