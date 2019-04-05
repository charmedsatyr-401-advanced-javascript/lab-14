![CF](http://i.imgur.com/7v5ASc8.png) LAB
=================================================

## Lab 14: Access Control (ACL)

### Author: Joseph Wolfe

### Links and Resources
* [PR](https://github.com/charmedsatyr-401-advanced-javascript/lab-14/pull/1)

* [![Build Status](https://travis-ci.org/charmedsatyr-401-advanced-javascript/lab-14.svg?branch=master)](https://travis-ci.org/charmedsatyr-401-advanced-javascript/lab-14)

* [front end](https://safe-inlet-71597.herokuapp.com/)

#### Documentation
* N/A

### Modules
`./src/routes/routes.js`

`./src/auth/users-model.js`

Please see previous lab documentation for more information.

-----

#### `./src/routes/routes.js`
##### Exported Values and Methods from `routes.js`
This module provides routes and associated handlers for the following authentication routes:

* `POST`
  * `/signup` → used to create a new user account
  * `/signin` → used to authenticate a session
  * `/roles` → dev route used to populate the database with `roles` records
* `GET`
  * `/public-stuff` → displays a message; publicly accessible route
  * `/hidden-stuff` → displays a message; route restricted to users with a valid login
  * `/something-to-read` → displays a message; requires the `read` capability
  * `/everything` → displays a message; requires all CRUD capabilities
  * `/users` → dev route used to test the virtual joining of `roles` and `users`
* `POST`
  * `/create-a-thing` → displays a message; requires `create` capability
* `PUT`
  * `/update` → displays a message; requires `update` capability
* `PATCH`
  * `/jp` → displays a message; requires `update` capability
* `DELETE`
  * `/bye-bye` → displays a message; requires `delete` capability

-----

#### `./src/auth/users-model.js`
##### Exported Values and Methods`
For the purpose of this lab, only the `users.methods.can(capability)` method is new. This method takes a string and checks the `capabilities` object at line 54 for a key matching the role of the user being authorized. The method returns a Boolean based on whether that string matches an entry in the corresponding value array.

Note that a virtual "join" between the `roles` and `users` database collections was attempted between lines 24 and 38. A `GET` request to `/users` demonstrates that it is functional, but it is unclear how to use this functionality to dynamically replace the `capabilities` object.

-----

#### Running the app
* Start a MongoDB database on your local machine that uses the `data` folder.
* Start the server on your local machine with `npm run start` or `npm run watch`.
* Ensure you have appropriate environmental variables set for `MONGODB_URI`, `PORT`, and `SECRET`.

###### Populating the `roles` collection
The `roles` in the collection currently take hardcoded `capabilities` from a `capabilities` object in `./src/auth/users-model.js`. However, if the virtual join between the `roles` and `users` tables were fixed, you would need to populate the `roles` collection with the following commands from `httpie` or a similar program: 

* `echo '{"role":"user", "capabilities":["read"]}' | http :3000/roles`

* `echo '{"role":"admin", "capabilities":["create","read","update","delete"]}' | http :3000/roles`

* `echo '{"role":"editor", "capabilities":["create", "read", "update"]}' | http :3000/roles`

###### Signing Up
Using the `httpie` application or a similar program, send the following commands to the server (you may use a custom username and password throughout):

`user` capabilities:
* `echo '{"username":"user", "password":"user", "role":"user"}' | http post :3000/signup`

`editor` capabilities:
* `echo '{"username":"editor", "password":"editor", "role":"editor"}' | http post :3000/signup`

`admin` capabilities:
* `echo '{"username":"admin", "password":"admin", "role":"admin"}' | http post :3000/signup`

#### Tests
* How do you run tests?
  * `npm run test`
  * `npm run test-watch`
  * `npm run lint`

* What assertions were made?
`./src/auth/router.js`:

  * `admin` users:

    ✓ can create one

    ✓ can signin with basic

    ✓ can signin with bearer

  * `editor` users

    ✓ can create one

    ✓ can signin with basic

    ✓ can signin with bearer

  * `user` users

    ✓ can create one

    ✓ can signin with basic

    ✓ can signin with bearer

* What assertions need to be / should be made?
  * Add tests to the api routes, asserting restricted access to the routes as shown.
  * Add tests to the mongoose model for the created static and instance methods.

#### UML
N/A