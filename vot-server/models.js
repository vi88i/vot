const { Schema, model } = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new Schema({
  name: {
    type: 'String',
    trim: true,
    index: true,
    required: true, 
  },
  email: {
    type: 'String',
    trim: true,
    required: true,
  },
  password: {
    type: 'String',
    trim: true,
    required: true,
  },
}, {
  collection: 'poll_users',
});

const user = model('user', userSchema);

module.exports = { user };