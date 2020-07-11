/* eslint-disable no-undef */
require('dotenv').config();

const mongoose = require('mongoose');
const { assert } = require('chai');
const fetch = require('node-fetch');

const { user } = require('../models');

describe('Authentication and Registration', () => {
  before((done) => {
    mongoose.connect(process.env.MONGODB_URL, { 
      useNewUrlParser: true, 
      useUnifiedTopology: true,
      useCreateIndex: true
    })
      .then(() => {
        user.deleteOne({ name : 'Vighnesh Nayak S' }, (err) => {
          if (err)
            done(err);
          else
            done();
        });
    })
      .catch((err) => {
        done(err);
    });
  });
  
  beforeEach((done) => {
    setTimeout(() => { done(); }, 500);
  });

  after((done) => {
    user.deleteOne({ name : 'Vighnesh Nayak S' }, (err) => {
      if (err) {
        done(err);
      } else {
        mongoose.connection.close();
        done();
      }
    });    
  });

  describe('Registration', () => {
    it('should register {Vighnesh Nayak S, vighneshsnayak@gmail.com, 12345678, 12345678}', (done) => {
      fetch('http://localhost:3000/users/sign-up', {
        method: 'POST',
        headers: { 'Content-type': 'application/json; charset=utf-8' },
        body: JSON.stringify({
          name: 'Vighnesh Nayak S',
          email: 'vighneshsnayak@gmail.com',
          password: '12345678',
          re_password: '12345678',
        }),
      })
        .then((res) => res.json())
        .then((res) => {
          assert.strictEqual(res.error, false, 'Error while registration');
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
    it('should not re-register {Vighnesh Nayak S, vighneshsnayak@gmail.com, 12345679, 12345679}', (done) => {
      fetch('http://localhost:3000/users/sign-up', {
        method: 'POST',
        headers: { 'Content-type': 'application/json; charset=utf-8' },
        body: JSON.stringify({
          name: 'Vighnesh Nayak S',
          email: 'vighneshsnayak@gmail.com',
          password: '12345679',
          re_password: '12345679',
        }),
      })
        .then((res) => res.json())
        .then((res) => {
          assert.strictEqual(res.error, true, 'Duplicate registration detected');
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
    it('should fail to register {Vighnesh N555k S, vighneshsnayak@gmail.com, 12345678, 12345678}', (done) => {
      fetch('http://localhost:3000/users/sign-up', {
        method: 'POST',
        headers: { 'Content-type': 'application/json; charset=utf-8' },
        body: JSON.stringify({
          name: 'Vighnesh N555k S',
          email: 'vighneshsnayak@gmail.com',
          password: '12345678',
          re_password: '12345678',
        }),
      })
        .then((res) => res.json())
        .then((res) => {
          assert.strictEqual(res.error, true, 'Duplicate registration detected');
          done();
        })
        .catch((err) => {
          done(err);
        });
    });        
  });

  describe('Authentication', () => {
    it('should authenticate {Vighnesh Nayak S, 12345678}', (done) => {
      fetch('http://localhost:3000/users/sign-in', {
        method: 'POST',
        headers: { 'Content-type': 'application/json; charset=utf-8' },
        body: JSON.stringify({
          name: 'Vighnesh Nayak S',
          password: '12345678',
        }),
      })
        .then((res) => res.json())
        .then((res) => {
          assert.strictEqual(res.error, false, 'Error while authentication');
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
    it('should not authenticate {Vighnesh Nayak S, 12345679}', (done) => {
      fetch('http://localhost:3000/users/sign-in', {
        method: 'POST',
        headers: { 'Content-type': 'application/json; charset=utf-8' },
        body: JSON.stringify({
          name: 'Vighnesh Nayak S',
          password: '12345679',
        }),
      })
        .then((res) => res.json())
        .then((res) => {
          assert.strictEqual(res.error, true, 'Wrong password authenticated');
          done();
        })
        .catch((err) => {
          done(err);
        });
    });    
  });
});