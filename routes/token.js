/* eslint-disable no-sync */

'use strict';

require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const knex = require('../knex.js');

// eslint-disable-next-line new-cap
const router = express.Router();
const secret = process.env.SECRET;

router.use(cookieParser());
router.use(bodyParser.urlencoded({
  extended: false
}));
router.use(bodyParser.json());

router.get('/token', (req, res) => {
  const token = req.cookies.token;

  jwt.verify(token, secret, (err) => {
    if (err) {
      res.set({ 'Content-Type': 'application/json' }).send('false');
    }
    else {
      res.set({ 'Content-Type': 'application/json' }).send('true');
    }
  });
});

router.post('/token', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email) {
    return res.status(400)
              .set({ 'Content-Type': 'plain/text' })
              .send('Email must not be blank');
  }
  else if (!password) {
    return res.status(400)
              .set({ 'Content-Type': 'plain/text' })
              .send('Password must not be blank');
  }
  knex('users')
    .where('email', email)
    .then((user) => {
      const hashpw = user[0].hashed_password;

      if (bcrypt.compareSync(password, hashpw)) {
        const userInfo = {
          id: user[0].id,
          firstName: user[0].first_name,
          lastName: user[0].last_name,
          email: user[0].email
        };
        const token = jwt.sign(userInfo, secret);

        res.cookie('token', token, { httpOnly: true }).send(userInfo);
      }
      else {
        res.status(400)
            .set({ 'Content-Type': 'plain/text' })
            .send('Bad email or password');
      }
    }).catch((error) => {
      if (error) {
        res.status(400)
            .set({ 'Content-Type': 'plain/text' })
            .send('Bad email or password');
      }
    });
});

router.delete('/token', (req, res) => {
  res.cookie('token', '').send();
});

module.exports = router;
