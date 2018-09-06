'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const { app } = require('../index.js');
const { TEST_DATABASE_URL, JWT_SECRET } = require('../config.js');
const { User } = require('../models/users.js');

chai.use(chaiHttp);
const expect = chai.expect;

