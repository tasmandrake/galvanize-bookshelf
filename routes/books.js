'use strict';

const express = require('express');

// eslint-disable-next-line new-cap
const router = express.Router();
const knex = require('../knex.js');
const bodyParser = require('body-parser');
const humps = require('humps');

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.get('/books', (req, res, next) => {
  knex('books')
    .select(
      'id',
      'title',
      'author',
      'genre',
      'description',
      'cover_url AS coverUrl',
      'created_at AS createdAt',
      'updated_at AS updatedAt'
    )
    .orderBy('title')
    .then((books) => res.send(books));
});

router.get('/books/:id', (req, res, next) => {
  const id = req.params.id;

  knex('books')
    .select(
      'id',
      'title',
      'author',
      'genre',
      'description',
      'cover_url AS coverUrl',
      'created_at AS createdAt',
      'updated_at AS updatedAt'
    )
    .where('id', id)
    .first()
    .then((book) => res.send(book));
});

router.post('/books', (req, res, next) => {
  const body = humps.decamelizeKeys(req.body);
  knex('books')
    .insert(body)
    .returning([
      'id',
      'title',
      'author',
      'genre',
      'description',
      'cover_url AS coverUrl'
    ])
    .then((newBook) => res.send(newBook[0]));
});

router.patch('/books/:id', (req, res, next) => {
  const id = req.params.id;
  const body = humps.decamelizeKeys(req.body);
  knex('books')
    .where('id', id)
    .update(body)
    .returning([
      'id',
      'title',
      'author',
      'genre',
      'description',
      'cover_url AS coverUrl'
    ])
    .then((updateBook) => res.send(updateBook[0]));
});

router.delete('/books/:id', (req, res, next) => {
  const id = req.params.id;
  knex('books')
    .where('id', id)
    .select(
      'title',
      'author',
      'genre',
      'description',
      'cover_url AS coverUrl',
      'created_at AS createdAt'
    )
    .del()
    .first()
    .then((deletedBook) => res.send(deletedBook));
});

app.use('/books' )

module.exports = router;
