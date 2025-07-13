'use strict';

var assert = require('assert');
var request = require('supertest');
var webServer = require('../lib/webServer');

describe('Web Server Login', function() {
  var app = webServer.app;

  describe('GET /', function() {
    it('should show login form when not authenticated', function(done) {
      request(app)
        .get('/')
        .expect(200)
        .expect(/Web Explorer Login/)
        .expect(/Username/)
        .expect(/Password/)
        .end(done);
    });
  });

  describe('POST /login', function() {
    it('should login with valid credentials', function(done) {
      request(app)
        .post('/login')
        .send({ username: 'admin', password: 'password123' })
        .expect(302)
        .expect('Location', '/')
        .end(done);
    });

    it('should reject invalid credentials', function(done) {
      request(app)
        .post('/login')
        .send({ username: 'admin', password: 'wrongpass' })
        .expect(200)
        .expect(/Login Failed/)
        .end(done);
    });
  });

  describe('API endpoints', function() {
    describe('GET /api/status', function() {
      it('should return authentication status', function(done) {
        request(app)
          .get('/api/status')
          .expect(200)
          .expect(function(res) {
            assert.equal(res.body.authenticated, false);
            assert.equal(res.body.user, null);
          })
          .end(done);
      });
    });

    describe('POST /api/login', function() {
      it('should login via API with valid credentials', function(done) {
        request(app)
          .post('/api/login')
          .send({ username: 'user', password: 'mypass' })
          .expect(200)
          .expect(function(res) {
            assert.equal(res.body.success, true);
            assert.equal(res.body.user, 'user');
          })
          .end(done);
      });

      it('should reject invalid credentials via API', function(done) {
        request(app)
          .post('/api/login')
          .send({ username: 'user', password: 'wrongpass' })
          .expect(401)
          .expect(function(res) {
            assert.equal(res.body.error, 'Invalid credentials');
          })
          .end(done);
      });
    });

    describe('POST /api/logout', function() {
      it('should logout successfully', function(done) {
        request(app)
          .post('/api/logout')
          .expect(200)
          .expect(function(res) {
            assert.equal(res.body.success, true);
          })
          .end(done);
      });
    });
  });

  describe('Protected routes', function() {
    it('should require authentication for /api/explore', function(done) {
      request(app)
        .post('/api/explore')
        .send({ url: 'http://example.com', depth: 0 })
        .expect(401)
        .expect(function(res) {
          assert.equal(res.body.error, 'Authentication required');
        })
        .end(done);
    });
  });
});