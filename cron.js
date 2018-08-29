'use strict';
const CronJob = require('cron').CronJob;
const moment = require('moment');

const { Account } = require('./models/accounts.js');

const buildCronTime = (aMoment) => {
  let str = `${aMoment.seconds()} ${aMoment.minutes()} ${aMoment.hours()} ${aMoment.date()} * *`;
  console.log(str);
};

const cronJobCreate = (account) => {
  // create cronjob here
  let count = 0;
  let job;
  // let timing = buildCronTime(account.bills[account.bills.length-1].dueDate);
  // while(count < 5) {
  job = new CronJob('*/2 * * * * *', function() {
    count++;
    console.log(`Cron job tick #${count}! account name: ${/*account.name*/''}, time: ${moment()}`);
  }, null, true);
  job.start();
};

Account
  .find()
  .then(accounts => console.log('printing something at least'));
// console.log();
// cronJobCreate(Account.find());
// buildCronTime(moment());

const cronJobRebatch = () => {};

module.exports = {cronJobRebatch, cronJobCreate};
