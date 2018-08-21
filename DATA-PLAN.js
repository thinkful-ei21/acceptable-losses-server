/*
----------------------------------------------------------------------------------------------------------------------------------------
Users= {
  firstname,
  lastname,
  username,
  password,
  accounts:{
      id 1,
      id 2
  }

}

Accounts= {

    id 1: {
      name: Netflix
      website,
      amount: null or if known $-
      frequency,
      billing-history: [{current payment date, amount}]
      next-due: {date, amount}
    },

    id 2: {
      name:Electricity
      website,
      amount: null or if known $-
      frequency,
      billing-history: [{current payment date, amount}]
      next-due: {date, amount}
    }

}
know:current-date

Accounts 

search:-----   filter:[next-due]
------------------------


Netflix           $10

next-due= 3/2018   [pay-now]

            [+]
==================================


Electricity         TBD

next-due= 4/10    [pay-now]

            [+]
===================================
----------------------------------------------------------------------------------------------------------------------------------------
*/


/*
endpoints:

Register
POST to /users using
--------------------
req
{
  "firstname",
  "lastname",
  "username",
  "email",
  "password",
}

res
{
  "id"
  "firstname",
  "lastname,
  "username",
}


Login
POST to /login using
--------------------
req
{
  "username",
  "password"
}

res
{
  "jwt"
}



Once logged in, dashboard component does a GET on componentDidMount
GET all to /accounts (proteced endpoint)
----------------------------------------
req (made to accountSchema, findOne(userId))
{
  "userID"
}

res
{
  "account" (all accounts owned by user)
}



in dashboard, user can POST an account
POST to /bills (protected enpoint)
----------------------------------
req
{
  "name"
  "website" (optional)
  "due date"
  "amount"
  "frequency"
}

Promise {
  account.create()
  bill.create()
}

res
{
  status201
}



each user should have 1 array of just bills

3 schema:
---------

  users:
    firstname,
    lastname,
    username,
    password,

  bills:
    id,
    userId,
    boolean of paid,
    frequency,
    due date,
    amount

  accounts:
    id,
    userId,
    name,
    website,
    bills: [
      {id 1},
      {id 2},
      ...
    ]



Visualized
----------

User is logged in...

Hospital
  due 4/13/18, amount $300
  due 3/13/18, amount $400
  due 2/13/18, amount $200

Netflix
  due 4/13/18, amount $30
  due 3/13/18, amount $30
  due 2/13/18, amount $30
*/