'use strict';

const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const AccountSchema = mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true },
  url: { type: String, default: null },
  bills: [{
    isPaid: { type: Boolean, default: false },
    frequency: { type: String, required: true },
    dueDate: { type: Date, required: true },
    amount: { type: Number, required: true }
  }]
});

// Add `createdAt` and `updatedAt` fields
AccountSchema.set('timestamps', true);

// Customize output for `res.json(data)`, `console.log(data)` etc.
AccountSchema.set('toObject', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    delete ret._id;
  }
});

// serialized method, must be called within each res.json()
AccountSchema.methods.serialize = function() {
  return {
    userId: this.userId,
    id: this.id,
    name: this.name,
    url: this.url || 'N/A',
    bills: this.bills || []
  };
};

const Account = mongoose.model('Bill', AccountSchema);

module.exports = { Account };
