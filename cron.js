'use strict';

const CronJob = require('cron').CronJob;
const moment = require('moment');

const { sendMail } = require('./mail.js');
const { Account } = require('./models/accounts.js');

let cronJobs = [];

const buildCronTime = account => {
  const currentBill = account.bills[account.bills.length-1];
  let reminderDate = moment(currentBill.dueDate);
  
  if (account.reminder === 'Day Before') {
    reminderDate.subtract(48, 'hours');
  } else if (account.reminder === 'Same Day') {
    reminderDate.subtract(24, 'hours');
  } else if (account.reminder === 'Week Before') {
    reminderDate.subtract(7, 'days');
  } else {
    return null;
  }

  let str = `${reminderDate.seconds()} ${reminderDate.minutes()} ${reminderDate.hours()} ${reminderDate.date()} ${reminderDate.month()} *`;
  return str;
};

const cronJobCreate = account => {
  let job;
  let due = moment(account.bills[account.bills.length-1].dueDate);
  let reminderTime = moment();
  reminderTime = reminderTime.month(due.month()).date(due.date()).year(due.year()).add(10, 'seconds');
  account.bills[account.bills.length-1].dueDate = reminderTime.format();
  // account.reminder = "Same Day";
  // account.bills[account.bills.length-1].dueDate = moment().add(10, 'seconds').add(24, 'hours').format();
  let cronTime = buildCronTime(account);
  if(!cronTime) {
    return;
  }
  account.bills[account.bills.length-1].dueDate = reminderTime.format('MM-DD-YYYY');
  job = new CronJob(cronTime, function() {
    Account.findById(account.id)
      .then(account => {
        if(account.fireCronJob) {
          sendMail(account);
        }
      })
      .catch(err => {
        console.error(err);
      });
  });
  job.start();
  account.cronJob = job;
  cronJobs.push([account.id, job]);
  return job;
};

const updateCronJob = account => {
  let newCronJobList = [];
  let existing = cronJobs.forEach(cronJob => {
    if(account.id !== cronJob[0]) {
      newCronJobList.push(cronJob);
    }
  });
  cronJobs = [...newCronJobList];
  return cronJobCreate(account);
};

const deleteCronJob = accountId => {
  let newCronJobList = [];
  let existing = cronJobs.forEach(cronJob => {
    if(accountId !== cronJob[0]) {
      newCronJobList.push(cronJob);
    }
  });
  cronJobs = [...newCronJobList];
}

const cronJobRebatch = accounts => {
  accounts.forEach(account => {
    cronJobCreate(account);
  });
};

const cronJobsDisplay = () => {
  let str = ``;
  cronJobs.forEach(cronJob => {
    str = str + `accountId: ${cronJob[0]}, next fire: ${cronJob[1].nextDates()}\n`;
  });
  return str;
}

module.exports = {
  cronJobRebatch,
  cronJobCreate,
  updateCronJob,
  deleteCronJob,
  cronJobsDisplay
};