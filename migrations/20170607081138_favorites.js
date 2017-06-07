'use strict';

exports.up = function(knex) {
  return knex.schema.createTable('favorites', (table) => {
    table.increments();
    table.integer('book_id').notNullable();
    table.integer('user_id').notNullable();
    table.timestamps(true, true);
    table.foreign('book_id').references('books.id').onDelete('CASCADE');
    table.foreign('user_id').references('users.id').onDelete('CASCADE');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('favorites');
};
