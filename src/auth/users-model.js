'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('./roles-model.js');

const SINGLE_USE_TOKENS = !!process.env.SINGLE_USE_TOKENS;
const TOKEN_EXPIRE = process.env.TOKEN_LIFETIME || '5m';
const SECRET = process.env.SECRET || 'foobar';

const usedTokens = new Set();

const users = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String },
    role: { type: String, default: 'user', enum: ['admin', 'editor', 'user'] },
  },
  { toObject: { virtuals: true }, toJSON: { virtuals: true } }
);

// The info is at user.capabilities[0].capabilities
users.virtual('capabilities', {
  ref: 'roles',
  localField: 'role',
  foreignField: 'role', // role
  justOne: false,
});

users.pre('find', function() {
  try {
    this.populate('capabilities');
  } catch (err) {
    console.error(err);
  }
});

users.pre('save', function(next) {
  bcrypt
    .hash(this.password, 10)
    .then(hashedPassword => {
      this.password = hashedPassword;
      next();
    })
    .catch(error => {
      throw new Error(error);
    });
});

const capabilities = {
  admin: ['create', 'read', 'update', 'delete'],
  editor: ['create', 'read', 'update'],
  user: ['read'],
};

users.statics.createFromOauth = function(email) {
  if (!email) {
    return Promise.reject('Validation Error');
  }

  return (
    this.findOne({ email })
      .then(user => {
        if (!user) {
          throw new Error('User Not Found');
        }
        return user;
      })
      // eslint-disable-next-line no-unused-vars
      .catch(error => {
        let username = email;
        let password = 'none';
        return this.create({ username, password, email });
      })
  );
};

users.statics.authenticateToken = function(token) {
  console.log('Authenticating Token:', token);
  if (usedTokens.has(token)) {
    return Promise.reject('Invalid Token');
  }

  try {
    let parsedToken = jwt.verify(token, SECRET);
    SINGLE_USE_TOKENS && parsedToken.type !== 'key' && usedTokens.add(token);
    let query = { _id: parsedToken.id };
    return this.findOne(query);
  } catch (e) {
    throw new Error('Invalid Token');
  }
};

users.statics.authenticateBasic = function(auth) {
  let query = { username: auth.username };
  console.log('authenticate Basic:', query);
  return this.findOne(query)
    .then(user => user && user.comparePassword(auth.password))
    .catch(error => {
      throw error;
    });
};

users.methods.comparePassword = function(password) {
  return bcrypt.compare(password, this.password).then(valid => (valid ? this : null));
};

users.methods.generateToken = function(type) {
  let token = {
    id: this._id,
    capabilities: capabilities[this.role],
    type: type || 'user',
  };

  let options = {};
  if (type !== 'key' && !!TOKEN_EXPIRE) {
    options = { expiresIn: TOKEN_EXPIRE };
  }

  return jwt.sign(token, SECRET, options);
};

users.methods.can = async function(capability) {
  return capabilities[this.role].includes(capability);
};

users.methods.generateKey = function() {
  return this.generateToken('key');
};

module.exports = mongoose.model('users', users);
