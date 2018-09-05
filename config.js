'use strict';

module.exports = {
  PORT: process.env.PORT || 8080,
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
  DATABASE_URL: process.env.DATABASE_URL || 'mongodb://localhost/acceptablelosses',
  TEST_DATABASE_URL:process.env.TEST_DATABASE_URL || 'mongodb://localhost/acceptablelosses',
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRY: process.env.JWT_EXPIRY || '7d',
  CLOUD_NAME: process.env.CLOUD_NAME, 
  API_KEY: process.env.API_KEY, 
  API_SECRET: process.env.API_SECRET,
  EMAIL_SERVICE: process.env.EMAIL_SERVICE,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS
};
