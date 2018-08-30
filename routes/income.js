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

  // Validate Mongoose Object Id
  const ids = [userId];
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
  return Income
    .find({userId})
    .then(income => res.json(income))
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



/* ===================== GET an income by ID ===================== */
router.get('/:id', (req, res, next) => {
  const userId = req.user.id;
  const incomeId = req.params.id;

  // Validate Mongoose Object Id
  const ids = [userId, incomeId];
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
  return Income
    .findById(incomeId)
    .then(income => res.json(income))
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



/* ================= POST (create) a new income ================== */
router.post('/', (req, res, next) => {
  const userId = req.user.id;
  const { source, amount=0 } = req.body;

  // Validate fields in request body
  const requiredFields = ['source', 'amount'];
  const missingField = requiredFields.find(field => !(field in req.body));
  if (missingField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: `Missing field: ${missingField}`,
      location: missingField
    });
  }

  // Validate Mongoose Object Id
  const ids = [userId];
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
  const newIncome = {
    userId,
    source,
    amount
  };

  return Income
    .find({userId, source})
    .countDocuments()
    .then(count => {
      if (count > 0) {
        return Promise.reject({
          code: 422,
          reason: 'ValidationError',
          message: 'Income source already exists',
          location: 'source'
        });
      }
      return Income.create(newIncome);
    })
    .then(income => res.json(income))
    .catch(err => {
      if (err.reason === 'ValidationError') {
        return res.status(err.code).json(err);
      }
      res.status(500).json({
        code: 500,
        message: 'Internal server error'
      });
    });

  // original way to create if mongoose compound index works
  // return Income
  //   .create(newIncome)
  //   .then(income => res.json(income))
  //   .catch(err => {
  //     if (err.code === 11000) {
  //       err = new Error();
  //       err.reason = 'ValidationError';
  //       err.message = 'Income source already exists';
  //       err.location = 'source';
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

  // Validate fields in request body
  const requiredFields = ['source', 'amount'];
  const missingField = requiredFields.find(field => !(field in req.body));
  if (missingField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: `Missing field: ${missingField}`,
      location: missingField
    });
  }

  // Validate Mongoose Object Id
  const ids = [userId];
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
  const updateIncome = {
    source,
    amount
  };

  return Income
    .findById(incomeId)
    .then(income => {
      if (income.source === updateIncome.source) {
        return Income.findByIdAndUpdate(incomeId, updateIncome, {new: true});
      }
      else if (income.source !== updateIncome.source) {
        return Income
          .find({userId, source})
          .countDocuments()
          .then(count => {
            if (count > 0) {
              return Promise.reject({
                code: 422,
                reason: 'ValidationError',
                message: 'Income source already exists',
                location: 'source'
              });
            }
            return Income.findByIdAndUpdate(incomeId, updateIncome, {new: true});
          });
      }
    })
    .then(income => res.status(201).json(income))
    .catch(err => {
      if (err.reason === 'ValidationError') {
        return res.status(err.code).json(err);
      }
      res.status(500).json({
        code: 500,
        message: 'Internal server error'
      });
    });

  // original way to update if mongoose compound index works
  // return Income
  //   .findByIdAndUpdate(incomeId, updateIncome, {new: true})
  //   .then(income => res.status(201).json(income))
  //   .catch(err => {
  //     if (err.code === 11000) {
  //       err = new Error();
  //       err.reason = 'ValidationError';
  //       err.message = 'Income source already exists';
  //       err.location = 'source';
  //       err.status = 400;
  //     }
  //     next(err);
  //   });
});



/* ============ DELETE (delete) an exsiting income =============== */
router.delete('/:id', (req, res, next) => {
  const userId = req.user.id;
  const incomeId = req.params.id;

  // Validate Mongoose Object Id
  const ids = [userId, incomeId];
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
  return Income
    .findOneAndRemove({_id: incomeId, userId})
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
