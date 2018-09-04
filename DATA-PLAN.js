'use strict';

const moment = require('moment');


/*
sample add date: 2018-01-01T12:00:00-07:00

{
	"username": "bruce.wayne@wayne_enterprises.org",
	"password": "password123",
	"firstName": "Bruce",
	"lastName": "Wayne"
}

{
  "profilePic": {
    "public_id": "",
    "secure_url": ""
  },
  "firstName": "Bruce",
  "lastName": "Wayne",
  "username": "bruce.wayne@wayne_enterprises.org",
  "id": "5b8ec9eef6a29504d3495b31"
}
*/



/*
Sample Response from cloudinary upon successful upload
{ public_id: 'cq3cdq9khscgnlchxrvj', <--- need this
  version: 1535657906,
  signature: '31c443048ae695b8ee98561a40df9adfb69652a8',
  width: 1024,
  height: 768,
  format: 'png',
  resource_type: 'image',
  created_at: '2018-08-30T19:38:26Z',
  tags: [],
  bytes: 390071,
  type: 'upload',
  etag: 'cddacd720c5d6421e1ec9a4b3bf5eff1',
  placeholder: false,
  url: 'http://res.cloudinary.com/shroudedstream/image/upload/v1535657906/cq3cdq9khscgnlchxrvj.png',
  secure_url: 'https://res.cloudinary.com/shroudedstream/image/upload/v1535657906/cq3cdq9khscgnlchxrvj.png', <-- need this
  original_filename: '7QcpQjIJp2G0NGd7S__rN1Nc' }
*/

/*
Uses a regular expression (regex) to check whether it looks enough like an email address

^\S+@\S+$
^ Matches the start the text
\S+ Matches one or more non-whitespace characters before the @
@ A literal at sign
\S+ Matches one or more non-whitespace characters after the @
$ Matches the end of the text

[\w-]+@([\w-]+\.)+[\w-]+
Simple email validator expression
Matches joe@aol.com | a@b.c

^\w+[\w-\.]*\@\w+((-\w+)|(\w*))\.[a-z]{2,3}$
Another validattion for proper email format
Matches: bob-smith@foo.com | bob.smith@foo.net | bob_smith@foo.edu
Non-matches: -smith@foo.com | .smith@foo.com | smith@foo_com
*/

// const validEmail = value => /^\w+[\w-\.]*\@\w+((-\w+)|(\w*))\.[a-z]{2,3}$/.test(value) ? true : false;
// console.log(validEmail('bruce.wayne@wayne_enterprises.com'));

/*
Regex if you want to ensure URL starts with HTTP/HTTPS:
https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)
*/

// const validUrl = value => /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/.test(value) ? true : false;
// console.log(validUrl('http://imussg@gmail'));

const currBill = { dueDate: ''};
const interval = 1;

moment(currBill.dueDate).add(interval, 'month').format('MM-DD-YYYY')