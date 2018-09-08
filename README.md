# Acceptable Losses Server

## Table of Contents
- [Introduction](#introduction)
- [Tech Stack](#tech-stack)
- [Server Structure](#app-structure)
- [Data Models](#data-models)
  - [User Schema](#user-schema)
  - [Account Schema](#account-schema)
  - [Income Schema](#income-schema)
- [API Endpoints](#api-endpoints)
  - [Users](#users)
  - [Authentication](#authentication)
  - [Accounts](#accounts)
  - [Income](#income)
  - [Image Upload](#image-upload)

## Introduction
This is the server documentation for [Acceptable Losses](https://acceptable-losses-client.herokuapp.com), a bill tracking app complete with reminder capabilities and graphical representation of your expenses against income.

## Tech Stack
Acceptable Losses server is powered by the following,
* Node
* Express
* MongoDB
* Mongoose
* Morgan
* Passport
* BCryptJS
* JSONWebToken
* Moment
* Cron
* NodeMailer
* Cloudinary
* dotEnv
* Mocha
* Chai

## App Structure
Acceptable Losses follows Node's convention of processing codes from top to bottom and left to right. The most-used routes will be placed at top, followed by lesser-used routes, and finally error handlers.

Route hierarchy is as follows,
```
Users
Authentication
Accounts
Income
Images
Error Handlers
```

Application data is persisted via MongoDB. Document mapping is handled by Mongoose. RESTful API architecture is also used for data creation and retrieval.

## Data Models
Acceptable Losses employs Mongoose document schema to construct its data models: users, accounts (such as a bill and its payment history), and income. User documents dictates the existence of other documents as a user ID is required for their creation.

### User Schema
```
username: {
  type: String,
  required: true,
  unique: true
},
password: { type: String, required: true },
firstName: { type: String, default: '' },
lastName: { type: String, default: '' },
profilePic: {
  public_id: { type: String, default: '' },
  secure_url: { type: String, default: '' }
}
```
While `username` is stored as a string, its route handlers will ensure that it is a proper email format.

### Account Schema
```
userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
name: { type: String, required: true },
url: { type: String, default: null },
frequency: { type: String, required: true },
reminder: { type: String, default: null },
nextDue: {
  isPaid: { type: Boolean, default: false },
  dueDate: { type: String, default: '' },
  datePaid: { type: String, default: null },
  amount: { type: Number, default: 0 }
},
bills: [
  {
    isPaid: { type: Boolean, default: false },
    dueDate: { type: String, default: '' },
    datePaid: { type: String, default: null },
    amount: { type: Number, default: 0 }
  }
],
fireCronJob: { type: Boolean, default: true }
```
Front end uses `nextDue` as reference of when and how much a bill is due. The `bills` array is representation of bill history.

### Income Schema
```
userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
source: { type: String, required: true },
amount: { type: Number, required: true, default: 0 }
```
Income is used for comparison against expenses, and should be entered at the monthly amount.

## API Endpoints
All requests and responses are in JSON format.

Action | Path |
--- | --- |
Users | https://acceptable-losses-server.herokuapp.com/api/users |
Authentication | https://acceptable-losses-server.herokuapp.com/api/auth |
Accounts | https://acceptable-losses-server.herokuapp.com/api/accounts |
Income | https://acceptable-losses-server.herokuapp.com/api/income |
Image upload | https://acceptable-losses-server.herokuapp.com/api/images |

### Users
`POST` request to endpoint `/` is for creating user documents. It accepts the following request body,
```
{
  username,
  password,
  firstName, // optional
  lastName // optional
}
```
`username` will be rejected if it is not a unique email. Once a user document is successfully created, this will be the server's response.
```
{
  id,
  username,
  firstName,
  lastName,
  profilePic
}
```
`profilePic` is an object for storing a user's profile picture on Cloudinary's server.

`PUT` request to endpoint `/settings` will modify a user's info. It accepts the following request body,
```
{
  username,
  firstName, // optional
  lastName // optional
}
```
This route will once again ensure that `username` is a unique email.

`PUT` request to endpoint `/password` will modify a user's password. It accepts the following request body,
```
{
  oldPassword,
  newPassword
}
```
This route will make sure that old password matches with current password before hashing and reassigning the new password.

`DELETE` request to endpoint `/delete` will remove a user entirely from the database. This will also remove all account and income documents owned by the user, along with his/her profile picture from Cloudinary's server.

### Authentication
`POST` to `/login` endpoint for creation of JWT. It accepts the following request body,
```
{
  username,
  password
}
```
This endpoint takes in the username and verifies the password. When validated, the server will respond with a token,
```
{
  authToken
}
```

`POST` to `/refresh` will send back another token with a newer expiriation. No request body is necessary as an existing and valid JWT must be provided to access this endpoint.

### Accounts
`POST` to `/` will create an account document. Analogous to a vendor account, this document contains a name, next due date, amount, and billing history. It accepts the following request body,
```
{
  name,
  url, // optional
  frequency,
  dueDate,
  reminder,
  amount
}
```

`GET` request to `/` and `/:id` will return an array of all or one account document belonging to a user, respectively, with `:id` being the account's ID.

`PUT` request to `/:id` will modify propertys of an account document of the same ID. It accepts the following request body,
```
{
  name,
  url, // optional
  frequency,
  dueDate, // optional
  reminder,
  amount // optional
}
```

`PUT` request to `/bills/:id` will update the bill history. This path is used specifically by the client-side to mark a bill as paid. Doing so will take an account's `nextDue`, increase it by a value based on its `frequency` (a month for example), mark it as paid on the current date, and push it into the `bills` array, thus adding to its history. Request body is optional,
```
{
  amount // optional
}
```
If no amount is sent, default value of `0` will be entered so the user can modify it later.

`DELETE` request to `/:id` will delete an account document with the same ID. The server will respond with status 204 whether or not the account exists.

### Income
`POST` request to `/` will create an income document. This is for comparison against monthly expenses, thus `amount` value should be per monthly basis. Income name is stored as `source`. It accepts the following request body,
```
{
  source,
  amount
}
```

`PUT` request to `/:id` will update an existing income document, with `:id` being the the income's ID. It accepts the following request body,
```
{
  source,
  amount
}
```

`GET` request to `/` and `/:id` will return an array of all or one income data belonging to a user, respectively, with `:id` being the income's ID.

`DELETE` request to `/:id` will delete an income document with the same ID. The server will respond with status 204 whether or not the income exists.

### Image Upload
`POST` request to `/upload` will create a profile picture by uploading a picture file (chosen by the user) directly into the app's Cloudinary account. Client-side will provide the request file via `FormData`, thus no additional content is needed in the request body. Once successful, `profilePic` property of the user document will be updated with a `public_id` and `secure_url`, which is used as reference to load a photo from Cloudinary.
```
{
  id,
  username,
  firstName,
  lastName,
  profilePic: {
    public_id,
    secure_url
  }
}
```
If a user already has an existing profile picture, sending request to this route with another file will replace the previous photo from Cloudinary's server with a new one.

`DELETE` request to `/delete` will remove a user's profile picture from Cloudinary's server and set the `public_id` and `secure_url` properties within the user's `profilePic` object into an empty string.
