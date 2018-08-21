'use strict';
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const UserSchema = mongoose.Schema({
  firstName: {
    type: String,
    default: ''
  },
  lastName: {
    type: String,
    default: ''
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  }
});

// Customize output for `res.json(data)`, `console.log(data)` etc.
UserSchema.set('toObject', {
  virtuals: true,     
  versionKey: false,  
  transform: (doc, ret) => {
    delete ret._id; 
    delete ret.password;
  }
});

// serialized method, must be called within each res.json()
UserSchema.methods.serialize = function() {
  return {
    id: this.id,
    username: this.username,
    firstName: this.firstName || '',
    lastName: this.lastName || ''
  };
};

UserSchema.methods.validatePassword = function(password) {
  return bcrypt.compare(password, this.password);
};

UserSchema.statics.hashPassword = function(password) {
  return bcrypt.hash(password, 10);
};

module.exports = mongoose.model('User', UserSchema);
