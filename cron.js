'use strict';
const CronJob = require('cron').CronJob;
const moment = require('moment');
const { sendMail } = require('./mail.js');

const { Account } = require('./models/accounts.js');
// reminder: ['no-reminder': null, 'day-before': -24 hours, 'same-day': -48 hours, 'week-before': -7 days]
const buildCronTime = (account) => {
	const currentBill = account.bills[account.bills.length-1];
	let reminderDate = moment(currentBill.dueDate);
	if(account.reminder === "no-reminder") {
		return null;
	} else if(account.reminder === "day-before") {
		reminderDate.subtract(48, 'hours');
	} else if(account.reminder === "same-day") {
		reminderDate.subtract(24, 'hours');
	} else if(account.reminder === "week-before") {
		reminderDate.subtract(7, 'days');
	} else {
		return null;
	}
  let str = `${reminderDate.seconds()} ${reminderDate.minutes()} ${reminderDate.hours()} ${reminderDate.date()} * *`;
  // console.log(str);
  // console.log(reminderDate.format());
  // console.log(`seconds: ${reminderDate.seconds()}`);
  // console.log(`minutes: ${reminderDate.minutes()}`);
  // console.log(`hours: ${reminderDate.hours()}`);
  // console.log(`str: ${str}`);
  return str;
};
// delete user, username will be email address
const cronJobCreate = (account) => {
  // create cronjob here
  let count = 0;
  let job;
  account.reminder = "same-day";
  let now = moment();
  now.add(1, 'days');
  now.add(10, 'seconds');
  account.bills[account.bills.length-1].dueDate = moment().add(10, 'seconds').add(24, 'hours').format();
  // console.log(account.bills[account.bills.length-1].dueDate);
  let cronTime = buildCronTime(account);
  // return;
  // let timing = buildCronTime(account.bills[account.bills.length-1].dueDate);
  // while(count < 5) {
  job = new CronJob(cronTime, function() {
  	// create and send email logic here
    console.log(`Single tick of the cron job executed! Reminder date: ${cronTime}`);
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
