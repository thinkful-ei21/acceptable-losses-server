'use strict';

const express = require('express');
const passport = require('passport');

const { Income } = require('../models/income.js');

const router = express.Router();

const jwtAuth = passport.authenticate('jwt', { session: false, failWithError: true });

router.use('/', jwtAuth);



/* ================ GET (read) all income ================== */
router.get('/', (req, res, next) => {
  const userId = req.user.id;

  return Income
    .find({userId})
    .then(result => res.json(result))
    .catch(err => next(err));
});



/* ================== GET an income by ID =================== */
router.get('/:id', (req, res, next) => {
  const incomeId = req.params.id;
  
  return Income
    .findById(incomeId)
    .then(account => res.json(account))
    .catch(err => next(err));
});



/* =============== POST (create) a new income ================ */
router.post('/', (req, res, next) => {
  const userId = req.user.id;
  const { name, amount=0 } = req.body;

  const newIncome = {
    userId,
    name,
    amount
  };

  return Income
    .create(newIncome)
    .then(result => res.json(result))
    .catch(err => next(err));
});



/* =============== PUT (update) an existing income ================ */
router.put('/:id', (req, res, next) => {
  const incomeId = req.params.id;
  const { name, amount } = req.body;

  const updateIncome = {
    name,
    amount
  };

  return Income
    .findByIdAndUpdate(incomeId, updateIncome, {new: true})
    .then(income => res.status(201).json(income))
    .catch(err => next(err));
});



/* ============ DELETE (delete) an exsiting income ================ */
router.delete('/:id', (req, res, next) => {
  const userId = req.user.id;
  const incomeId = req.params.id;

  return Income
    .findOneAndRemove({_id: incomeId, userId})
    .then(() => res.sendStatus(204).end())
    .catch(err => next(err));
});



module.exports = { router };
