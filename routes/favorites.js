/* eslint-disable camelcase */

'use strict';

const express = require('express');
const knex = require('../knex.js');
const jwt = require('jsonwebtoken');

// eslint-disable-next-line new-cap
const router = express.Router();

router.get('/favorites', (req, res) => {
  const token = req.cookies.token;
  const secret = process.env.SECRET;

  jwt.verify(token, secret, (err) => {
    if (err) {
      return res.status(401)
        .set({ 'Content-Type': 'plain/text' })
        .send('Unauthorized');
    }
    knex('favorites')
      .select(
        'favorites.id',
        'favorites.book_id AS bookId',
        'favorites.user_id AS userId',
        'books.created_at AS createdAt',
        'books.updated_at AS updatedAt',
        'books.title',
        'books.author',
        'books.genre',
        'books.description',
        'books.cover_url AS coverUrl'
      )
      .join('books', 'books.id', 'favorites.book_id')
      .then((favorites) => {
        res.set({ 'Content-Type': 'application/json' }).send(favorites);
      });
  });
});

router.get('/favorites/check', (req, res) => {
  const token = req.cookies.token;
  const secret = process.env.SECRET;
  const id = req.query.bookId;

  jwt.verify(token, secret, (err) => {
    if (err) {
      return res.sendStatus(401);
    }
    knex('favorites')
      .where('book_id', id)
      .then((book) => {
        if (!book.length) {
          return res.status(200)
            .set({ 'Content-Type': 'plain/text' })
            .send('false');
        }
        res.set({ 'Content-Type': 'application/json' }).send(true);
      }).catch(() => {
        return res.status(400)
          .set({ 'Content-Type': 'text/plain' })
          .send('Book ID must be an integer');
      });
  });
});

router.post('/favorites', (req, res) => {
  const token = req.cookies.token;
  const secret = process.env.SECRET;
  const bookId = req.body.bookId;

  if (!Number.isInteger(bookId)) {
    return res.status(400)
      .set({ 'Content-Type': 'text/plain' })
      .send('Book ID must be an integer');
  }
  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      return res.sendStatus(401);
    }
    knex('favorites')
      .insert({
        book_id: bookId,
        user_id: decoded.id
      })
      .returning([
        'id',
        'book_id AS bookId',
        'user_id AS userId'
      ])
      .then((newFav) => {
        res.send(newFav[0]);
      })
      .catch(() => {
        return res.status(404)
          .set({ 'Content-Type': 'text/plain' })
          .send('Book not found');
      });
  });
});

router.delete('/favorites', (req, res) => {
  const token = req.cookies.token;
  const secret = process.env.SECRET;
  const id = req.body.bookId;

  if (!Number.isInteger(id)) {
    return res.status(400)
      .set({ 'Content-Type': 'text/plain' })
      .send('Book ID must be an integer');
  }
  jwt.verify(token, secret, (err) => {
    if (err) {
      return res.sendStatus(401);
    }

    knex('favorites')
      .del()
      .select(
        'book_id AS bookId',
        'user_id AS userId'
      )
      .where('book_id', id)
      .first()
      .then((deletedFav) => {
        if (!deletedFav) {
          return res.status(404)
            .set({ 'Content-Type': 'plain/text' })
            .send('Favorite not found');
        }
        res.status(200)
          .set({ 'Content-Type': 'application/json' })
          .send(deletedFav);
      });
  });
});

module.exports = router;
