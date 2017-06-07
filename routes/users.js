/* eslint-disable camelcase *//* eslint-disable no-sync */

'use strict';

const express = require('express');
const bcrypt = require('bcrypt');
const knex = require('../knex.js');
const humps = require('humps');
const jwt = require('jsonwebtoken');

// eslint-disable-next-line new-cap
const router = express.Router();
const saltRounds = 10;
const secret = process.env.SECRET;

router.post('/users', (req, res) => {
  const body = humps.decamelizeKeys(req.body);

  if (!body.email) {
    return res.status(400)
              .set({ 'Content-Type': 'plain/text' })
              .send('Email must not be blank');
  }
  else if (!body.password) {
    return res.status(400)
              .set({ 'Content-Type': 'plain/text' })
              .send('Password must be at least 8 characters long');
  }
  body.password = bcrypt.hashSync(body.password, saltRounds);
  knex('users')
    .insert({
      first_name: body.first_name,
      last_name: body.last_name,
      email: body.email,
      hashed_password: body.password
    })
    .returning([
      'id',
      'first_name AS firstName',
      'last_name AS lastName',
      'email'
    ])
    .then((newUser) => {
      const token = jwt.sign(newUser[0], secret);

      res.cookie('token', token, { httpOnly: true }).send(newUser[0]);
    })
    .catch(() => {
      res.status(400)
          .set({ 'Content-Type': 'plain/text' })
          .send('Email already exists');
    });
});

module.exports = router;
