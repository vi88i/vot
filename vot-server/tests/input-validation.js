/* eslint-disable no-undef */
const { assert } = require('chai');
const { signUpSchema, signInSchema } = require('../json-schema');

describe('JSON input validation', () => {
  describe('Sign up', () => {
    it('{Vighnesh Nayak S, vighneshsnayak@gmail.com, 12345678, 12345678} should pass', (done) => {
      const { error } = signUpSchema.validate({ 
        name: 'Vighnesh Nayak S',
        email: 'vighneshsnayak@gmail.com',
        password: '12345678',
        re_password: '12345678', 
      });
      assert.isUndefined(error, error);
      done();
    });
    it('{Vighnesh Nayak S, vighneshsnayak@gmail.com, 123456$5, 12345678} should fail', (done) => {
      const { error } = signUpSchema.validate({ 
        name: 'Vighnesh Nayak S',
        email: 'vighneshsnayak@gmail.com',
        password: '123546$5', 
        re_password: '12345678',
      });
      assert.isDefined(error, 'Failure case passed');
      done();
    });
    it('{Vighnesh Nayak S, vighneshsnayak@gmail.co, 12345678, 12345678} should fail', (done) => {
      const { error } = signUpSchema.validate({ 
        name: 'Vighnesh Nayak S',
        email: 'vighneshsnayak@gmail.co',
        password: '12345678',
        re_password: '12345678', 
      });
      assert.isDefined(error, 'Failure case passed');
      done();
    });
    it('{Vighnesh Nay5k S, vighneshsnayak@gmail.com, 12345678, 12345678} should fail', (done) => {
      const { error } = signUpSchema.validate({ 
        name: 'Vighnesh Nay5k S',
        email: 'vighneshsnayak@gmail.com',
        password: '12345678',
        re_password: '12345678', 
      });
      assert.isDefined(error, 'Failure case passed');
      done();
    });
    it('{Vighnesh Nayak S, vighneshsnayak@gmail.com, 12345678, 12345679} should fail', (done) => {
      const { error } = signUpSchema.validate({ 
        name: 'Vighnesh Nayak S',
        email: 'vighneshsnayak@gmail.com',
        password: '12345678',
        re_password: '12345679', 
      });
      assert.isDefined(error, 'Failure case passed');
      done();
    });                
  });

  describe('Sign in', () => {
    it('{Vighnesh Nayak S, 12345678} should pass', (done) => {
      const { error } = signInSchema.validate({ 
        name: 'Vighnesh Nayak S',
        password: '12354678', 
      });
      assert.isUndefined(error, error);
      done();
    });
    it("{Vighnesh Nayak S, '--12345678} should fail", (done) => {
      const { error } = signInSchema.validate({ 
        name: 'Vighnesh Nayak S',
        password: "'--12345678", 
      });
      assert.isDefined(error, 'Failure case passed');
      done();
    });
    it('{Vighnesh Naya<script>k S, 12345678} should fail', (done) => {
      const { error } = signInSchema.validate({ 
        name: 'Vighnesh Naya<script>k S',
        password: '12345678', 
      });
      assert.isDefined(error, 'Failure case passed');
      done();
    });                
  });
});