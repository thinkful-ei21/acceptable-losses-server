'use strict';

const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const AccountSchema = mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true },
  url: { type: String, default: null },
  frequency: { type: String, required: true },
  nextDue: { 
    isPaid: { type: Boolean, default: false },
    oneTime: { type: Boolean, default: false },
    dueDate: { type: Date, required: true },
    amount: { type: Number }
  },
  bills: [{
    isPaid: { type: Boolean, default: false },
    oneTime: { type: Boolean, default: false },
    dueDate: { type: Date, required: true },
    amount: { type: Number }
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

const Account = mongoose.model('Account', AccountSchema);

module.exports = { Account };
