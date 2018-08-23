'use strict';

const {router} = require('./auth.js');
const {localStrategy, jwtStrategy} = require('./strategies.js');

module.exports = {router, localStrategy, jwtStrategy};
