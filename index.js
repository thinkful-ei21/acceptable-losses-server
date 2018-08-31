'use strict';

require('dotenv').config();
const express = require('express');
const formData = require('express-form-data');
const cors = require('cors');
const morgan = require('morgan');
const passport = require('passport');

const { PORT, CLIENT_ORIGIN } = require('./config.js');
const { dbConnect } = require('./db-mongoose');
const { Account } = require('./models/accounts.js');
const { cronJobCreate } = require('./cron.js');
const { sendMail } = require('./mail.js');
// const { dbConnect } = require('./db-knex');

const { router: usersRouter } = require('./routes/users.js');
const { router: authRouter, localStrategy, jwtStrategy } = require('./passport/index.js');
const { router: accountsRouter } = require('./routes/accounts.js');
const { router: incomeRouter } = require('./routes/income.js');
const { router: imageRouter } = require('./routes/images.js');

const app = express();
app.use(express.json());
app.use(formData.parse());

app.use(
  morgan(process.env.NODE_ENV === 'production' ? 'common' : 'dev', {
    skip: (req, res) => process.env.NODE_ENV === 'test'
  })
);

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});
// app.use(
//   cors({
//     origin: CLIENT_ORIGIN
//   })
// );

passport.use(localStrategy);
passport.use(jwtStrategy);

const jwtAuth = passport.authenticate('jwt', { session: false, failWithError: true });

app.use('/api/users', usersRouter);
app.use('/api/auth', authRouter);
app.use('/api/accounts', accountsRouter);
app.use('/api/income', incomeRouter);
app.use('/api/images', imageRouter);

// Custom 404 Not Found route handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Custom Error Handler
app.use((err, req, res, next) => {
  if (err.status) {
    const errBody = Object.assign({}, err, { message: err.message });
    res.status(err.status).json(errBody);
  } else {
    if (process.env.NODE_ENV === 'development') {
      console.error(err);
    }
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

function runServer(port = PORT) {
  const server = app
    .listen(port, () => {
      console.info(`App listening on port ${server.address().port}`);
    })
    .on('error', err => {
      console.error('Express failed to start');
      console.error(err);
    });
}

if (require.main === module) {
  dbConnect()
    .then(() => {
      return Account.find();
    })
    .then(accounts => {
      sendMail(accounts[0]);
    });
  runServer();
}

module.exports = { app };
