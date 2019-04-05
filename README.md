![CF](http://i.imgur.com/7v5ASc8.png) LAB
=================================================

## Lab 13: Bearer Authorization

### Author: Joseph Wolfe

### Links and Resources
* [PR](https://github.com/CharmedSatyr/lab-13/pull/1)

* [![Build Status](https://travis-ci.org/CharmedSatyr/lab-13.svg?branch=submission)](https://travis-ci.org/CharmedSatyr/lab-13)

* [front end](https://murmuring-bastion-63940.herokuapp.com/)

#### Documentation
* N/A

### Modules

`./index.js`

`./src/app.js`

`.src/auth/middleware.js`

`.src/auth/router.js`

`.src/auth/users-model.js`

`.src/middleware/404.js`

`.src/middleware/error.js`

-----

#### `./index.js`
##### Exported Values and Methods from `./index.js`
This is the entry point of the application. When the app starts, the database connections are initiated.

-----

#### `.src/app.js`
##### Exported Values and Methods from `./src/app.js`
This module instantiates the app, sets middleware, routes, and controllers, and exports an `app` and `start` method for the Express server.

-----

#### `.src/auth/middleware.js`
##### Exported Values and Methods from `middleware.js`
This authentication middleware splits the user's request headers and uses internal methods `_authBasic` and `_authenticate`, and their internal calls, to further parse and validate them. Internal method `_authError` handles errors from invalid request headers.

*Updates:*
* Now checks if `req.url` matches `/key`
  * If it does, it validates its type and triggers a new `_authKey` private function
  * If it does not, a bearer token would now trigger the `_authBearer` private function

##### `_authBearer(auth)`
This returns a new `User` static method `authenticateBearer(auth)` invoked with its `auth` argument.

`authenticateBearer` returns a promise, which resolves to a `user` object.

The `user` object is then passed to the `_authenticate` private function, and any errors are handled by `next`.

##### `_authKey(key)`
This returns a new `User` static method `authenticateKey(key)` invoked with its `key` argument.

When `authenticateKey` returns a promise, that promise resolves to a `user` object and a `key`.

The `user` object is assigned to `req.user`.

The `key` is processed by the new `user` instance method `refreshKey(key)` and assigned to `req.token`.

Once this is complete, the method invokes `next()` or `_authError()`.

Note that this method does not use the `_authenticate(user)` private function.

-----

#### `.src/auth/router.js`
##### Exported Values and Methods from `router.js`
This module provides routes and associated handlers for the following authentication routes:

* `/signup` → used to create a new user account
* `/signin` → used to authenticate a session

Both of these routes take `POST` requests.

The module exports an Express `router` object used in `./src/app.js`.

*Updates:*
* Add `/` route with a static message.

* Add `/key` route that triggers different validation in the `auth` middleware

-----

#### `.src/auth/users-model.js`
##### Exported Values and Methods from `users-model.js`
This module defines a mongoose schema `Users` with the following properties:
```
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String },
  role: { type: String, required: true, default: 'user', enum: ['admin', 'editor', 'user'] },
```

It then adds a custom pre-save hook and the additional custom methods `authenticateBasic`, `comparePassword`, and `generateToken`, used in authentication and session management.

*Updates:*
##### `users.statics.authenticateKey(token)` method
This method takes a token and parses it with the `jwt.verify` method.

It takes the user's `id` from the parsed key and uses mongoose's `findById(id)` method to locate the user's record in the database.

Once the promise from `findById` resolves into the `user` object, that object is added to an object that includes the `key: parsedKey` key-value pair, where `parsedKey` is the previous result of `jwt.verify`.

The new object is returned to the `_authKey` private function in `middleware.js`.

##### `users.generateToken()` method
This method now imposes an expiration date of 15 minutes on new tokens.

##### `users.authenticateBearer(token)` method
This method parses the token using the `jwt.verify` method.

It takes the user's `id` from the parsed token and uses mongoose's `findById(id)` method to locate the user's record in the database. Once the promise of `findById` resolves into the `user` object, that object is returned to the `_authBearer` method in `middleware.js`.

##### `users.refreshKey(key)` method
This method creates a new object from the key (a JWT token) it receives. It then deletes the `iat` and `exp` properties from the new key, which corresponds to the "Issued At" and "Expiration" JWT payload claims. It then uses `jwt.sign` to re-sign the key. This way of handling the key is intended to make it harder to determine the age of the token or cause the token to expire due to age.

-----

#### `.src/middleware/404.js`
##### Exported Values and Methods from `404.js`
Unknown path fallback middleware.

-----

#### `./src/middleware/error.js`
##### Exported Values and Methods from `error.js`
Server error handling middleware.

-----


#### Running the app
* Start a MongoDB database on your local machine that uses the `data` folder.
* Start the server on your local machine with `npm run start` or `npm run watch`.

###### Signing Up
Using the `httpie` package or a similar program, send the following command to the server (you may use a custom username and password throughout):

* `echo '{"username":"student", "password":"codefellows"}' | http post :3000/signup`

You will receive a `token` in return.

###### Signing In
Using the `httpie` package or a similar program, send the following command to the server:

* `http post :3000/signin "Authorization: Bearer <token>"`

Substitute the `token` received when signing up for `<token>` in the above command.

This will return a token that expires in 15 minutes. You can use it for signing in before it expires.


###### Obtaining a permanent Authentication Key
Using the `httpie` package or a similar program, send the following command to the server:

* `http post :3000/key "Authorization: Bearer <token>"`

Substitute a valid `token` for `<token>` in the above command.

This will return a token that does not expire and which has its "Issued At" and "Expires" JWT payload claims deleted or reset on each login, making it difficult to tell the age of the authentication key.

#### Tests
* How do you run tests?
  * `npm run test`
  * `npm run test-watch`
  * `npm run lint`

* What assertions were made?

  * The `auth` middleware is tested to properly authenticate users using Basic authentication, given correct and incorrect credentials.
  * The `router` middleware is tested to ensure it sends a token in response to `POST` requests to the `/signup` and `/signin` requests.

* What assertions need to be / should be made?
  * Unit and end-to-end testing for the error-handling middleware could be implemented.  
  * New routes `/` and `/keys` could be tested.
  * Formal tests could be written for the following:
    * Given a good token, user is able to “log in” and receive a new token.
    * Tokens can optionally be expired
    * Expired tokens do not allow a user to login
    * Auth Keys can login a user as a token would
    * Auth Keys do not expire

#### UML
N/A