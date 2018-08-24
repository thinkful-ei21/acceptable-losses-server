'use strict';

const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');

const { Income } = require('../models/income.js');

const router = express.Router();

const jwtAuth = passport.authenticate('jwt', { session: false, failWithError: true });

router.use('/', jwtAuth);



/* =================== GET (read) all income =================== */
router.get('/', (req, res, next) => {
  const userId = req.user.id;

  /* Validate fields in request body */
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    const err = new Error();
    err.message = 'The `userId` is missing or invalid';
    err.status = 400;
    return next(err);
  }

  return Income
    .find({userId})
    .then(income => res.json(income))
    .catch(err => next(err));
});



/* ===================== GET an income by ID ===================== */
router.get('/:id', (req, res, next) => {
  const userId = req.user.id;
  const incomeId = req.params.id;

  /* Validate fields in request body */
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    const err = new Error();
    err.message = 'The `userId` is missing or invalid';
    err.status = 400;
    return next(err);
  }
  if (!mongoose.Types.ObjectId.isValid(incomeId)) {
    const err = new Error();
    err.message = 'The `incomeId` is invalid';
    err.status = 400;
    return next(err);
  }

  return Income
    .findById(incomeId)
    .then(income => res.json(income))
    .catch(err => next(err));
});



/* ================= POST (create) a new income ================== */
router.post('/', (req, res, next) => {
  const userId = req.user.id;
  const { source, amount=0 } = req.body;

  /* Validate fields in request body */
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    const err = new Error();
    err.message = 'The `userId` is missing or invalid';
    err.status = 400;
    return next(err);
  }
  if (!source) {
    const err = new Error();
    err.message = 'Missing `source` in request body';
    err.status = 400;
    return next(err);
  }

  const newIncome = {
    userId,
    source,
    amount
  };

  return Income
    .find({userId, source})
    .count()
    .then(count => {
      console.log(count);
      if (count > 0) {
        return Promise.reject({
          code: 422,
          reason: 'Validation Error',
          message: 'Income source already exists',
          location: 'source'
        });
      }
      return Income.create(newIncome);
    })
    .then(income => res.json(income))
    .catch(err => {
      if (err.reason === 'Validation Error') {
        return res.status(err.code).json(err);
      }
      res.status(500).json({code: 500, message: 'Internal server error'});
    });

  // original way to create, but compound index isn't working
  // return Income
  //   .create(newIncome)
  //   .then(income => res.json(income))
  //   .catch(err => {
  //     if (err.code === 11000) {
  //       err = new Error();
  //       err.message = 'Income name already exists';
  //       err.status = 400;
  //     }
  //     next(err);
  //   });
});



/* =============== PUT (update) an existing income =============== */
router.put('/:id', (req, res, next) => {
  const userId = req.user.id;
  const incomeId = req.params.id;
  const { source, amount=0 } = req.body;

  /* Validate fields in request body */
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    const err = new Error();
    err.message = 'The `userId` is missing or invalid';
    err.status = 400;
    return next(err);
  }
  if (!mongoose.Types.ObjectId.isValid(incomeId)) {
    const err = new Error();
    err.message = 'The `incomeId` is invalid';
    err.status = 400;
    return next(err);
  }
  if (!source) {
    const err = new Error();
    err.message = 'Missing `source` in request body';
    err.status = 400;
    return next(err);
  }

  const updateIncome = {
    source,
    amount
  };

  return Income.findById(incomeId)
    .then(income => {
      if(income.source !== updateIncome.source) {
        return Income.find({source}).count()
          .then(count => {
            if(count > 0) {
              return Promise.reject({
                code: 422,
                reason: 'Validation Error',
                message: 'Income source already exists',
                location: 'source'
              });
            }
            return Income.findByIdAndUpdate(incomeId, updateIncome, {new: true});
          })
      }
    })
    .then(income => res.status(201).json(income))
    .catch(err => {
      if (err.reason === 'Validation Error') {
        return res.status(err.code).json(err);
      }
      res.status(500).json({code: 500, message: 'Internal server error'});
    });

  // return Income
  //   .findByIdAndUpdate(incomeId, updateIncome, {new: true})
  //   .then(income => res.status(201).json(income))
  //   .catch(err => {
  //     if (err.code === 11000) {
  //       err = new Error();
  //       err.message = 'Income name already exists';
  //       err.status = 400;
  //     }
  //     next(err);
  //   });
});



/* ============ DELETE (delete) an exsiting income =============== */
router.delete('/:id', (req, res, next) => {
  const userId = req.user.id;
  const incomeId = req.params.id;

  /* Validate fields in request body */
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    const err = new Error();
    err.message = 'The `userId` is missing or invalid';
    err.status = 400;
    return next(err);
  }
  if (!mongoose.Types.ObjectId.isValid(incomeId)) {
    const err = new Error();
    err.message = 'The `incomeId` is invalid';
    err.status = 400;
    return next(err);
  }

  return Income
    .findOneAndRemove({_id: incomeId, userId})
    .then(() => res.sendStatus(204).end())
    .catch(err => next(err));
});



module.exports = { router };
