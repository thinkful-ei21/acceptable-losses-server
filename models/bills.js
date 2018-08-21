'use strict';

const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const BillSchema = mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isPaid: { type: Boolean, default: false },
  frequency: { type: String, default: null },
  dueDate: { type: Date, required: true },
  amount: { type: Number, required: true }
});

// Add `createdAt` and `updatedAt` fields
BillSchema.set('timestamps', true);

// Customize output for `res.json(data)`, `console.log(data)` etc.
BillSchema.set('toObject', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    delete ret._id;
  }
});

// serialized method, must be called within each res.json()
BillSchema.methods.serialize = function() {
  return {
    userId: this.userId,
    id: this.id,
    isPaid: this.isPaid,
    frequency: this.frequency || 'N/A',
    dueDate: this.dueDate,
    amount: this.amount || 'N/A'
  };
};

module.exports = mongoose.model('Bill', BillSchema);
