'use strict';

const router = require('express').Router();
const auth = require('../auth/middleware.js');
const Role = require('../auth/roles-model.js');
const Users = require('../auth/users-model.js');

// Use to populate roles
router.post('/roles', (req, res, next) => {
  const role = new Role(req.body);
  role
    .save()
    .then(role => {
      res.send(role);
    })
    .catch(next);
});

// Use to see the virtual join -- why won't it work in `users-model.js`?
// eslint-disable-next-line
router.get('/users', auth(), (req, res, next) => {
  Users.find().then(users => {
    users.forEach(user => {
      console.log(user.capabilities[0].capabilities);
    });
  });
});

// router.get('/public-stuff') should be visible by anyone
router.get('/public-stuff', (req, res, next) => {
  res.status(200).send('Hi, this is public.');
});

// router.get('/hidden-stuff') should require only a valid login
router.get('/hidden-stuff', auth(), (req, res, next) => {
  res.status(200).send('Shhh, this is hidden.');
});

// router.get('/something-to-read') should require the read capability
router.get('/something-to-read', auth('read'), (req, res, next) => {
  res.status(200).send('Reading rainbow!');
});

// router.post('/create-a-thing) should require the create capability
router.get('/create-a-thing', auth('create'), (req, res, next) => {
  res.status(200).send('You are an artist!');
});

// router.put('/update) should require the update capability
router.put('/update', auth('update'), (req, res, next) => {
  res.status(200).send('That needed changing!');
});

// router.patch('/jp) should require the update capability
router.patch('/jp', auth('update'), (req, res, next) => {
  res.status(200).send('Patch your system.');
});

// router.delete('/bye-bye) should require the delete capability
router.delete('/bye-bye', auth('delete'), (req, res, next) => {
  res.status(200).send('Poor fella, he died so young.');
});
// router.get('/everything') should require the superuser capability
router.get(
  '/everything',
  auth('create'),
  auth('read'),
  auth('update'),
  auth('delete'),
  (req, res, next) => {
    res.status(200).send('I BOW BEFORE YOU, MASTER');
  }
);

module.exports = router;
