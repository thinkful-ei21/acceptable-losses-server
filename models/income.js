'use strict';

const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const IncomeSchema = mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true },
  amount: { type: Number, required: true }
});

// Add `createdAt` and `updatedAt` fields
IncomeSchema.set('timestamps', true);

// Customize output for `res.json(data)`, `console.log(data)` etc.
IncomeSchema.set('toObject', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    delete ret._id;
  }
});

// serialized method, must be called within each res.json()
IncomeSchema.methods.serialize = function() {
  return {
    userId: this.userId,
    id: this.id,
    name: this.name,
    amount: this.amount
  };
};

const Income = mongoose.model('Income', IncomeSchema);

module.exports = { Income };
