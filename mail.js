'use strict';

const nodemailer = require('nodemailer');
const moment = require('moment');

const { Account }  = require ('./models/accounts.js');
const { User } = require('./models/users.js');

const send = (account) => {
  // our account
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'shrouded.stream@gmail.com',
      pass: 'thanosdidnothingwrong'
    }
  });

  const dueDate = moment(account.nextDue.dueDate).format('MM-DD-YYYY');

  User.findById(account.userId)
    .then(user => {
      // pass this into mail options, can populate using client data
      // user.username = 'shrouded.stream@gmail.com';
      const mailOptions = {
        from: 'shrouded.stream@gmail.com',
        to: user.username,
        subject: `Reminder! Your bill for ${account.name} is due on ${dueDate}`,
        text: `Dear ${user.firstName||'user' + ' ' + user.lastName||''},\n\tYou have a bill due on ${dueDate} for ${account.name}.  Once you pay this bill revisit the app to record your payment.\n\nSincerely,\nAcceptable Losses Staff`
      };
      console.log(mailOptions);
      // actual function call to send mail
      transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
    });
};

// Account.find()
//   .then(accounts => {
//     console.log("something");
//     const account = accounts[0];
//     // account.username = "imussg@gmail.com";
//     return send(account);
//   }).catch(err => console.log("something happened"));

module.exports = {
  sendMail: send
};

/* SAMPLE CODE SNIPPIT VIA NODEMAILER.COM

// Generate test SMTP service account from ethereal.email
// Only needed if you don't have a real mail account for testing
nodemailer.createTestAccount((err, account) => {
  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: account.user, // generated ethereal user
      pass: account.pass // generated ethereal password
    }
  });

  // setup email data with unicode symbols
  let mailOptions = {
    from: '"Your Name" <yourname@example.com>', // sender address
    to: 'user1@example.com, user2@example.com', // list of receivers
    subject: 'Test ✔', // Subject line
    text: 'Hello world?', // plain text body
    html: '<b>Hello world?</b>' // html body
  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log('Message sent: %s', info.messageId);
    // Preview only available when sending through an Ethereal account
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
    // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
  });
});

*/
