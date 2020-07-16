const { Schema, model } = require('mongoose');

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
});

const pollOptionSchema = new Schema({
  text: {
    type: 'String',
    trim: true,
    required: true,
  },
  index: {
    type: 'Number',
    required: true,
  }
});

const voteSchema = new Schema({
  voter_id: {
    type: 'String',
    trim: true,
    required: true,
  },
  selected: {
    type: 'String',
    trim: true,
    required: true,
  }
});

const pollSchema = new Schema({
  pollster: {
    type: 'String',
    trim: true,
    index: true,
    required: true, 
  },
  question: {
    type: 'String',
    trim: true,
    required: true,
  },
  options: [pollOptionSchema],
  ballot: [voteSchema],
});

const user = model('user', userSchema);
const poll = model('poll', pollSchema);

module.exports = { user, poll };