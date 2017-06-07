'use strict';

const knex = require('../knex.js');
const bodyParser = require('body-parser');
const humps = require('humps');
const express = require('express');

// eslint-disable-next-line new-cap
const router = express.Router();

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.get('/books', (req, res) => {
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

router.get('/books/:id', (req, res) => {
  const id = req.params.id;

  if (!Number(id)) {
    return res.status(404)
              .set({ 'Content-Type': 'plain/text' })
              .send('Not Found');
  }
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
    .then((book) => {
      if (!book.length) {
        return res.status(404)
                  .set({ 'Content-Type': 'plain/text' })
                  .send('Not Found');
      }
      res.send(book[0]);
    });
});

router.post('/books', (req, res) => {
  const body = humps.decamelizeKeys(req.body);

  if (!body.title) {
    return res.status(400)
              .set({ 'Content-Type': 'plain/text' })
              .send('Title must not be blank');
  }
  else if (!body.author) {
    return res.status(400)
              .set({ 'Content-Type': 'plain/text' })
              .send('Author must not be blank');
  }
  else if (!body.genre) {
    return res.status(400)
              .set({ 'Content-Type': 'plain/text' })
              .send('Genre must not be blank');
  }
  else if (!body.description) {
    return res.status(400)
              .set({ 'Content-Type': 'plain/text' })
              .send('Description must not be blank');
  }
  else if (!body.cover_url) {
    return res.status(400)
              .set({ 'Content-Type': 'plain/text' })
              .send('Cover URL must not be blank');
  }
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

router.patch('/books/:id', (req, res) => {
  const id = req.params.id;
  const body = humps.decamelizeKeys(req.body);

  if (!Number(id)) {
    return res.status(404)
              .set({ 'Content-Type': 'plain/text' })
              .send('Not Found');
  }
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
    .then((updateBook) => res.send(updateBook[0]))
    .catch((error) => {
      if (error) {
        return res.status(404)
                  .set({ 'Content-Type': 'plain/text' })
                  .send('Not Found');
      }
    });
});

router.delete('/books/:id', (req, res) => {
  const id = req.params.id;

  if (!Number(id)) {
    return res.status(404)
              .set({ 'Content-Type': 'plain/text' })
              .send('Not Found');
  }
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
    .then((deletedBook) => {
      if (!deletedBook) {
        return res.status(404)
                  .set({ 'Content-Type': 'plain/text' })
                  .send('Not Found');
      }
      res.send(deletedBook);
    });
});

module.exports = router;
