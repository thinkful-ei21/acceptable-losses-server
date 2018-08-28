'use strict';

const { Account } = require('../models/accounts.js');

module.exports = {
  cronJobRebatch: function() {
    Account.find()
      .then(accounts => {
        // recreate all cron jobs based on the "reminder", "dueDate" fields
      });
  },
  cronJobCreate: function(account) {
    // create cronjob here
  }
};
